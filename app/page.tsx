'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { Zap, TrendingUp, Shield, ArrowRight, Star, Gamepad, Trophy, Users, Flame, Gift } from 'lucide-react'
import { useRef } from 'react'

function AnimatedSection({ children, delay = 0, className = '' }: { children: React.ReactNode, delay?: number, className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function CountUp({ target, suffix = '' }: { target: number, suffix?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
    >
      {inView ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {target.toLocaleString()}{suffix}
        </motion.span>
      ) : '0'}
    </motion.span>
  )
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center relative overflow-hidden bg-black text-white selection:bg-purple-500/30 font-sans">

      {/* === BACKGROUND === */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-small-white/[0.1] bg-[size:60px_60px] animate-grid-move opacity-30" />
        <div className="absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black_80%)]" />
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-600/30 rounded-full blur-[150px] animate-pulse mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[150px] animate-pulse mix-blend-screen" />
      </div>

      {/* === SCROLLING MARQUEE === */}
      <div className="absolute top-12 left-0 w-full overflow-hidden z-0 opacity-20 -rotate-2 scale-110 pointer-events-none">
        <div className="flex gap-8 whitespace-nowrap animate-marquee text-6xl font-black text-transparent stroke-white/20 select-none">
          {[...Array(20)].map((_, i) => (
            <span key={i} className="outline-text">WIN CASH • WIN CLOUT • JOIN THE CLUB •</span>
          ))}
        </div>
      </div>

      {/* ============================================ */}
      {/* SECTION 1: HERO                              */}
      {/* ============================================ */}
      <section className="relative z-10 w-full max-w-6xl px-6 md:px-12 flex flex-col items-center text-center pt-32 pb-20 min-h-screen justify-center">
        {/* Live Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="mb-6 relative group cursor-pointer"
        >
          <div className="absolute -inset-1 bg-linear-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200 animate-pulse" />
          <div className="relative inline-flex items-center gap-3 px-6 py-2 rounded-full bg-black border border-purple-500/50 text-purple-200 text-sm font-bold uppercase tracking-widest shadow-[0_0_30px_-5px_rgba(168,85,247,0.6)]">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </span>
            Live Drops Active
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter leading-[0.85] select-none font-[family-name:var(--font-glitch)]">
            <span className="block text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">DROP</span>
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-purple-500 via-pink-500 to-purple-500 animate-shimmer bg-[200%_auto] relative">
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
            <div className="absolute -inset-1 bg-linear-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200" />
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

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full bg-white/60"
            />
          </div>
        </motion.div>
      </section>

      {/* ============================================ */}
      {/* SECTION 2: SOCIAL PROOF / STATS              */}
      {/* ============================================ */}
      <section className="relative z-10 w-full max-w-6xl px-6 md:px-12 py-24">
        <AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, label: 'Members', value: 12500, suffix: '+', color: 'text-blue-400' },
              { icon: Gift, label: 'Prizes Given', value: 420, suffix: '+', color: 'text-purple-400' },
              { icon: Trophy, label: 'Winners', value: 2800, suffix: '+', color: 'text-yellow-400' },
              { icon: Flame, label: 'Points Earned', value: 5000000, suffix: '+', color: 'text-orange-400' },
            ].map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 0.1}>
                <div className="text-center p-6 rounded-2xl border border-white/5 bg-zinc-900/30 hover:border-white/10 transition-colors">
                  <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-3`} />
                  <div className="text-3xl md:text-4xl font-black text-white">
                    <CountUp target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-bold">{stat.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* ============================================ */}
      {/* SECTION 3: HOW IT WORKS                      */}
      {/* ============================================ */}
      <section className="relative z-10 w-full max-w-6xl px-6 md:px-12 py-24">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter">
            HOW IT <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400">WORKS</span>
          </h2>
          <p className="text-zinc-400 text-lg mt-4 max-w-xl mx-auto">Three steps. Sixty seconds. You&apos;re in.</p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'JOIN FREE', desc: 'Create your account in seconds. No credit card required.', icon: Users, color: 'from-purple-600 to-indigo-600' },
            { step: '02', title: 'EARN POINTS', desc: 'Play arcade games, complete streaks, refer friends — stack those points.', icon: Gamepad, color: 'from-pink-600 to-purple-600' },
            { step: '03', title: 'WIN BIG', desc: 'Enter drops with your points. Win cash, sneakers, tech — updated daily.', icon: Trophy, color: 'from-yellow-500 to-orange-500' },
          ].map((item, i) => (
            <AnimatedSection key={item.step} delay={i * 0.15}>
              <div className="relative group p-8 rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm overflow-hidden hover:border-white/20 transition-all cursor-default">
                <div className="absolute inset-0 bg-linear-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 right-4 text-6xl font-black text-white/[0.03] select-none">{item.step}</div>
                <div className="relative z-10">
                  <div className={`mb-5 p-3 rounded-2xl bg-linear-to-br ${item.color} w-fit shadow-lg`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">{item.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4: FEATURES                          */}
      {/* ============================================ */}
      <section className="relative z-10 w-full max-w-6xl px-6 md:px-12 py-24">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter">
            NOT YOUR AVERAGE <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-orange-400">DROP SITE</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-yellow-400 fill-yellow-400/20" />}
            title="DAILY DROPS"
            desc="High-value prizes dropping every 24 hours. Don't blink or you'll miss it."
            delay={0}
          />
          <FeatureCard
            icon={<Star className="w-8 h-8 text-purple-400 fill-purple-400/20" />}
            title="EXCLUSIVE STATUS"
            desc="Join a vetted community of winners. Flex your wins on the global leaderboard."
            delay={0.1}
          />
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-blue-400 fill-blue-400/20" />}
            title="PROVABLY FAIR"
            desc="Blockchain-verified outcomes. 100% transparent. No rigged games, ever."
            delay={0.2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <AnimatedSection delay={0.3}>
            <div className="p-8 rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm hover:border-purple-500/30 transition-all">
              <Gamepad className="w-8 h-8 text-pink-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">6 ARCADE GAMES</h3>
              <p className="text-zinc-400 text-sm">Scratch cards, prize wheel, coin flip, slots, hi-lo, and mystery boxes. All free to play.</p>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.4}>
            <div className="p-8 rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm hover:border-yellow-500/30 transition-all">
              <TrendingUp className="w-8 h-8 text-green-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">GLOBAL LEADERBOARD</h3>
              <p className="text-zinc-400 text-sm">Compete with thousands. Climb the ranks. Earn badges and flex your status.</p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 5: TESTIMONIALS                      */}
      {/* ============================================ */}
      <section className="relative z-10 w-full max-w-6xl px-6 md:px-12 py-24">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter">
            WHAT MEMBERS <span className="text-transparent bg-clip-text bg-linear-to-r from-green-400 to-cyan-400">SAY</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: '@drops_king', text: "Won $500 on my second week. This is literally free money if you grind the arcade.", stars: 5 },
            { name: '@hypebeast_val', text: "The arcade games are actually addicting. Mystery box is goated 🔥", stars: 5 },
            { name: '@crypto_mike', text: "Finally a drop site that's actually fair. Leaderboard keeps me coming back daily.", stars: 5 },
          ].map((t, i) => (
            <AnimatedSection key={t.name} delay={i * 0.15}>
              <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30 backdrop-blur-sm">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-zinc-300 text-sm mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="text-xs text-zinc-500 font-bold">{t.name}</div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ============================================ */}
      {/* SECTION 6: FINAL CTA                         */}
      {/* ============================================ */}
      <section className="relative z-10 w-full max-w-4xl px-6 md:px-12 py-32 text-center">
        <AnimatedSection>
          <div className="relative">
            <div className="absolute -inset-8 bg-linear-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-[3rem] blur-3xl" />
            <div className="relative p-12 md:p-16 rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
                READY TO <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400">WIN</span>?
              </h2>
              <p className="text-zinc-400 text-lg mb-8 max-w-md mx-auto">Join thousands of members winning daily. Your first drop entry is free.</p>
              <Link href="/signup" className="relative group inline-block">
                <div className="absolute -inset-1 bg-linear-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200" />
                <button className="relative overflow-hidden rounded-full bg-white px-12 py-5 text-black font-black text-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <span className="relative flex items-center justify-center gap-3 z-10">
                    GET STARTED FREE <ArrowRight className="w-6 h-6 stroke-[3px]" />
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/5 py-8 text-center">
        <p className="text-zinc-600 text-xs">© 2025 DROPCLUB. All rights reserved. Not gambling — just vibes.</p>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) {
  return (
    <AnimatedSection delay={delay}>
      <div className="group relative p-8 rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-sm overflow-hidden hover:border-purple-500/30 transition-colors h-full">
        <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
          <div className="mb-4 p-3 rounded-2xl bg-white/5 w-fit border border-white/10 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
          <p className="text-zinc-400 leading-relaxed text-sm">{desc}</p>
        </div>
      </div>
    </AnimatedSection>
  )
}
