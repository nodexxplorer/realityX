// app/dashboard/templates/page.tsx
"use client";
import React from "react";
import { useRouter } from "next/navigation";

// Full template library with categories, search, filtering
export default function TemplatesPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">All Templates</h1>
        
        {/* Categories */}
        <div className="flex gap-4 mb-8">
          <button className="px-4 py-2 rounded-lg bg-purple-500 text-white">All</button>
          <button className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300">Writing</button>
          <button className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300">Coding</button>
          <button className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300">Data</button>
        </div>
        
        {/* Template Grid - Same as QuickStartTemplates but with all templates */}
      </div>
    </div>
  );
}