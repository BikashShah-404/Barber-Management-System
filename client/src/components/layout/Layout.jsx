import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  const [showTopBtn, setShowTopBtn] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowTopBtn(true)
      } else {
        setShowTopBtn(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      
      {/* Scroll To Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white shadow-lg hover:bg-zinc-800 transition-all duration-300 ${
          showTopBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  )
}
