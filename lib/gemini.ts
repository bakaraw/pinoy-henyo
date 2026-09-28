import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

async function withRetry<T>(fn: () => Promise<T>, tries = 3): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const retryable = err?.status === 503 || err?.status === 429;
      if (!retryable || i >= tries - 1) throw err;
      await new Promise((r) => setTimeout(r, 500 * 2 ** i)); // 0.5s, 1s, 2s
    }
  }
}


// change this into haveing an actual list of words to choose from instead of generating a random word every time
export async function generateRandomWord() {
  const res = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: "Generate a random word for a Pinoy Henyo game.",
    config: {
      systemInstruction:
        "You are generating a random word for a Pinoy Henyo game. Provide only the word, nothing else. the word should be tangible, common, and not too long. Do not include any punctuation or special characters. English word only. make it unique every time",
      temperature: 0,
    },
  });
  return res.text?.trim().toLowerCase();
}

export async function judge(word: string, question: string) {
  const res = await withRetry(() =>
    ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: `Secret word: ${word}\nQuestion: ${question}`,
      config: {
        systemInstruction:
          "You are the judge in a Pinoy Henyo game. Answer the question about the secret word with exactly one word: yes, no, or maybe. Never reveal the word. When the player corretly guesses the word, respond with 'yes, [word] is the correct answer'. If the question is not clear or cannot be answered with yes/no/maybe, respond with 'maybe'.",
        temperature: 0,
      },
    }));
  return res.text?.trim().toLowerCase();
}