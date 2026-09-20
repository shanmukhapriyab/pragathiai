import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  ArrowUpRight,
  Banknote,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Compass,
  FileText,
  Globe2,
  HandCoins,
  Languages,
  Lightbulb,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Target,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type Language = "English" | "हिन्दी" | "मराठी" | "தமிழ்" | "తెలుగు";

type FormState = {
  village: string;
  businessIdea: string;
  capital: number;
  language: Language;
};

type Report = {
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

const sampleReport: Report = {
  headline: "Millet snacks have a promising first-mile opportunity in Buldhana.",
  summary: "A lean launch can work if you protect cash flow, test with repeat orders, and price for both walk-in customers and nearby hamlets.",
  marketReach: { score: 78, label: "Good local fit", detail: "Start within a 5–8 km service radius; expand after 30 days of repeat orders." },
  strengths: ["Clear everyday demand from students and commuters", "Low-cost test launch through weekly market stalls", "Differentiation through fresh, local ingredients"],
  risks: ["Seasonal demand may create uneven weekly cash flow", "Input prices should be checked with two local suppliers", "Do not lock the entire capital into equipment on day one"],
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
  loan: { route: "Micro Finance", scheme: "PM SVANidhi / MUDRA Shishu", eligibleAmount: 100000, interestRate: "7–12% p.a.*", tenure: "12–24 months", reason: "Your planned capital sits in the micro-enterprise band, so a smaller working-capital route keeps early repayments lighter." },
  source: "fallback",
};

const defaultForm: FormState = {
  village: "Buldhana, Maharashtra",
  businessIdea: "Millet snacks & breakfast cart",
  capital: 75000,
  language: "English",
};

const formatCurrency = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;
const formatNumber = (value: number) => Math.round(value).toLocaleString("en-IN");

function getRate(route: Report["loan"]["route"]) {
  return route === "Micro Finance" ? 0.11 : 0.12;
}

function buildSchedule(principal: number, annualRate: number, months: number) {
  const quarterRate = annualRate / 4;
  const quarters = Math.max(4, Math.ceil(months / 3));
  const payment = principal * (quarterRate * Math.pow(1 + quarterRate, quarters)) / (Math.pow(1 + quarterRate, quarters) - 1);
  let balance = principal;
  return Array.from({ length: quarters }, (_, index) => {
    const interest = balance * quarterRate;
    const principalPaid = Math.min(balance, payment - interest);
    const ending = Math.max(0, balance - principalPaid);
    const dueDate = new Date(2026, 5, 30);
    dueDate.setMonth(dueDate.getMonth() + index * 3);
    const due = dueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const row = { quarter: `Q${index + 1}`, due, payment, interest, principalPaid, ending };
    balance = ending;
    return row;
  });
}

function Metric({ icon: Icon, label, value, accent = "orange" }: { icon: typeof Target; label: string; value: string; accent?: "orange" | "green" | "blue" }) {
  const accents = {
    orange: "bg-[#fff0d6] text-[#b7621c]",
    green: "bg-[#e4f1df] text-[#2f6b51]",
    blue: "bg-[#e5eef5] text-[#42637a]",
  };
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${accents[accent]}`}><Icon size={18} /></div>
      <div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6f7a71]">{label}</p><p className="mt-0.5 text-sm font-bold text-[#163f34]">{value}</p></div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, detail }: { eyebrow: string; title: string; detail?: string }) {
  return <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="section-label">{eyebrow}</p><h2 className="mt-2 font-display text-3xl leading-tight text-[#163f34] sm:text-[38px]">{title}</h2></div>{detail && <p className="max-w-sm text-sm leading-6 text-[#6f7a71] sm:text-right">{detail}</p>}</div>;
}

export default function Home() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [report, setReport] = useState<Report | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const advisoryMutation = trpc.advisory.generate.useMutation();
  const activeReport = report ?? sampleReport;
  const rate = getRate(activeReport.loan.route);
  const schedule = useMemo(() => buildSchedule(activeReport.loan.eligibleAmount, rate, activeReport.loan.route === "Micro Finance" ? 18 : 36), [activeReport.loan.eligibleAmount, activeReport.loan.route, rate]);
  const totalRepayment = schedule.reduce((sum, row) => sum + row.payment, 0);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const result = await advisoryMutation.mutateAsync(form);
      setReport(result as Report);
      toast.success(result.source === "groq" ? "Your live village report is ready" : "Your starter report is ready", { description: "We paired the feasibility read with a loan route and quarterly plan." });
      window.setTimeout(() => document.getElementById("report")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch {
      toast.error("We could not generate the report", { description: "Try again with a village, idea, and capital amount." });
    }
  };

  const resetToSample = () => {
    setForm(defaultForm);
    setReport(null);
    toast("Sample inputs restored", { description: "You can edit any field before generating your plan." });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f6f0] text-[#163f34]">
      <header className="sticky top-0 z-40 border-b border-[#deded4]/80 bg-[#f8f6f0]/95 backdrop-blur">
        <div className="mx-auto flex h-[74px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <a href="#top" className="flex items-center gap-3" aria-label="PragathiAI home">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#163f34] text-[#f4c95d] shadow-[0_6px_20px_rgba(22,63,52,0.16)]"><Sparkles size={19} strokeWidth={2.4} /></div>
            <div><p className="font-display text-[21px] font-semibold tracking-[-0.03em]">Pragathi<span className="text-[#d8843e]">AI</span></p><p className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b877e] sm:block">From village to viability</p></div>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-[#607067] lg:flex">
            <a href="#how-it-works" className="transition-colors hover:text-[#163f34]">How it works</a>
            <a href="#feasibility" className="transition-colors hover:text-[#163f34]">Feasibility</a>
            <a href="#finance" className="transition-colors hover:text-[#163f34]">Finance tools</a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="hidden items-center gap-2 text-sm font-bold text-[#163f34] transition-colors hover:text-[#b7621c] sm:flex" onClick={() => toast("Saved plans are coming next", { description: "For now, download or note your plan from this report." })}>My plans <ArrowUpRight size={16} /></button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8ddd4] text-[#163f34] lg:hidden" onClick={() => setMenuOpen(value => !value)} aria-label="Toggle navigation"><Menu size={20} /></button>
            <Button className="hidden rounded-xl bg-[#e1a54b] px-5 font-bold text-[#163f34] shadow-none hover:bg-[#edb55e] sm:flex" onClick={() => document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" })}>Start a plan <ArrowUpRight size={16} /></Button>
          </div>
        </div>
        {menuOpen && <div className="border-t border-[#deded4] bg-[#f8f6f0] px-5 py-4 lg:hidden"><div className="flex flex-col gap-4 text-sm font-semibold"><a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a><a href="#feasibility" onClick={() => setMenuOpen(false)}>Feasibility</a><a href="#finance" onClick={() => setMenuOpen(false)}>Finance tools</a></div></div>}
      </header>

      <main id="top">
        <section className="relative isolate overflow-hidden bg-[#163f34] text-[#f7f4e9]">
          <div className="absolute -right-24 -top-28 h-[380px] w-[380px] rounded-full bg-[#35634d]/40 blur-2xl" />
          <div className="absolute bottom-0 left-1/3 h-[160px] w-[420px] rounded-full bg-[#285544]/60 blur-3xl" />
          <div className="relative mx-auto grid max-w-[1320px] gap-14 px-5 pb-16 pt-16 sm:px-8 lg:grid-cols-[1.04fr_.96fr] lg:items-center lg:px-10 lg:pb-24 lg:pt-24">
            <div className="max-w-[650px]">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#6c947b]/60 bg-[#275442] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.17em] text-[#d9e7bd]"><span className="h-2 w-2 rounded-full bg-[#e1a54b]" /> For local business owners</div>
              <h1 className="max-w-[680px] font-display text-[48px] leading-[1.02] tracking-[-0.045em] sm:text-[66px]">Make the next <span className="italic text-[#e9bd62]">right move.</span></h1>
              <p className="mt-7 max-w-[590px] text-[17px] leading-8 text-[#d2ddd1]">Tell us where you live, what you want to sell and how much you can start with. We will show you what to do next, in simple language.</p>
              <div className="mt-9 flex flex-wrap items-center gap-4"><Button className="h-12 rounded-xl bg-[#e1a54b] px-6 font-bold text-[#163f34] shadow-[0_8px_24px_rgba(225,165,75,.16)] hover:bg-[#f1c36d]" onClick={() => document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" })}>Build my village plan <ArrowUpRight size={17} /></Button><a href="#how-it-works" className="inline-flex items-center gap-2 text-sm font-semibold text-[#d2ddd1] transition-colors hover:text-white">See how it works <ChevronDown size={16} /></a></div>
              <div className="mt-12 flex flex-wrap gap-x-7 gap-y-4 text-xs font-semibold text-[#a9c4b0]"><span className="flex items-center gap-2"><Languages size={15} className="text-[#e1a54b]" /> 5 languages</span><span className="flex items-center gap-2"><ShieldCheck size={15} className="text-[#e1a54b]" /> Practical, not promising</span><span className="flex items-center gap-2"><Globe2 size={15} className="text-[#e1a54b]" /> Advice for your area</span></div>
            </div>
            <div className="relative mx-auto w-full max-w-[520px] lg:justify-self-end">
              <div className="hero-orbit absolute -right-8 -top-8 h-[330px] w-[330px] rounded-full border border-[#9dbc87]/20" /><div className="hero-orbit absolute -bottom-10 -left-10 h-[240px] w-[240px] rounded-full border border-[#e1a54b]/20" />
              <div className="relative rounded-[30px] bg-[#f7f4e9] p-4 text-[#163f34] shadow-[0_24px_65px_rgba(0,0,0,.18)] sm:p-5">
                <div className="rounded-[23px] border border-[#dfe4d8] bg-[#eef1e7] p-5 sm:p-6">
                  <div className="flex items-center justify-between"><div><p className="section-label text-[#52705d]">Your launch snapshot</p><p className="mt-1 text-xs font-semibold text-[#718075]">Example plan</p></div><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#163f34] text-[#f1c36d]"><Compass size={17} /></div></div>
                  <div className="mt-5 rounded-2xl bg-[#163f34] p-4 text-[#f7f4e9]"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a9c4b0]">Local fit score</p><p className="mt-1 font-display text-[43px] leading-none">78<span className="ml-1 text-lg text-[#b6cdb9]">/100</span></p></div><div className="rounded-full bg-[#326b51] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#d9edc3]">Good fit</div></div><div className="mt-5 h-2 rounded-full bg-[#315c4a]"><div className="h-2 w-[78%] rounded-full bg-[#e1a54b]" /></div><p className="mt-3 text-xs leading-5 text-[#c3d5c6]">The right-sized start for a business that grows with its community.</p></div>
                  <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white p-3.5"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#889389]">Best route</p><p className="mt-1.5 text-sm font-bold">Micro Finance</p><p className="mt-1 text-xs text-[#718075]">MUDRA Shishu</p></div><div className="rounded-2xl bg-white p-3.5"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#889389]">Quarterly EMI</p><p className="mt-1.5 text-sm font-bold">₹20,340</p><p className="mt-1 text-xs text-[#718075]">6 payments shown</p></div></div>
                </div>
                <div className="flex items-center justify-between px-1 pt-4 text-[11px] font-semibold text-[#718075]"><span className="flex items-center gap-1.5"><Sparkles size={13} className="text-[#d8843e]" /> Simple and practical</span><span>01 / 03</span></div>
              </div>
            </div>
          </div>
        </section>

        <section id="planner" className="mx-auto max-w-[1320px] scroll-mt-24 px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="grid gap-9 lg:grid-cols-[.84fr_1.16fr] lg:items-start">
            <div className="pt-2"><p className="section-label">01 · Start with what you know</p><h2 className="mt-3 max-w-[450px] font-display text-4xl leading-[1.08] tracking-[-0.035em] sm:text-[48px]">Your idea deserves a <span className="italic text-[#d8843e]">fair read.</span></h2><p className="mt-5 max-w-[430px] text-[15px] leading-7 text-[#6f7a71]">No business jargon. Just a few details about your village, your idea and your starting point.</p><div className="mt-9 space-y-4"><Metric icon={MapPin} label="Local context" value="Market reach near your village" accent="green" /><Metric icon={BarChart3} label="Business clarity" value="SWOT + competitor map" accent="blue" /><Metric icon={WalletCards} label="Financial confidence" value="Loan route + EMI schedule" accent="orange" /></div></div>
            <form onSubmit={submit} className="rounded-[30px] bg-white p-5 shadow-[0_15px_55px_rgba(46,67,53,.08)] ring-1 ring-[#e5e5dc] sm:p-7">
              <div className="flex flex-col justify-between gap-3 border-b border-[#ebece4] pb-5 sm:flex-row sm:items-center"><div><p className="text-lg font-bold text-[#163f34]">Tell us about your starting point</p><p className="mt-1 text-sm text-[#7b877e]">Takes less than 60 seconds</p></div><div className="flex items-center gap-2 rounded-full bg-[#f4f7ef] px-3 py-1.5 text-[11px] font-bold text-[#52705d]"><span className="h-2 w-2 rounded-full bg-[#83a86b]" /> Your details stay private</div></div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="sm:col-span-2"><span className="field-label"><MapPin size={14} /> Village / town</span><input className="field-input" value={form.village} onChange={event => setForm({ ...form, village: event.target.value })} placeholder="e.g. Buldhana, Maharashtra" required /></label><label className="sm:col-span-2"><span className="field-label"><Store size={14} /> What do you want to build?</span><input className="field-input" value={form.businessIdea} onChange={event => setForm({ ...form, businessIdea: event.target.value })} placeholder="e.g. Millet snacks & breakfast cart" required /></label><label><span className="field-label"><Banknote size={14} /> Available capital</span><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#98a298]">₹</span><input className="field-input pl-9" type="number" min={5000} max={5000000} step={1000} value={form.capital} onChange={event => setForm({ ...form, capital: Number(event.target.value) })} required /></div><input className="mt-3 w-full accent-[#d8843e]" type="range" min={5000} max={500000} step={5000} value={Math.min(form.capital, 500000)} onChange={event => setForm({ ...form, capital: Number(event.target.value) })} aria-label="Available capital slider" /><div className="mt-1 flex justify-between text-[11px] font-semibold text-[#9aa49b]"><span>₹5k</span><span>₹5L+</span></div></label><label><span className="field-label"><Languages size={14} /> Preferred language</span><div className="relative"><select className="field-input appearance-none pr-10" value={form.language} onChange={event => setForm({ ...form, language: event.target.value as Language })}>{["English", "हिन्दी", "मराठी", "தமிழ்", "తెలుగు"].map(language => <option key={language}>{language}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#718075]" size={16} /></div><p className="mt-3 text-xs leading-5 text-[#7b877e]">We keep the numbers universal and translate the insight.</p></label></div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><button type="button" className="order-2 inline-flex items-center gap-2 text-sm font-bold text-[#6f7a71] hover:text-[#163f34] sm:order-1" onClick={resetToSample}><Clock3 size={15} /> Use sample inputs</button><Button type="submit" disabled={advisoryMutation.isPending} className="order-1 h-12 rounded-xl bg-[#163f34] px-6 font-bold text-white shadow-none hover:bg-[#245a47] sm:order-2">{advisoryMutation.isPending ? <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Reading your village...</> : <>Generate my plan <Sparkles size={16} /></>}</Button></div>
            </form>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-[#e4e5dc] bg-[#f1f3e9] px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-[1320px]"><SectionHeading eyebrow="02 · Three clear steps" title="Three steps to get started." detail="Everything here is written to help you make a decision this month." /><div className="grid gap-4 md:grid-cols-3"><div className="step-card"><div className="step-number">01</div><div className="mt-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dcebd8] text-[#2f6b51]"><Search size={21} /></div><h3 className="mt-5 text-xl font-bold">Read the local signal</h3><p className="mt-3 text-sm leading-6 text-[#6f7a71]">See how far your market can realistically travel, who else is serving it, and where your edge can be.</p></div><div className="step-card"><div className="step-number">02</div><div className="mt-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0d6] text-[#b7621c]"><Lightbulb size={21} /></div><h3 className="mt-5 text-xl font-bold">Make the offer make sense</h3><p className="mt-3 text-sm leading-6 text-[#6f7a71]">Get practical pricing bands and a simple SWOT read before committing your savings or borrowing.</p></div><div className="step-card"><div className="step-number">03</div><div className="mt-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5eef5] text-[#42637a]"><HandCoins size={21} /></div><h3 className="mt-5 text-xl font-bold">Borrow with a plan</h3><p className="mt-3 text-sm leading-6 text-[#6f7a71]">We route your capital need to a micro finance or term loan path and show the quarterly repayment rhythm.</p></div></div></div>
        </section>

        <section id="report" className="mx-auto max-w-[1320px] scroll-mt-24 px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="mb-8 flex flex-col justify-between gap-5 border-b border-[#deded4] pb-8 sm:flex-row sm:items-end"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e8f0e0] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#3d6e55]"><Sparkles size={13} /> {report ? (report.source === "groq" ? "Fresh report" : "Your report") : "Example report"}</div><h2 className="font-display text-4xl tracking-[-0.035em] sm:text-[50px]">Your village plan</h2></div><p className="max-w-[340px] text-sm leading-6 text-[#6f7a71] sm:text-right">A simple plan you can discuss with your family, mentor or bank.</p></div>
          <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]"><div className="rounded-[28px] bg-[#163f34] p-6 text-[#f7f4e9] sm:p-8"><div className="flex items-center justify-between gap-4"><p className="section-label text-[#a9c4b0]">Will this work?</p><div className="rounded-full border border-[#6c947b]/60 px-3 py-1 text-[11px] font-bold text-[#d9e7bd]">{activeReport.marketReach.label}</div></div><div className="mt-5 grid gap-8 md:grid-cols-[1fr_180px] md:items-end"><div><h3 className="max-w-[650px] font-display text-3xl leading-tight tracking-[-0.025em] sm:text-[39px]">{activeReport.headline}</h3><p className="mt-4 max-w-[620px] text-sm leading-7 text-[#c6d6c8]">{activeReport.summary}</p></div><div className="md:text-right"><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9fbaaa]">Local fit</p><p className="mt-1 font-display text-6xl leading-none text-[#e9bd62]">{activeReport.marketReach.score}</p><p className="mt-1 text-xs font-semibold text-[#b3cbb8]">out of 100</p></div></div><div className="mt-8 border-t border-[#4b705d] pt-6"><div className="flex items-center justify-between text-xs font-semibold text-[#b3cbb8]"><span>Reach confidence</span><span>{activeReport.marketReach.score}%</span></div><div className="mt-2 h-2 rounded-full bg-[#315c4a]"><div className="h-2 rounded-full bg-[#e1a54b] transition-all" style={{ width: `${activeReport.marketReach.score}%` }} /></div><p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#c6d6c8]"><MapPin size={14} className="mt-0.5 shrink-0 text-[#e9bd62]" /> {activeReport.marketReach.detail}</p></div></div><div className="rounded-[28px] border border-[#dfdfd5] bg-[#fffdf8] p-6"><p className="section-label">The short answer</p><div className="mt-6 space-y-5"><div><p className="text-xs font-semibold text-[#7b877e]">Recommended route</p><p className="mt-1 text-xl font-bold text-[#163f34]">{activeReport.loan.route}</p></div><div><p className="text-xs font-semibold text-[#7b877e]">Estimated eligibility</p><p className="mt-1 text-xl font-bold text-[#163f34]">{formatCurrency(activeReport.loan.eligibleAmount)}</p></div><div><p className="text-xs font-semibold text-[#7b877e]">Suggested scheme family</p><p className="mt-1 text-sm font-bold leading-5 text-[#163f34]">{activeReport.loan.scheme}</p></div><div className="rounded-2xl bg-[#f1f3e9] p-3.5 text-xs leading-5 text-[#617167]"><ShieldCheck size={16} className="mb-1 text-[#4d865d]" /> Estimates are directional; confirm current terms with your local bank, SHG or official portal.</div></div></div></div>

          <div id="feasibility" className="mt-5 grid gap-5 lg:grid-cols-2"><div className="report-card"><div className="flex items-center gap-3"><div className="icon-tile green"><CheckCircle2 size={19} /></div><div><p className="section-label">Strengths</p><h3 className="mt-1 text-xl font-bold">What is working for you</h3></div></div><ul className="mt-6 space-y-4">{activeReport.strengths.map(item => <li key={item} className="flex gap-3 text-sm leading-6 text-[#536159]"><CheckCircle2 size={17} className="mt-1 shrink-0 text-[#4d865d]" />{item}</li>)}</ul></div><div className="report-card"><div className="flex items-center gap-3"><div className="icon-tile orange"><Target size={19} /></div><div><p className="section-label">Watch-outs</p><h3 className="mt-1 text-xl font-bold">What to protect against</h3></div></div><ul className="mt-6 space-y-4">{activeReport.risks.map(item => <li key={item} className="flex gap-3 text-sm leading-6 text-[#536159]"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#d8843e]" />{item}</li>)}</ul></div></div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="report-card"><div className="flex items-end justify-between gap-3"><div><p className="section-label">Competitor map</p><h3 className="mt-1 text-xl font-bold">Who is already nearby?</h3></div><div className="rounded-full bg-[#eef1e7] px-3 py-1.5 text-[11px] font-bold text-[#52705d]">{activeReport.competitors.length} local signals</div></div><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[520px] border-collapse text-left"><thead><tr className="border-b border-[#ecece4] text-[10px] font-bold uppercase tracking-[0.13em] text-[#99a39a]"><th className="pb-3 pr-4">Operator</th><th className="pb-3 pr-4">Distance</th><th className="pb-3">Their edge / your opening</th></tr></thead><tbody>{activeReport.competitors.map((competitor, index) => <tr key={competitor.name} className="border-b border-[#f0f0e9] last:border-0"><td className="py-4 pr-4 text-sm font-bold text-[#264c3e]"><span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-[#f1f3e9] text-[10px] text-[#52705d]">0{index + 1}</span>{competitor.name}</td><td className="py-4 pr-4 text-sm font-semibold text-[#6f7a71]">{competitor.distance}</td><td className="py-4 text-sm leading-5 text-[#6f7a71]">{competitor.edge}</td></tr>)}</tbody></table></div></div><div className="report-card"><p className="section-label">Pricing strategy</p><h3 className="mt-1 text-xl font-bold">Start simple, earn repeat</h3><div className="mt-6 space-y-3">{activeReport.pricing.map((price, index) => <div key={price.label} className="flex items-center justify-between gap-4 rounded-2xl bg-[#f5f5ee] p-3.5"><div><p className="text-sm font-bold text-[#264c3e]">{price.label}</p><p className="mt-0.5 text-xs text-[#7b877e]">{price.note}</p></div><p className={`font-display text-xl ${index === 1 ? "text-[#d8843e]" : "text-[#163f34]"}`}>{price.value}</p></div>)}</div></div></div>
        </section>

        <section id="finance" className="bg-[#e8eee4] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-[1320px]"><SectionHeading eyebrow="03 · Borrow with clarity" title="Your money, mapped forward." detail="The calculator auto-routes by capital need, then turns the recommendation into a simple quarterly rhythm." /><div className="grid gap-5 lg:grid-cols-[.88fr_1.12fr]"><div className="rounded-[28px] bg-[#163f34] p-6 text-[#f7f4e9] sm:p-8"><div className="flex items-center justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2e624c] text-[#e9bd62]"><CircleDollarSign size={23} /></div><span className="rounded-full bg-[#2b624c] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.13em] text-[#d9edc3]">Auto-routed</span></div><p className="section-label mt-8 text-[#a9c4b0]">Recommended financing path</p><h3 className="mt-2 font-display text-4xl tracking-[-0.03em] text-[#f7f4e9]">{activeReport.loan.route}</h3><p className="mt-2 text-sm font-semibold text-[#e9bd62]">{activeReport.loan.scheme}</p><p className="mt-5 text-sm leading-7 text-[#c6d6c8]">{activeReport.loan.reason}</p><div className="mt-8 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#214d3c] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9fbaaa]">Eligible estimate</p><p className="mt-2 text-xl font-bold">{formatCurrency(activeReport.loan.eligibleAmount)}</p></div><div className="rounded-2xl bg-[#214d3c] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9fbaaa]">Assumed rate</p><p className="mt-2 text-xl font-bold">{Math.round(rate * 100)}% <span className="text-sm font-medium text-[#a9c4b0]">p.a.</span></p></div></div><div className="mt-6 flex items-start gap-2 rounded-2xl border border-[#52765f] p-3 text-xs leading-5 text-[#c6d6c8]"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#e9bd62]" /> Final eligibility depends on lender policy, documentation and current scheme rules.</div></div><div className="rounded-[28px] bg-[#fffdf8] p-6 ring-1 ring-[#dfe4d8] sm:p-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="section-label">Quarterly repayment plan</p><h3 className="mt-1 text-2xl font-bold text-[#163f34]">Plan your payments</h3></div><div className="flex gap-2"><div className="rounded-2xl bg-[#f1f3e9] px-3 py-2 text-right"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#889389]">Quarterly EMI</p><p className="mt-1 text-lg font-bold text-[#d8843e]">{formatCurrency(schedule[0]?.payment ?? 0)}</p></div></div></div><div className="mt-7 grid grid-cols-3 gap-3 border-y border-[#ecece4] py-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#98a298]">Principal</p><p className="mt-1 text-sm font-bold text-[#264c3e]">{formatCurrency(activeReport.loan.eligibleAmount)}</p></div><div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#98a298]">Tenure</p><p className="mt-1 text-sm font-bold text-[#264c3e]">{activeReport.loan.tenure}</p></div><div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#98a298]">Total estimate</p><p className="mt-1 text-sm font-bold text-[#264c3e]">{formatCurrency(totalRepayment)}</p></div></div><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[560px] border-collapse text-left"><thead><tr className="border-b border-[#ecece4] text-[10px] font-bold uppercase tracking-[0.13em] text-[#99a39a]"><th className="pb-3">Quarter</th><th className="pb-3">Due</th><th className="pb-3 text-right">Payment</th><th className="pb-3 text-right">Interest</th><th className="pb-3 text-right">Balance</th></tr></thead><tbody>{schedule.map((row, index) => <tr key={row.quarter} className={`border-b border-[#f0f0e9] last:border-0 ${index === 0 ? "bg-[#fffbf2]" : ""}`}><td className="py-3.5 text-sm font-bold text-[#264c3e]">{row.quarter}</td><td className="py-3.5 text-sm font-semibold text-[#718075]">{row.due}</td><td className="py-3.5 text-right text-sm font-bold text-[#d8843e]">{formatCurrency(row.payment)}</td><td className="py-3.5 text-right text-sm text-[#718075]">{formatCurrency(row.interest)}</td><td className="py-3.5 text-right text-sm font-semibold text-[#264c3e]">{formatCurrency(row.ending)}</td></tr>)}</tbody></table></div><p className="mt-5 flex items-center gap-2 text-xs leading-5 text-[#7b877e]"><CalendarDays size={14} className="text-[#52705d]" /> Estimated quarterly schedule based on an equal-payment amortization model.</p></div></div></div>
        </section>

        <section className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 lg:px-10 lg:py-20"><div className="relative overflow-hidden rounded-[30px] bg-[#f1dfbd] px-6 py-10 sm:px-10 sm:py-12"><div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-[22px] border-[#d6a65d]/30" /><div className="absolute -bottom-24 right-32 h-40 w-40 rounded-full border-[16px] border-[#d6a65d]/20" /><div className="relative max-w-[640px]"><p className="section-label text-[#9a6a31]">A clear next step</p><h2 className="mt-3 font-display text-4xl leading-tight tracking-[-0.035em] text-[#49341e] sm:text-[47px]">Less confusion. More confidence. Better starts.</h2><p className="mt-4 max-w-[540px] text-[15px] leading-7 text-[#6f5b3d]">Good advice should meet you where you are — with a phone, a plan and the courage to begin.</p><Button className="mt-7 rounded-xl bg-[#163f34] px-5 font-bold text-white shadow-none hover:bg-[#245a47]" onClick={() => document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" })}>Start with my idea <ArrowUpRight size={16} /></Button></div></div></section>
      </main>

      <footer className="border-t border-[#deded4] bg-[#f8f6f0] px-5 py-8 sm:px-8 lg:px-10"><div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-4 text-xs font-semibold text-[#7b877e] sm:flex-row sm:items-center"><div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#163f34] text-[#f4c95d]"><Sparkles size={13} /></div><span>PragathiAI · Helping you take the next right step.</span></div><div className="flex items-center gap-5"><span>Numbers are estimates</span><span className="flex items-center gap-1.5"><ShieldCheck size={13} /> Your inputs stay private</span></div></div></footer>
    </div>
  );
}
