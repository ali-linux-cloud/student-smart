export interface FileUploadSchema {
  subjects: string[];
  sourceLanguage: string;
  targetLanguage: string;
}

export const defaultSchema: FileUploadSchema = {
  subjects: [],
  sourceLanguage: 'English',
  targetLanguage: 'English',
};
