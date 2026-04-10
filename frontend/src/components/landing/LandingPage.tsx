'use client';

import { ArrowRight, Lock, Sparkles, Users, Zap } from 'lucide-react';
import Link from 'next/link';

const featureCards = [
    {
        icon: Users,
        title: 'Group Spaces',
        body: 'Spin up focused rooms for projects, teams, and friend circles in seconds.',
    },
    {
        icon: Zap,
        title: 'Instant Delivery',
        body: 'Realtime sockets keep every message and typing event synced without refresh.',
    },
    {
        icon: Lock,
        title: 'Private by Design',
        body: 'Token-based auth, secure media uploads, and controlled member actions.',
    },
];

export function LandingPage() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-[#070d12] text-white">
            <div className="landing-grid pointer-events-none absolute inset-0 opacity-60" />
            <div className="landing-orb landing-orb-one" />
            <div className="landing-orb landing-orb-two" />

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-12 pt-10 lg:px-10 lg:pt-16">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-[#d5e6ef]">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#25d366] shadow-[0_0_20px_rgba(37,211,102,0.9)]" />
                        AALAP
                    </div>
                    <Link
                        href="/login"
                        className="rounded-full border border-[#2a3942] bg-[#101a21]/80 px-4 py-2 text-sm text-[#dce8ef] transition hover:-translate-y-0.5 hover:border-[#3a5563] hover:bg-[#17242d]"
                    >
                        Sign In
                    </Link>
                </header>

                <section className="mt-12 grid items-center gap-8 lg:mt-16 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="landing-reveal space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#2a3942] bg-[#0f1920]/90 px-3 py-1 text-xs text-[#9fc4d4]">
                            <Sparkles size={14} className="text-[#53bdeb]" />
                            Realtime chat reimagined for web
                        </div>

                        <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                            Conversations that feel
                            <span className="landing-shimmer ml-3 inline-block bg-gradient-to-r from-[#25d366] via-[#53bdeb] to-[#7ee2c6] bg-clip-text text-transparent">
                                alive
                            </span>
                        </h1>

                        <p className="max-w-xl text-base leading-relaxed text-[#a8bcc8] sm:text-lg">
                            Aalap gives your team fast, elegant, and expressive communication with modern group flows,
                            media sharing, and live interaction signals.
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href="/login"
                                className="group inline-flex items-center gap-2 rounded-full bg-[#25d366] px-5 py-3 text-sm font-semibold text-[#06270f] transition hover:-translate-y-0.5 hover:brightness-105"
                            >
                                Login to Continue
                                <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-full border border-[#365160] bg-[#0f1920]/80 px-5 py-3 text-sm font-medium text-[#e6f4fb] transition hover:-translate-y-0.5 hover:bg-[#15222b]"
                            >
                                Create Account
                            </Link>
                        </div>
                    </div>

                    <div className="landing-panel rounded-3xl border border-[#2a3942] bg-[#0d171dcc] p-5 backdrop-blur-xl sm:p-6">
                        <div className="flex items-center justify-between border-b border-[#23323a] pb-3">
                            <span className="text-sm font-medium text-[#c2d9e4]">Live Preview</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#153125] px-2 py-1 text-[11px] text-[#77f2ad]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#25d366] animate-pulse" />
                                online
                            </span>
                        </div>

                        <div className="landing-chat-preview mt-4 rounded-2xl border border-[#22343f] bg-[#0a1218] p-3 sm:p-4">
                            <div className="flex items-center justify-between border-b border-[#1f3038] pb-2 text-[11px] text-[#88a7b4]">
                                <span># Weekend Plan</span>
                                <span>now</span>
                            </div>

                            <div className="mt-3 space-y-2.5 text-xs sm:text-sm">
                                <div className="landing-bubble landing-bubble-in max-w-[88%] rounded-2xl rounded-bl-md px-3 py-2 text-[#c7dce7]">
                                    Rashed: Who is bringing the speaker tonight?
                                </div>
                                <div
                                    className="landing-bubble landing-bubble-out ml-auto max-w-[82%] rounded-2xl rounded-br-md px-3 py-2 text-[#d8f8e8]"
                                    style={{ animationDelay: '120ms' }}
                                >
                                    I got it. Also shared the venue pin.
                                </div>
                                <div
                                    className="landing-bubble landing-bubble-in max-w-[80%] rounded-2xl rounded-bl-md px-3 py-2 text-[#c7dce7]"
                                    style={{ animationDelay: '220ms' }}
                                >
                                    Nice. Let&apos;s meet by 8:30.
                                </div>

                                <div className="landing-typing inline-flex items-center gap-1 rounded-full border border-[#25414d] bg-[#13242d] px-3 py-1.5 text-[11px] text-[#91b8c8]">
                                    <span className="landing-typing-dot" />
                                    <span className="landing-typing-dot" />
                                    <span className="landing-typing-dot" />
                                    Priyo typing...
                                </div>
                            </div>

                            <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-[#87a9b7]">
                                <div className="rounded-lg border border-[#1e3440] bg-[#0f202a] px-2 py-1.5">12 online</div>
                                <div className="rounded-lg border border-[#234432] bg-[#122a20] px-2 py-1.5">4 files</div>
                                <div className="rounded-lg border border-[#2b3047] bg-[#191e33] px-2 py-1.5">2 calls</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-10 grid gap-4 md:grid-cols-3">
                    {featureCards.map((feature, index) => (
                        <article
                            key={feature.title}
                            className="landing-card rounded-2xl border border-[#263842] bg-[#0f1a22bf] p-5 backdrop-blur-sm"
                            style={{ animationDelay: `${index * 120}ms` }}
                        >
                            <feature.icon size={18} className="text-[#72d7b4]" />
                            <h3 className="mt-3 text-lg font-semibold text-[#e8f4fb]">{feature.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-[#a9bdc8]">{feature.body}</p>
                        </article>
                    ))}
                </section>
            </div>
        </main>
    );
}
