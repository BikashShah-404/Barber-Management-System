import { useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Check, X, ChevronDown, Sparkles, ArrowRight, Shield, Crown } from 'lucide-react'
import PageHero from '../components/PageHero'
import { Button } from '../components/ui/Button'
import { pricingPlans, promotionPlans } from '../data/siteContent'
import { cn } from '../lib/utils'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* ─── FAQ Data ────────────────────────────────────────────────────── */
const faqs = [
  {
    q: 'Is BladeBook really free?',
    a: 'Yes — both customers and shop owners can use BladeBook at no cost. Listing your shop, managing slots, and booking appointments are all free in this version.',
  },
  {
    q: 'How does shop verification work?',
    a: 'After you submit your shop details, our admin team reviews and approves your listing. This keeps the marketplace trustworthy and ensures customers only see legitimate businesses.',
  },
  {
    q: 'Can I cancel bookings?',
    a: 'Absolutely. Customers can cancel upcoming bookings from their dashboard. Shop owners can also reject or cancel requests if a slot is no longer available.',
  },
  {
    q: 'Is my data secure?',
    a: 'We use industry-standard encryption, secure authentication with JWT, and never share your personal information with third parties. Your data stays yours.',
  },
  {
    q: 'How do I list my shop?',
    a: 'Register as a shop owner, fill in your business profile with services and hours, and submit for admin approval. Once verified, your shop goes live on the platform.',
  },
]

/* ─── Comparison Table Data ────────────────────────────────────────── */
const comparisonFeatures = [
  { feature: 'Featured badge on your listing', silver: true, gold: true, platinum: true },
  { feature: 'Appear in "Featured Barbers" section', silver: true, gold: true, platinum: true },
  { feature: 'Search results priority', silver: 'Standard', gold: 'Top', platinum: 'Highest' },
  { feature: 'Monthly performance report', silver: true, gold: true, platinum: false },
  { feature: 'Advanced analytics dashboard', silver: false, gold: false, platinum: true },
  { feature: 'Featured on homepage carousel', silver: false, gold: true, platinum: true },
  { feature: 'Featured on homepage hero section', silver: false, gold: false, platinum: true },
  { feature: 'Customer support', silver: 'Standard', gold: 'Priority', platinum: 'Dedicated' },
  { feature: 'Early access to new features', silver: false, gold: false, platinum: true },
]

/* ─── FAQ Accordion Item ──────────────────────────────────────────── */
function FaqItem({ faq, index }) {
  const [open, setOpen] = useState(false)
  const contentRef = useRef(null)
  const iconRef = useRef(null)

  const toggle = useCallback(() => {
    const el = contentRef.current
    const icon = iconRef.current
    if (!el) return

    if (!open) {
      // Open
      gsap.set(el, { height: 'auto' })
      const h = el.offsetHeight
      gsap.fromTo(el, { height: 0, opacity: 0 }, { height: h, opacity: 1, duration: 0.45, ease: 'power3.out' })
      gsap.to(icon, { rotate: 180, duration: 0.35, ease: 'power2.out' })
    } else {
      // Close
      gsap.to(el, { height: 0, opacity: 0, duration: 0.35, ease: 'power3.inOut' })
      gsap.to(icon, { rotate: 0, duration: 0.35, ease: 'power2.out' })
    }
    setOpen(!open)
  }, [open])

  return (
    <div className="faq-item rounded-2xl border border-stone-200/80 bg-white/80 backdrop-blur-sm transition-colors hover:border-bronze/30">
      <button
        onClick={toggle}
        className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left sm:p-6"
      >
        <span className="font-display text-lg text-ink sm:text-xl">{faq.q}</span>
        <span ref={iconRef} className="shrink-0 text-bronze">
          <ChevronDown className="h-5 w-5" />
        </span>
      </button>
      <div ref={contentRef} className="h-0 overflow-hidden opacity-0">
        <p className="px-5 pb-5 leading-relaxed text-muted sm:px-6 sm:pb-6">
          {faq.a}
        </p>
      </div>
    </div>
  )
}

