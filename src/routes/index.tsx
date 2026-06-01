import { createFileRoute } from "@tanstack/react-router";
import { BMICalculator } from "@/components/BMICalculator";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BMI Calculator — Track Your Body Mass Index" },
      { name: "description", content: "Free, modern BMI calculator. Instantly check your Body Mass Index, see your category, get health tips and track your history." },
      { property: "og:title", content: "BMI Calculator — Track Your Body Mass Index" },
      { property: "og:description", content: "Free, modern BMI calculator with health tips, history and downloadable reports." },
    ],
  }),
  component: Index,
});

function Index() {
  return <BMICalculator />;
}
