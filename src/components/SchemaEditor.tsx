'use client';

import { useState } from 'react';
import { FileUploadSchema, defaultSchema } from './schema/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SchemaEditorProps {
  onSchemaChange: (schema: FileUploadSchema) => void;
}

const languages = [
  'English',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Japanese',
  'Korean',
  'Arabic',
];

export function SchemaEditor({ onSchemaChange }: SchemaEditorProps) {
  const [schema, setSchema] = useState<FileUploadSchema>(defaultSchema);
  const [subject, setSubject] = useState('');

  const handleAddSubject = () => {
    if (subject.trim()) {
      const newSchema = {
        ...schema,
        subjects: [...schema.subjects, subject.trim()],
      };
      setSchema(newSchema);
      onSchemaChange(newSchema);
      setSubject('');
    }
  };

  const handleRemoveSubject = (index: number) => {
    const newSchema = {
      ...schema,
      subjects: schema.subjects.filter((_, i) => i !== index),
    };
    setSchema(newSchema);
    onSchemaChange(newSchema);
  };

  const handleLanguageChange = (type: 'source' | 'target', value: string) => {
    const newSchema = {
      ...schema,
      [type === 'source' ? 'sourceLanguage' : 'targetLanguage']: value,
    };
    setSchema(newSchema);
    onSchemaChange(newSchema);
  };

  return (
    <div className="space-y-6 p-4 bg-card rounded-lg border">
      <div className="space-y-2">
        <Label>Subjects</Label>
        <div className="flex gap-2">
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Add a subject"
            className="flex-1"
          />
          <Button onClick={handleAddSubject}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {schema.subjects.map((subject, index) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded"
            >
              <span>{subject}</span>
              <button
                onClick={() => handleRemoveSubject(index)}
                className="text-sm text-destructive hover:text-destructive/80"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Source Language</Label>
          <Select
            value={schema.sourceLanguage}
            onValueChange={(value) => handleLanguageChange('source', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Target Language</Label>
          <Select
            value={schema.targetLanguage}
            onValueChange={(value) => handleLanguageChange('target', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
