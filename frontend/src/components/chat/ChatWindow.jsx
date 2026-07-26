import { useEffect, useRef } from "react";

import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

function ChatWindow({
  messages,
  loading,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  return (
    <div className="h-full overflow-y-auto bg-white">

      <div className="mx-auto flex max-w-5xl flex-col px-8 py-8">

      {messages.map((message, index) => {
  
  return (
    <MessageBubble
      key={index}
      message={message}
    />
  );
})}

        {loading && <TypingIndicator />}

        <div className="h-8" />

        <div ref={bottomRef} />

      </div>

    </div>
  );
}

export default ChatWindow;