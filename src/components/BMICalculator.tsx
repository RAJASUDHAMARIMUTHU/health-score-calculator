import { useEffect, useMemo, useState } from "react";
import { Moon, Sun, Calculator, RotateCcw, Download, Trash2, Activity, Heart, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

type Category = {
  label: string;
  range: string;
  colorVar: string;
  tip: string;
};

// BMI category resolver
function getCategory(bmi: number): Category {
  if (bmi < 18.5)
    return {
      label: "Underweight",
      range: "< 18.5",
      colorVar: "var(--bmi-under)",
      tip: "Consider a nutrient-dense diet with healthy fats, lean protein and strength training to build muscle.",
    };
  if (bmi < 25)
    return {
      label: "Normal Weight",
      range: "18.5 – 24.9",
      colorVar: "var(--bmi-normal)",
      tip: "Great job! Maintain your balanced diet, stay active 150+ min/week, and keep hydrated.",
    };
  if (bmi < 30)
    return {
      label: "Overweight",
      range: "25 – 29.9",
      colorVar: "var(--bmi-over)",
      tip: "Aim for gradual changes: more vegetables, fewer added sugars, and regular cardio plus strength work.",
    };
  return {
    label: "Obese",
    range: "≥ 30",
    colorVar: "var(--bmi-obese)",
    tip: "Consider speaking with a healthcare professional. Small, consistent habit changes can have a big impact.",
  };
}

type HistoryItem = {
  id: string;
  date: string;
  weight: number;
  height: number;
  bmi: number;
  category: string;
};

const HISTORY_KEY = "bmi:history:v1";
const THEME_KEY = "bmi:theme";

export function BMICalculator() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Init theme + history from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = t ? t === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  // Persist theme
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark]);

  const category = useMemo(() => (bmi !== null ? getCategory(bmi) : null), [bmi]);

  // Gauge: map BMI 10..40 to 0..100%
  const gaugePct = useMemo(() => {
    if (bmi === null) return 0;
    return Math.max(0, Math.min(100, ((bmi - 10) / 30) * 100));
  }, [bmi]);

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!weight || !height) {
      setError("Please enter both weight and height.");
      setBmi(null);
      return;
    }
    if (Number.isNaN(w) || Number.isNaN(h) || w <= 0 || h <= 0) {
      setError("Please enter valid positive numbers.");
      setBmi(null);
      return;
    }
    if (w > 500 || h > 300) {
      setError("Those values look out of range. Please check your input.");
      setBmi(null);
      return;
    }
    const meters = h / 100;
    const result = w / (meters * meters);
    const rounded = Math.round(result * 100) / 100;
    setBmi(rounded);

    const cat = getCategory(rounded);
    const entry: HistoryItem = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleString(),
      weight: w,
      height: h,
      bmi: rounded,
      category: cat.label,
    };
    const next = [entry, ...history].slice(0, 8);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }

  function handleReset() {
    setWeight("");
    setHeight("");
    setBmi(null);
    setError(null);
  }

  function clearHistory() {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }

  function downloadReport() {
    if (bmi === null || !category) return;
    const content = `BMI Report
Generated: ${new Date().toLocaleString()}

Weight: ${weight} kg
Height: ${height} cm

BMI: ${bmi.toFixed(2)}
Category: ${category.label} (${category.range})

Health tip:
${category.tip}
`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bmi-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const categories = [
    { label: "Underweight", range: "< 18.5", colorVar: "var(--bmi-under)" },
    { label: "Normal", range: "18.5 – 24.9", colorVar: "var(--bmi-normal)" },
    { label: "Overweight", range: "25 – 29.9", colorVar: "var(--bmi-over)" },
    { label: "Obese", range: "≥ 30", colorVar: "var(--bmi-obese)" },
  ];

  return (
    <main
      className="min-h-screen w-full px-4 py-10 sm:px-6 lg:px-8"
      style={{ background: "var(--gradient-bg)" }}
    >
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-foreground shadow-lg"
              style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-glow)" }}
            >
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                BMI Calculator
              </h1>
              <p className="text-sm text-muted-foreground">Know your number. Own your health.</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle theme"
            className="rounded-full transition-transform hover:scale-110"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </header>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Calculator Card */}
          <Card
            className="lg:col-span-3 overflow-hidden border-0 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <form onSubmit={handleCalculate} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    placeholder="e.g. 70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="h-12 text-base transition-all focus-visible:ring-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    placeholder="e.g. 175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="h-12 text-base transition-all focus-visible:ring-2"
                  />
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in fade-in slide-in-from-top-1"
                >
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  className="h-12 flex-1 text-base font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg"
                  style={{ background: "var(--gradient-hero)" }}
                >
                  <Calculator className="mr-2 h-4 w-4" /> Calculate BMI
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="h-12 transition-all hover:scale-[1.02]"
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
            </form>

            {/* Result */}
            {bmi !== null && category && (
              <div
                className="mt-8 rounded-2xl border p-6 animate-in fade-in zoom-in-95 duration-500"
                style={{
                  background: `color-mix(in oklab, ${category.colorVar} 12%, var(--card))`,
                  borderColor: `color-mix(in oklab, ${category.colorVar} 35%, transparent)`,
                }}
              >
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Your BMI</p>
                    <p
                      className="text-5xl font-bold tracking-tight sm:text-6xl"
                      style={{ color: category.colorVar }}
                    >
                      {bmi.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm"
                      style={{ backgroundColor: category.colorVar }}
                    >
                      {category.label}
                    </span>
                    <p className="mt-1 text-xs text-muted-foreground">Range: {category.range}</p>
                  </div>
                </div>

                {/* Gauge */}
                <div className="mt-6">
                  <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${gaugePct}%`,
                        background: `linear-gradient(90deg, var(--bmi-under), var(--bmi-normal), var(--bmi-over), var(--bmi-obese))`,
                      }}
                    />
                    <div
                      className="absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-foreground shadow-md transition-all duration-700"
                      style={{ left: `calc(${gaugePct}% - 2px)` }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
                    <span>10</span>
                    <span>18.5</span>
                    <span>25</span>
                    <span>30</span>
                    <span>40</span>
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-2 rounded-lg bg-background/50 p-3 text-sm">
                  <Heart
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: category.colorVar }}
                  />
                  <p className="text-foreground/90">{category.tip}</p>
                </div>

                <Button
                  variant="outline"
                  onClick={downloadReport}
                  className="mt-4 transition-transform hover:scale-[1.02]"
                >
                  <Download className="mr-2 h-4 w-4" /> Download report
                </Button>
              </div>
            )}
          </Card>

          {/* Info / History sidebar */}
          <div className="space-y-6 lg:col-span-2">
            <Card
              className="border-0 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold">BMI Categories</h2>
              </div>
              <ul className="space-y-2.5">
                {categories.map((c) => (
                  <li
                    key={c.label}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: c.colorVar }}
                      />
                      <span className="font-medium">{c.label}</span>
                    </div>
                    <span className="text-muted-foreground">{c.range}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                A healthy BMI generally falls between <strong>18.5 and 24.9</strong>. BMI is a
                screening tool and does not diagnose body fatness or health.
              </p>
            </Card>

            <Card
              className="border-0 p-6 animate-in fade-in slide-in-from-bottom-4 duration-1000"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold">Recent calculations</h2>
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="mr-1 h-3 w-3" /> Clear
                  </Button>
                )}
              </div>
              {history.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No history yet. Your past calculations will appear here.
                </p>
              ) : (
                <ul className="space-y-2">
                  {history.map((h) => {
                    const c = getCategory(h.bmi);
                    return (
                      <li
                        key={h.id}
                        className="flex items-center justify-between rounded-lg border bg-background/50 px-3 py-2 text-sm transition-all hover:scale-[1.01] hover:shadow-sm"
                      >
                        <div>
                          <p className="font-semibold" style={{ color: c.colorVar }}>
                            {h.bmi.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">{h.date}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>{h.weight} kg · {h.height} cm</p>
                          <p>{h.category}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>
        </div>

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          BMI is a general indicator. Always consult a healthcare professional for medical advice.
        </footer>
      </div>
    </main>
  );
}