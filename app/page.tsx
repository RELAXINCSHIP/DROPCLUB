'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, TrendingUp, Shield, ArrowRight, Star } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden bg-black text-white selection:bg-purple-500/30 font-sans">

      {/* 1. AGGRESSIVE BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none perspective-[1000px]">
        {/* Moving Grid */}
        <div className="absolute inset-0 bg-grid-small-white/[0.1] bg-[size:60px_60px] animate-grid-move opacity-30 origin-top" style={{ transformStyle: 'preserve-3d' }} />

        {/* Radial Fade */}
        <div className="absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black_80%)]" />

        {/* Random Floating Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-600/30 rounded-full blur-[150px] animate-pulse mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[150px] animate-pulse delay-1000 mix-blend-screen" />
      </div>

      {/* 2. SCROLLING MARQUEE (Top & Bottom) */}
      <div className="absolute top-12 left-0 w-full overflow-hidden z-0 opacity-20 -rotate-2 scale-110 pointer-events-none">
        <div className="flex gap-8 whitespace-nowrap animate-marquee text-6xl font-black text-transparent stroke-white/20 select-none">
          {[...Array(20)].map((_, i) => (
            <span key={i} className="outline-text">WIN CASH • WIN CLOUT • JOIN THE CLUB •</span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-24 left-0 w-full overflow-hidden z-0 opacity-20 rotate-1 scale-110 pointer-events-none">
        <div className="flex gap-8 whitespace-nowrap animate-marquee-reverse text-4xl font-black text-zinc-800 select-none">
          {[...Array(20)].map((_, i) => (
            <span key={i}>DAILY DROPS • EXCLUSIVE ACCESS • PROVABLY FAIR •</span>
          ))}
        </div>
      </div>

      <div className="z-10 w-full max-w-6xl px-6 md:px-12 flex flex-col items-center text-center relative">

        {/* Live Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="mb-6 relative group cursor-pointer"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200 animate-pulse"></div>
          <div className="relative inline-flex items-center gap-3 px-6 py-2 rounded-full bg-black border border-purple-500/50 text-purple-200 text-sm font-bold uppercase tracking-widest shadow-[0_0_30px_-5px_rgba(168,85,247,0.6)]">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span>Live Drops Active</span>
          </div>
        </motion.div>

        {/* Main Heading with GLITCH */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 relative"
        >
          <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter leading-[0.85] select-none font-[family-name:var(--font-glitch)]">
            <span className="block text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">DROP</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-shimmer bg-[200%_auto] relative">
              <span className="absolute inset-0 text-purple-500/30 blur-xl animate-pulse" aria-hidden="true">CLUB</span>
              CLUB
            </span>
          </h1>
        </motion.div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-2xl md:text-3xl text-zinc-300 mb-12 max-w-3xl leading-relaxed font-light tracking-wide"
        >
          Win Cash. Win Clout. Win Access. <br />
          <span className="text-white font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">The exclusive club for the top 1%.</span>
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 w-full justify-center items-center"
        >
          <Link href="/signup" className="w-full sm:w-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
            <button className="relative w-full sm:w-auto overflow-hidden rounded-full bg-white px-10 py-5 text-black font-black text-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
              <span className="relative flex items-center justify-center gap-3 z-10">
                JOIN THE CLUB <ArrowRight className="w-6 h-6 stroke-[3px]" />
              </span>
            </button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-10 py-5 rounded-full font-bold text-xl text-white border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] hover:border-white/50">
              MEMBER LOGIN
            </button>
          </Link>
        </motion.div>

        {/* Feature Grid with Neon Borders */}
        <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-yellow-400 fill-yellow-400/20" />}
            title="DAILY DROPS"
            desc="High-value prizes dropping every 24 hours. Don't blink or you'll miss it."
            delay={0.8}
          />
          <FeatureCard
            icon={<Star className="w-8 h-8 text-purple-400 fill-purple-400/20" />}
            title="EXCLUSIVE STATUS"
            desc="Join a vetted community of winners. Flex your wins on the global leaderboard."
            delay={0.9}
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-blue-400 fill-blue-400/20" />}
            title="PROVABLY FAIR"
            desc="Blockchain-verified outcomes. 100% transparent. No rigged games, ever."
            delay={1.0}
          />
        </div>
      </div>
    </main>
  )
}

function FeatureCard({ icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className="group relative p-8 rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm overflow-hidden hover:border-purple-500/30 transition-colors"
    >
      <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <div className="mb-4 p-3 rounded-2xl bg-white/5 w-fit border border-white/10 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-zinc-400 leading-relaxed text-sm">{desc}</p>
      </div>
    </motion.div>
  )
}
