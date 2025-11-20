// types/speech.d.ts
interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

declare var webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

// Add this at the very top of your file (or in a global.d.ts file if you want it project-wide)
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

// Now you can use it safely:
const SpeechRecognition =
  window.SpeechRecognition || (window as any).webkitSpeechRecognition;
