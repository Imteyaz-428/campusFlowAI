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
  
        <div className="border-b bg-white p-4">
  
          <button
            onClick={onNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-700"
          >
            <Plus size={18} />
            New Chat
          </button>
  
        </div>
  
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
  
                <button
                  key={session.id}
                  onClick={() => onSelect(session.id)}
                  className={`group flex w-full items-center justify-between rounded-xl p-3 text-left transition ${
                    currentSessionId === session.id
                      ? "bg-blue-100 border border-blue-200"
                      : "hover:bg-white"
                  }`}
                >
  
                  <div className="flex min-w-0 items-start gap-3">
  
                    <div className="mt-1">
  
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
  
                  </div>
  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(session.id);
                    }}
                    className="rounded-md p-1 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
  
                </button>
  
              ))}
  
            </div>
  
          )}
  
        </div>
  
      </div>
    );
  }
  
  export default ChatSidebar;