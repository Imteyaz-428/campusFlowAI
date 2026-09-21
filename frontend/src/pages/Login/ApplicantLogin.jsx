import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Lock,
  Hash,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

import api from "../../services/api";

function ApplicantLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    organization_slug: "gcet",
    application_number: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    if (!formData.organization_slug.trim()) {
      setError("Please enter your organization.");
      return;
    }

    if (!formData.application_number.trim()) {
      setError("Please enter your application number.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        organization_slug:
          formData.organization_slug.trim(),

        application_number:
          formData.application_number
            .trim()
            .toUpperCase(),

        password: formData.password,
      };

      const response = await api.post(
        "/auth/applicant-login",
        payload
      );

      console.log(
        "Applicant login successful:",
        response.data
      );

      /*
       * Backend returns:
       *
       * {
       *   access_token: "...",
       *   token_type: "bearer"
       * }
       */

      const accessToken =
        response.data?.access_token;

      if (!accessToken) {
        throw new Error(
          "Login succeeded but no access token was returned."
        );
      }

      /*
       * Store applicant authentication.
       *
       * Keep applicant session separate from
       * the normal admin/staff login.
       */

      localStorage.setItem(
        "applicant_token",
        accessToken
      );

      localStorage.setItem(
        "applicant_application_number",
        payload.application_number
      );

      localStorage.setItem(
        "applicant_organization_slug",
        payload.organization_slug
      );

      /*
       * Go to applicant dashboard.
       */

      navigate("/applicant/dashboard");
    } catch (err) {
      console.error(
        "Applicant login failed:",
        err
      );

      let message =
        "Invalid application number or password.";

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
                "Invalid login details."
              );
            })
            .join(" ");
        } else if (typeof detail === "string") {
          message = detail;
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

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
            to="/apply"
            className="text-sm font-semibold text-gray-700 transition hover:text-gray-900"
          >
            Apply for Admission
          </Link>

        </div>

      </header>

      {/* Main */}

      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-10">

        <div className="w-full max-w-md">

          {/* Heading */}

          <div className="mb-8 text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900">
              <GraduationCap
                size={27}
                className="text-white"
              />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Applicant Login
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Access your admission application
              and track your progress.
            </p>

          </div>

          {/* Login Card */}

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xl sm:p-8">

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Organization */}

              <label className="block">

                <span className="mb-2 block text-sm font-semibold text-gray-700">
                  Organization
                </span>

                <input
                  type="text"
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

              {/* Application Number */}

              <label className="block">

                <span className="mb-2 block text-sm font-semibold text-gray-700">
                  Application Number
                </span>

                <div className="relative">

                  <Hash
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    name="application_number"
                    value={
                      formData.application_number
                    }
                    onChange={handleChange}
                    placeholder="APP-2026-00008"
                    required
                    autoComplete="username"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm uppercase outline-none transition focus:border-gray-400 focus:bg-white"
                  />

                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Enter the application number received
                  after submitting your application.
                </p>

              </label>

              {/* Password */}

              <label className="block">

                <span className="mb-2 block text-sm font-semibold text-gray-700">
                  Password
                </span>

                <div className="relative">

                  <Lock
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={
                      formData.password
                    }
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-11 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </label>

              {/* Error */}

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <p className="text-sm font-medium leading-5 text-red-700">
                    {error}
                  </p>

                </div>
              )}

              {/* Login Button */}

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

                    Signing In...
                  </>
                ) : (
                  <>
                    Login to Applicant Portal

                    <ArrowRight size={17} />
                  </>
                )}

              </button>

            </form>

            {/* Footer */}

            <div className="mt-6 border-t border-gray-100 pt-6">

              <p className="text-center text-sm text-gray-500">

                Don't have an application?

                {" "}

                <Link
                  to="/apply"
                  className="font-semibold text-gray-900 hover:underline"
                >
                  Apply for Admission
                </Link>

              </p>

            </div>

          </div>

          {/* Help */}

          <p className="mt-6 text-center text-xs leading-5 text-gray-400">
            Use the application number and password
            created during your admission application.
          </p>

        </div>

      </main>

    </div>
  );
}

export default ApplicantLogin;