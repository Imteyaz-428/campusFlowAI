import { useRef, useState } from "react";
import { Send } from "lucide-react";

function ChatInput({
  onSend,
  loading,
}) {
  const [question, setQuestion] = useState("");

  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!question.trim()) {
      return;
    }

    onSend(question.trim());

    setQuestion("");

    textareaRef.current.style.height = "56px";
    textareaRef.current.focus();
  };

  const handleChange = (e) => {
    setQuestion(e.target.value);

    e.target.style.height = "56px";
    e.target.style.height =
      e.target.scrollHeight + "px";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-white px-6 py-5">

      <div className="flex items-end gap-4">

        <textarea
          ref={textareaRef}
          rows={1}
          value={question}
          disabled={loading}
          placeholder="Ask something about your documents..."
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          style={{
            minHeight: "56px",
            maxHeight: "180px",
          }}
        />

        <button
          onClick={handleSend}
          disabled={loading || !question.trim()}
          className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={20} />
        </button>

      </div>

      <p className="mt-3 text-xs text-gray-400">
        Press Enter to send • Shift + Enter for a new line
      </p>

    </div>
  );
}

export default ChatInput;