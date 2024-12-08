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
    const prompt = `Please analyze the following lecture notes and create a well-structured resume with clear sections and bullet points. 
Focus on these subjects: ${subjects.join(', ')}.
Source language: ${sourceLanguage}
Target language: ${targetLanguage}

The resume should be organized as follows:
1. MAIN CONCEPTS
   • List key concepts with brief explanations
   • Highlight fundamental principles

2. DETAILED ANALYSIS
   • Break down important topics
   • Include relevant examples
   • Explain complex ideas in simple terms

3. PRACTICAL APPLICATIONS
   • List real-world applications
   • Include case studies if available
   • Connect theory to practice

4. KEY TAKEAWAYS
   • Summarize the most important points
   • List any critical conclusions

Please format each section with:
- Clear headings in UPPERCASE
- Bullet points for easy reading
- Sub-sections where needed
- Short, concise explanations

Here are the lecture notes:

${combinedText}`;

    console.log('Calling Groq API...');
    // Call Groq API for text generation
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a professional educational content organizer that creates well-structured, comprehensive resumes from lecture notes. Your output must be highly organized with clear sections, bullet points, and hierarchical structure. Use markdown formatting with headers (e.g., # for main sections, ## for subsections) and bullet points (* or -) to ensure clear visual organization. Each section should be clearly separated and easy to read."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 32768,
      top_p: 0.9,
      stream: false
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
