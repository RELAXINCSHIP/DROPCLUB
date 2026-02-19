export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-black text-white selection:bg-purple-500/30">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-grid-small-white/[0.05] bg-[size:60px_60px]" />
                <div className="absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

                {/* Glowing Orbs - Simplified for Auth */}
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[128px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[128px] animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 w-full max-w-md p-4">
                {children}
            </div>
        </div>
    )
}
