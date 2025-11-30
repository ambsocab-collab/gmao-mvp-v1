import { redirect } from "next/navigation";

export default function Home() {
  // Redirigir directamente al dashboard para usuarios autenticados
  // o al login para usuarios no autenticados
  redirect("/dashboard");
}
