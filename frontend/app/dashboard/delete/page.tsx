// app/dashboard/delete/page.tsx

"use client";

export default function DeletePage() {
  const handleDelete = async () => {
    if (confirm("Are you sure you want to permanently delete your account?")) {
      await fetch("/api/dashboard/delete", { method: "DELETE" });
      window.location.href = "/"; // back to home after deletion
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-red-600">Delete Account</h1>
      <p className="mb-4">
        This will <strong>permanently delete</strong> your account and all
        associated usage logs. This action cannot be undone.
      </p>
      <button
        onClick={handleDelete}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Yes, Delete My Account
      </button>
    </div>
  );
}
