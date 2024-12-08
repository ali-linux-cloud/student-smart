'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { SchemaEditor } from '@/components/SchemaEditor';
import { FileUploadSchema, defaultSchema } from '@/components/schema/types';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [schema, setSchema] = useState<FileUploadSchema>(defaultSchema);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    // TODO: Implement immediate text extraction using LlamaParser
  };

  const handleSchemaChange = (newSchema: FileUploadSchema) => {
    setSchema(newSchema);
  };

  const handleStartExtraction = () => {
    // TODO: Implement OpenAI processing
    console.log('Starting extraction with:', { files, schema });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          PDF Lecture Resume Generator
        </h1>

        <div className="grid gap-8">
          <div className="p-6 bg-card rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Upload PDF Files</h2>
            <FileUpload onFilesSelected={handleFilesSelected} />
            
            {files.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Uploaded Files:</h3>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-2 bg-primary/5 rounded">
                      <span>{file.name}</span>
                      <button className="text-sm text-primary hover:text-primary/80">
                        Preview Resume
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Define Schema</h2>
            <SchemaEditor onSchemaChange={handleSchemaChange} />
          </div>

          <button
            onClick={handleStartExtraction}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            disabled={files.length === 0 || schema.subjects.length === 0}
          >
            Start Extraction
          </button>
        </div>
      </div>
    </div>
  );
}
