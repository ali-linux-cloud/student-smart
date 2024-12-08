'use client';

import { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/components/ui/modal';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

interface ExtractedText {
  filename: string;
  text: string;
}

export function FileUpload({ onFilesSelected }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedTexts, setExtractedTexts] = useState<ExtractedText[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract text');
      }

      const data = await response.json();
      setExtractedTexts(prev => [...prev, { filename: data.filename, text: data.text }]);
      setShowModal(true);
    } catch (error) {
      console.error('Error extracting text:', error);
      setError(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      const pdfFiles = filesArray.filter(file => file.type === 'application/pdf');
      
      if (pdfFiles.length === 0) {
        setError('Please upload PDF files only');
        return;
      }

      onFilesSelected(pdfFiles);
      
      // Process each PDF file
      for (const file of pdfFiles) {
        await processFile(file);
      }
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const pdfFiles = filesArray.filter(file => file.type === 'application/pdf');
      
      if (pdfFiles.length === 0) {
        setError('Please upload PDF files only');
        return;
      }

      onFilesSelected(pdfFiles);
      
      // Process each PDF file
      for (const file of pdfFiles) {
        await processFile(file);
      }
    }
  };

  return (
    <>
      <div className="w-full">
        <div
          className={`relative rounded-lg border-2 border-dashed p-6 transition-colors
            ${dragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}
            ${dragActive ? 'border-primary' : 'hover:border-primary/50'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Input
            type="file"
            multiple
            accept=".pdf"
            onChange={handleChange}
            className="absolute inset-0 cursor-pointer opacity-0"
            disabled={isLoading}
          />
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <Upload className="h-8 w-8 text-gray-500" />
            <div className="text-sm text-gray-600">
              {isLoading ? (
                'Processing...'
              ) : (
                <>
                  <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                </>
              )}
            </div>
            <p className="text-xs text-gray-500">PDF files only</p>
          </div>
        </div>

        {error && (
          <div className="mt-2 flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <Modal open={showModal} onOpenChange={setShowModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Extracted Text</ModalTitle>
            <ModalDescription>
              Text extracted from your PDF files:
            </ModalDescription>
          </ModalHeader>
          <div className="max-h-[60vh] overflow-y-auto p-4">
            {extractedTexts.map((item, index) => (
              <div key={index} className="mb-4">
                <h3 className="font-medium text-sm mb-2">{item.filename}</h3>
                <pre className="whitespace-pre-wrap text-sm bg-muted p-2 rounded">
                  {item.text}
                </pre>
              </div>
            ))}
          </div>
          <ModalFooter>
            <Button onClick={() => setShowModal(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
