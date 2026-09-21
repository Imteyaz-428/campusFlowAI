import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  Bot,
  Sparkles,
  Plus,
  MessageSquare,
} from "lucide-react";

import ApplicantLayout from "../../components/layout/ApplicantLayout";

import ChatWindow from "../../components/chat/ChatWindow";
import ChatInput from "../../components/chat/ChatInput";
import ChatSidebar from "../../components/chat/ChatSidebar";

import {
  getApplicantAgentSessions,
  getApplicantAgentSession,
  deleteApplicantAgentSession,
  sendApplicantAgentMessage,
} from "../../services/applicantChat";


// ================================================================
// APPLICANT CHAT
// ================================================================

function ApplicantChat() {


  // STATE


  const [sessions, setSessions] = useState([]);

  const [currentSessionId, setCurrentSessionId] =
    useState(null);

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);

  const [loadingSessions, setLoadingSessions] =
    useState(true);



  // LOAD SESSIONS


  const loadSessions = async () => {

    try {

      setLoadingSessions(true);

      const response =
        await getApplicantAgentSessions();

      /*
       * Backend may return:
       *
       * [
       *   {...},
       *   {...}
       * ]
       *
       * OR:
       *
       * {
       *   sessions: [...]
       * }
       */

      const sessionData =
        Array.isArray(response)
          ? response
          : response?.sessions || [];

      setSessions(sessionData);

    } catch (error) {

      console.error(
        "Failed to load applicant chats:",
        error
      );

      // ----------------------------------------------------------
      // AUTHENTICATION ERROR
      // ----------------------------------------------------------

      if (
        error?.response?.status === 401
      ) {

        localStorage.removeItem(
          "applicant_token"
        );

        localStorage.removeItem(
          "applicant_application_number"
        );

        localStorage.removeItem(
          "applicant_organization_slug"
        );

        window.location.replace(
          "/applicant/login"
        );

        return;
      }

      toast.error(
        error?.response?.data?.detail ||
        "Unable to load your previous chats."
      );

    } finally {

      setLoadingSessions(false);

    }
  };



  // INITIAL LOAD


  useEffect(() => {

    loadSessions();

  }, []);



  // NEW CHAT


  const handleNewChat = () => {

    if (loading) {
      return;
    }

    setCurrentSessionId(null);

    setMessages([]);

  };



  // SELECT SESSION


  const handleSelectSession = async (
    sessionId
  ) => {

    if (loading) {
      return;
    }

    if (!sessionId) {
      return;
    }

    try {

      setLoading(true);

      const response =
        await getApplicantAgentSession(
          sessionId
        );

      /*
       * Backend normally returns:
       *
       * {
       *   id,
       *   messages: [...]
       * }
       */

      const session =
        response?.session ||
        response;

      const returnedSessionId =
        session?.id ||
        sessionId;

      const sessionMessages =
        Array.isArray(
          session?.messages
        )
          ? session.messages
          : [];

      setCurrentSessionId(
        returnedSessionId
      );

      setMessages(
        sessionMessages.map(
          (message) => ({
            role:
              message.role ||
              "assistant",

            content:
              message.content ||
              message.message ||
              "",

            citations:
              message.citations ||
              [],
          })
        )
      );

    } catch (error) {

      console.error(
        "Failed to open applicant chat:",
        error
      );

      if (
        error?.response?.status === 401
      ) {

        localStorage.removeItem(
          "applicant_token"
        );

        window.location.replace(
          "/applicant/login"
        );

        return;
      }

      toast.error(
        error?.response?.data?.detail ||
        "Unable to open this conversation."
      );

    } finally {

      setLoading(false);

    }
  };



  // DELETE SESSION


  const handleDeleteSession = async (
    sessionId
  ) => {

    if (loading) {
      return;
    }

    if (!sessionId) {
      return;
    }

    try {

      await deleteApplicantAgentSession(
        sessionId
      );

      setSessions(
        (previous) =>
          previous.filter(
            (session) =>
              session.id !== sessionId
          )
      );

      /*
       * If the deleted session is currently open,
       * reset the chat window.
       */

      if (
        currentSessionId === sessionId
      ) {

        setCurrentSessionId(null);

        setMessages([]);

      }

      toast.success(
        "Conversation deleted."
      );

    } catch (error) {

      console.error(
        "Failed to delete applicant chat:",
        error
      );

      if (
        error?.response?.status === 401
      ) {

        localStorage.removeItem(
          "applicant_token"
        );

        window.location.replace(
          "/applicant/login"
        );

        return;
      }

      toast.error(
        error?.response?.data?.detail ||
        "Unable to delete this conversation."
      );

    }
  };



  // SEND MESSAGE


  const handleSend = async (
    question
  ) => {

    if (loading) {
      return;
    }

    const trimmedQuestion =
      String(question || "").trim();

    if (!trimmedQuestion) {
      return;
    }


    // ------------------------------------------------------------
    // OPTIMISTIC USER MESSAGE
    // ------------------------------------------------------------

    const userMessage = {
      role: "user",
      content: trimmedQuestion,
      citations: [],
    };

    setMessages(
      (previous) => [
        ...previous,
        userMessage,
      ]
    );

    setLoading(true);


    try {

      // ----------------------------------------------------------
      // SEND TO APPLICANT AGENT
      // ----------------------------------------------------------

      const response =
        await sendApplicantAgentMessage({
          message: trimmedQuestion,
          sessionId: currentSessionId,
        });


      // ----------------------------------------------------------
      // SESSION ID
      // ----------------------------------------------------------

      /*
       * New chat:
       *
       * currentSessionId = null
       *
       * Backend creates a session and returns:
       *
       * {
       *   session_id: "..."
       * }
       */

      const returnedSessionId =
        response?.session_id ||
        response?.sessionId ||
        response?.session?.id ||
        null;


      if (
        returnedSessionId
      ) {

        setCurrentSessionId(
          returnedSessionId
        );

      }


      // ----------------------------------------------------------
      // AI MESSAGE
      // ----------------------------------------------------------

      const assistantContent =
        response?.message ||
        response?.answer ||
        response?.response ||
        response?.content ||
        "I couldn't generate a response.";


      const assistantMessage = {
        role: "assistant",

        content:
          assistantContent,

        citations:
          response?.citations ||
          [],
      };


      setMessages(
        (previous) => [
          ...previous,
          assistantMessage,
        ]
      );


      // ----------------------------------------------------------
      // REFRESH SESSION LIST
      // ----------------------------------------------------------

      /*
       * This makes the newly created conversation
       * immediately appear in the sidebar.
       */

      await loadSessions();

    } catch (error) {

      console.error(
        "Applicant chat failed:",
        error
      );


      // ----------------------------------------------------------
      // AUTH ERROR
      // ----------------------------------------------------------

      if (
        error?.response?.status === 401
      ) {

        localStorage.removeItem(
          "applicant_token"
        );

        window.location.replace(
          "/applicant/login"
        );

        return;
      }


      // ----------------------------------------------------------
      // REMOVE OPTIMISTIC USER MESSAGE
      // ----------------------------------------------------------

      setMessages(
        (previous) => {

          const copy = [
            ...previous,
          ];

          const last =
            copy[copy.length - 1];

          if (
            last?.role === "user" &&
            last?.content ===
              trimmedQuestion
          ) {

            copy.pop();

          }

          return copy;

        }
      );


      // ----------------------------------------------------------
      // ERROR MESSAGE
      // ----------------------------------------------------------

      toast.error(
        error?.response?.data?.detail ||
        error?.message ||
        "Something went wrong while contacting CampusFlow AI."
      );

    } finally {

      setLoading(false);

    }
  };



  // SUGGESTION


  const handleSuggestion = (
    question
  ) => {

    if (loading) {
      return;
    }

    handleSend(question);

  };



  // UI


  return (

    <ApplicantLayout>

      <div className="flex h-[calc(100vh-110px)] min-h-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* ======================================================
            SIDEBAR
        ======================================================= */}

        <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-gray-50 md:flex md:flex-col">

          {/* ----------------------------------------------------
              NEW CHAT
          ----------------------------------------------------- */}

          <div className="border-b border-gray-200 p-3">

            <button
              type="button"
              onClick={handleNewChat}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <Plus size={17} />

              New Chat

            </button>

          </div>


          {/* ----------------------------------------------------
              TITLE
          ----------------------------------------------------- */}

          <div className="px-4 py-3">

            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Conversations
            </p>

          </div>


          {/* ----------------------------------------------------
              SESSION LIST
          ----------------------------------------------------- */}

          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">

            {loadingSessions ? (

              <div className="flex items-center justify-center px-4 py-8">

                <div className="text-center">

                  <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />

                  <p className="mt-3 text-xs text-gray-500">
                    Loading conversations...
                  </p>

                </div>

              </div>

            ) : sessions.length === 0 ? (

              <div className="px-4 py-8 text-center">

                <MessageSquare
                  size={22}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 text-xs font-medium text-gray-500">
                  No conversations yet
                </p>

                <p className="mt-1 text-[11px] leading-5 text-gray-400">
                  Start a conversation with CampusFlow AI.
                </p>

              </div>

            ) : (

              <ChatSidebar
                sessions={sessions}
                currentSessionId={
                  currentSessionId
                }
                onSelect={
                  handleSelectSession
                }
                onDelete={
                  handleDeleteSession
                }
                onNewChat={
                  handleNewChat
                }
              />

            )}

          </div>

        </aside>


        {/* ======================================================
            MAIN CHAT
        ======================================================= */}

        <div className="flex min-w-0 flex-1 flex-col">

          {/* ====================================================
              HEADER
          ==================================================== */}

          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 py-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900">

                <Bot
                  size={20}
                  className="text-white"
                />

              </div>


              <div>

                <div className="flex items-center gap-2">

                  <p className="text-lg font-bold text-gray-900">
                    Applicant AI Assistant
                  </p>

                  <Sparkles
                    size={15}
                    className="text-blue-500"
                  />

                </div>

                <p className="text-xs text-gray-500">
                  Your admission and application assistant
                </p>

              </div>

            </div>


            {/* --------------------------------------------------
                MOBILE NEW CHAT
            --------------------------------------------------- */}

            <button
              type="button"
              onClick={handleNewChat}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 md:hidden"
            >

              <Plus size={16} />

              <span className="hidden sm:inline">
                New Chat
              </span>

            </button>

          </div>


          {/* ====================================================
              CHAT BODY
          ==================================================== */}

          <div className="min-h-0 flex-1">

            {messages.length === 0 ? (

              <ApplicantEmptyState
                onSuggestion={
                  handleSuggestion
                }
              />

            ) : (

              <ChatWindow
                messages={messages}
                loading={loading}
              />

            )}

          </div>


          {/* ====================================================
              INPUT
          ==================================================== */}

          <ChatInput
            loading={loading}
            onSend={handleSend}
          />

        </div>

      </div>

    </ApplicantLayout>

  );
}


