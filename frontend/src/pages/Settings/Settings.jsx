import Layout from "../../components/layout/Layout";
import ProfileCard from "../../components/settings/ProfileCard";
import PasswordCard from "../../components/settings/PasswordCard";

import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";


function Settings() {
  const navigate = useNavigate();

  return (
    <Layout>

      <div className="mx-auto max-w-5xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Settings
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your account settings, security,
            and college configuration.
          </p>

        </div>


        <div className="space-y-8">

          {/* ===================================================
              PROFILE
          =================================================== */}

          <ProfileCard />


          {/* ===================================================
              PASSWORD
          =================================================== */}

          <PasswordCard />


          {/* ===================================================
              COLLEGE CONFIGURATION
          =================================================== */}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* HEADER */}

            <div className="border-b border-gray-200 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-indigo-100 p-2">

                  <GraduationCap
                    size={20}
                    className="text-indigo-600"
                  />

                </div>

                <div>

                  <h2 className="text-lg font-semibold text-gray-900">
                    College Configuration
                  </h2>

                  <p className="text-sm text-gray-500">
                    Manage official college information
                    used by CampusFlow AI.
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                OPTIONS
            ================================================= */}

            <div className="space-y-3 p-5">

              {/* ===============================================
                  KNOWLEDGE BASE
              =============================================== */}

              <button
                onClick={() =>
                  navigate(
                    "/settings/college-knowledge"
                  )
                }
                className="group flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
              >

                <div className="flex items-start gap-4">

                  <div className="rounded-lg bg-gray-100 p-2.5 transition group-hover:bg-blue-100">

                    <BookOpen
                      size={20}
                      className="text-gray-600 group-hover:text-blue-600"
                    />

                  </div>


                  <div>

                    <h3 className="font-semibold text-gray-900">
                      College Knowledge Base
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Upload official admission procedures,
                      required documents, fee information,
                      academic rules, scholarships, and
                      other college documents used by the
                      AI knowledge system.
                    </p>


                    <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-green-600">

                      <ShieldCheck size={14} />

                      Official college knowledge

                    </div>

                  </div>

                </div>


                <ChevronRight
                  size={20}
                  className="shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
                />

              </button>


              {/* ===============================================
                  ADMISSION CRITERIA
              =============================================== */}

              <button
                onClick={() =>
                  navigate(
                    "/settings/admission-criteria"
                  )
                }
                className="group flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50/40"
              >

                <div className="flex items-start gap-4">

                  <div className="rounded-lg bg-gray-100 p-2.5 transition group-hover:bg-indigo-100">

                    <GraduationCap
                      size={20}
                      className="text-gray-600 group-hover:text-indigo-600"
                    />

                  </div>


                  <div>

                    <h3 className="font-semibold text-gray-900">
                      Admission Criteria
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Configure program-specific eligibility
                      rules such as minimum academic
                      percentages, age requirements, and
                      entrance examinations.
                    </p>


                    <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-indigo-600">

                      <ShieldCheck size={14} />

                      Administrator controlled

                    </div>

                  </div>

                </div>


                <ChevronRight
                  size={20}
                  className="shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-600"
                />

              </button>

            </div>

          </div>

        </div>

      </div>

    </Layout>
  );
}


export default Settings;