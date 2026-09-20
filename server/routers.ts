import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

const advisoryInputSchema = z.object({
  village: z.string().min(2).max(80),
  businessIdea: z.string().min(2).max(120),
  capital: z.number().int().min(5000).max(5000000),
  language: z.enum(["English", "हिन्दी", "मराठी", "தமிழ்", "తెలుగు"]),
});

type AdvisoryInput = z.infer<typeof advisoryInputSchema>;

export type AdvisoryReport = {
  headline: string;
  summary: string;
  marketReach: { score: number; label: string; detail: string };
  strengths: string[];
  risks: string[];
  competitors: { name: string; distance: string; edge: string }[];
  pricing: { label: string; value: string; note: string }[];
  loan: {
    route: "Micro Finance" | "Term Loan";
    scheme: string;
    eligibleAmount: number;
    interestRate: string;
    tenure: string;
    reason: string;
  };
  source: "groq" | "fallback";
};

const formatCurrency = (amount: number) => `₹${Math.round(amount).toLocaleString("en-IN")}`;

export function buildFallbackReport(input: AdvisoryInput): AdvisoryReport {
  const microFinance = input.capital <= 100000;
  const eligibleAmount = microFinance
    ? Math.min(100000, Math.round(input.capital * 1.7))
    : Math.min(1000000, Math.round(input.capital * 2.5));
  const idea = input.businessIdea.toLowerCase();
  const localDemand = idea.includes("tailor") || idea.includes("food") || idea.includes("dairy")
    ? "repeat local demand"
    : "underserved village demand";

  return {
    headline: `${input.businessIdea} has a promising first-mile opportunity in ${input.village}.`,
    summary: `A lean launch can work if you protect cash flow, test with ${localDemand}, and price for both walk-in customers and nearby hamlets.`,
    marketReach: {
      score: microFinance ? 78 : 84,
      label: microFinance ? "Good local fit" : "Strong growth fit",
      detail: `Start within a 5–8 km service radius around ${input.village}; expand after 30 days of repeat orders.`,
    },
    strengths: [
      "Low-friction first launch with a clear local customer base",
      "Can build trust through WhatsApp, SHG and weekly-market referrals",
      "Room to differentiate on reliability and doorstep convenience",
    ],
    risks: [
      "Seasonal demand may create uneven weekly cash flow",
      "Input prices should be checked with two local suppliers before borrowing",
      "Avoid locking the entire capital into equipment on day one",
    ],
    competitors: [
      { name: "Nearby weekly-market sellers", distance: "3–5 km", edge: "Existing footfall; less convenient" },
      { name: "Established town operator", distance: "8–12 km", edge: "Wider range; slower service" },
      { name: "Informal home providers", distance: "1–3 km", edge: "Low price; inconsistent quality" },
    ],
    pricing: [
      { label: "Entry offer", value: "₹99–149", note: "Bring first-time customers in" },
      { label: "Core ticket", value: "₹199–349", note: "Target 45–55% gross margin" },
      { label: "Premium / bundle", value: "₹399–599", note: "Use for repeat customers" },
    ],
    loan: {
      route: microFinance ? "Micro Finance" : "Term Loan",
      scheme: microFinance ? "PM SVANidhi / MUDRA Shishu" : "MUDRA Kishor / PMEGP",
      eligibleAmount,
      interestRate: microFinance ? "7–12% p.a.*" : "10–14% p.a.*",
      tenure: microFinance ? "12–24 months" : "24–60 months",
      reason: microFinance
        ? "Your planned capital sits in the micro-enterprise band, so a smaller working-capital route keeps early repayments lighter."
        : "Your capital need is above the micro band; a term loan can fund equipment and staged expansion with a longer repayment window.",
    },
    source: "fallback",
  };
}

function isReport(value: unknown): value is Omit<AdvisoryReport, "source"> {
  if (!value || typeof value !== "object") return false;
  const report = value as Record<string, unknown>;
  return typeof report.headline === "string"
    && typeof report.summary === "string"
    && typeof report.marketReach === "object"
    && Array.isArray(report.strengths)
    && Array.isArray(report.risks)
    && Array.isArray(report.competitors)
    && Array.isArray(report.pricing)
    && typeof report.loan === "object";
}

async function generateWithGroq(input: AdvisoryInput): Promise<AdvisoryReport | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.25,
      max_tokens: 1300,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are PragathiAI, a practical rural business advisor for micro-entrepreneurs in India. Return only valid JSON with keys: headline, summary, marketReach {score:number,label:string,detail:string}, strengths:string[], risks:string[], competitors [{name,distance,edge}], pricing [{label,value,note}], loan {route:"Micro Finance"|"Term Loan",scheme,eligibleAmount:number,interestRate,tenure,reason}. Be specific but avoid inventing precise government approvals. Mention estimates as estimates. Use the requested language.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            village: input.village,
            businessIdea: input.businessIdea,
            capital: input.capital,
            language: input.language,
            instruction: "Create a concise, hyper-local feasibility snapshot with competitor mapping, pricing bands, and a responsible loan route.",
          }),
        },
      ],
    }),
  });

  if (!response.ok) return null;
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    const parsed = JSON.parse(content) as unknown;
    if (!isReport(parsed)) return null;
    return { ...(parsed as Omit<AdvisoryReport, "source">), source: "groq" };
  } catch {
    return null;
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  advisory: router({
    generate: publicProcedure.input(advisoryInputSchema).mutation(async ({ input }) => {
      try {
        const liveReport = await generateWithGroq(input);
        return liveReport ?? buildFallbackReport(input);
      } catch (error) {
        console.warn("[PragathiAI] Groq unavailable, using fallback report:", error);
        return buildFallbackReport(input);
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
export { formatCurrency };
