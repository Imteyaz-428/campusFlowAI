import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AuthInput from "../../components/auth/AuthInput";
import { signup } from "../../services/auth";
import { saveToken } from "../../utils/token";

function Signup() {
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

      const res = await signup(data);

      saveToken(res.data.access_token);

      toast.success("Workspace created successfully.");

      reset();

      navigate("/");
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Signup failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
     <div className="w-full max-w-xl rounded-2xl bg-white p-11 shadow-xl">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Create Workspace
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Create your organization and admin account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <AuthInput
            label="Organization Name"
            name="organization_name"
            register={register}
            placeholder="OpenAI"
          />

          <AuthInput
            label="Organization Slug"
            name="organization_slug"
            register={register}
            placeholder="openai"
          />

          <AuthInput
            label="Full Name"
            name="name"
            register={register}
            placeholder="Imteyaz Alam"
          />

          <AuthInput
            label="Email"
            type="email"
            name="email"
            register={register}
            placeholder="name@example.com"
          />

          <AuthInput
            label="Password"
            type="password"
            name="password"
            register={register}
            placeholder="********"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating..." : "Create Workspace"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have a workspace?{" "}
          <Link
            to="/login"
            className="font-medium text-black hover:underline"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Signup;