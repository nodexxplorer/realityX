// lib/openai-stream.ts

type OpenAIPayload = {
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  stream?: boolean;
  [key: string]: any;
};

export async function OpenAIStream(payload: OpenAIPayload) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not defined in environment variables");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI API request failed: ${res.status} ${res.statusText}\n${errorText}`);
  }

  const data = await res.json();
  return data;
}
