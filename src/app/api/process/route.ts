import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is not set in environment variables');
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { texts, subjects, sourceLanguage, targetLanguage } = await request.json();

    if (!Array.isArray(texts) || texts.length === 0) {
      console.error('Invalid texts array:', texts);
      return NextResponse.json(
        { error: 'No texts provided for processing' },
        { status: 400 }
      );
    }

    console.log('Processing request with:', {
      numberOfTexts: texts.length,
      subjects,
      sourceLanguage,
      targetLanguage
    });

    // Combine all texts into one string with clear separation
    const combinedText = texts.join('\n\n=== Next Document ===\n\n');

    // Create a prompt that includes the subjects and language requirements
    const prompt = `Please analyze the following lecture notes and create a comprehensive resume. 
Focus on these subjects: ${subjects.join(', ')}.
Source language: ${sourceLanguage}
Target language: ${targetLanguage}

The resume should:
1. Identify and summarize key concepts
2. Highlight important definitions and explanations
3. Note any significant examples or case studies
4. Organize the information in a clear, structured format

Here are the lecture notes:

${combinedText}`;

    console.log('Calling Groq API...');
    // Call Groq API for text generation
    const completion = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates well-structured, comprehensive resumes from lecture notes. Your output should be clear, organized, and focused on the requested subjects."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    console.log('Groq API response received');
    // Extract the generated text from the response
    const generatedResume = completion.choices[0].message.content;

    return NextResponse.json({ 
      resume: generatedResume 
    });

  } catch (error) {
    // Type guard for error object
    const err = error as Error;
    console.error('Detailed error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause
    });
    
    // Return more specific error message
    return NextResponse.json(
      { error: `Error processing with Groq: ${err.message}` },
      { status: 500 }
    );
  }
}
