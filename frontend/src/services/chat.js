import api from "./api";
import { getToken } from "../utils/token";

const BASE_URL = import.meta.env.VITE_API_URL;

export const getSessions = async () => {
  const res = await api.get("/chat/sessions");
  return res.data;
};

export const getSession = async (sessionId) => {
  const res = await api.get(`/chat/sessions/${sessionId}`);
  return res.data;
};

export const deleteSession = async (sessionId) => {
  const res = await api.delete(`/chat/sessions/${sessionId}`);
  return res.data;
};

export const streamChat = async ({
  question,
  sessionId,
  onMetadata,
  onToken,
  onDone,
  onError,
}) => {
  try {
    const token = getToken();

    const response = await fetch(`${BASE_URL}/chat/stream`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to start chat.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const event of events) {
        
        console.log(event);
        
        const lines = event.split("\n");

        let type = "";
        let data = "";

        for (const line of lines) {
          if (line.startsWith("event:")) {
            type = line.replace("event:", "").trim();
          }

          if (line.startsWith("data:")) {
            data += line.replace("data:", "").trim();
          }
        }

        console.log("Type:", type);
        console.log("Data:", data);

        switch (type) {
          case "metadata": {
            const parsed = JSON.parse(data);

            console.log("Metadata Parsed:", parsed);

            onMetadata?.(parsed);
            break;
          }

          case "token":
            onToken?.(data);
            break;

          case "done":
            onDone?.();
            break;

          default:
            console.log("Unknown SSE Event:", type);
        }
      }
    }
  } catch (err) {
    console.error(err);
    onError?.(err);
  }
};

/* =========================================================
   CAMPUSFLOW AI AGENT
========================================================= */

export const sendAgentMessage = async ({
  message,
  sessionId,
}) => {
  const response = await api.post(
    "/agent/chat",
    {
      message,
      session_id: sessionId || null,
    }
  );

  return response.data;
};