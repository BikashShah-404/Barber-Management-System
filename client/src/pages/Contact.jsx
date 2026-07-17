import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import {
  Mail,
  MapPin,
  Phone,
  Send,
  Clock,
  MessageCircle,
  Building2,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import PageHero from '../components/PageHero'
import { Button } from '../components/ui/Button'
import { Input, Textarea, Select } from '../components/ui/Input'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const contactCards = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@bladebook.local',
    sub: 'Support & partnerships',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+977 9800000000',
    sub: 'Mon–Fri · 10 am–5 pm',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Kathmandu, Nepal',
    sub: 'Built for local barbershops',
  },
]

const faqs = [
  {
    q: 'Response time?',
    a: 'We aim to reply within one business day. Urgent issues are typically addressed within a few hours during office hours.',
  },
  {
    q: 'Walk-in support?',
    a: 'Our office is open for walk-ins Monday through Friday, 10 am to 5 pm. No appointment needed — just drop by.',
  },
  {
    q: 'Partnership inquiries?',
    a: 'Select "Partnership" in the topic dropdown above and share your proposal. We love collaborating with local businesses.',
  },
]

export default function Contact() {
  const root = useRef(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  })

  useGSAP(
    () => {
      /* ---- Contact info cards ---- */
      gsap.from('.contact-card', {
        scrollTrigger: { trigger: '.contact-grid', start: 'top 80%' },
        x: -40,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power3.out',
      })

      /* ---- Map placeholder ---- */
      gsap.from('.contact-map', {
        scrollTrigger: { trigger: '.contact-map', start: 'top 85%' },
        y: 30,
        opacity: 0,
        duration: 0.7,
        delay: 0.15,
        ease: 'power3.out',
      })

      /* ---- Contact form ---- */
      gsap.from('.contact-form', {
        scrollTrigger: { trigger: '.contact-grid', start: 'top 80%' },
        x: 40,
        opacity: 0,
        duration: 0.7,
        delay: 0.1,
        ease: 'power3.out',
      })

      /* ---- Office hours strip ---- */
      gsap.from('.office-hours > *', {
        scrollTrigger: { trigger: '.office-hours', start: 'top 85%' },
        y: 24,
        opacity: 0,
        stagger: 0.08,
        duration: 0.55,
        ease: 'power3.out',
      })

      /* ---- FAQ cards ---- */
      gsap.from('.faq-card', {
        scrollTrigger: { trigger: '.faq-section', start: 'top 82%' },
        y: 48,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: 'back.out(1.4)',
      })

      /* ---- Bottom CTA ---- */
      gsap.from('.bottom-cta > *', {
        scrollTrigger: { trigger: '.bottom-cta', start: 'top 85%' },
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power3.out',
      })
    },
    { scope: root }
  )

  const onSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success('Message sent! We will get back to you soon.')
      setForm({ name: '', email: '', subject: 'general', message: '' })
    }, 800)
  }

  return (
    <div ref={root}>
      {/* ──────────────── 1. Hero ──────────────── */}
      <PageHero
        eyebrow="Contact"
        title="Let's talk booking."
        subtitle="Questions about listing your shop, using the platform, or academic demos? Send a note — we typically reply within one business day."
        crumbs={['Contact']}
      />

      {/* ──────────────── 2. Contact Grid ──────────────── */}
      <section className="contact-grid relative mx-auto grid max-w-[1300px] gap-8 px-4 py-20 sm:px-6 lg:grid-cols-5">
        {/* Left — Info + Map */}
        <div className="space-y-5 lg:col-span-2">
          {contactCards.map((item) => (
            <div
              key={item.label}
              className="contact-card group rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sand text-bronze transition-colors group-hover:bg-bronze group-hover:text-white">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {item.label}
                  </p>
                  <p className="mt-1 font-medium text-ink">{item.value}</p>
                  <p className="text-sm text-stone-500">{item.sub}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Map Placeholder */}
          <div className="contact-map relative overflow-hidden rounded-3xl border border-stone-200 shadow-sm">
            <div className="relative aspect-[4/3] bg-gradient-to-br from-sand via-cream-dark to-sand">
              {/* Decorative circles */}
              <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-bronze/30" />
              <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-bronze/15" />
              <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-bronze/10" />

              {/* Center pin */}
              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bronze text-white shadow-lg shadow-bronze/30">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="mt-1 h-3 w-3 rounded-full bg-bronze/40" />
              </div>

              {/* Label */}
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 p-3 backdrop-blur-sm">
                <p className="text-sm font-medium text-ink">Kathmandu, Nepal</p>
                <p className="text-xs text-stone-500">
                  Serving local barbershops valley-wide
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <form
          onSubmit={onSubmit}
          className="contact-form space-y-5 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3"
        >
          <div>
            <h2 className="font-display text-3xl text-ink">Send a message</h2>
            <p className="mt-1 text-sm text-stone-500">
              Fill out the form and we'll get back to you promptly.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
            />
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@email.com"
            />
          </div>

          <Select
            label="Topic"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          >
            <option value="general">General question</option>
            <option value="owner">List my shop</option>
            <option value="support">Technical support</option>
            <option value="partnership">Partnership</option>
          </Select>

          <Textarea
            label="Message"
            required
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="How can we help?"
            className="min-h-36"
          />

          <Button type="submit" variant="bronze" size="lg" loading={loading}>
            <Send className="h-4 w-4" /> Send message
          </Button>
        </form>
      </section>

      {/* ──────────────── 3. Office Hours Strip ──────────────── */}
      <section className="border-y border-stone-200 bg-gradient-to-r from-sand/60 via-cream to-sand/60">
        <div className="office-hours mx-auto flex max-w-[1300px] flex-col items-center gap-4 px-4 py-12 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bronze text-white">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-bronze">
                Office Hours
              </p>
              <p className="text-sm text-stone-600">
                We're here when you need us
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
            {[
              { day: 'Mon – Fri', time: '10 am – 5 pm' },
              { day: 'Saturday', time: 'By appointment' },
              { day: 'Sunday', time: 'Closed' },
            ].map((slot) => (
              <div
                key={slot.day}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-2.5 shadow-sm"
              >
                <p className="text-xs font-semibold text-ink">{slot.day}</p>
                <p className="text-xs text-stone-500">{slot.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── 4. FAQ Mini Section ──────────────── */}
      <section className="faq-section mx-auto max-w-[1300px] px-4 py-20 sm:px-6">
        <div className="mb-10 max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-bronze">
            Common Questions
          </p>
          <h2 className="mt-2 font-display text-4xl text-ink">
            Before you reach out
          </h2>
          <p className="mt-2 text-stone-500">
            Quick answers to our most frequently asked contact questions.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="faq-card group rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-sand text-bronze transition-colors group-hover:bg-bronze group-hover:text-white">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl text-ink">{faq.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────── 5. Bottom CTA ──────────────── */}
      <section className="relative overflow-hidden border-t border-stone-200 bg-gradient-to-b from-sand/40 to-cream">
        <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-bronze/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-zinc-200/25 blur-3xl" />

        <div className="bottom-cta relative z-10 mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sand text-bronze">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="font-display text-4xl text-ink sm:text-5xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-stone-600 leading-relaxed">
            Create your free account to book appointments instantly, or browse
            our listed barbershops across Kathmandu.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register">
              <Button variant="bronze" size="lg">
                Create an account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/shops">
              <Button variant="outline" size="lg">
                Browse shops
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
