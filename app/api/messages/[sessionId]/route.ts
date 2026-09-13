import { NextRequest } from "next/server";
import { getMessagesBySession, deleteChatSession } from "@/lib/chatMessages";

export async function GET(_: NextRequest, props: { params: Promise<{ sessionId: string }> }) {
  const params = await props.params;

  try {
    const messages = await getMessagesBySession(params.sessionId);
    return Response.json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return Response.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, props: { params: Promise<{ sessionId: string }> }) {
  const params = await props.params;

  try {
    await deleteChatSession(params.sessionId);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete chat session:", error);
    return Response.json({ error: "Failed to delete chat session" }, { status: 500 });
  }
}
