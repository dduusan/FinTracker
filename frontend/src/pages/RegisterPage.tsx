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
      toast.success("Nalog je kreiran! Sada se prijavite.");
      navigate("/login");
    } catch (err: any) {
      const message =
        err.response?.data?.error || "Greška pri registraciji.";
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
        <p className="text-center text-gray-500 mb-8">Kreiraj novi nalog</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="name"
            label="Ime (opciono)"
            placeholder="Tvoje ime"
            error={errors.name?.message}
            {...register("name")}
          />

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
            placeholder="Najmanje 6 karaktera"
            error={errors.password?.message}
            {...register("password", {
              required: "Lozinka je obavezna",
              minLength: {
                value: 6,
                message: "Lozinka mora imati najmanje 6 karaktera",
              },
            })}
          />

          <Input
            id="confirmPassword"
            label="Potvrdi lozinku"
            type="password"
            placeholder="Ponovite lozinku"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Potvrdite lozinku",
              validate: (value) =>
                value === watch("password") || "Lozinke se ne poklapaju",
            })}
          />

          <Button type="submit" loading={loading} className="w-full">
            Registruj se
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Već imaš nalog?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Prijavi se
          </Link>
        </p>
      </div>
    </div>
  );
}
