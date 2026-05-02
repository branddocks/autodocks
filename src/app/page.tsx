import Link from "next/link";
import {
  Zap,
  Calendar,
  Image,
  CheckCircle2,
  ArrowRight,
  Clock,
  Users,
  Sparkles,
  Shield,
  Instagram,
} from "lucide-react";

const FEATURES = [
  {
    icon: Calendar,
    title: "AI Content Calendar",
    desc: "Generate a full month of content in 60 seconds. Topics, captions, hashtags — all branded to your client.",
  },
  {
    icon: Image,
    title: "Auto Image Generation",
    desc: "AI creates on-brand images for every post. Your client's colors, style, and vibe — automatically.",
  },
  {
    icon: CheckCircle2,
    title: "Review & Approve",
    desc: "Nothing posts without your approval. Review, edit, regenerate — you stay in control.",
  },
  {
    icon: Instagram,
    title: "Auto-Post to Instagram",
    desc: "Approved posts go live at the scheduled time. No manual posting. No forgotten uploads.",
  },
  {
    icon: Users,
    title: "Multi-Client Dashboard",
    desc: "Manage 3-10 clients from one screen. Each with their own brand profile, calendar, and queue.",
  },
  {
    icon: Sparkles,
    title: "Indian Festival Calendar",
    desc: "Diwali, Holi, Independence Day — festive content auto-suggested. No more missing trending dates.",
  },
];

const STEPS = [
  { num: "01", title: "Add Your Client", desc: "Brand colors, tone, niche, audience — set it once." },
  { num: "02", title: "Generate Calendar", desc: "AI creates 30 days of content in under 2 minutes." },
  { num: "03", title: "Review & Approve", desc: "Edit captions, regenerate images, schedule times." },
  { num: "04", title: "Auto-Post", desc: "Posts go live on Instagram at the perfect time. Done." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[var(--background)]/85 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              AutoDocks
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted hover:text-foreground transition-colors px-4 py-2"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-foreground text-background px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-full px-5 py-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-semibold text-brand-deep tracking-wide uppercase">
              Built for Indian Agencies
            </span>
          </div>

          <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.05] mb-6">
            Your clients' social media.{" "}
            <span className="text-brand italic">On autopilot.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted max-w-xl mx-auto mb-10 leading-relaxed">
            AI generates branded content calendars, creates images, and
            auto-posts to Instagram — for every client. You just approve.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              href="/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-brand-deep transition-colors shadow-lg shadow-brand/20"
            >
              Start 7-Day Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#how"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-surface border border-border-strong px-8 py-4 rounded-xl font-semibold text-base hover:bg-surface-warm transition-colors"
            >
              See How It Works
            </Link>
          </div>

          <p className="text-sm text-muted-fg">
            No credit card required · 3 clients free · Cancel anytime
          </p>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF STRIP ═══ */}
      <div className="border-y border-[var(--color-border)] py-6 bg-surface">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-10 flex-wrap text-sm text-muted-fg font-medium">
          <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Razorpay Secured</span>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 2-min Setup</span>
          <span className="flex items-center gap-2"><Instagram className="w-4 h-4" /> Instagram Auto-Post</span>
          <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI-Powered</span>
        </div>
      </div>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[3px] text-brand mb-3">
            How it works
          </p>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-16">
            From zero to posted.<br />In 4 steps.
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {STEPS.map((step) => (
              <div key={step.num} className="relative">
                <div className="text-6xl font-display font-bold text-brand-50 mb-4">
                  {step.num}
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-24 px-6 bg-surface-warm">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[3px] text-brand mb-3">
            Features
          </p>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-16">
            Everything your agency needs.<br />Nothing it doesn't.
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-surface border border-[var(--color-border)] rounded-2xl p-7 hover:border-brand-100 hover:shadow-lg transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-5 group-hover:bg-brand-100 transition-colors">
                  <f.icon className="w-5 h-5 text-brand" />
                </div>
                <h3 className="font-display font-bold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[3px] text-brand mb-3 text-center">
            Pricing
          </p>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-4 text-center">
            Simple pricing. No surprises.
          </h2>
          <p className="text-muted text-center mb-14 max-w-md mx-auto">
            Start free. Upgrade when you're ready. Cancel anytime.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Starter */}
            <div className="bg-surface border border-[var(--color-border)] rounded-2xl p-8">
              <p className="text-sm font-bold text-muted-fg uppercase tracking-wider mb-1">Starter</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display font-bold text-4xl">₹499</span>
                <span className="text-muted text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["3 clients", "90 posts/month", "AI captions & images", "Auto-posting", "Email support"].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center bg-foreground text-background py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-surface border-2 border-brand rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-8 bg-brand text-white text-xs font-bold px-4 py-1 rounded-full">
                POPULAR
              </div>
              <p className="text-sm font-bold text-brand uppercase tracking-wider mb-1">Pro</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display font-bold text-4xl">₹999</span>
                <span className="text-muted text-sm">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "10 clients",
                  "300 posts/month",
                  "AI captions & images",
                  "Auto-posting",
                  "Priority support",
                  "Custom AI prompts",
                  "Team access (2 seats)",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?plan=pro"
                className="block text-center bg-brand text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-brand-deep transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 px-6 bg-surface-warm">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-4">
            Stop posting manually.<br />Start scaling.
          </h2>
          <p className="text-muted text-lg mb-8">
            7-day free trial. No credit card. Set up in 2 minutes.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-brand text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-brand-deep transition-colors shadow-lg shadow-brand/20"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-[var(--color-border)] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-display font-bold text-sm">AutoDocks</span>
          </div>
          <p className="text-xs text-muted-fg">
            Built by{" "}
            <a href="https://branddocks.com" className="text-brand hover:underline">
              Brand Docks
            </a>{" "}
            · Junagadh, India
          </p>
        </div>
      </footer>
    </div>
  );
}
