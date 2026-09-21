import {
    ArrowRight,
    Building2,
    FileText,
    GraduationCap,
    LogIn,
    ShieldCheck,
    UserRound,
  } from "lucide-react";
  
  import { useNavigate } from "react-router-dom";
  
  function Landing() {
    const navigate = useNavigate();
  
    /* =========================================================
       NAVIGATION
    ========================================================= */
  
    const goToLogin = () => {
      navigate("/login");
    };
  
    const goToOrganizationSignup = () => {
      navigate("/signup");
    };
  
    const goToApplicantLogin = () => {
      navigate("/applicant/login");
    };
  
    const goToApplicantApply = () => {
      navigate("/apply");
    };
  
    /* =========================================================
       UI
    ========================================================= */
  
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
  
        {/* =====================================================
            HEADER
        ===================================================== */}
  
        <header className="border-b border-gray-200 bg-white">
  
          <div
            className="
              mx-auto
              flex
              max-w-6xl
              items-center
              justify-between
              px-5
              py-4
              sm:px-6
            "
          >
  
            {/* BRAND */}
  
            <button
              type="button"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              className="flex items-center gap-3 text-left"
            >
  
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-gray-900
                "
              >
                <GraduationCap
                  size={24}
                  className="text-white"
                />
              </div>
  
              <div>
  
                <h1
                  className="
                    text-xl
                    font-bold
                    leading-none
                    tracking-tight
                    text-gray-900
                  "
                >
                  CampusFlow AI
                </h1>
  
                <p
                  className="
                    mt-1
                    text-xs
                    text-gray-500
                  "
                >
                  Intelligent Campus Process Automation
                </p>
  
              </div>
  
            </button>
  
  
            {/* LOGIN */}
  
            <button
              type="button"
              onClick={goToLogin}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-gray-200
                bg-white
                px-5
                py-2.5
                text-sm
                font-semibold
                text-gray-700
                transition
                hover:border-gray-300
                hover:bg-gray-100
              "
            >
  
              <LogIn size={17} />
  
              Login
  
            </button>
  
          </div>
  
        </header>
  
  
        {/* =====================================================
            MAIN
        ===================================================== */}
  
        <main
          className="
            mx-auto
            max-w-6xl
            px-5
            py-10
            sm:px-6
            sm:py-12
          "
        >
  
          <div className="w-full">
  
  
            {/* =================================================
                HERO
            ================================================= */}
  
            <div
              className="
                mx-auto
                max-w-3xl
                text-center
              "
            >
  
              <div
                className="
                  mx-auto
                  mb-5
                  flex
                  h-20
                  w-20
                  items-center
                  justify-center
                  rounded-2xl
                  bg-gray-900
                  shadow-sm
                "
              >
  
                <GraduationCap
                  size={40}
                  strokeWidth={1.8}
                  className="text-white"
                />
  
              </div>
  
  
              <h2
                className="
                  text-4xl
                  font-bold
                  tracking-tight
                  text-gray-950
                  sm:text-5xl
                  lg:text-6xl
                "
              >
                Welcome to CampusFlow AI
              </h2>
  
  
              <p
                className="
                  mx-auto
                  mt-4
                  max-w-2xl
                  text-base
                  leading-7
                  text-gray-500
                  sm:text-lg
                "
              >
                One platform for managing admissions,
                students, documents, fees, onboarding
                and campus services.
              </p>
  
            </div>
  
  
            {/* =================================================
                EXISTING USERS
            ================================================= */}
  
            <section className="mx-auto mt-10 max-w-5xl">
  
              <div className="mb-4 text-center">
  
                <h3
                  className="
                    text-base
                    font-bold
                    text-gray-900
                  "
                >
                  Already part of a campus?
                </h3>
  
                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-500
                  "
                >
                  Login using your CampusFlow account.
                </p>
  
              </div>
  
  
              <button
                type="button"
                onClick={goToLogin}
                className="
                  group
                  w-full
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  p-6
                  text-left
                  shadow-sm
                  transition
                  hover:border-gray-300
                  hover:shadow-md
                "
              >
  
                <div
                  className="
                    flex
                    items-center
                    gap-5
                  "
                >
  
                  <div
                    className="
                      flex
                      h-14
                      w-14
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-gray-100
                      transition
                      group-hover:bg-gray-900
                    "
                  >
  
                    <UserRound
                      size={26}
                      className="
                        text-gray-700
                        transition
                        group-hover:text-white
                      "
                    />
  
                  </div>
  
  
                  <div className="min-w-0 flex-1">
  
                    <h4
                      className="
                        text-base
                        font-bold
                        text-gray-900
                        sm:text-lg
                      "
                    >
                      Campus User Login
                    </h4>
  
                    <p
                      className="
                        mt-1
                        text-sm
                        leading-6
                        text-gray-500
                      "
                    >
                      Admin, teacher, staff or student can
                      access their CampusFlow account.
                    </p>
  
                  </div>
  
  
                  <ArrowRight
                    size={22}
                    className="
                      shrink-0
                      text-gray-300
                      transition
                      group-hover:translate-x-1
                      group-hover:text-gray-900
                    "
                  />
  
                </div>
  
              </button>
  
            </section>
  
  
            {/* =================================================
                APPLICANT PORTAL
            ================================================= */}
  
            <section className="mx-auto mt-8 max-w-5xl">
  
              <div className="mb-4 text-center">
  
                <h3
                  className="
                    text-base
                    font-bold
                    text-gray-900
                  "
                >
                  Applicant Portal
                </h3>
  
                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-500
                  "
                >
                  Applying to a college through CampusFlow?
                </p>
  
              </div>
  
  
              <div
                className="
                  grid
                  gap-5
                  sm:grid-cols-2
                "
              >
  
                {/* APPLICANT LOGIN */}
  
                <button
                  type="button"
                  onClick={goToApplicantLogin}
                  className="
                    group
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    p-6
                    text-left
                    shadow-sm
                    transition
                    hover:border-gray-300
                    hover:shadow-md
                  "
                >
  
                  <div
                    className="
                      flex
                      items-start
                      justify-between
                    "
                  >
  
                    <div
                      className="
                        flex
                        h-13
                        w-13
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-50
                      "
                    >
  
                      <LogIn
                        size={24}
                        className="text-blue-600"
                      />
  
                    </div>
  
  
                    <ArrowRight
                      size={21}
                      className="
                        text-gray-300
                        transition
                        group-hover:translate-x-1
                        group-hover:text-gray-900
                      "
                    />
  
                  </div>
  
  
                  <h4
                    className="
                      mt-5
                      text-base
                      font-bold
                      text-gray-900
                      sm:text-lg
                    "
                  >
                    Applicant Login
                  </h4>
  
  
                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-gray-500
                    "
                  >
                    Already applied? Login to check your
                    application and admission status.
                  </p>
  
                </button>
  
  
                {/* NEW APPLICANT */}
  
                <button
                  type="button"
                  onClick={goToApplicantApply}
                  className="
                    group
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    p-6
                    text-left
                    shadow-sm
                    transition
                    hover:border-gray-300
                    hover:shadow-md
                  "
                >
  
                  <div
                    className="
                      flex
                      items-start
                      justify-between
                    "
                  >
  
                    <div
                      className="
                        flex
                        h-13
                        w-13
                        items-center
                        justify-center
                        rounded-xl
                        bg-green-50
                      "
                    >
  
                      <FileText
                        size={24}
                        className="text-green-600"
                      />
  
                    </div>
  
  
                    <ArrowRight
                      size={21}
                      className="
                        text-gray-300
                        transition
                        group-hover:translate-x-1
                        group-hover:text-gray-900
                      "
                    />
  
                  </div>
  
  
                  <h4
                    className="
                      mt-5
                      text-base
                      font-bold
                      text-gray-900
                      sm:text-lg
                    "
                  >
                    New Applicant
                  </h4>
  
  
                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-gray-500
                    "
                  >
                    Create your application and start
                    the admission process.
                  </p>
  
                </button>
  
              </div>
  
            </section>
  
  
            {/* =================================================
                ORGANIZATION
            ================================================= */}
  
            <section className="mx-auto mt-8 max-w-5xl">
  
              <div
                className="
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  p-6
                  shadow-sm
                "
              >
  
                <div
                  className="
                    flex
                    flex-col
                    gap-5
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
  
                  <div
                    className="
                      flex
                      items-center
                      gap-4
                    "
                  >
  
                    <div
                      className="
                        flex
                        h-14
                        w-14
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-violet-50
                      "
                    >
  
                      <Building2
                        size={25}
                        className="text-violet-600"
                      />
  
                    </div>
  
  
                    <div>
  
                      <h3
                        className="
                          text-base
                          font-bold
                          text-gray-900
                          sm:text-lg
                        "
                      >
                        Setting up CampusFlow
                        for your institution?
                      </h3>
  
                      <p
                        className="
                          mt-1
                          text-sm
                          leading-6
                          text-gray-500
                        "
                      >
                        Create a new organization and
                        start managing your campus.
                      </p>
  
                    </div>
  
                  </div>
  
  
                  <button
                    type="button"
                    onClick={goToOrganizationSignup}
                    className="
                      inline-flex
                      shrink-0
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-gray-900
                      px-6
                      py-3.5
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-gray-800
                    "
                  >
  
                    Create Organization
  
                    <ArrowRight size={17} />
  
                  </button>
  
                </div>
  
              </div>
  
            </section>
  
  
            {/* =================================================
                INFORMATION
            ================================================= */}
  
            <div
              className="
                mx-auto
                mt-8
                flex
                max-w-5xl
                flex-wrap
                items-center
                justify-center
                gap-x-8
                gap-y-3
                text-xs
                text-gray-400
              "
            >
  
              <div className="flex items-center gap-2">
  
                <ShieldCheck size={15} />
  
                Role-based access
  
              </div>
  
  
              <div className="flex items-center gap-2">
  
                <GraduationCap size={15} />
  
                Student services
  
              </div>
  
  
              <div className="flex items-center gap-2">
  
                <Building2 size={15} />
  
                Multi-organization
  
              </div>
  
            </div>
  
  
            {/* =================================================
                FOOTER
            ================================================= */}
  
            <footer
              className="
                mt-10
                border-t
                border-gray-200
                pt-5
                text-center
              "
            >
  
              <p
                className="
                  text-sm
                  font-semibold
                  text-gray-500
                "
              >
                CampusFlow AI
              </p>
  
              <p
                className="
                  mt-1
                  text-xs
                  text-gray-400
                "
              >
                Intelligent Campus Process Automation
              </p>
  
            </footer>
  
          </div>
  
        </main>
  
      </div>
    );
  }
  
  export default Landing;