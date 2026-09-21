import {
  MessageSquare,
  Plus,
  Trash2,
} from "lucide-react";

function ChatSidebar({
  sessions,
  currentSessionId,
  onSelect,
  onDelete,
  onNewChat,
}) {
  return (
    <div className="flex h-full flex-col bg-gray-50">

      {/* ======================================================
          NEW CHAT
      ====================================================== */}

      <div className="border-b bg-white p-4">

        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          New Chat
        </button>

      </div>


      {/* ======================================================
          CHAT SESSIONS
      ====================================================== */}

      <div className="flex-1 overflow-y-auto p-3">

        {sessions.length === 0 ? (

          <div className="mt-16 flex flex-col items-center text-center text-gray-500">

            <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
              <MessageSquare
                size={28}
                className="text-blue-600"
              />
            </div>

            <p className="font-medium">
              No chats yet
            </p>

            <p className="mt-1 text-sm">
              Start a new AI conversation.
            </p>

          </div>

        ) : (

          <div className="space-y-2">

            {sessions.map((session) => (

              <div
                key={session.id}
                className={`group flex w-full items-center rounded-xl transition ${
                  currentSessionId === session.id
                    ? "border border-blue-200 bg-blue-100"
                    : "hover:bg-white"
                }`}
              >

                {/* ==================================================
                    SESSION BUTTON
                ================================================== */}

                <button
                  type="button"
                  onClick={() =>
                    onSelect(session.id)
                  }
                  className="flex min-w-0 flex-1 items-center gap-3 p-3 text-left"
                >

                  <div className="mt-1 shrink-0">

                    <MessageSquare
                      size={16}
                      className={
                        currentSessionId === session.id
                          ? "text-blue-600"
                          : "text-gray-500"
                      }
                    />

                  </div>


                  <div className="min-w-0">

                    <p className="truncate text-sm font-medium text-gray-900">
                      {session.title}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Chat #{session.id}
                    </p>

                  </div>

                </button>


                {/* ==================================================
                    DELETE BUTTON
                ================================================== */}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(session.id);
                  }}
                  aria-label={`Delete chat ${session.id}`}
                  className="mr-2 shrink-0 rounded-md p-1.5 text-gray-400 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
                >

                  <Trash2 size={15} />

                </button>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default ChatSidebar;