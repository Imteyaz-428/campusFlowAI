import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Layout from "../../components/layout/Layout";
import ChatSidebar from "../../components/chat/ChatSidebar";
import ChatWindow from "../../components/chat/ChatWindow";
import ChatInput from "../../components/chat/ChatInput";
import EmptyChat from "../../components/chat/EmptyChat";

import {
  streamChat,
  getSessions,
  getSession,
  deleteSession,
} from "../../services/chat";

function Chat() {
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(data);
    } catch {
      toast.error("Failed to load chat sessions.");
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const loadSession = async (sessionId) => {
    try {
      const data = await getSession(sessionId);

      setCurrentSessionId(sessionId);
      setMessages(data.messages);
    } catch {
      toast.error("Failed to load chat.");
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
  };

  const handleDelete = async (sessionId) => {
    if (!window.confirm("Delete this chat?")) {
      return;
    }

    try {
      await deleteSession(sessionId);

      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }

      fetchSessions();

      toast.success("Chat deleted.");
    } catch {
      toast.error("Delete failed.");
    }
  };

  const handleSend = async (question) => {
    const userMessage = {
      role: "user",
      content: question,
    };

    const aiMessage = {
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
      aiMessage,
    ]);

    setLoading(true);

    await streamChat({
      question,
      sessionId: currentSessionId,

      onMetadata: (data) => {
        setCurrentSessionId(data.session_id);
      },

      onToken: (token) => {
        setMessages((prev) => {
          const copy = [...prev];

          copy[copy.length - 1] = {
            ...copy[copy.length - 1],
            content:
              copy[copy.length - 1].content + token,
          };

          return copy;
        });
      },

      onDone: async () => {
        setLoading(false);
        await fetchSessions();
      },

      onError: () => {
        setLoading(false);
        toast.error("Something went wrong.");
      },
    });
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-110px)] overflow-hidden rounded-2xl border bg-white shadow-sm">

        <div className="flex h-full">

          <div className="w-[220px] shrink-0 border-r bg-gray-50">
            <ChatSidebar
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSelect={loadSession}
              onDelete={handleDelete}
              onNewChat={handleNewChat}
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col bg-white">

            <div className="min-h-0 flex-1">
              {messages.length === 0 ? (
                <EmptyChat />
              ) : (
                <ChatWindow
                  messages={messages}
                  loading={loading}
                />
              )}
            </div>

            <ChatInput
              loading={loading}
              onSend={handleSend}
            />

          </div>

        </div>

      </div>
    </Layout>
  );
}

export default Chat;