import { useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  User,
  Mail,
  Phone,
  Building2,
  CalendarDays,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";

import api from "../../../services/api";

function ApplicantApply() {
  const [formData, setFormData] = useState({
    organization_slug: "gcet",
    full_name: "",
    email: "",
    phone: "",
    program: "",
    department: "",
    academic_year: "2026",
    semester: "",
    password: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // Frontend validation
    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (!formData.organization_slug.trim()) {
      setError("Please enter your organization.");
      return;
    }

    if (!formData.full_name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!formData.program) {
      setError("Please select a program.");
      return;
    }

    if (!formData.department) {
      setError("Please select a department.");
      return;
    }

    if (!formData.academic_year) {
      setError("Please enter your academic year.");
      return;
    }

    if (!formData.semester) {
      setError("Please select your semester.");
      return;
    }

    setLoading(true);

    try {
      /*
       * Send application to the real backend.
       *
       * Backend:
       * POST /campus/students/
       */

      const payload = {
        organization_slug: formData.organization_slug.trim(),
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        program: formData.program,
        department: formData.department,
        academic_year: Number(formData.academic_year),
        semester: Number(formData.semester),
        password: formData.password,
      };

      const response = await api.post(
        "/campus/students/",
        payload
      );

      console.log("Application submitted:", response.data);

      /*
       * Backend generates the REAL application number.
       *
       * Example:
       * APP-2026-00008
       */

      const generatedApplicationNumber =
        response.data?.application_number;

      if (!generatedApplicationNumber) {
        throw new Error(
          "Application number was not returned by the server."
        );
      }

      setApplicationNumber(generatedApplicationNumber);
      setSubmitted(true);
    } catch (err) {
      console.error(
        "Application submission failed:",
        err
      );

      let message =
        "Unable to submit application. Please try again.";

      // FastAPI validation error
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;

        if (Array.isArray(detail)) {
          message = detail
            .map((item) => {
              if (typeof item === "string") {
                return item;
              }

              return (
                item?.msg ||
                "Invalid application data."
              );
            })
            .join(" ");
        } else if (typeof detail === "string") {
          message = detail;
        }
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyApplicationNumber = async () => {
    try {
      await navigator.clipboard.writeText(
        applicationNumber
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Unable to copy application number:",
        error
      );
    }
  };

  /*
   
   * SUCCESS SCREEN
   
   */

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">

        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">

          <div className="w-full rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl sm:p-10">

            {/* Success Icon */}

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
              <CheckCircle2
                size={34}
                className="text-green-600"
              />
            </div>

            {/* Heading */}

            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              Application Submitted
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              Your admission application has been
              submitted successfully.
            </p>

            {/* REAL Application Number */}

            <div className="mt-7 rounded-2xl border border-gray-200 bg-gray-50 p-6">

              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Your Application Number
              </p>

              <p className="mt-2 break-all text-3xl font-bold tracking-wide text-gray-900">
                {applicationNumber}
              </p>

              {/* Copy Button */}

              <button
                type="button"
                onClick={
                  handleCopyApplicationNumber
                }
                className="mx-auto mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                {copied ? (
                  <>
                    <Check
                      size={16}
                      className="text-green-600"
                    />

                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} />

                    Copy Application Number
                  </>
                )}
              </button>

            </div>

            {/* Important */}

            <div className="mt-6 rounded-xl bg-blue-50 p-4 text-left">

              <p className="text-sm font-semibold text-blue-900">
                Important
              </p>

              <p className="mt-1 text-sm leading-6 text-blue-700">
                Save your application number.
                You will need it along with your
                password to access the applicant portal.
              </p>

            </div>

            {/* Login */}

            <Link
              to="/applicant/login"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Continue to Applicant Login

              <ArrowRight size={17} />
            </Link>

          </div>

        </div>

      </div>
    );
  }

  /*
   
   * APPLICATION FORM
   
   */

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}

      <header className="border-b border-gray-200 bg-white">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <Link
            to="/"
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900">
              <GraduationCap
                size={21}
                className="text-white"
              />
            </div>

            <div>

              <p className="font-bold text-gray-900">
                CampusFlow AI
              </p>

              <p className="text-xs text-gray-500">
                Student Admission Portal
              </p>

            </div>

          </Link>

          <Link
            to="/applicant/login"
            className="text-sm font-semibold text-gray-700 transition hover:text-gray-900"
          >
            Applicant Login
          </Link>

        </div>

      </header>

      {/* Main */}

      <main className="px-4 py-8 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-4xl">

          {/* Heading */}

          <div className="mb-8 text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900">
              <GraduationCap
                size={27}
                className="text-white"
              />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Apply for Admission
            </h1>

            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Submit your application to start your
              admission journey with CampusFlow AI.
            </p>

          </div>

          {/* Form Card */}

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl sm:p-8">

            <form
              onSubmit={handleSubmit}
              className="space-y-8"
            >

              {/* Institution */}

              <section>

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900">
                    <Building2
                      size={17}
                      className="text-white"
                    />
                  </div>

                  <div>

                    <h2 className="font-bold text-gray-900">
                      Institution
                    </h2>

                    <p className="text-sm text-gray-500">
                      Select the institution you are
                      applying to.
                    </p>

                  </div>

                </div>

                <label className="block">

                  <span className="mb-2 block text-sm font-semibold text-gray-700">
                    Organization
                  </span>

                  <input
                    name="organization_slug"
                    value={
                      formData.organization_slug
                    }
                    onChange={handleChange}
                    placeholder="Organization slug"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Example: gcet
                  </p>

                </label>

              </section>

              {/* Personal Information */}

              <section>

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900">
                    <User
                      size={17}
                      className="text-white"
                    />
                  </div>

                  <div>

                    <h2 className="font-bold text-gray-900">
                      Personal Information
                    </h2>

                    <p className="text-sm text-gray-500">
                      Enter your basic contact details.
                    </p>

                  </div>

                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* Full Name */}

                  <label className="md:col-span-2">

                    <span className="mb-2 block text-sm font-semibold text-gray-700">
                      Full Name
                    </span>

                    <div className="relative">

                      <User
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        name="full_name"
                        value={
                          formData.full_name
                        }
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
                      />

                    </div>

                  </label>

                  {/* Email */}

                  <label>

                    <span className="mb-2 block text-sm font-semibold text-gray-700">
                      Email Address
                    </span>

                    <div className="relative">

                      <Mail
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="email"
                        name="email"
                        value={
                          formData.email
                        }
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
                      />

                    </div>

                  </label>

                  {/* Phone */}

                  <label>

                    <span className="mb-2 block text-sm font-semibold text-gray-700">
                      Phone Number
                    </span>

                    <div className="relative">

                      <Phone
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="tel"
                        name="phone"
                        value={
                          formData.phone
                        }
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        required
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
                      />

                    </div>

                  </label>

                </div>

              </section>

              {/* Academic Information */}

              <section>

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900">
                    <GraduationCap
                      size={17}
                      className="text-white"
                    />
                  </div>

                  <div>

                    <h2 className="font-bold text-gray-900">
                      Academic Information
                    </h2>

                    <p className="text-sm text-gray-500">
                      Provide your intended academic
                      details.
                    </p>

                  </div>

                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* Program */}

                  <label>

                    <span className="mb-2 block text-sm font-semibold text-gray-700">
                      Program
                    </span>

                    <select
                      name="program"
                      value={
                        formData.program
                      }
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
                    >

                      <option value="">
                        Select program
                      </option>

                      <option value="B.Tech">
                        B.Tech
                      </option>

                      <option value="BCA">
                        BCA
                      </option>

                      <option value="MCA">
                        MCA
                      </option>

                      <option value="MBA">
                        MBA
                      </option>

                    </select>

                  </label>

                  {/* Department */}

                  <label>

                    <span className="mb-2 block text-sm font-semibold text-gray-700">
                      Department
                    </span>

                    <select
                      name="department"
                      value={
                        formData.department
                      }
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
                    >

                      <option value="">
                        Select department
                      </option>

                      <option value="CSE">
                        Computer Science & Engineering
                      </option>

                      <option value="AIML">
                        Artificial Intelligence & Machine Learning
                      </option>

                      <option value="ECE">
                        Electronics & Communication
                      </option>

                      <option value="ME">
                        Mechanical Engineering
                      </option>

                      <option value="CE">
                        Civil Engineering
                      </option>

                    </select>

                  </label>

                  {/* Academic Year */}

                  <label>

                    <span className="mb-2 block text-sm font-semibold text-gray-700">
                      Academic Year
                    </span>

                    <div className="relative">

                      <CalendarDays
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="number"
                        name="academic_year"
                        value={
                          formData.academic_year
                        }
                        onChange={handleChange}
                        min="2020"
                        max="2100"
                        placeholder="2026"
                        required
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
                      />

                    </div>

                    <p className="mt-2 text-xs text-gray-400">
                      Enter the starting year, e.g. 2026
                    </p>

                  </label>

                  {/* Semester */}

                  <label>

                    <span className="mb-2 block text-sm font-semibold text-gray-700">
                      Semester
                    </span>

                    <select
                      name="semester"
                      value={
                        formData.semester
                      }
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
                    >

                      <option value="">
                        Select semester
                      </option>

                      {[
                        1,
                        2,
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                      ].map((semester) => (
                        <option
                          key={semester}
                          value={semester}
                        >
                          Semester {semester}
                        </option>
                      ))}

                    </select>

                  </label>

                </div>

              </section>

              {/* Password */}

              <section>

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900">
                    <Lock
                      size={17}
                      className="text-white"
                    />
                  </div>

                  <div>

                    <h2 className="font-bold text-gray-900">
                      Applicant Account
                    </h2>

                    <p className="text-sm text-gray-500">
                      Create the password you will use
                      to track your application.
                    </p>

                  </div>

                </div>

                <label>

                  <span className="mb-2 block text-sm font-semibold text-gray-700">
                    Password
                  </span>

                  <div className="relative">

                    <Lock
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="password"
                      name="password"
                      value={
                        formData.password
                      }
                      onChange={handleChange}
                      placeholder="Minimum 8 characters"
                      minLength={8}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
                    />

                  </div>

                </label>

              </section>

              {/* Error */}

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <p className="text-sm font-medium text-red-700">
                    {error}
                  </p>

                </div>
              )}

              {/* Submit */}

              <div className="border-t border-gray-100 pt-6">

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="animate-spin"
                      />

                      Submitting Application...
                    </>
                  ) : (
                    <>
                      Submit Application

                      <ArrowRight size={17} />
                    </>
                  )}

                </button>

                <p className="mt-4 text-center text-sm text-gray-500">

                  Already applied?

                  {" "}

                  <Link
                    to="/applicant/login"
                    className="font-semibold text-gray-900 hover:underline"
                  >
                    Applicant Login
                  </Link>

                </p>

              </div>

            </form>

          </div>

        </div>

      </main>

    </div>
  );
}

export default ApplicantApply;