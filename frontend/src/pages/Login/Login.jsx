import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AuthInput from "../../components/auth/AuthInput";
import { login, me } from "../../services/auth";
import { saveToken } from "../../utils/token";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // 1. Login
      const res = await login(data);

      // 2. Save JWT
      saveToken(res.data.access_token);

      // 3. Get current logged-in user
      const userRes = await me();
      const user = userRes.data;
      setUser(user);

      console.log("Logged in user:", user);

      toast.success("Login successful.");

      reset();

      // 4. Role-based redirect
      if (user.role === "STUDENT") {
        navigate("/student-dashboard");
      } else if (user.role === "TEACHER") {
        navigate("/dashboard");
      } else if (user.role === "ADMIN") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error("Login error:", err);

      toast.error(
        err.response?.data?.detail ||
          "Invalid organization, email, or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-2xl md:p-12">

        {/* Logo / Brand */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-2xl font-bold text-white">
            C
          </div>

          <h1 className="text-4xl font-bold text-gray-900">
            CampusFlow AI
          </h1>

          <p className="mt-3 text-gray-500">
            Intelligent Campus Process Automation
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <AuthInput
            label="Organization"
            type="text"
            name="organization_slug"
            placeholder="gcet"
            register={register}
          />

          <AuthInput
            label="Email"
            type="email"
            name="email"
            placeholder="name@example.com"
            register={register}
          />

          <AuthInput
            label="Password"
            type="password"
            name="password"
            placeholder="********"
            register={register}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-black py-4 text-lg font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Don't have a campus workspace?
          </p>

          <Link
            to="/signup"
            className="mt-1 inline-block font-semibold text-gray-900 hover:underline"
          >
            Create Workspace
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Login;