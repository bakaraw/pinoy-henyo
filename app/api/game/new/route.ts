import {generateRandomWord} from "@/lib/gemini";
import {pickRandomWord} from "@/lib/word";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const word = await pickRandomWord();
    return Response.json({word});
}