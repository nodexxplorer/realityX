// app/dashboard/profile/page.tsx

"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const data = await res.json();
        setName(data.user.name);
        setEmail(data.user.email);
      }
    };
    fetchData();
  }, []);

  const handleUpdate = async () => {
    await fetch("/api/dashboard/update", {
      method: "POST",
      body: JSON.stringify({ name, email }),
    });
    alert("Profile updated!");
  };

  return (
    <div className="p-6 z-20 w-full space-y-4 max-w-md flex flex-col items-center justify-center gap-4 rounded-2xl p-8 bg-gray-100 shadow-2xl  backdrop-blur-md bg-white/10 border border-white/20">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-2 mb-2"
        placeholder="Name"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 mb-4"
        placeholder="Email"
      />
      <button
        onClick={handleUpdate}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save Changes
      </button>
    </div>
  );
}