/* ─── Comparison Cell ─────────────────────────────────────────────── */
function CellMark({ value }) {
  if (typeof value === 'string') {
    return <span className="text-stone-700 font-medium">{value}</span>
  }
  return value ? (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-bronze/10">
      <Check className="h-3.5 w-3.5 text-bronze" />
    </span>
  ) : (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-stone-100">
      <X className="h-3.5 w-3.5 text-stone-400" />
    </span>
  )
}

/* ━━━ Main Pricing Page ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function Pricing() {
  const root = useRef(null)

  useGSAP(
    () => {
      /* ── Pricing cards ── */
      gsap.from('.price-card', {
        scrollTrigger: { trigger: '.price-grid', start: 'top 80%' },
        y: 80,
        opacity: 0,
        scale: 0.9,
        stagger: 0.15,
        duration: 0.85,
        ease: 'back.out(1.4)',
      })

      /* ── Check icons drawing effect ── */
      gsap.from('.feature-check', {
        scrollTrigger: { trigger: '.price-grid', start: 'top 75%' },
        scale: 0,
        opacity: 0,
        stagger: 0.04,
        duration: 0.5,
        ease: 'back.out(2)',
      })

      /* ── Highlighted card glow pulse ── */
      gsap.to('.card-glow', {
        scale: 1.15,
        opacity: 0.6,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      /* ── FAQ section header ── */
      gsap.from('.faq-header', {
        scrollTrigger: { trigger: '.faq-section', start: 'top 80%' },
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      })

      /* ── FAQ items ── */
      gsap.from('.faq-item', {
        scrollTrigger: { trigger: '.faq-section', start: 'top 75%' },
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power3.out',
      })

      /* ── Comparison section header ── */
      gsap.from('.compare-header', {
        scrollTrigger: { trigger: '.compare-section', start: 'top 80%' },
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      })

      /* ── Comparison table rows ── */
      gsap.from('.compare-row', {
        scrollTrigger: { trigger: '.compare-table', start: 'top 80%' },
        x: 60,
        opacity: 0,
        stagger: 0.07,
        duration: 0.6,
        ease: 'power3.out',
      })

      /* ── Bottom CTA ── */
      gsap.from('.cta-bottom', {
        scrollTrigger: { trigger: '.cta-bottom', start: 'top 85%' },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      })
    },
    { scope: root }
  )

  return (
    <div ref={root}>
      {/* ── 1. Page Hero ────────────────────────────────────────────── */}
      <PageHero
        eyebrow="Shop Promotion Plans"
        title="Boost Your Visibility"
        subtitle="Get more customers by appearing at the top of search results and in the Featured Barbers section."
        crumbs={['Pricing']}
      />

      {/* ── 3. Pricing Cards Grid ───────────────────────────────────── */}
      <section className="mx-auto max-w-[1300px] px-4 py-14 sm:px-6 sm:py-16">
        <div className="price-grid grid items-center gap-6 lg:grid-cols-3">
          {promotionPlans.map((plan) => (
            <article
              key={plan.tier}
              className={cn(
                'price-card relative flex flex-col rounded-[2rem] border p-7 shadow-sm transition-shadow duration-300 sm:p-8',
                plan.highlight
                  ? 'scale-[1.03] border-bronze bg-ink text-cream shadow-xl shadow-stone-900/20 z-10'
                  : 'border-stone-200 bg-white text-ink hover:shadow-md'
              )}
            >
              {/* Floating glow behind highlighted card */}
              {plan.highlight && (
                <div className="card-glow pointer-events-none absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-bronze/20 via-zinc-400/10 to-transparent blur-2xl" />
              )}

              {/* Popular badge */}
              {plan.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-bronze to-bronze-light px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white shadow-lg shadow-zinc-900/25">
                  <Sparkles className="h-3 w-3" />
                  Best Value
                </span>
              )}

              {/* Plan name */}
              <p
                className={cn(
                  'text-sm font-medium uppercase tracking-widest',
                  plan.highlight ? 'text-bronze-light' : 'text-bronze'
                )}
              >
                {plan.name}
              </p>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-4xl sm:text-5xl">{plan.price}</span>
                <span
                  className={cn(
                    'text-sm',
                    plan.highlight ? 'text-stone-400' : 'text-stone-500'
                  )}
                >
                  {plan.period}
                </span>
              </div>

              {/* Description */}
              <p
                className={cn(
                  'mt-3 text-sm leading-relaxed',
                  plan.highlight ? 'text-stone-400' : 'text-stone-500'
                )}
              >
                {plan.desc}
              </p>

              {/* Divider */}
              <div
                className={cn(
                  'my-6 h-px',
                  plan.highlight ? 'bg-white/10' : 'bg-stone-200'
                )}
              />

              {/* Features */}
              <ul className="flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <span
                      className={cn(
                        'feature-check mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                        plan.highlight
                          ? 'bg-bronze-light/20 text-bronze-light'
                          : 'bg-bronze/10 text-bronze'
                      )}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span
                      className={cn(
                        plan.highlight ? 'text-stone-300' : 'text-stone-600'
                      )}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to={plan.to} className="mt-8 block">
                <Button
                  className="w-full"
                  size="lg"
                  variant={plan.highlight ? 'bronze' : 'outline'}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ── 4. FAQ Section ──────────────────────────────────────────── */}
      <section className="faq-section border-t border-stone-200/60 bg-gradient-to-b from-cream to-sand/20">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="faq-header mb-12 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-bronze">
              FAQ
            </p>
            <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
              Common questions, clear answers
            </h2>
            <p className="mt-3 text-muted">
              Everything you need to know before getting started with BladeBook.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FaqItem key={i} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Comparison Table ─────────────────────────────────────── */}
      <section className="compare-section border-t border-stone-200/60">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
          <div className="compare-header mb-12 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-bronze">
              Compare plans
            </p>
            <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
              Everything at a glance
            </h2>
          </div>

          <div className="compare-table overflow-x-auto rounded-[2rem] border border-stone-200/80 bg-white/80 shadow-sm backdrop-blur-sm">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-stone-200/80">
                  <th className="px-6 py-5 text-left font-medium text-muted">
                    Feature
                  </th>
                  <th className="px-6 py-5 text-center font-medium text-ink">
                    <span className="text-xs uppercase tracking-widest text-muted">NPR 299</span>
                    <br />
                    <span className="font-display text-lg">Silver</span>
                  </th>
                  <th className="px-6 py-5 text-center font-medium text-ink">
                    <span className="inline-block rounded-full bg-gradient-to-r from-bronze to-bronze-light px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
                      Best Value
                    </span>
                    <br />
                    <span className="mt-1 block font-display text-lg">Gold</span>
                  </th>
                  <th className="px-6 py-5 text-center font-medium text-ink">
                    <span className="text-xs uppercase tracking-widest text-muted">NPR 999</span>
                    <br />
                    <span className="font-display text-lg">Platinum</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={cn(
                      'compare-row transition-colors hover:bg-sand/30',
                      i < comparisonFeatures.length - 1 && 'border-b border-stone-100'
                    )}
                  >
                    <td className="px-6 py-4 text-stone-700">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      <CellMark value={row.silver} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CellMark value={row.gold} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <CellMark value={row.platinum} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 6. Bottom CTA ───────────────────────────────────────────── */}
      <section className="border-t border-stone-200/60 bg-gradient-to-b from-sand/30 to-cream">
        <div className="cta-bottom mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-24">
          <div className="relative inline-block">
            <div className="pointer-events-none absolute -inset-6 rounded-full bg-bronze/8 blur-2xl" />
            <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-bronze/10">
              <Shield className="h-6 w-6 text-bronze" />
            </span>
          </div>
          <h2 className="mt-6 font-display text-3xl text-ink sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted leading-relaxed">
            Online payments are intentionally out of scope for this version.
            Shop billing details are informational only — no hidden charges,
            no credit card required.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/register">
              <Button variant="bronze" size="lg">
                Create free account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                Talk to our team
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted">
            No credit card · No lock-in · Free forever for customers
          </p>
        </div>
      </section>
    </div>
  )
}
