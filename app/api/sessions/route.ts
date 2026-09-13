import { getChatSessions, createChatSession } from "@/lib/chatSessions";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const sessions = await getChatSessions();
        return NextResponse.json(sessions);
    } catch (error) {
        console.error("Failed to fetch sessions:", error);
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { firstMessage } = body;

        // Use first message as title (truncated)
        const title = firstMessage ? (firstMessage.length > 30 ? firstMessage.slice(0, 30) + "..." : firstMessage) : "New Chat";

        const session = await createChatSession(title);
        return NextResponse.json({ sessionId: session._id });
    } catch (error) {
        console.error("Failed to create session:", error);
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }
}