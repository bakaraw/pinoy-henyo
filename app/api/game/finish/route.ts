import { db } from "@/lib/db";
import { WORDS } from "@/lib/word";

export async function POST(req: Request) {
    const { word, questions_asked } = await req.json();

    if (!WORDS.includes(word) || !Number.isInteger(questions_asked) || questions_asked < 1) {
        return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    await db`
        INSERT INTO attempts (word, questions_asked)
        VALUES (${word}, ${questions_asked})
    `;
    
    const [stats] = await db`
        SELECT
        COUNT(*) FILTER (WHERE questions_asked > ${questions_asked}) AS worse,
        COUNT(*) AS total
        FROM attempts
        WHERE word = ${word}
  `;

    const total = Number(stats.total);
    const percentile = Math.round((Number(stats.worse) / total) * 100);

    return Response.json({ percentile, total });
}