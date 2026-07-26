import { useEffect, useRef, useState } from "react";
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

  const pendingCitations = useRef([]);

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
    pendingCitations.current = [];

    const userMessage = {
      role: "user",
      content: question,
    };

    const aiMessage = {
      role: "assistant",
      content: "",
      citations: [],
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);

    setLoading(true);

    await streamChat({
        question,
        sessionId: currentSessionId,
      
        onMetadata: (data) => {
         
          
      
          setCurrentSessionId(data.session_id);
      
          pendingCitations.current = data.citations || [];
      
          
        },
      
        onToken: (token) => {
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy.length - 1;
      
            copy[last] = {
              ...copy[last],
              content: copy[last].content + token,
            };
      
            return copy;
          });
        },
      
        onDone: async () => {
         
          console.log("Citations:", pendingCitations.current);
      
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy.length - 1;
      
            copy[last] = {
              ...copy[last],
              citations: pendingCitations.current,
            };
      
           
            console.log(copy[last]);
      
            return copy;
          });
      
          pendingCitations.current = [];
      
          setLoading(false);
          await fetchSessions();
        },
      
        onError: (err) => {
          console.error(err);
      
          pendingCitations.current = [];
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