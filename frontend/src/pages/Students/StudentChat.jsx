import {
    useCallback,
    useEffect,
    useState,
  } from "react";
  
  import toast from "react-hot-toast";
  
  import Layout from "../../components/layout/Layout";
  
  import ChatSidebar from "../../components/chat/ChatSidebar";
  import ChatWindow from "../../components/chat/ChatWindow";
  import ChatInput from "../../components/chat/ChatInput";
  
  import {
    sendAgentMessage,
    getSessions,
    getSession,
    deleteSession,
  } from "../../services/chat";
  
  
  function NewStudentChat() {
  
    /* =========================================================
       STATE
    ========================================================= */
  
    const [sessions, setSessions] = useState([]);
  
    const [messages, setMessages] = useState([]);
  
    const [currentSessionId, setCurrentSessionId] =
      useState(null);
  
    const [loading, setLoading] =
      useState(false);
  
    const [loadingSessions, setLoadingSessions] =
      useState(true);
  
  
    /* =========================================================
       LOAD SESSIONS
    ========================================================= */
  
    const fetchSessions = useCallback(
      async () => {
  
        try {
  
          setLoadingSessions(true);
  
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
  
        } finally {
  
          setLoadingSessions(false);
  
        }
  
      },
      []
    );
  
  
    /* =========================================================
       INITIAL LOAD
    ========================================================= */
  
    useEffect(() => {
  
      fetchSessions();
  
    }, [fetchSessions]);
  
  
    /* =========================================================
       LOAD EXISTING SESSION
    ========================================================= */
  
    const loadSession = async (sessionId) => {
  
      if (!sessionId) {
        return;
      }
  
      try {
  
        setLoading(true);
  
        const data = await getSession(sessionId);
  
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
          error?.response?.data?.detail ||
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
          error?.response?.data?.detail ||
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
  
  
      /* =======================================================
         USER MESSAGE
      ======================================================= */
  
      const userMessage = {
        role: "user",
        content: trimmedQuestion,
      };
  
  
      /* =======================================================
         TEMPORARY AI MESSAGE
      ======================================================= */
  
      const assistantMessage = {
        role: "assistant",
        content: "",
        citations: [],
        loading: true,
      };
  
  
      setMessages(
        (previous) => [
          ...previous,
          userMessage,
          assistantMessage,
        ]
      );
  
  
      setLoading(true);
  
  
      try {
  
        /* =====================================================
           CALL CAMPUSFLOW AGENT
        ===================================================== */
  
        const response =
          await sendAgentMessage({
            message: trimmedQuestion,
            sessionId: currentSessionId,
          });
  
  
        console.log(
          "CampusFlow Agent response:",
          response
        );
  
  
        /* =====================================================
           SESSION ID
        ===================================================== */
  
        if (response?.session_id) {
  
          setCurrentSessionId(
            response.session_id
          );
  
        }
  
  
        /* =====================================================
           AI RESPONSE
        ===================================================== */
  
        const assistantContent =
          response?.message ||
          "I'm sorry, I couldn't generate a response.";
  
  
        /* =====================================================
           CITATIONS
        ===================================================== */
  
        const citations =
          Array.isArray(response?.citations)
            ? response.citations
            : [];
  
  
        /* =====================================================
           UPDATE AI MESSAGE
        ===================================================== */
  
        setMessages(
          (previous) => {
  
            const copy = [
              ...previous,
            ];
  
            const lastIndex =
              copy.length - 1;
  
            copy[lastIndex] = {
  
              ...copy[lastIndex],
  
              content:
                assistantContent,
  
              citations,
  
              loading: false,
  
            };
  
            return copy;
  
          }
        );
  
  
        /* =====================================================
           REFRESH CHAT HISTORY
        ===================================================== */
  
        await fetchSessions();
  
  
      } catch (error) {
  
        console.error(
          "CampusFlow Agent failed:",
          error
        );
  
  
        const errorMessage =
          error?.response?.data?.detail ||
          "Something went wrong while contacting CampusFlow AI.";
  
  
        /* =====================================================
           SHOW ERROR INSIDE CHAT
        ===================================================== */
  
        setMessages(
          (previous) => {
  
            const copy = [
              ...previous,
            ];
  
            const lastIndex =
              copy.length - 1;
  
            copy[lastIndex] = {
  
              ...copy[lastIndex],
  
              content:
                errorMessage,
  
              citations: [],
  
              loading: false,
  
              error: true,
  
            };
  
            return copy;
  
          }
        );
  
  
        toast.error(
          errorMessage
        );
  
      } finally {
  
        setLoading(false);
  
      }
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
  
                onSelect={
                  loadSession
                }
  
                onDelete={
                  handleDelete
                }
  
                onNewChat={
                  handleNewChat
                }
  
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
  
              {/* ===============================================
                  STUDENT AI HEADER
              =============================================== */}
  
              <div
                className="
                  flex
                  shrink-0
                  items-center
                  justify-between
                  border-b
                  border-gray-100
                  bg-white
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
  
                  {/* AI ICON */}
  
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
                    🎓
                  </div>
  
  
                  {/* TITLE */}
  
                  <div>
  
                    <div
                      className="
                        text-sm
                        font-bold
                        text-gray-900
                      "
                    >
                      CampusFlow Student AI
                    </div>
  
                    <div
                      className="
                        text-xs
                        text-gray-500
                      "
                    >
                      Your personal campus assistant
                    </div>
  
                  </div>
  
                </div>
  
  
                {/* SESSION */}
  
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
  
  
              {/* ===============================================
                  MESSAGES / WELCOME
              =============================================== */}
  
              <div
                className="
                  min-h-0
                  flex-1
                  overflow-hidden
                "
              >
  
                {messages.length === 0 ? (
  
                  /* ===========================================
                     STUDENT WELCOME SCREEN
                  =========================================== */
  
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
                          🎓
                        </div>
  
  
                        <h1
                          className="
                            text-2xl
                            font-bold
                            text-gray-900
                          "
                        >
                          Hi! I'm your CampusFlow AI
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
                          I can help you with your
                          admission, documents, fees,
                          onboarding, and other
                          campus-related questions.
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
  
                        {/* ADMISSION */}
  
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            handleQuickPrompt(
                              "What is my admission status and what should I do next?"
                            )
                          }
                          className="
                            group
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
                            🎓
                          </div>
  
                          <div
                            className="
                              text-sm
                              font-semibold
                              text-gray-900
                            "
                          >
                            Admission & Application
                          </div>
  
                          <div
                            className="
                              mt-1
                              text-xs
                              leading-5
                              text-gray-500
                            "
                          >
                            Check your admission status
                            and application information.
                          </div>
  
                        </button>
  
  
                        {/* DOCUMENTS */}
  
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            handleQuickPrompt(
                              "Which documents are required and which of my documents are still missing?"
                            )
                          }
                          className="
                            group
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
                              bg-indigo-50
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
                            My Documents
                          </div>
  
                          <div
                            className="
                              mt-1
                              text-xs
                              leading-5
                              text-gray-500
                            "
                          >
                            Find missing documents and
                            understand document requirements.
                          </div>
  
                        </button>
  
  
                        {/* FEES */}
  
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            handleQuickPrompt(
                              "What is my current fee status and do I have any pending fees?"
                            )
                          }
                          className="
                            group
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
                            Fees & Payments
                          </div>
  
                          <div
                            className="
                              mt-1
                              text-xs
                              leading-5
                              text-gray-500
                            "
                          >
                            Check your fee status and
                            pending payments.
                          </div>
  
                        </button>
  
  
                        {/* ONBOARDING */}
  
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            handleQuickPrompt(
                              "What is my onboarding status and what should I do next?"
                            )
                          }
                          className="
                            group
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
                              bg-violet-50
                              text-lg
                            "
                          >
                            ✅
                          </div>
  
                          <div
                            className="
                              text-sm
                              font-semibold
                              text-gray-900
                            "
                          >
                            My Onboarding
                          </div>
  
                          <div
                            className="
                              mt-1
                              text-xs
                              leading-5
                              text-gray-500
                            "
                          >
                            See your onboarding progress
                            and next required action.
                          </div>
  
                        </button>
  
                      </div>
  
  
                      {/* HELPER TEXT */}
  
                      <div
                        className="
                          mt-8
                          text-center
                          text-xs
                          text-gray-400
                        "
                      >
                        You can also ask me anything
                        about your campus services.
                      </div>
  
                    </div>
  
                  </div>
  
                ) : (
  
                  /* ===========================================
                     CHAT WINDOW
                  =========================================== */
  
                  <ChatWindow
                    messages={messages}
                    loading={loading}
                  />
  
                )}
  
              </div>
  
  
              {/* ===============================================
                  INPUT
              =============================================== */}
  
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
  
  
  export default NewStudentChat;