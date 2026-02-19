'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, TrendingUp, Shield, ArrowRight, Star } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden bg-black text-white selection:bg-purple-500/30">

      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-small-white/[0.05] bg-[size:60px_60px]" />

        {/* Radial Fade for Grid */}
        <div className="absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

        {/* Glowing Orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[128px] animate-pulse delay-1000" />
      </div>

      <div className="z-10 w-full max-w-5xl px-6 md:px-12 flex flex-col items-center text-center">

        {/* Live Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md text-purple-200 text-sm font-medium shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            LIVE DROPS ACTIVE
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-9xl font-black tracking-tighter mb-6 leading-tight"
        >
          <span className="bg-clip-text text-transparent bg-linear-to-b from-white via-white to-white/50">
            DROP
          </span>
          <span className="bg-clip-text text-transparent bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 animate-shimmer bg-[200%_auto]">
            CLUB
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl leading-relaxed"
        >
          Win Cash. Win Clout. Win Access.
          <br className="hidden md:block" />
          <span className="text-zinc-100 block mt-2">The exclusive club for the top 1%.</span>
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 w-full justify-center"
        >
          <Link href="/signup" className="w-full sm:w-auto">
            <button className="relative w-full sm:w-auto overflow-hidden rounded-full bg-white px-8 py-4 text-black font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)] group">
              <span className="absolute inset-0 bg-linear-to-r from-transparent via-black/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              <span className="relative flex items-center justify-center gap-2">
                Join the Club <ArrowRight className="w-5 h-5" />
              </span>
            </button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg text-white border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
              Member Login
            </button>
          </Link>
        </motion.div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-yellow-400" />}
            title="Daily Drops"
            desc="High-value prizes dropping every 24 hours. Don't blink."
            delay={0.8}
          />
          <FeatureCard
            icon={<Star className="w-6 h-6 text-purple-400" />}
            title="Exclusive Status"
            desc="Join a vetted community of winners. Flex your wins."
            delay={0.9}
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6 text-blue-400" />}
            title="Provably Fair"
            desc="Blockchain-verified winners. Complete transparency."
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
