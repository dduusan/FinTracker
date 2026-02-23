import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const { user, register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(data: RegisterForm) {
    setLoading(true);
    try {
      await authRegister({
        email: data.email,
        password: data.password,
        name: data.name || undefined,
      });
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      const message =
        axiosErr.response?.data?.error || "Registration failed.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm mx-4">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-2">
          FinTracker
        </h1>
        <p className="text-center text-gray-500 mb-8">Create a new account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="name"
            label="Name (optional)"
            placeholder="Your name"
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email",
              },
            })}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />

          <Input
            id="confirmPassword"
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            })}
          />

          <Button type="submit" loading={loading} className="w-full">
            Sign up
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
