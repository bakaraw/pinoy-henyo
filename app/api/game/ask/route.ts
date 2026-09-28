import {judge} from "@/lib/gemini";

export async function POST(req: Request) {
    const {word, question} = await req.json();
    try {
        const answer = await judge(word, question);
        return Response.json({answer});
    } catch {
        return Response.json({error: "Judge is busy, try again"}, {status: 503})
    }
}