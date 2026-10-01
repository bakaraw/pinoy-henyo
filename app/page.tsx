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
  const [askCounter, setAskCounter] = useState<number>(0);
  const [gaveUp, setGaveUp] = useState<boolean>(false);

  async function startGame() {
    setLoading(true);
    const res = await fetch("/api/game/new");
    if (!res.ok) {
      console.error("new game failed:", res.status);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setWord(data.word);
    setQuestion("");
    setLogs([]);
    setAskCounter(0);
    setResult(null);
    setResponse(null);
    setGaveUp(false);
    setLoading(false);
  }

  function isCorrectGuess(question: string, word: string) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(question);
  }

  async function ask() {
    if (!question.trim() || !word) return;

    const nextCount = askCounter + 1;
    setAskCounter(nextCount);
    if (isCorrectGuess(question, word)) {
      await finish(nextCount);
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

  async function finish(questionsAsked: number) {
    setLoading(true);
    try {
      const res = await fetch("/api/game/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, questions_asked: questionsAsked }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      setResult(await res.json());
    } catch (err) {
      console.error("finish failed:", err);
    } finally {
      setLoading(false);
    }
  }

  function giveUp() {
    setGaveUp(true);
  }

  function playAgain() {
    setWord(null);
    setQuestion("");
    setLogs([]);
    setResponse(null);
    setPreviousQuestion("");
    setResult(null);
    setAskCounter(0);
    setGaveUp(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-neutral-50 px-4 py-16">
      <div className="w-full max-w-lg space-y-5">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900">
            Pinoy Henyo
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Yes-or-no guessing game type shiii
          </p>
        </div>

        {/* Description / last answer */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
          {response === null ? (
            <p className="text-neutral-600">
              Guess the secret word by asking yes/no questions. I&apos;ll answer{" "}
              <span className="font-semibold text-green-600">yes</span>,{" "}
              <span className="font-semibold text-red-500">no</span>, or{" "}
              <span className="font-semibold text-amber-500">maybe</span>.
              Fewer questions = better score!
            </p>
          ) : (
            <div>
              <p className="text-sm text-neutral-500">&quot;{previousQuestion}&quot;</p>
              <p
                className={`mt-1 text-2xl font-bold uppercase ${
                  response === "yes"
                    ? "text-green-600"
                    : response === "no"
                    ? "text-red-500"
                    : "text-amber-500"
                }`}
              >
                {response}
              </p>
            </div>
          )}
        </section>

        {/* Question log */}
        {logs.length > 0 && !result && !gaveUp && (
          <ul className="max-h-48 space-y-1.5 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-3 text-sm shadow-sm">
            {logs.map((e, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-1"
              >
                <span className="truncate text-neutral-700">{e.question}</span>
                <span
                  className={`shrink-0 text-xs font-bold uppercase ${
                    e.answer === "yes"
                      ? "text-green-600"
                      : e.answer === "no"
                      ? "text-red-500"
                      : "text-amber-500"
                  }`}
                >
                  {e.answer}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Result (win or give up) */}
        {(result || gaveUp) && (
          <section className="rounded-2xl border-2 border-neutral-900 bg-white p-6 text-center shadow-sm">
            {result ? (
              <>
                <p className="text-lg font-semibold text-neutral-900">
                  You got it — <span className="capitalize">{word}</span>! 🎉
                </p>
                <p className="mt-2 text-sm text-neutral-600">
                  Asked {askCounter} question{askCounter === 1 ? "" : "s"}
                </p>
                <p className="text-sm text-neutral-600">
                  {result.total <= 1
                    ? "You're the first to try this word!"
                    : result.percentile !== null
                    ? `Better than ${result.percentile}% of players`
                    : `${result.total} players have tried this word so far`}
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-neutral-900">
                  Gave up — the word was <span className="capitalize">{word}</span>
                </p>
                <p className="mt-2 text-sm text-neutral-600">
                  Asked {askCounter} question{askCounter === 1 ? "" : "s"} before giving up
                </p>
              </>
            )}
            <button
              onClick={playAgain}
              className="mt-4 w-full rounded-lg bg-neutral-900 px-4 py-2 font-semibold text-white transition hover:bg-neutral-700"
            >
              Play again
            </button>
          </section>
        )}

        {/* Input / start */}
        {!result && !gaveUp && (
          <div className="flex w-full gap-2">
            {word === null ? (
              <button
                onClick={startGame}
                disabled={loading}
                className="flex-1 rounded-lg bg-neutral-900 px-4 py-3 font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50"
              >
                {loading ? "Loading..." : "START"}
              </button>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Ask a question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && ask()}
                  className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-neutral-900"
                />
                <button
                  disabled={loading || !question.trim()}
                  onClick={ask}
                  className="rounded-lg bg-neutral-900 px-5 py-3 font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-40"
                >
                  Ask
                </button>
                <button
                  onClick={giveUp}
                  className="rounded-lg border border-neutral-300 px-4 py-3 font-semibold text-neutral-600 transition hover:bg-neutral-100"
                >
                  Give up
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}