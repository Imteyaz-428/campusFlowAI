import {
    Bot,
    FileText,
    BookOpen,
    Lightbulb,
    Search,
  } from "lucide-react";
  
  function EmptyChat() {
    const prompts = [
      {
        icon: <FileText size={18} />,
        title: "Summarize a document",
        description: "Generate a concise summary of your PDF.",
      },
      {
        icon: <BookOpen size={18} />,
        title: "Explain concepts",
        description: "Understand technical topics in simple words.",
      },
      {
        icon: <Lightbulb size={18} />,
        title: "Key insights",
        description: "Extract important points and takeaways.",
      },
      {
        icon: <Search size={18} />,
        title: "Ask anything",
        description: "Search across your uploaded knowledge base.",
      },
    ];
  
    return (
      <div className="flex flex-1 items-center justify-center px-8">
  
        <div className="w-full max-w-3xl text-center">
  
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <Bot
              size={38}
              className="text-blue-600"
            />
          </div>
  
          <h1 className="text-4xl font-bold text-gray-900">
            Enterprise RAG Assistant
          </h1>
  
          <p className="mt-3 text-lg text-gray-500">
            Chat with your organization's documents using AI.
          </p>
  
          <div className="mt-12 grid gap-4 md:grid-cols-2">
  
            {prompts.map((item) => (
              <button
                key={item.title}
                className="rounded-2xl border bg-white p-5 text-left transition hover:border-blue-500 hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  {item.icon}
                </div>
  
                <h3 className="font-semibold text-gray-900">
                  {item.title}
                </h3>
  
                <p className="mt-2 text-sm text-gray-500">
                  {item.description}
                </p>
              </button>
            ))}
  
          </div>
  
        </div>
  
      </div>
    );
  }
  
  export default EmptyChat;