// ================================================================
// EMPTY STATE
// ================================================================

function ApplicantEmptyState({
  onSuggestion,
}) {

  return (

    <div className="flex h-full items-center justify-center overflow-y-auto px-6 py-10">

      <div className="w-full max-w-2xl text-center">

        {/* ------------------------------------------------------
            ICON
        ------------------------------------------------------- */}

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 shadow-sm">

          <Bot
            size={28}
            className="text-white"
          />

        </div>


        {/* ------------------------------------------------------
            TITLE
        ------------------------------------------------------- */}

        <div className="mt-5 flex items-center justify-center gap-2">

          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            How can I help with your application?
          </h2>

        </div>


        {/* ------------------------------------------------------
            DESCRIPTION
        ------------------------------------------------------- */}

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">

          Ask CampusFlow AI about your application,
          admission requirements, documents, fees,
          or the next steps in your admission.

        </p>


        {/* ------------------------------------------------------
            SUGGESTIONS
        ------------------------------------------------------- */}

        <div className="mt-7 grid gap-3 sm:grid-cols-2">

          <Suggestion
            icon="📄"
            text="What documents are required?"
            onClick={onSuggestion}
          />

          <Suggestion
            icon="🔎"
            text="What is my application status?"
            onClick={onSuggestion}
          />

          <Suggestion
            icon="🎓"
            text="What are the admission requirements?"
            onClick={onSuggestion}
          />

          <Suggestion
            icon="📋"
            text="How does the admission process work?"
            onClick={onSuggestion}
          />

        </div>


        {/* ------------------------------------------------------
            INFO
        ------------------------------------------------------- */}

        <div className="mt-7 flex items-center justify-center gap-2 text-xs text-gray-400">

          <Sparkles size={13} />

          <span>
            CampusFlow AI uses your authenticated applicant
            information to assist you.
          </span>

        </div>

      </div>

    </div>

  );
}


// ================================================================
// SUGGESTION
// ================================================================

function Suggestion({
  icon,
  text,
  onClick,
}) {

  return (

    <button
      type="button"
      onClick={() => onClick(text)}
      className="group rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-left transition hover:border-gray-300 hover:bg-white hover:shadow-sm"
    >

      <div className="flex items-center gap-3">

        <span className="text-lg">
          {icon}
        </span>

        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
          {text}
        </span>

      </div>

    </button>

  );
}


export default ApplicantChat;