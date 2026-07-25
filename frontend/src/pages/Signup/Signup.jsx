import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { saveToken } from "../../utils/token";


import AuthInput from "../../components/auth/AuthInput";
import { signup } from "../../services/auth";

function Signup() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await signup(data);

      saveToken(res.data.access_token);

      toast.success("Workspace created successfully.");

      reset();

      navigate("/dashboard");

    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Signup failed."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center mb-6">
          Create Workspace
        </h1>

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
          label="Name"
          name="name"
          register={register}
          placeholder="Imteyaz Alam"
        />

        <AuthInput
          label="Email"
          type="email"
          name="email"
          register={register}
          placeholder="imteyaz@gmail.com"
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
          className="w-full mt-4 bg-black text-white py-3 rounded-lg hover:bg-gray-800"
        >
          Create Workspace
        </button>
      </form>
    </div>
  );
}

export default Signup;