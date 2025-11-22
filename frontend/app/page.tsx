// app/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

const App = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = session?.user;

  const getUserInitials = () => {
    if (!user?.name) return user?.email?.[0]?.toUpperCase() || "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  const handleProtectedRoute = (path: string) => {
    if (!user) {
      router.push("/login");
    } else {
      router.push(path);
    }
    setMobileMenuOpen(false);
  };

  const FeatureCard = ({ title, icon, description }: any) => (
    <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-xl text-center transition-transform transform hover:scale-105 hover:border-purple-500">
      <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 rounded-full bg-gray-800 border border-gray-700">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );

  const StepCard = ({ number, title, description }: any) => (
    <div className="relative">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );

  const PricingCard = ({ tier, price, features, isPopular }: any) => (
    <div className={`relative bg-gray-900 p-8 rounded-xl border ${isPopular ? 'border-purple-500 shadow-2xl shadow-purple-500/20' : 'border-gray-700'} transition-transform transform hover:scale-105`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">{tier}</h3>
        {price && (
          <>
            <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              {price}
            </div>
            <p className="text-gray-400 text-sm mt-2">per month</p>
          </>
        )}
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature: string, idx: number) => (
          <li key={idx} className="flex items-start gap-3 text-gray-300">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={() => handleProtectedRoute("/dashboard")}
        className={`w-full py-3 rounded-lg font-semibold transition-colors ${
          isPopular 
            ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:opacity-90' 
            : 'bg-gray-800 text-white hover:bg-gray-700'
        }`}
      >
        Get Started
      </button>
    </div>
  );

  return (
    <div className="bg-gray-950 relative text-gray-200 font-sans antialiased min-h-screen overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute w-96 h-96 rounded-full bg-purple-600 opacity-10 blur-3xl -top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-96 h-96 rounded-full bg-blue-500 opacity-10 blur-3xl bottom-20 right-20 animate-pulse"></div>
      </div>

      <div className="relative z-10">
        {/* Navbar */}
        <nav className="flex items-center justify-between p-4 sm:p-6 backdrop-blur-sm bg-gray-950/80 sticky top-0 z-50 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <img src="/realityX logo.png" alt="Logo" className="h-10 sm:h-12 w-auto" />
            <Link href="/" className="text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 font-bold">
              realityX
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
              About
            </Link>
            {user && (
              <>
                <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </button>
                <button onClick={() => router.push("/dashboard/new-ai-session")} className="text-gray-400 hover:text-white transition-colors">
                  Chat
                </button>
              </>
            )}
          </div>
          

          {/* Desktop - Login or Avatar */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:opacity-90 transition-opacity"
                title={user.name || user.email || "User"}
              >
                {getUserInitials()}
              </button>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="bg-purple-600 px-8 py-2 rounded-lg font-semibold text-white hover:bg-purple-700 transition-colors"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-3">
            {user ? (
              <>
                <button onClick={() => router.push("/dashboard")} className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold text-sm">
                  {getUserInitials()}
                </button>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-400 hover:text-white transition-colors">
                  {mobileMenuOpen ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </>
            ) : (
              <button onClick={() => router.push("/login")} className="bg-purple-600 px-6 py-2 rounded-lg font-semibold text-white hover:bg-purple-700 transition-colors text-sm">
                Login
              </button>
            )}
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && user && (
          <div className="lg:hidden absolute top-[72px] left-0 right-0 bg-gray-900 border-b border-gray-800 shadow-xl z-50 animate-slide-down">
            <div className="flex flex-col p-4 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold">
                  {getUserInitials()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{user.name || "User"}</p>
                  <p className="text-gray-400 text-sm truncate">{user.email}</p>
                </div>
              </div>
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors py-2">Home</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors py-2">About</Link>
              <button onClick={() => handleProtectedRoute("/dashboard")} className="text-left text-gray-300 hover:text-white transition-colors py-2">Dashboard</button>
              <button onClick={() => { setMobileMenuOpen(false); router.push("/api/auth/signout"); }} className="text-left text-red-400 hover:text-red-300 transition-colors py-2 border-t border-gray-800 pt-4">Logout</button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <main className="flex flex-col items-center justify-center text-center px-4 sm:px-6 py-20 sm:py-32">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 max-w-5xl leading-tight mb-6">
            <span className="text-white">realityX</span> AI
          </h1>
          <p className="text-gray-400 text-base sm:text-lg md:text-xl max-w-3xl mb-10">
            Your intelligent AI companion. Chat, learn, create, and explore endless possibilities with advanced AI technology at your fingertips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => handleProtectedRoute("/dashboard")} className="flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold py-4 px-8 rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/50">
              Start Chatting Now
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button onClick={() => handleProtectedRoute("/dashboard")} className="border-2 border-gray-700 text-white font-semibold py-4 px-8 rounded-lg transition-all hover:bg-gray-800 hover:border-purple-500">
              View Chat History
            </button>
          </div>
        </main>

        {/* Features Section */}
        <section className="px-4 sm:px-6 lg:px-12 py-20 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Everything you need for intelligent conversations and creative exploration</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Intelligent Responses"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
              description="Get smart, contextual responses powered by state-of-the-art AI technology that understands your questions."
            />
            <FeatureCard
              title="Chat History"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              description="Access your entire conversation history and revisit past chats whenever you need them."
            />
            <FeatureCard
              title="Multi-Purpose AI"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              description="Use AI for writing, coding, analysis, brainstorming, and much more in one convenient place."
            />
          </div>
        </section>

        {/* How It Works */}
        <section className="px-4 sm:px-6 lg:px-12 py-20 bg-gray-900/30 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Get started in seconds and explore the power of AI</p>
            </div>
            <div className="space-y-12">
              <StepCard number="1" title="Create Your Account" description="Sign up with Google or email to access your personal AI assistant dashboard instantly." />
              <StepCard number="2" title="Start a Conversation" description="Begin chatting with our AI. Ask questions, get advice, brainstorm ideas, or explore any topic." />
              <StepCard number="3" title="Explore Features" description="Discover what the AI can do. Write content, debug code, analyze data, or spark creativity." />
              <StepCard number="4" title="Build Your Library" description="Save important conversations and organize them by topic for easy access and reference." />
              <StepCard number="5" title="Upgrade & Unlock" description="Choose a paid plan to unlock unlimited conversations, advanced features, and priority support." />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="px-4 sm:px-6 lg:px-12 py-20 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Simple Pricing</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Choose the perfect plan for your needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard
              tier="Free"
              features={[
                "150 Messages/Month",
                "Basic AI Responses",
                "Chat History (30 days)"
              ]}
              isPopular={false}
            />
            <PricingCard
              tier="Pro"
              price="0.05 SOL / month"
              features={[
                "300 Messages/Month",
                "Advanced AI Responses",
                "Unlimited Chat History",
                "Priority Support",
                "Custom AI Instructions"
              ]}
              isPopular={true}
            />
            <PricingCard
              tier="Elite"
              price="0.25 SOL / month"
              features={[
                "More AI Credits",
                "Full Analytics Dashboard",
                "Custom Template Creation",
                "Dedicated Support",
                "Image Upload & Analysis",
              ]}
              isPopular={false}
            />
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-4 sm:px-6 lg:px-12 py-20 bg-gray-900/30 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
                  10M+
                </div>
                <p className="text-gray-400">Active Conversations</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
                  500K+
                </div>
                <p className="text-gray-400">Happy Users</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
                  99.9%
                </div>
                <p className="text-gray-400">Uptime Guarantee</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 sm:px-6 lg:px-12 py-20 text-center">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm rounded-3xl p-12 border border-purple-500/30">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Experience AI?</h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of users exploring the possibilities of intelligent conversations
            </p>
            <button
              onClick={() => handleProtectedRoute("/dashboard")}
              className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold py-4 px-10 rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/50 inline-flex items-center gap-2"
            >
              Start Free Today
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 px-4 sm:px-6 lg:px-12 py-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/realityX logo.png" alt="Logo" className="h-10 w-auto" />
                <span className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 font-bold">realityX</span>
              </div>
              <p className="text-gray-400 max-w-sm">Empowering users with intelligent AI conversations. Chat, create, and explore unlimited possibilities.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Chat</Link></li>
                
                <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            © 2025 realityX. All rights reserved.
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default App;