import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    try {
      await login(data);
      toast.success("Uspešna prijava!");
    } catch (err: any) {
      const message =
        err.response?.data?.error || "Pogrešan email ili lozinka.";
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
        <p className="text-center text-gray-500 mb-8">Prijavi se na svoj nalog</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="tvoj@email.com"
            error={errors.email?.message}
            {...register("email", {
              required: "Email je obavezan",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Unesite validan email",
              },
            })}
          />

          <Input
            id="password"
            label="Lozinka"
            type="password"
            placeholder="Unesite lozinku"
            error={errors.password?.message}
            {...register("password", {
              required: "Lozinka je obavezna",
              minLength: {
                value: 6,
                message: "Lozinka mora imati najmanje 6 karaktera",
              },
            })}
          />

          <Button type="submit" loading={loading} className="w-full">
            Prijavi se
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Nemaš nalog?{" "}
          <Link to="/register" className="text-indigo-600 hover:underline">
            Registruj se
          </Link>
        </p>
      </div>
    </div>
  );
}
