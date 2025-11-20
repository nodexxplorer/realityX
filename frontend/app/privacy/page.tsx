// app/privacy/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Trash2, FileText, AlertCircle } from "lucide-react";

const PrivacyPage = () => {
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

  const privacySections = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Information We Collect",
      content: "We collect information you provide directly, such as account creation details, profile information, and conversation content. We also automatically collect usage data like IP address, device type, and interaction patterns to improve our service.",
      items: ["Account credentials", "Profile information", "Conversation history", "Usage analytics", "Device information"]
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "How We Protect Your Data",
      content: "Your data is encrypted both in transit and at rest using industry-standard encryption protocols. We implement multi-layer security measures, regular security audits, and comply with international data protection standards.",
      items: ["End-to-end encryption", "SSL/TLS encryption", "Regular security audits", "Multi-factor authentication", "Secure data centers"]
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Data Usage & Sharing",
      content: "We never sell your personal data to third parties. Your conversations are used solely to improve our AI models and provide better service. You have full control over your data and can request access, modification, or deletion at any time.",
      items: ["No third-party sales", "AI model improvement only", "User consent required", "Transparent data practices", "Full user control"]
    },
    {
      icon: <Trash2 className="w-6 h-6" />,
      title: "Data Retention & Deletion",
      content: "You can delete individual conversations or your entire account at any time. We retain data only as long as necessary for service provision and legal compliance. Deleted data is permanently removed from our servers within 30 days.",
      items: ["On-demand deletion", "Account termination option", "30-day purge period", "Data export available", "No hidden retention"]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Your Privacy Rights",
      content: "You have the right to access, correct, or delete your personal information. We comply with GDPR, CCPA, and other privacy regulations. You can contact our privacy team for any data-related requests.",
      items: ["Right to access", "Right to rectification", "Right to erasure", "Right to portability", "Opt-out rights"]
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "Changes to This Policy",
      content: "We may update this privacy policy periodically. We'll notify you of significant changes via email or through our platform. Your continued use after changes constitutes acceptance of the updated policy.",
      items: ["Regular updates", "Email notifications", "Version history", "Effective date tracking", "User consent required"]
    }
  ];

  return (
    <div className="bg-gray-950 text-gray-200 relative font-sans min-h-screen overflow-x-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full bg-purple-600 opacity-10 -top-48 -left-48 blur-3xl"></div>
        <div className="absolute w-96 h-96 rounded-full bg-blue-500 opacity-10 top-1/2 -right-48 blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Navbar */}
        <nav className="flex items-center justify-between p-4 sm:p-6 backdrop-blur-sm bg-gray-950/80 sticky top-0 z-50 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <img src="/dream dao logo.png" alt="Logo" className="h-10 sm:h-12 w-auto" />
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
                <button onClick={() => router.push("/chat")} className="text-gray-400 hover:text-white transition-colors">Chat</button>
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
              Your Privacy <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Matters</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto">
              We're committed to protecting your personal information and being transparent about how we use your data. Your privacy is our priority.
            </p>
          </motion.header>

          {/* Privacy Sections */}
          <div className="space-y-8">
            {privacySections.map((section, idx) => (
              <motion.div
                key={idx}
                className="bg-gray-900/50 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
                    {section.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">{section.title}</h2>
                    <p className="text-sm sm:text-base text-gray-400 mb-4">{section.content}</p>
                    <ul className="space-y-2">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <motion.section
            className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm p-8 sm:p-12 rounded-2xl border border-purple-500/30 mt-16 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Have Privacy Questions?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">Contact our privacy team at privacy@realityX.io or use the form below to submit your concerns.</p>
        
            <Link href="mailto:dreamtoreality@gmail.com" className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-all">Contact Privacy Team</Link>
          </motion.section>

          <motion.p
            className="text-center text-gray-500 text-sm mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Last updated: January 2025. We regularly review and update this policy.
          </motion.p>
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

export default PrivacyPage;
