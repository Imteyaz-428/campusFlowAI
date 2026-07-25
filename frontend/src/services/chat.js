import api from "./api";
import { getToken } from "../utils/token";
const BASE_URL = "http://127.0.0.1:8000";

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

    const response = await fetch(
      `${BASE_URL}/chat/stream`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          session_id: sessionId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to start chat.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, {
        stream: true,
      });

      const events = buffer.split("\n\n");

      buffer = events.pop();

      for (const event of events) {
        const lines = event.split("\n");

        let type = "";
        let data = "";

        for (const line of lines) {
          if (line.startsWith("event:")) {
            type = line.replace("event:", "").trim();
          }

          if (line.startsWith("data:")) {
            data = line.replace("data:", "").trim();
          }
        }

        if (type === "metadata") {
          onMetadata?.(JSON.parse(data));
        }

        if (type === "token") {
          onToken?.(data);
        }

        if (type === "done") {
          onDone?.();
        }
      }
    }
  } catch (err) {
    onError?.(err);
  }
};