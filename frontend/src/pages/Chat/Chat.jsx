import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import Layout from "../../components/layout/Layout";
import ChatSidebar from "../../components/chat/ChatSidebar";
import ChatWindow from "../../components/chat/ChatWindow";
import ChatInput from "../../components/chat/ChatInput";

import {
  streamChat,
  getSessions,
  getSession,
  deleteSession,
} from "../../services/chat";


function AdminChat() {
  /* =========================================================
     STATE
  ========================================================= */

  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  const pendingCitations = useRef([]);


  /* =========================================================
     LOAD SESSIONS
  ========================================================= */

  const fetchSessions = async () => {
    try {
      const data = await getSessions();

      setSessions(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load chat sessions:",
        error
      );

      toast.error(
        "Failed to load chat sessions."
      );
    }
  };


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchSessions();
  }, []);


  /* =========================================================
     LOAD EXISTING SESSION
  ========================================================= */

  const loadSession = async (sessionId) => {
    if (!sessionId) {
      return;
    }

    try {
      setLoading(true);

      const data =
        await getSession(sessionId);

      setCurrentSessionId(sessionId);

      setMessages(
        Array.isArray(data?.messages)
          ? data.messages
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load chat:",
        error
      );

      toast.error(
        "Failed to load chat."
      );
    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     NEW CHAT
  ========================================================= */

  const handleNewChat = () => {
    if (loading) {
      return;
    }

    setCurrentSessionId(null);
    setMessages([]);

    pendingCitations.current = [];
  };


  /* =========================================================
     DELETE CHAT
  ========================================================= */

  const handleDelete = async (sessionId) => {
    if (!sessionId) {
      return;
    }

    if (
      !window.confirm(
        "Delete this chat?"
      )
    ) {
      return;
    }

    try {
      await deleteSession(sessionId);

      if (
        currentSessionId === sessionId
      ) {
        setCurrentSessionId(null);
        setMessages([]);
      }

      await fetchSessions();

      toast.success(
        "Chat deleted."
      );
    } catch (error) {
      console.error(
        "Delete chat failed:",
        error
      );

      toast.error(
        "Delete failed."
      );
    }
  };


  /* =========================================================
     SEND MESSAGE
     ========================================================= */

  const handleSend = async (question) => {
    const trimmedQuestion =
      String(question || "").trim();

    if (!trimmedQuestion) {
      return;
    }

    if (loading) {
      return;
    }

    /* -------------------------------------------------------
       Reset citations
    ------------------------------------------------------- */

    pendingCitations.current = [];


    /* -------------------------------------------------------
       User message
    ------------------------------------------------------- */

    const userMessage = {
      role: "user",
      content: trimmedQuestion,
    };


    /* -------------------------------------------------------
       Temporary assistant message
    ------------------------------------------------------- */

    const assistantMessage = {
      role: "assistant",
      content: "",
      citations: [],
    };


    setMessages((previous) => [
      ...previous,
      userMessage,
      assistantMessage,
    ]);

    setLoading(true);


    /* =======================================================
       EXISTING RAG STREAM
    ======================================================= */

    await streamChat({
      question: trimmedQuestion,
      sessionId: currentSessionId,


      /* =====================================================
         METADATA
      ===================================================== */

      onMetadata: (data) => {
        console.log(
          "Admin chat metadata:",
          data
        );

        if (data?.session_id) {
          setCurrentSessionId(
            data.session_id
          );
        }

        pendingCitations.current =
          Array.isArray(
            data?.citations
          )
            ? data.citations
            : [];
      },


      /* =====================================================
         STREAM TOKENS
      ===================================================== */

      onToken: (token) => {
        setMessages((previous) => {
          const copy = [...previous];

          const lastIndex =
            copy.length - 1;

          if (lastIndex < 0) {
            return copy;
          }

          copy[lastIndex] = {
            ...copy[lastIndex],
            content:
              copy[lastIndex].content +
              token,
          };

          return copy;
        });
      },


      /* =====================================================
         STREAM COMPLETE
      ===================================================== */

      onDone: async () => {
        const citations =
          pendingCitations.current;

        setMessages((previous) => {
          const copy = [...previous];

          const lastIndex =
            copy.length - 1;

          if (lastIndex < 0) {
            return copy;
          }

          copy[lastIndex] = {
            ...copy[lastIndex],
            citations,
          };

          return copy;
        });

        pendingCitations.current = [];

        setLoading(false);

        await fetchSessions();
      },


      /* =====================================================
         ERROR
      ===================================================== */

      onError: (error) => {
        console.error(
          "Admin chat error:",
          error
        );

        pendingCitations.current = [];

        setMessages((previous) => {
          const copy = [...previous];

          const lastIndex =
            copy.length - 1;

          if (lastIndex < 0) {
            return copy;
          }

          copy[lastIndex] = {
            ...copy[lastIndex],
            content:
              "Sorry, I couldn't process your request. Please try again.",
            citations: [],
          };

          return copy;
        });

        setLoading(false);

        toast.error(
          "Something went wrong."
        );
      },
    });
  };


  /* =========================================================
     QUICK PROMPT
  ========================================================= */

  const handleQuickPrompt = (prompt) => {
    if (loading) {
      return;
    }

    handleSend(prompt);
  };


  /* =========================================================
     UI
  ========================================================= */

  return (
    <Layout>

      <div
        className="
          h-[calc(100vh-110px)]
          overflow-hidden
          rounded-2xl
          border
          bg-white
          shadow-sm
        "
      >

        <div
          className="
            flex
            h-full
          "
        >

          {/* =================================================
              CHAT HISTORY SIDEBAR
          ================================================= */}

          <div
            className="
              w-[220px]
              shrink-0
              border-r
              bg-gray-50
            "
          >

            <ChatSidebar
              sessions={sessions}
              currentSessionId={
                currentSessionId
              }
              onSelect={loadSession}
              onDelete={handleDelete}
              onNewChat={handleNewChat}
            />

          </div>


          {/* =================================================
              MAIN CHAT
          ================================================= */}

          <div
            className="
              flex
              min-h-0
              flex-1
              flex-col
              bg-white
            "
          >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
              className="
                flex
                shrink-0
                items-center
                justify-between
                border-b
                border-gray-100
                px-6
                py-4
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-xl
                  "
                >
                  🤖
                </div>

                <div>

                  <div
                    className="
                      text-sm
                      font-bold
                      text-gray-900
                    "
                  >
                    CampusFlow Admin AI
                  </div>

                  <div
                    className="
                      text-xs
                      text-gray-500
                    "
                  >
                    Intelligent campus knowledge assistant
                  </div>

                </div>

              </div>


              {currentSessionId && (
                <div
                  className="
                    rounded-full
                    bg-blue-50
                    px-3
                    py-1
                    text-[11px]
                    font-medium
                    text-blue-600
                  "
                >
                  Chat #{currentSessionId}
                </div>
              )}

            </div>


            {/* =================================================
                CHAT CONTENT
            ================================================= */}

            <div
              className="
                min-h-0
                flex-1
                overflow-hidden
              "
            >

              {messages.length === 0 ? (

                /* =============================================
                   ADMIN WELCOME
                ============================================= */

                <div
                  className="
                    h-full
                    overflow-y-auto
                    px-6
                    py-10
                  "
                >

                  <div
                    className="
                      mx-auto
                      max-w-3xl
                    "
                  >

                    {/* HERO */}

                    <div
                      className="
                        mb-8
                        text-center
                      "
                    >

                      <div
                        className="
                          mx-auto
                          mb-4
                          flex
                          h-16
                          w-16
                          items-center
                          justify-center
                          rounded-2xl
                          bg-blue-50
                          text-3xl
                        "
                      >
                        🤖
                      </div>

                      <h1
                        className="
                          text-2xl
                          font-bold
                          text-gray-900
                        "
                      >
                        CampusFlow Admin AI
                      </h1>

                      <p
                        className="
                          mx-auto
                          mt-2
                          max-w-xl
                          text-sm
                          leading-6
                          text-gray-500
                        "
                      >
                        Your intelligent assistant for
                        institutional knowledge and
                        campus operations.
                      </p>

                    </div>


                    {/* QUICK ACTIONS */}

                    <div
                      className="
                        grid
                        grid-cols-1
                        gap-4
                        md:grid-cols-2
                      "
                    >

                      {/* DOCUMENTS */}

                      <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          handleQuickPrompt(
                            "What are the important policies and procedures in our institutional documents?"
                          )
                        }
                        className="
                          rounded-2xl
                          border
                          border-gray-200
                          bg-white
                          p-5
                          text-left
                          transition
                          hover:border-blue-300
                          hover:bg-blue-50/40
                          hover:shadow-sm
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      >

                        <div
                          className="
                            mb-3
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-blue-50
                            text-lg
                          "
                        >
                          📄
                        </div>

                        <div
                          className="
                            text-sm
                            font-semibold
                            text-gray-900
                          "
                        >
                          Institutional Documents
                        </div>

                        <div
                          className="
                            mt-1
                            text-xs
                            leading-5
                            text-gray-500
                          "
                        >
                          Search policies, procedures,
                          and institutional information.
                        </div>

                      </button>


                      {/* ADMISSION */}

                      <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          handleQuickPrompt(
                            "Explain the admission process and important requirements for students."
                          )
                        }
                        className="
                          rounded-2xl
                          border
                          border-gray-200
                          bg-white
                          p-5
                          text-left
                          transition
                          hover:border-indigo-300
                          hover:bg-indigo-50/40
                          hover:shadow-sm
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      >

                        <div
                          className="
                            mb-3
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-indigo-50
                            text-lg
                          "
                        >
                          🎓
                        </div>

                        <div
                          className="
                            text-sm
                            font-semibold
                            text-gray-900
                          "
                        >
                          Admission Information
                        </div>

                        <div
                          className="
                            mt-1
                            text-xs
                            leading-5
                            text-gray-500
                          "
                        >
                          Find admission procedures,
                          rules, and requirements.
                        </div>

                      </button>


                      {/* FEES */}

                      <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          handleQuickPrompt(
                            "What are the fee payment rules and important fee-related policies?"
                          )
                        }
                        className="
                          rounded-2xl
                          border
                          border-gray-200
                          bg-white
                          p-5
                          text-left
                          transition
                          hover:border-emerald-300
                          hover:bg-emerald-50/40
                          hover:shadow-sm
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      >

                        <div
                          className="
                            mb-3
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-emerald-50
                            text-lg
                          "
                        >
                          💰
                        </div>

                        <div
                          className="
                            text-sm
                            font-semibold
                            text-gray-900
                          "
                        >
                          Fees & Policies
                        </div>

                        <div
                          className="
                            mt-1
                            text-xs
                            leading-5
                            text-gray-500
                          "
                        >
                          Understand fee rules,
                          payments, and policies.
                        </div>

                      </button>


                      {/* CAMPUS OPERATIONS */}

                      <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          handleQuickPrompt(
                            "What important campus processes and student services are described in our institutional documents?"
                          )
                        }
                        className="
                          rounded-2xl
                          border
                          border-gray-200
                          bg-white
                          p-5
                          text-left
                          transition
                          hover:border-violet-300
                          hover:bg-violet-50/40
                          hover:shadow-sm
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      >

                        <div
                          className="
                            mb-3
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            bg-violet-50
                            text-lg
                          "
                        >
                          🏫
                        </div>

                        <div
                          className="
                            text-sm
                            font-semibold
                            text-gray-900
                          "
                        >
                          Campus Operations
                        </div>

                        <div
                          className="
                            mt-1
                            text-xs
                            leading-5
                            text-gray-500
                          "
                        >
                          Explore campus processes,
                          services, and procedures.
                        </div>

                      </button>

                    </div>


                    <div
                      className="
                        mt-8
                        text-center
                        text-xs
                        text-gray-400
                      "
                    >
                      Ask questions about your
                      organization's uploaded knowledge.
                    </div>

                  </div>

                </div>

              ) : (

                <ChatWindow
                  messages={messages}
                  loading={loading}
                />

              )}

            </div>


            {/* =================================================
                INPUT
            ================================================= */}

            <div
              className="
                shrink-0
                border-t
                border-gray-100
                bg-white
                px-4
                py-3
              "
            >

              <ChatInput
                loading={loading}
                onSend={handleSend}
              />

            </div>

          </div>

        </div>

      </div>

    </Layout>
  );
}


export default AdminChat;