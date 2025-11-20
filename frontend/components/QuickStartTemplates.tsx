// components/QuickStartTemplates.tsx
"use client";
import React from "react";
import { useRouter } from "next/navigation";

type Template = {
  id: number;
  title: string;
  icon: string;
  description: string;
  prompt: string;
  category: string;
  color: string;
  usageCount?: number;
};

const templates: Template[] = [
  {
    id: 1,
    title: "Content Writing",
    icon: "✍️",
    description: "Blog posts, articles, social media",
    prompt: "I need help writing professional content. I want to create a [type of content] about [topic]. The tone should be [professional/casual/friendly] and the target audience is [audience]. Please help me structure and write this content.",
    category: "writing",
    color: "from-blue-500 to-cyan-500",
    usageCount: 1243
  },
  {
    id: 2,
    title: "Code Assistant",
    icon: "💻",
    description: "Debug, explain, optimize code",
    prompt: "I need help with coding. Here's what I'm working on: [describe your coding task]. Please help me [debug/explain/optimize] the following code:\n\n[paste code here]",
    category: "coding",
    color: "from-green-500 to-emerald-500",
    usageCount: 2156
  },
  {
    id: 3,
    title: "Data Analysis",
    icon: "📊",
    description: "Process CSV, Excel, insights",
    prompt: "I have a dataset that I need analyzed. Please help me: 1) Understand the data structure, 2) Find key patterns and insights, 3) Create visualizations if needed, 4) Provide actionable recommendations. [Upload your file or describe your data]",
    category: "data",
    color: "from-purple-500 to-pink-500",
    usageCount: 987
  },
  {
    id: 4,
    title: "Learning Tutor",
    icon: "🎓",
    description: "Explain concepts, practice problems",
    prompt: "I need help understanding [topic/concept]. Please: 1) Explain it in simple terms, 2) Provide real-world examples, 3) Break it down step-by-step, 4) Give me practice questions to test my understanding.",
    category: "education",
    color: "from-orange-500 to-red-500",
    usageCount: 1567
  },
  {
    id: 5,
    title: "Creative Writing",
    icon: "🎨",
    description: "Stories, poems, creative ideas",
    prompt: "I want to create something creative. Help me write a [story/poem/script] about [theme/topic]. The style should be [dramatic/humorous/mysterious] and I want it to [evoke emotion/entertain/inspire].",
    category: "creative",
    color: "from-pink-500 to-rose-500",
    usageCount: 856
  },
  {
    id: 6,
    title: "Research Assistant",
    icon: "🔍",
    description: "Summarize, compare, research",
    prompt: "I need research help on [topic]. Please: 1) Provide a comprehensive overview, 2) List key facts and statistics, 3) Compare different perspectives, 4) Cite credible sources where possible.",
    category: "research",
    color: "from-indigo-500 to-blue-500",
    usageCount: 1432
  }
];

interface TemplateCardProps extends Template {
  onClick: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  title,
  icon,
  description,
  color,
  usageCount,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className="group relative p-6 bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-xl hover:border-purple-500/50 hover:bg-slate-800/70 transition-all cursor-pointer overflow-hidden"
    >
      {/* Gradient background on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-2xl shadow-lg`}>
              {icon}
            </div>
            <div className="text-left">
              <h4 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                {title}
              </h4>
              <p className="text-sm text-slate-400">{description}</p>
            </div>
          </div>
          <svg
            className="w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </div>

        {usageCount && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            {usageCount.toLocaleString()} uses
          </div>
        )}
      </div>
    </button>
  );
};

export default function QuickStartTemplates() {
  const router = useRouter();

  const handleTemplateClick = async (template: Template) => {
    console.log('🚀 Template clicked:', template.title);
    console.log('📝 Template prompt:', template.prompt.substring(0, 50) + '...');
    
    // Store the template prompt in sessionStorage to use in new chat
    if (typeof window !== 'undefined') {
      try {
        // Store in both sessionStorage AND localStorage as backup
        sessionStorage.setItem('templatePrompt', template.prompt);
        sessionStorage.setItem('templateTitle', template.title);
        localStorage.setItem('templatePrompt', template.prompt);
        localStorage.setItem('templateTitle', template.title);
        
        console.log('✅ Template stored successfully');
        
        // Verify storage
        const verification = sessionStorage.getItem('templatePrompt');
        console.log('🔍 Verification:', verification ? 'Success' : 'Failed');
        
        // Small delay to ensure storage is set
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (e) {
        console.error('❌ Error storing template:', e);
      }
    }
    
    // Navigate to new chat session
    console.log('📍 Navigating to new session...');
    router.push('/dashboard/new-ai-session');
  };

  const handleExploreAll = () => {
    router.push('/dashboard/templates');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Quick Start Templates</h3>
          <p className="text-sm text-slate-400 mt-1">Pre-built prompts to get you started faster</p>
        </div>
        <button
          onClick={handleExploreAll}
          className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
        >
          Explore All →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            {...template}
            onClick={() => handleTemplateClick(template)}
          />
        ))}
      </div>
    </div>
  );
}