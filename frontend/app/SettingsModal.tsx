// app/SettingsModal.tsx

"use client";

import { X } from "lucide-react";
// If the file is named 'page.tsx' and located in 'app/Settings', use:
import SettingsPage from "./dashboard/Settings/page";
import type { ComponentType } from "react";

type SettingsModalProps = {
  onClose?: () => void;
};

// Cast the imported page to a component type that accepts the onClose prop
const SettingsPageTyped = SettingsPage as unknown as ComponentType<{ onClose?: () => void }>;

export default function SettingsModal({ onClose }: SettingsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative bg-zinc-900 w-full max-w-2xl p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
        
        {/* X Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-400 hover:text-white"
        >
          <X size={24} />
        </button>

        {/* Reuse SettingsPage but pass onClose */}
        <SettingsPageTyped onClose={onClose} />
      </div>
    </div>
  );
}
