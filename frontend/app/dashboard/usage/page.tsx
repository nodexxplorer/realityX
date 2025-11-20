// 

"use client";
import { useEffect, useState } from "react";

interface Usage {
  date: string;
  count: number;
}

export default function UsagePage() {
  const [usage, setUsage] = useState<Usage[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const data = await res.json();
        setUsage(data.usage);
      }
    };
    fetchData();
  }, []);

  return (
    <div className=" mt-16 max-w-md mx-auto bg-white rounded-xl bg-gray-100 shadow-2xl px-auto backdrop-blur-md bg-white/10 border border-white/20 shadow-md">
      <h1 className="text-2xl text-center align-text-center font-bold mb-4">Your Usage (last 7 days)</h1>
      <ul>
        {usage.map((u, i) => (
          <li key={i} className="border-b py-2">
            {u.date}: {u.count} requests
          </li>
        ))}
      </ul>
    </div>
  );
}
