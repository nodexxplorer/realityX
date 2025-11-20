// // lib/ai.ts

// import { openai } from '@ai-sdk/openai';
// import { streamText } from 'ai';
// import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// const apiKey = process.env.OPENAI_API_KEY;

// if (!apiKey) {
//   throw new Error('Missing OPENAI_API_KEY in environment.');
// }

// // Initialize OpenAI model provider
// const openaiModel = openai(apiKey);
// // const model = openaiModel.model('gpt-4');

// export async function generateAIResponse(
//   messages: ChatCompletionMessageParam[]
// ): Promise<Response> {
//   try {
//     // Convert ChatCompletionMessageParam[] to the expected CoreMessage[] format
//     const coreMessages = messages.map((msg) => ({
//       role: msg.role as 'user' | 'assistant' | 'system',
//       content: msg.content,
//     }));

//     const result = await streamText({
//       model: openaiModel,
//       messages: coreMessages,
//       // Optional: add parameters like temperature here
//       // temperature: 0.7,
//     });

//     return result.toDataStreamResponse();
//   } catch (error) {
//     console.error('AI streaming error:', error);
//     return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }
