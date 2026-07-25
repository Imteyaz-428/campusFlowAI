import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
          className={`text-xs font-semibold mb-3 ${
            isUser ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {isUser ? "You" : "AI Assistant"}
        </p>

        <div
          className={`leading-7 text-[15px] ${
            isUser ? "text-white" : "text-gray-800"
          }`}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;