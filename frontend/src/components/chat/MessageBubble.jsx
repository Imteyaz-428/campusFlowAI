import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import CitationList from "./CitationList";

function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex mb-6 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-4 ${
          isUser
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-white border border-gray-200 shadow-sm rounded-bl-md"
        }`}
      >
        <p
          className={`mb-3 text-xs font-semibold ${
            isUser ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {isUser ? "You" : "AI Assistant"}
        </p>

        <div
          className={`prose prose-sm max-w-none leading-7 ${
            isUser
              ? "prose-invert text-white"
              : "text-gray-800"
          }`}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>

        {!isUser && (
          <CitationList citations={message.citations} />
        )}
      </div>
    </div>
  );
}

export default MessageBubble;