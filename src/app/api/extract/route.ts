import { NextRequest, NextResponse } from 'next/server';
import { LlamaParseReader } from 'llamaindex';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const UPLOADS_DIR = join(process.cwd(), 'uploads');

if (!process.env.LLAMA_CLOUD_API_KEY) {
  throw new Error('LLAMA_CLOUD_API_KEY is not set in environment variables');
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate a unique filename to prevent collisions
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${file.name}`;
    const filePath = join(UPLOADS_DIR, uniqueFilename);
    
    try {
      // Save the uploaded file
      await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

      // Initialize LlamaParser reader with API key and basic configuration
      const reader = new LlamaParseReader({ 
        apiKey: process.env.LLAMA_CLOUD_API_KEY,
        resultType: "markdown"
      });

      // Parse the document
      const documents = await reader.loadData(filePath);

      // Extract text from all documents and combine them with page numbers
      let fullText = '';
      documents.forEach((doc, index) => {
        fullText += `=== Page ${index + 1} ===\n${doc.text}\n\n`;
      });

      // Clean up the uploaded file
      try {
        await unlink(filePath);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
        // Continue execution even if cleanup fails
      }

      return NextResponse.json({ 
        text: fullText,
        filename: file.name 
      });
    } catch (error) {
      console.error('Error processing file:', error);
      // Attempt to clean up the file in case of processing error
      try {
        await unlink(filePath);
      } catch (cleanupError) {
        console.error('Error cleaning up file after processing error:', cleanupError);
      }
      return NextResponse.json(
        { error: 'Error processing file' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error handling request:', error);
    return NextResponse.json(
      { error: 'Error handling request' },
      { status: 500 }
    );
  }
}
