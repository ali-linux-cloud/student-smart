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
  onExtractedText?: (filename: string, text: string) => void;
}

interface ExtractedText {
  filename: string;
  text: string;
}

export function FileUpload({ onFilesSelected, onExtractedText }: FileUploadProps) {
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
      console.log('Processing file:', file.name);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Text extracted successfully:', {
          filename: file.name,
          textLength: data.text.length
        });
        const newText: ExtractedText = { filename: file.name, text: data.text };
        setExtractedTexts(prev => [...prev, newText]);
        onExtractedText?.(file.name, data.text);
      } else {
        console.error('Error response:', data);
        throw new Error(data.error || 'Failed to extract text from file');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file';
      setError(errorMessage);
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      const pdfFiles = Array.from(files).filter(
        file => file.type === 'application/pdf'
      );
      
      if (pdfFiles.length === 0) {
        setError('Please upload PDF files only');
        setShowModal(true);
        return;
      }

      onFilesSelected(pdfFiles);
      for (const file of pdfFiles) {
        await processFile(file);
      }
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { files } = e.target;

    if (files && files.length > 0) {
      const pdfFiles = Array.from(files).filter(
        file => file.type === 'application/pdf'
      );

      if (pdfFiles.length === 0) {
        setError('Please upload PDF files only');
        setShowModal(true);
        return;
      }

      onFilesSelected(pdfFiles);
      for (const file of pdfFiles) {
        await processFile(file);
      }
    }
  };

  return (
    <div className="w-full space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept=".pdf"
          className="hidden"
          onChange={handleChange}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-flex flex-col items-center gap-2"
        >
          <Upload className="h-8 w-8 text-gray-500" />
          <span className="text-sm text-gray-600">
            {isLoading ? (
              'Processing...'
            ) : (
              <>
                Drag & drop PDF files here, or <span className="text-primary">browse</span>
              </>
            )}
          </span>
        </label>
      </div>

      {extractedTexts.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Extracted Text:</h3>
          <div className="space-y-2">
            {extractedTexts.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">{item.filename}</h4>
                <p className="text-sm whitespace-pre-wrap">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <Modal open={showModal} onOpenChange={() => setShowModal(false)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Error</ModalTitle>
              <ModalDescription className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </ModalDescription>
            </ModalHeader>
            <ModalFooter>
              <Button onClick={() => setShowModal(false)}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
