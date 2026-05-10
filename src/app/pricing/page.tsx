import Link from "next/link";
import { CheckCircle2, Zap, Crown, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Free Trial",
    price: "₹0",
    period: "7 days",
    description: "Try everything free. No credit card required.",
    cta: "Start Free Trial",
    href: "/signup",
    featured: false,
    features: [
      "1 client",
      "10 AI posts total",
      "AI captions + images",
      "Review & approval queue",
      "Manual download",
    ],
    notIncluded: [
      "Auto-posting to Instagram",
    ],
  },
  {
    name: "Starter",
    price: "₹499",
    period: "/month",
    description: "Perfect for freelancers and small agencies.",
    cta: "Get Started",
    href: "/signup?plan=starter",
    featured: false,
    features: [
      "3 clients",
      "90 AI posts/month",
      "AI captions (Gemini 2.5 Flash)",
      "AI image generation",
      "Instagram auto-posting",
      "Content calendar (monthly)",
      "Indian festive calendar",
      "Review & approval queue",
      "Client share links",
      "Email support",
    ],
    notIncluded: [],
  },
  {
    name: "Pro",
    price: "₹999",
    period: "/month",
    description: "For growing agencies managing multiple brands.",
    cta: "Go Pro",
    href: "/signup?plan=pro",
    featured: true,
    features: [
      "10 clients",
      "300 AI posts/month",
      "AI captions (Gemini 2.5 Flash)",
      "AI image generation",
      "Instagram auto-posting",
      "Smart content calendar",
      "Indian festive calendar",
      "Review & approval queue",
      "Client share links",
      "Custom AI instructions per client",
      "Priority support",
    ],
    notIncluded: [],
  },
];

const faqs = [
  {
    q: "Do I need a credit card to start the trial?",
    a: "No. Sign up with email or Google and get 7 days free — no card required.",
  },
  {
    q: "How does Instagram auto-posting work?",
    a: "Connect your client's Instagram Business account via the Meta Graph API. AutoDocks posts directly to Instagram at the scheduled time. Your client's account must be a Business or Creator account linked to a Facebook Page.",
  },
  {
    q: "What AI models do you use?",
    a: "We use Google Gemini 2.5 Flash for content generation (captions, hashtags, calendar) and Google Imagen 3 for image generation. Both are tuned for social media quality at Indian agency pricing.",
  },
  {
    q: "Can I upgrade or downgrade anytime?",
    a: "Yes. Upgrade from Starter to Pro anytime — billing adjusts at the next cycle. Downgrade by cancelling and resubscribing to the lower plan.",
  },
  {
    q: "What payment methods do you accept?",
    a: "All payments via Razorpay — UPI, cards (Visa/Mastercard/RuPay), net banking, and wallets. All in Indian Rupees.",
  },
  {
    q: "Is my client data safe?",
    a: "Client data is stored in a secured PostgreSQL database. AI-generated images are stored in Supabase Storage. Instagram access tokens are stored encrypted at rest. We never share your data.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#D4764E] rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">AutoDocks</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-[#D4764E] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#c0663e] transition-colors"
          >
            Start free trial
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Built for Indian marketing agencies. No per-post fees, no hidden charges.
            Pay once, generate unlimited content within your plan.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                plan.featured
                  ? "border-[#D4764E] bg-[#D4764E]/5"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1.5 bg-[#D4764E] text-white text-xs font-bold px-3 py-1 rounded-full">
                    <Crown className="w-3 h-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle2
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        plan.featured ? "text-[#D4764E]" : "text-green-500"
                      }`}
                    />
                    <span className="text-gray-300">{f}</span>
                  </li>
                ))}
                {plan.notIncluded.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm opacity-40">
                    <span className="w-4 h-4 mt-0.5 flex-shrink-0 text-center">✕</span>
                    <span className="text-gray-500">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                  plan.featured
                    ? "bg-[#D4764E] text-white hover:bg-[#c0663e]"
                    : "border border-white/10 text-white hover:bg-white/5"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Annual discount callout */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-center mb-16">
          <p className="text-sm text-gray-400 mb-1">Save 20% with annual billing</p>
          <div className="flex items-center justify-center gap-8">
            <div>
              <span className="text-gray-600 line-through text-sm mr-2">₹499/mo</span>
              <span className="text-white font-bold">₹399/mo</span>
              <span className="text-gray-500 text-xs ml-1">· Starter Annual</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div>
              <span className="text-gray-600 line-through text-sm mr-2">₹999/mo</span>
              <span className="text-white font-bold">₹799/mo</span>
              <span className="text-gray-500 text-xs ml-1">· Pro Annual</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Contact <a href="mailto:support@autodocks.app" className="text-[#D4764E] hover:underline">support@autodocks.app</a> to switch to annual billing.
          </p>
        </div>

        {/* What makes us different */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Built for Indian agencies</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🇮🇳",
                title: "Indian Festive Calendar",
                desc: "Diwali, Holi, Eid, Navratri, IPL — every festival pre-loaded. Your AI calendar knows what's coming.",
              },
              {
                icon: "₹",
                title: "Rupee Pricing",
                desc: "No dollar conversion math. Pay in INR via UPI, cards, or net banking. Razorpay subscriptions.",
              },
              {
                icon: "🗣️",
                title: "Hinglish Support",
                desc: "Generate captions in English, Hindi, or Hinglish. Your clients' audiences speak your language.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/[0.02] border border-white/10 rounded-2xl p-5"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="bg-white/[0.02] border border-white/10 rounded-2xl p-5"
              >
                <p className="font-semibold text-sm mb-2">{faq.q}</p>
                <p className="text-sm text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-white/[0.02] border border-white/10 rounded-2xl p-10">
          <h2 className="text-2xl font-bold mb-3">Start your free trial today</h2>
          <p className="text-gray-400 mb-6">
            7 days free. No credit card. Cancel anytime.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-[#D4764E] text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-[#c0663e] transition-colors"
          >
            <Zap className="w-4 h-4" />
            Get started free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center">
        <p className="text-xs text-gray-600">
          © 2026 AutoDocks · Built by{" "}
          <a href="https://branddocks.com" className="hover:text-gray-400 transition-colors">
            Brand Docks
          </a>{" "}
          ·{" "}
          <a href="mailto:support@autodocks.app" className="hover:text-gray-400 transition-colors">
            support@autodocks.app
          </a>
        </p>
      </footer>
    </div>
  );
}
