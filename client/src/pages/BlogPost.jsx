import { useRef } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { format } from 'date-fns'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ArrowLeft, Clock, BookOpen, ArrowRight, ArrowUpRight } from 'lucide-react'
import { blogPosts } from '../data/siteContent'
import { Button } from '../components/ui/Button'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function BlogPost() {
  const { slug } = useParams()
  const post = blogPosts.find((p) => p.slug === slug)
  const root = useRef(null)
  const heroImg = useRef(null)

  useGSAP(
    () => {
      if (!post) return

      // Parallax hero image
      if (heroImg.current) {
        gsap.to(heroImg.current, {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: '.post-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
      }

      // Header entrance animation
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.post-back', { y: 20, opacity: 0, duration: 0.5 })
        .from('.post-meta > *', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5 }, '-=0.3')
        .from('.post-title', { y: 30, opacity: 0, duration: 0.7 }, '-=0.3')
        .from('.post-excerpt', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
        .from('.post-body > *', { y: 30, opacity: 0, stagger: 0.1, duration: 0.8 }, '-=0.4')

      // Related articles reveal
      gsap.from('.related-card', {
        scrollTrigger: { trigger: '.related-section', start: 'top 85%' },
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power3.out',
      })
    },
    { scope: root, dependencies: [post] }
  )

  if (!post) return <Navigate to="/blog" replace />

  const relatedPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3)

  return (
    <article ref={root} className="bg-cream min-h-screen pb-24">
      {/* ════════════════════ HERO BANNER ════════════════════ */}
      <div className="post-hero relative aspect-[21/9] min-h-[400px] max-h-[600px] w-full overflow-hidden bg-stone-900">
        <img
          ref={heroImg}
          src={post.image}
          alt={post.title}
          className="absolute inset-0 h-[120%] w-full object-cover will-change-transform"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-[1300px] px-4 sm:px-6 relative z-10 -mt-32 sm:-mt-48">
        {/* ════════════════════ ARTICLE HEADER ════════════════════ */}
        <div className="rounded-[2.5rem] bg-white p-8 sm:p-12 shadow-2xl shadow-stone-900/10 border border-stone-200">
          <Link to="/blog" className="post-back inline-block mb-8">
            <Button variant="ghost" size="sm" className="-ml-4 text-stone-500 hover:text-ink">
              <ArrowLeft className="h-4 w-4" /> Back to blog
            </Button>
          </Link>

          <div className="post-meta flex flex-wrap items-center gap-4 text-sm text-stone-500 mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sand px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-bronze">
              <BookOpen className="h-3.5 w-3.5" /> {post.category}
            </span>
            <span className="font-medium">{format(new Date(post.date), 'MMMM d, yyyy')}</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="h-4 w-4" /> {post.readTime}
            </span>
          </div>

          <h1 className="post-title font-display text-4xl leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
            {post.title}
          </h1>
          <p className="post-excerpt mt-6 text-xl leading-relaxed text-stone-600 font-medium">
            {post.excerpt}
          </p>
        </div>

        {/* ════════════════════ ARTICLE BODY ════════════════════ */}
        <div className="post-body prose prose-stone prose-lg mt-16 max-w-none text-stone-600 leading-loose">
          <p>
            The grooming industry has always relied heavily on personal relationships and skill. A great barber knows their clients, remembers their preferences, and delivers consistent results. However, the operational side of running a barbershop has often lagged behind the actual craft. Scribbled notebooks, missed phone calls, and chaotic walk-in queues are common staples that lead to frustration for both the owner and the customer. 
          </p>
          <p>
            Digitizing the booking process is not about replacing the human element; it's about enhancing it. By providing a structured, online scheduling system, shops can eliminate the guesswork. Clients no longer have to wonder if a chair will be free, and barbers can anticipate their daily workflow without the anxiety of unexpected rushes or empty slots. This translates directly to better time management and increased revenue.
          </p>
          <p>
            Implementing a platform like BladeBook allows for real-time visibility. When a customer searches for a service, they see actual availability. The request-and-approval flow gives shop owners the final say, ensuring that their schedule remains under their control while offering the convenience of 24/7 digital booking. It bridges the gap between traditional service and modern expectations.
          </p>
          <p>
            Furthermore, a verified marketplace approach builds trust. By having administrators approve shop listings, customers can book with confidence, knowing they are engaging with legitimate, quality businesses. This ecosystem benefits everyone: shops gain access to a broader client base, and customers enjoy a friction-free experience from discovery to the final cut.
          </p>
          <p>
            Ultimately, the transition to online booking is an investment in the business's future. It frees up the barber to focus on what they do best—delivering excellent grooming services—while the software handles the logistics. As the industry evolves, embracing these tools will be the defining factor between shops that merely survive and those that thrive.
          </p>
        </div>

        {/* ════════════════════ SHARE / RELATED ════════════════════ */}
        <div className="related-section mt-24 border-t border-stone-200 pt-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
            <h3 className="font-display text-3xl text-ink">Keep reading</h3>
            <div className="flex gap-3">
              <Link to="/shops">
                <Button variant="bronze">Find a shop</Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline">Contact us</Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {relatedPosts.map((rp) => (
              <Link
                key={rp.slug}
                to={`/blog/${rp.slug}`}
                className="related-card group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md hover:border-bronze/30"
              >
                <div className="sm:w-48 shrink-0 aspect-[16/9] sm:aspect-auto overflow-hidden">
                  <img
                    src={rp.image}
                    alt={rp.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="p-5 flex flex-col justify-center flex-1">
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                    <span className="font-medium text-bronze">{rp.category}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {rp.readTime}
                    </span>
                  </div>
                  <h4 className="font-display text-xl text-ink transition-colors group-hover:text-bronze">
                    {rp.title}
                  </h4>
                  <p className="mt-1 text-sm text-stone-500 line-clamp-1">{rp.excerpt}</p>
                </div>
                <div className="hidden sm:flex items-center justify-center px-6 text-stone-300 group-hover:text-bronze transition-colors">
                  <ArrowUpRight className="h-6 w-6" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
