// app/about/page.tsx
"use client";

import React, { useState } from "react";
import { Github, Twitter, Facebook, MessageCircle, Sparkles, Users, Target, Zap, Shield, Brain } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";

const AboutPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = session?.user;

  // Get user initials
  const getUserInitials = () => {
    if (!user?.name) return user?.email?.[0]?.toUpperCase() || "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  // Navigation handler
  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const team = [
    {
      name: "Fortune Divinewill",
      role: "Founder & Vision",
      bio: "Driving the mission and shaping the future of the project.",
      img: "/ceo.png",
      socials: { 
        twitter: "https://x.com/nodexxplorer", 
        github: "https://github.com/nodexxplorer", 
        facebook: "https://web.facebook.com/nodexxplorer" 
      },
    },
    {
      name: "Samuel Iwuk",
      role: "Analysis Engineer",
      bio: "Building scalable systems and ensuring seamless integrations.",
      img: "/samuel.jpg",
      socials: { 
        twitter: "https://x.com/iwukjnr", 
        github: "https://github.com/Samuel-Matthew", 
        facebook: "https://web.facebook.com/iwukjnr" 
      },
    },
    {
      name: "Destiny Okagbuo",
      role: "Community Manager",
      bio: "Connecting people, growing community, and driving engagement.",
      img: "/destiny.jpg",
      socials: { 
        twitter: "https://x.com/Destiny_Okagbuo", 
        github: "https://github.com/DestinySolomon", 
        facebook: "https://web.facebook.com/DestinyOkagbuo" 
      },
    },
  ];

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Advanced AI Technology",
      description: "Powered by cutting-edge language models that understand context, nuance, and complexity. Get human-like responses that feel natural and helpful.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Personal Assistant",
      description: "Your dedicated AI that learns your preferences, remembers conversations, and adapts to your unique communication style over time.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Your conversations are encrypted and private. We prioritize your data security and never share your information with third parties.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Get instant responses without waiting. Our optimized infrastructure ensures you get answers in real-time, every single time.",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Multi-Purpose Usage",
      description: "From writing and coding to analysis and brainstorming. Use AI for any task you can imagine with zero limitations.",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Always Improving",
      description: "We continuously update our AI with the latest advancements and user feedback to provide you with the best experience possible.",
    },
  ];

  const stats = [
    { label: "Active Users", value: "500K+" },
    { label: "Conversations", value: "5M+" },
    { label: "Lines of Code Generated", value: "50M+" },
    { label: "Uptime", value: "99.9%" },
  ];

  const useCases = [
    {
      title: "Content Creation",
      description: "Write blog posts, articles, stories, and social media content with AI assistance and human creativity combined.",
      emoji: "✍️"
    },
    {
      title: "Code & Development",
      description: "Generate code snippets, debug issues, learn new languages, and accelerate your development workflow.",
      emoji: "💻"
    },
    {
      title: "Learning & Research",
      description: "Understand complex topics, get explanations, research information, and deepen your knowledge across any subject.",
      emoji: "🎓"
    },
    {
      title: "Business & Strategy",
      description: "Get business insights, develop strategies, analyze markets, and make data-driven decisions faster.",
      emoji: "📈"
    },
    {
      title: "Creative Projects",
      description: "Brainstorm ideas, develop concepts, create storylines, and bring your creative vision to life with AI collaboration.",
      emoji: "🎨"
    },
    {
      title: "Problem Solving",
      description: "Work through challenges, get different perspectives, find solutions, and overcome obstacles efficiently.",
      emoji: "🔍"
    },
  ];

  return (
    <div className="bg-gray-950 text-gray-200 relative font-sans min-h-screen overflow-x-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full bg-purple-600 opacity-10 -top-48 -left-48 blur-3xl"></div>
        <div className="absolute w-96 h-96 rounded-full bg-blue-500 opacity-10 top-1/2 -right-48 blur-3xl"></div>
        <div className="absolute w-96 h-96 rounded-full bg-pink-500 opacity-10 bottom-0 left-1/3 blur-3xl"></div>
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
            <Link href="/about" className="text-white font-semibold">
              About
            </Link>

            {user && (
              <>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Dashboard
                </button>
                
              </>
            )}
          </div>

          {/* Desktop - Login Button or User Avatar */}
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

          {/* Mobile - Hamburger Menu or User Avatar */}
          <div className="flex lg:hidden items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold text-sm"
                >
                  {getUserInitials()}
                </button>
                
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  aria-label="Toggle menu"
                >
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
              <button
                onClick={() => router.push("/login")}
                className="bg-purple-600 px-6 py-2 rounded-lg font-semibold text-white hover:bg-purple-700 transition-colors text-sm"
              >
                Login
              </button>
            )}
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
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

              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors py-2">
                Home
              </Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white transition-colors py-2">
                About
              </Link>
              <button onClick={() => handleNavigation("/dashboard")} className="text-left text-gray-300 hover:text-white transition-colors py-2">
                Dashboard
              </button>
            
              
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push("/api/auth/signout");
                }}
                className="text-left text-red-400 hover:text-red-300 transition-colors py-2 border-t border-gray-800 pt-4"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Hero */}
        <motion.header
          className="text-center px-4 sm:px-6 mt-12 sm:mt-16 md:mt-24 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
            About{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              realityX
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 mt-4 max-w-3xl mx-auto">
            Your intelligent AI companion. We're on a mission to make advanced AI accessible to everyone, enabling creative expression, learning, and problem-solving at scale.
          </p>
        </motion.header>

        {/* Stats Section */}
        <motion.section
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-6 mt-12 sm:mt-16 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              className="bg-gray-900/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-800 text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                {stat.value}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </motion.section>

        <main className="px-4 sm:px-6 py-12 sm:py-16 max-w-6xl mx-auto space-y-16 sm:space-y-24">
          {/* Mission & Vision */}
          <motion.section
            className="grid md:grid-cols-2 gap-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-gray-900/50 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-800">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                Our Mission
              </h2>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                realityX is dedicated to democratizing access to advanced AI technology. We believe everyone deserves an intelligent assistant that can help them learn, create, and solve problems. Our mission is to provide a seamless, intuitive platform where users from all backgrounds can harness the power of AI to achieve their goals and expand their potential.
              </p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-800">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                Our Vision
              </h2>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                We envision a world where AI is a helpful companion to everyone. A future where language barriers, knowledge gaps, and creative blocks are no longer obstacles. Through continuous innovation and user-centric design, realityX will become the most trusted and beloved AI platform globally, empowering billions to do more with less friction.
              </p>
            </div>
          </motion.section>

          {/* Features Grid */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-8 sm:mb-12">
              Why Choose realityX?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center mb-4 text-white">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Use Cases */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-8 sm:mb-12">
              What Can You Do With realityX?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {useCases.map((useCase, idx) => (
                <motion.div
                  key={idx}
                  className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-all"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-4xl mb-4">{useCase.emoji}</div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-sm text-gray-400">{useCase.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* AI Assistant CTA */}
          <motion.section
            className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm p-6 sm:p-10 rounded-2xl border border-purple-500/30"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 mb-6">
                <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Chat With Your AI Assistant?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-8">
                Start a conversation today and experience the power of intelligent, context-aware AI that adapts to your needs and helps you accomplish more.
              </p>
              <button
                onClick={() => handleNavigation("/dashboard/new-ai-session")}
                className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold px-6 sm:px-10 py-3 sm:py-4 rounded-xl hover:opacity-90 transition-all text-sm sm:text-base inline-flex items-center gap-2 shadow-xl hover:shadow-purple-500/50"
              >
                Start Chatting Now
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </motion.section>

          {/* Team Section */}
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-8 sm:mb-12">
              Meet the Builders
            </h2>
            <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member, idx) => (
                <motion.div
                  key={idx}
                  className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 hover:border-purple-500/50 text-center transition-all"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                >
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto mb-4 object-cover border-4 border-purple-500/30"
                  />
                  <h3 className="font-bold text-lg sm:text-xl text-white">{member.name}</h3>
                  <p className="text-sm text-purple-400 mb-2">{member.role}</p>
                  <p className="text-xs sm:text-sm text-gray-400 mb-4">{member.bio}</p>
                  <div className="flex justify-center gap-4">
                    <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                      <Twitter className="w-5 h-5 text-gray-400 hover:text-blue-400" />
                    </a>
                    <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                      <Github className="w-5 h-5 text-gray-400 hover:text-white" />
                    </a>
                    <a href={member.socials.facebook} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                      <Facebook className="w-5 h-5 text-gray-400 hover:text-blue-500" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Community Section */}
          <motion.section
            className="bg-gray-900/50 backdrop-blur-sm p-8 sm:p-12 rounded-2xl border border-gray-800 text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <MessageCircle className="w-16 h-16 sm:w-20 sm:h-20 text-purple-400 mx-auto mb-6" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Join Our Community
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Connect with thousands of users, share tips and tricks, and be part of a vibrant community exploring the possibilities of AI. Exchange ideas, learn from others, and grow together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://discord.gg/uB24uX7F"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold px-8 py-3 rounded-xl transition-all inline-flex items-center gap-3 shadow-lg w-full sm:w-auto justify-center"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Join Discord Community</span>
              </a>
              <button
                onClick={() => router.push("/dashboard")}
                className="border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white font-bold px-8 py-3 rounded-xl transition-all w-full sm:w-auto"
              >
                Try AI Now
              </button>
            </div>
          </motion.section>

          {/* Final CTA */}
          <motion.section
            className="text-center py-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already leveraging AI to enhance their productivity and creativity. Your AI assistant is just one click away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user && (
                <button
                  onClick={() => router.push("/login")}
                  className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold px-10 py-4 rounded-xl hover:opacity-90 transition-all shadow-xl"
                >
                  Get Started Free
                </button>
              )}
              <button
                onClick={() => handleNavigation("/dashboard/new-ai-session")}
                className="border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white font-bold px-10 py-4 rounded-xl transition-all"
              >
                Start Chatting
              </button>
            </div>
          </motion.section>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 py-8 px-4 sm:px-6 text-center text-gray-400 text-sm">
          <p>&copy; 2025 realityX. All rights reserved.</p>
          <p className="mt-2">Built by the NodeXplorer's Team</p>
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

export default AboutPage;