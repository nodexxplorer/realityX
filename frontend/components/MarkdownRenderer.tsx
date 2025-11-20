// components/MarkdownRenderer.tsx

'use client';

import React, { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Split content by code blocks
  const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const text = content.substring(lastIndex, match.index);
      if (text.trim()) {
        parts.push({ type: 'text', content: text });
      }
    }

    // Add code block
    const language = match[1] || 'text';
    const code = match[2];
    parts.push({ type: 'code', content: code, language });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    const text = content.substring(lastIndex);
    if (text.trim()) {
      parts.push({ type: 'text', content: text });
    }
  }

  // If no code blocks found, treat entire content as text
  if (parts.length === 0) {
    parts.push({ type: 'text', content });
  }

  return (
    <div className={`markdown-content ${className}`}>
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <CodeBlock key={index} code={part.content} language={part.language || 'text'} />
          );
        }

        // Render text with basic markdown formatting
        const formattedText = part.content
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`([^`]+)`/g, '<code class="bg-gray-700 px-1.5 py-0.5 rounded text-sm">$1</code>')
          .replace(/\n/g, '<br />');

        return (
          <div
            key={index}
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        );
      })}
    </div>
  );
}

// Simple code block component without external dependencies
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-700">
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-mono uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          {copied ? (
            <>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="bg-gray-900 p-4 overflow-x-auto text-sm">
        <code className="text-gray-100 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

