"use client";

import { useState } from "react";

type Entry = { question: string; answer: string };

export default function Home() {
  const [word, setWord] = useState<string | null>(null);
  const [question, setQuestion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState<Entry[]>([]);
  const [response, setResponse] = useState<string | null>(null);
  const [previousQuestion, setPreviousQuestion] = useState<string>("");

  const [result, setResult] = useState<{ percentile: number | null; total: number } | null>(null);

  async function startGame() {
    setLoading(true);
    const res = await fetch("/api/game/new");
    if (!res.ok) {
      console.error("new game failed:", res.status);
      return;
    }

    const data = await res.json();
    setWord(data.word);
    setQuestion("");
    setLogs([]);
    console.log("New game started with word:", data.word);
    setLoading(false);
  }

  function isCorrectGuess(question: string, word: string) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(question);
  }

  async function ask() {
    if (!question.trim() || !word) return;

    if (isCorrectGuess(question, word)) {
      await finish(); // +1 counts the winning guess
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/game/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, question }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);

      const data = await res.json();
      setResponse(data.answer);
      setPreviousQuestion(question);
      setLogs((prev) => [...prev, { question, answer: data.answer }]);
      setQuestion("");
    } catch (err) {
      console.error("ask failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function finish() {
    setLoading(true);
    try {
      const res = await fetch("/api/game/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, questions_asked: logs.length }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      setResult(await res.json());
      console.log(result);
    } catch (err) {
      console.error("finish failed:", err);
    } finally {
      setLoading(false);
    }
    alert(`Congratulations! You guessed the word: ${word}`);

  }

  function playAgain() {
    setWord(null);
    setQuestion("");
    setLogs([]);
    setResponse(null);
    setPreviousQuestion("");
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 px-4 pt-16">
      {/* Title */}
      <h1 className="w-full max-w-lg rounded-lg border-2 border-black py-3 text-center text-3xl font-bold">
        Pinoy Henyo
      </h1>

      {/* Description / tutorial */}
      <section className="w-full max-w-lg rounded-2xl border-2 border-black p-6 text-center">
        {
          response === null ? (
            <p>
              Guess the secret word by asking yes/no questions. I'll answer yes, no,
              or maybe. Fewer questions = better score!
            </p>) : (
            <p>
              {previousQuestion} <strong>{response}</strong>
            </p>
          )
        }
      </section>

      {/* Ask a question + button */}
      <div className="flex w-full max-w-lg gap-2">
        {/* <input
          type="text"
          placeholder="Ask a question"
          className="flex-1 rounded-md border-2 border-black px-3 py-2"
        /> */}
        {
          word === null ?
            !loading ? (
              <button
                className="flex-1 rounded-md border-2 border-black px-4 py-2 font-semibold"
                onClick={startGame}
              >
                START
              </button>
            ) : (
              <div className="flex-1 rounded-md border-2 border-black px-4 py-2 font-semibold">
                Loading...
              </div>
            ) : (
              <div className="flex w-full gap-2">
                <input
                  type="text"
                  placeholder="Ask a question"
                  className="w-full flex-initial rounded-md border-2 border-black px-3 py-2"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      ask();
                    }
                  }}
                />
                <button
                  disabled={loading || !question.trim()}
                  className="w-64 flex-initial  rounded-md border-2 border-black px-4 py-2 font-semibold"
                  onClick={ask}
                >
                  Ask
                </button>
              </div>
            )
        }
      </div>
    </main>
  );
}