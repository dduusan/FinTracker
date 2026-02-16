import { format } from "date-fns";
import { sr } from "date-fns/locale";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "RSD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string): string {
  return format(new Date(date), "dd. MMM yyyy.", { locale: sr });
}

export function formatMonth(date: string): string {
  return format(new Date(date), "LLLL yyyy.", { locale: sr });
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
