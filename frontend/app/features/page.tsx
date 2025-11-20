// app/features/page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, MessageSquare, BookOpen, Code, Lightbulb, BarChart3, Infinity, Settings, Clock, Share2, Archive, Palette } from "lucide-react";

const FeaturesPage = () => {
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

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const mainFeatures = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Smart Conversations",
      description: "Natural language conversations that understand context and nuance. Ask follow-up questions, clarify points, and have meaningful discussions.",
      benefits: ["Context awareness", "Multi-turn conversations", "Clarification requests", "Tone adaptation"]
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Code Generation & Debugging",
      description: "Generate, debug, and optimize code across multiple programming languages. Get explanations for how code works.",
      benefits: ["Multi-language support", "Syntax highlighting", "Performance tips", "Security analysis"]
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Learning & Education",
      description: "Break down complex topics into understandable explanations. Get study guides, practice problems, and learning resources.",
      benefits: ["Concept explanations", "Study guides", "Quiz generation", "Progress tracking"]
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Creative Brainstorming",
      description: "Generate ideas for projects, content, businesses, and creative endeavors. Refine concepts through iterative feedback.",
      benefits: ["Idea generation", "Story development", "Business planning", "Creative writing"]
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Data Analysis & Insights",
      description: "Analyze data, create visualizations, and derive actionable insights from your information.",
      benefits: ["Data interpretation", "Chart suggestions", "Trend analysis", "Report generation"]
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Responses",
      description: "Get immediate answers without waiting. Our optimized infrastructure delivers responses in milliseconds.",
      benefits: ["Real-time processing", "Streaming responses", "Zero latency", "Always available"]
    }
  ];

  const advancedFeatures = [
    {
      icon: <Infinity className="w-6 h-6" />,
      title: "Unlimited Conversations",
      description: "Chat as much as you want with no message limits or restrictions on usage.",
    },
    {
      icon: <Archive className="w-6 h-6" />,
      title: "Full Chat History",
      description: "Access your entire conversation history organized by date and topic for easy retrieval.",
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Custom Instructions",
      description: "Set preferences and instructions to customize how the AI responds to your needs.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Long Context Memory",
      description: "Maintain context over longer conversations with improved memory retention.",
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Easy Sharing",
      description: "Share conversations, transcripts, or specific messages with colleagues and friends.",
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Customization",
      description: "Personalize the interface with themes, font sizes, and layout preferences.",
    }
  ];

  const planComparison = [
    { feature: "Smart Conversations", starter: true, pro: true, enterprise: true },
    { feature: "Chat History", starter: "30 days", pro: true, enterprise: true },
    { feature: "Message Limit", starter: "50/month", pro: "Unlimited", enterprise: "Unlimited" },
    { feature: "Code Generation", starter: false, pro: true, enterprise: true },
    { feature: "Custom Instructions", starter: false, pro: true, enterprise: true },
    { feature: "Priority Support", starter: false, pro: false, enterprise: true },
    { feature: "Team Collaboration", starter: false, pro: false, enterprise: true },
  ];

  return (
    <div className="bg-gray-950 text-gray-200 relative font-sans min-h-screen overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full bg-purple-600 opacity-10 -top-48 -left-48 blur-3xl"></div>
        <div className="absolute w-96 h-96 rounded-full bg-blue-500 opacity-10 top-1/2 -right-48 blur-3xl"></div>
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

          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link>
            {user && (
              <>
                <button onClick={() => router.push("/dashboard")} className="text-gray-400 hover:text-white transition-colors">Dashboard</button>
                
              </>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                {getUserInitials()}
              </button>
            ) : (
              <button onClick={() => router.push("/login")} className="bg-purple-600 px-8 py-2 rounded-lg font-semibold text-white hover:bg-purple-700 transition-colors">
                Login
              </button>
            )}
          </div>

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

        {mobileMenuOpen && user && (
          <div className="lg:hidden absolute top-[64px] sm:top-[72px] left-0 right-0 bg-gray-900 border-b border-gray-800 shadow-xl z-50 animate-slide-down">
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
              <button onClick={() => handleNavigation("/dashboard")} className="text-left text-gray-300 hover:text-white transition-colors py-2">Dashboard</button>
              
              <button onClick={() => { setMobileMenuOpen(false); router.push("/api/auth/signout"); }} className="text-left text-red-400 hover:text-red-300 transition-colors py-2 border-t border-gray-800 pt-4">Logout</button>
            </div>
          </div>
        )}

        <main className="px-4 sm:px-6 py-12 sm:py-16 max-w-6xl mx-auto">
          {/* Hero */}
          <motion.header
            className="text-center mb-16 sm:mb-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
              Powerful Features <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Built for You</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto">
              Discover everything realityX can do to enhance your productivity, creativity, and learning.
            </p>
          </motion.header>

          {/* Main Features */}
          <div className="space-y-8 mb-20">
            {mainFeatures.map((feature, idx) => (
              <motion.div
                key={idx}
                className="bg-gray-900/50 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all"
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{feature.title}</h2>
                    <p className="text-sm sm:text-base text-gray-400 mb-4">{feature.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {feature.benefits.map((benefit, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs sm:text-sm text-purple-300">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Advanced Features */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">Advanced Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {advancedFeatures.map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center text-white mb-3">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Plan Comparison */}
          <motion.section
            className="mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">Feature Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 text-white font-bold">Feature</th>
                    <th className="text-center py-4 px-4 text-purple-400 font-bold">Free</th>
                    <th className="text-center py-4 px-4 text-blue-400 font-bold">Pro</th>
                    <th className="text-center py-4 px-4 text-gradient text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Elite</th>
                  </tr>
                </thead>
                <tbody>
                  {planComparison.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors">
                      <td className="py-4 px-4 text-gray-300 font-medium">{row.feature}</td>
                      <td className="text-center py-4 px-4">
                        {row.starter === true ? (
                          <span className="text-green-400">✓</span>
                        ) : row.starter === false ? (
                          <span className="text-gray-500">✗</span>
                        ) : (
                          <span className="text-gray-400 text-sm">{row.starter}</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-4">
                        {row.pro === true ? (
                          <span className="text-green-400">✓</span>
                        ) : row.pro === false ? (
                          <span className="text-gray-500">✗</span>
                        ) : (
                          <span className="text-gray-400 text-sm">{row.pro}</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-4">
                        {row.enterprise === true ? (
                          <span className="text-green-400">✓</span>
                        ) : row.enterprise === false ? (
                          <span className="text-gray-500">✗</span>
                        ) : (
                          <span className="text-gray-400 text-sm">{row.enterprise}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm p-8 sm:p-12 rounded-2xl border border-purple-500/30 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to Experience All Features?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">Start your free account today and unlock the full potential of AI-powered conversations.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user && (
                <button
                  onClick={() => router.push("/login")}
                  className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-all"
                >
                  Get Started Free
                </button>
              )}
              <button
                onClick={() => handleNavigation("/dashboard")}
                className="border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white font-bold px-8 py-3 rounded-xl transition-all"
              >
                Try Now
              </button>
            </div>
          </motion.section>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-8 px-4 sm:px-6 text-center text-gray-400 text-sm mt-16">
          <p>&copy; 2025 realityX. All rights reserved.</p>
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

export default FeaturesPage;