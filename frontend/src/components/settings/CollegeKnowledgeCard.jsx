import {
    BookOpen,
    ChevronRight,
    FileText,
    ShieldCheck,
  } from "lucide-react";
  
  import { useNavigate } from "react-router-dom";
  
  
  function CollegeKnowledgeCard() {
  
    const navigate = useNavigate();
  
  
    return (
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
  
        {/* ======================================================
            HEADER
        ====================================================== */}
  
        <div className="flex items-center justify-between border-b px-6 py-5">
  
          <div className="flex items-center gap-3">
  
            <div className="rounded-lg bg-indigo-100 p-2">
  
              <BookOpen
                size={20}
                className="text-indigo-600"
              />
  
            </div>
  
            <div>
  
              <h2 className="text-lg font-semibold text-gray-900">
                College Configuration
              </h2>
  
              <p className="text-sm text-gray-500">
                Manage official college information used by CampusFlow AI.
              </p>
  
            </div>
  
          </div>
  
        </div>
  
  
        {/* ======================================================
            KNOWLEDGE BASE
        ====================================================== */}
  
        <div className="p-6">
  
          <button
            type="button"
            onClick={() =>
              navigate(
                "/settings/college-knowledge"
              )
            }
            className="group flex w-full items-center justify-between rounded-2xl border border-gray-200 p-5 text-left transition hover:border-gray-300 hover:bg-gray-50"
          >
  
            <div className="flex items-start gap-4">
  
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100">
  
                <FileText
                  size={21}
                  className="text-gray-700"
                />
  
              </div>
  
              <div>
  
                <h3 className="font-semibold text-gray-900">
                  College Knowledge Base
                </h3>
  
                <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
  
                  Upload official admission procedures, required documents,
                  fee information, academic rules, scholarships, and other
                  college documents used by the AI knowledge system.
  
                </p>
  
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-green-700">
  
                  <ShieldCheck
                    size={15}
                  />
  
                  Official college knowledge
  
                </div>
  
              </div>
  
            </div>
  
  
            <ChevronRight
              size={20}
              className="shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-gray-700"
            />
  
          </button>
  
        </div>
  
      </div>
    );
  }
  
  export default CollegeKnowledgeCard;