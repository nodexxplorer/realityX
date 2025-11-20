// // app/dashboard/setting/page.tsx


"use client";

import { useState } from "react";
import SettingsModal from "./SettingsModal";

export default function SettingsPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="h-screen flex items-center justify-center bg-zinc-900">
      {isOpen && (
        <SettingsModal onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}


// import SettingsModal from "./SettingsModal";


// export default function SettingsPage() {
//   return (
//     <div className="h-screen flex items-center justify-center bg-zinc-900">
//       <SettingsModal />
//     </div>
//   );
// }
