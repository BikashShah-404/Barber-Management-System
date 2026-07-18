import { useRef, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ArrowUpRight, Clock, BookOpen, Mail } from 'lucide-react'
import { format } from 'date-fns'
import PageHero from '../components/PageHero'
import { Badge } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { blogPosts } from '../data/siteContent'
import { cn } from '../lib/utils'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const categories = ['All', 'Operations', 'Tips', 'Customers', 'Platform', 'Style', 'Tech']

export default function Blog() {
  const root = useRef(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [email, setEmail] = useState('')

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return blogPosts
    return blogPosts.filter((p) => p.category === activeCategory)
  }, [activeCategory])

  const featured = filtered[0]
  const rest = filtered.slice(1)

  useGSAP(
    () => {
      // Category filter pills — slide in from left
      gsap.from('.filter-pill', {
        x: -32,
        opacity: 0,
        stagger: 0.06,
        duration: 0.5,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.filter-bar', start: 'top 90%' },
      })

      // Featured article card
      gsap.from('.blog-featured', {
        scrollTrigger: { trigger: '.blog-featured', start: 'top 85%' },
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
      })

      // Article grid cards — stagger from below
      gsap.from('.blog-card', {
        scrollTrigger: { trigger: '.blog-grid', start: 'top 82%' },
        y: 56,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out',
      })

      // Newsletter CTA — scale in
      gsap.from('.newsletter-cta', {
        scrollTrigger: { trigger: '.newsletter-cta', start: 'top 85%' },
        scale: 0.92,
        opacity: 0,
        duration: 0.9,
        ease: 'back.out(1.4)',
      })
    },
    { scope: root, dependencies: [activeCategory], revertOnUpdate: true }
  )

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    // Simple toast-style alert for the non-functional demo
    if (!email.trim()) return
    alert(`🎉 Thanks for subscribing with ${email}! (Demo — no email sent)`)
    setEmail('')
  }

  return (
    <div ref={root}>
      {/* ── 1. Page Hero ── */}
      <PageHero
        eyebrow="Blog"
        title="Notes on booking, grooming & growth."
        subtitle="Practical ideas for customers and barbershop owners — from slot strategy to marketplace trust."
        crumbs={['Blog']}
      />

      <section className="mx-auto max-w-[1300px] px-4 py-16 sm:px-6">
        {/* ── 2. Category Filters ── */}
        <div className="filter-bar mb-10 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'filter-pill cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors duration-300',
                activeCategory === cat
                  ? 'bg-bronze text-white shadow-md shadow-bronze/25'
                  : 'bg-sand/70 text-muted hover:bg-sand hover:text-ink'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── 3. Featured Article ── */}
        {featured && (
          <Link
            to={`/blog/${featured.slug}`}
            className="blog-featured group relative grid overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white shadow-sm transition-shadow duration-500 hover:shadow-xl lg:grid-cols-2 lg:h-[300px]"
          >
            {/* Image side — ken-burns zoom on hover */}
            <div className="aspect-[21/9] overflow-hidden lg:aspect-auto lg:h-full">
              <img
                src={featured.image}
                alt={featured.title}
                className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
              />
            </div>

            {/* Content side */}
            <div className="relative flex flex-col justify-center p-4 sm:p-5 lg:p-5">
              {/* Decorative accent */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-bronze/5 blur-2xl" />

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge className="border-bronze/20 bg-sand text-bronze px-2 py-0.5">
                  {featured.category}
                </Badge>
                <span className="text-muted">
                  {format(new Date(featured.date), 'MMM d, yyyy')}
                </span>
                <span className="flex items-center gap-1 text-muted">
                  <Clock className="h-3 w-3" /> {featured.readTime}
                </span>
              </div>

              <h2 className="mt-2 font-display text-xl leading-tight text-ink transition-colors duration-300 group-hover:text-bronze sm:text-2xl">
                {featured.title}
              </h2>

              <p className="mt-1.5 line-clamp-1 text-sm leading-relaxed text-stone-500">
                {featured.excerpt}
              </p>

              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-bronze transition-transform duration-300 group-hover:translate-x-1">
                Read article <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        )}

        {/* ── 4. Article Grid ── */}
        {rest.length > 0 && (
          <div className="blog-grid mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="blog-card group flex flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
              >
                {/* Card image */}
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-xs">
                    <Badge className="border-bronze/20 bg-sand text-bronze">
                      {post.category}
                    </Badge>
                    <span className="text-muted">
                      {format(new Date(post.date), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1 text-muted">
                      <Clock className="h-3 w-3" /> {post.readTime}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-xl leading-snug text-ink transition-colors duration-300 group-hover:text-bronze">
                    {post.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-500">
                    {post.excerpt}
                  </p>

                  <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-bronze opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Read more <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="mb-4 h-12 w-12 text-stone-300" />
            <p className="font-display text-xl text-muted">
              No articles in this category yet.
            </p>
            <button
              onClick={() => setActiveCategory('All')}
              className="mt-3 text-sm font-medium text-bronze underline-offset-4 hover:underline"
            >
              View all articles
            </button>
          </div>
        )}
      </section>

      {/* ── 5. Newsletter CTA ── */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="newsletter-cta grain relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-ink px-6 py-16 text-center sm:px-12 sm:py-20">
          {/* Floating glow effects */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-bronze/20 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-52 w-52 rounded-full bg-zinc-500/15 blur-[80px]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bronze/10 blur-[60px]" />

          <div className="relative z-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Mail className="h-7 w-7 text-bronze-light" />
            </div>

            <h2 className="mt-6 font-display text-3xl text-cream sm:text-4xl lg:text-5xl">
              Stay sharp, stay booked.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-stone-400 sm:text-base">
              Tips for barbers and customers — scheduling tricks, grooming trends, and platform updates. No spam, unsubscribe anytime.
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-cream placeholder:text-stone-500 backdrop-blur-sm transition focus:border-bronze/50 focus:outline-none focus:ring-2 focus:ring-bronze/30"
              />
              <Button variant="bronze" size="lg" type="submit" className="shrink-0">
                Subscribe
              </Button>
            </form>

            <p className="mt-4 text-xs text-stone-500">
              Join 1,200+ readers · Free forever
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
