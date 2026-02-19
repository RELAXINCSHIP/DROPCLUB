'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, TrendingUp, Shield } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 text-center overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-background to-background" />
        <div className="absolute bottom-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-600/10 rounded-full blur-[128px]" />
        <div className="absolute top-20 left-20 w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-blue-600/10 rounded-full blur-[128px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 w-full max-w-4xl mx-auto"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-zinc-900/50 border border-zinc-800 backdrop-blur-md px-4 py-1.5 rounded-full text-xs md:text-sm flex items-center gap-2 text-zinc-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Drops Active
          </div>
        </div>

        <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter bg-gradient-to-br from-white via-zinc-200 to-zinc-600 bg-clip-text text-transparent drop-shadow-sm px-2">
          DROPCLUB
        </h1>

        <p className="text-lg md:text-3xl text-zinc-400 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
          Win Cash. Win Clout. Win Access.
          <br className="hidden md:block" />
          <span className="text-zinc-100 block mt-2 md:mt-0">The club you actually want to be in.</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full px-4">
          <Link href="/signup" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] transition-all"
            >
              Join the Club
            </motion.button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto border border-zinc-800 bg-zinc-950/50 backdrop-blur-md px-8 py-4 rounded-full font-bold text-lg text-white transition-all"
            >
              Log In
            </motion.button>
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-6xl mx-auto">
          <motion.div
            whileHover={{ y: -5 }}
            className="p-8 border border-zinc-800 rounded-3xl bg-zinc-900/20 backdrop-blur-sm"
          >
            <div className="bg-purple-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-purple-400">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Daily Drops</h3>
            <p className="text-zinc-400 leading-relaxed">New chances to win every single day at noon. Don't miss the notification.</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="p-8 border border-zinc-800 rounded-3xl bg-zinc-900/20 backdrop-blur-sm"
          >
            <div className="bg-blue-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-blue-400">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Exclusive Access</h3>
            <p className="text-zinc-400 leading-relaxed">Members get entry to VIP events, limited merch, and 2x entries.</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="p-8 border border-zinc-800 rounded-3xl bg-zinc-900/20 backdrop-blur-sm"
          >
            <div className="bg-green-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-green-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Community Vault</h3>
            <p className="text-zinc-400 leading-relaxed">Transparency first. See past winners and verifiable blockchain proof.</p>
          </motion.div>
        </div>
      </motion.div>
    </main>
  )
}
