import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AuthInput from "../../components/auth/AuthInput";
import { login } from "../../services/auth";
import { saveToken } from "../../utils/token";

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const res = await login(data);

      saveToken(res.data.access_token);

      toast.success("Login successful.");

      reset();

      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
        "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-14 shadow-2xl">

        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold text-gray-900">
            Welcome Back
          </h1>

          <p className="mt-3 text-lg text-gray-500">
            Sign in to continue to your workspace.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-7"
        >
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
            className="mt-2 w-full rounded-2xl bg-black py-4 text-xl font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-base text-gray-500">
          Don't have a workspace?{" "}
          <Link
            to="/signup"
            className="font-semibold text-black hover:underline"
          >
            Create Workspace
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;