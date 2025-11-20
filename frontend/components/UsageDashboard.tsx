// components/UsageDashboard.tsx


"use client";

import { useEffect, useState } from "react";

type UsageData = {
  ai_chat: { used: number; remaining: number | string; limit: number | string };
  ai_image: { used: number; remaining: number | string; limit: number | string };
  ai_video: { used: number; remaining: number | string; limit: number | string };
};

export default function UsageDashboardPage() {
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    fetch("/api/ai/usage")
      .then((res) => res.json())
      .then((data) => setUsage(data));
  }, []);

  if (!usage) return <p>Loading usage...</p>;

  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      {Object.entries(usage).map(([feature, data]) => (
        <div
          key={feature}
          className="p-4 rounded-2xl shadow bg-white text-center"
        >
          <h2 className="font-bold capitalize">{feature.replace("ai_", "")}</h2>
          <p className="text-gray-600">
            {data.used} / {data.limit}
          </p>
          <p className="text-sm text-gray-500">
            Remaining: {data.remaining}
          </p>
        </div>
      ))}
    </div>
  );
}
