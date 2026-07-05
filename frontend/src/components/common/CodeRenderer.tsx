import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeRendererProps {
  content: string;
}

export const CodeRenderer: React.FC<CodeRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText.trim());
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!content) return null;

  // Split content by triple backtick blocks
  const blocks = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2.5 text-sm leading-relaxed text-content-primary-light dark:text-content-primary-dark">
      {blocks.map((block, idx) => {
        if (block.startsWith('```') && block.endsWith('```')) {
          // Extract language and code content
          const match = block.match(/```(\w*)\n([\s\S]*?)```/);
          const language = match ? match[1] : '';
          const codeText = match ? match[2] : block.slice(3, -3);

          return (
            <div
              key={idx}
              className="my-3 overflow-hidden rounded-xl border border-border-light bg-[#1e1e1e] dark:border-border-dark shadow-sm"
            >
              {/* Code block header bar */}
              <div className="flex h-9 items-center justify-between bg-[#2d2d2d] px-4">
                <span className="text-[11px] font-mono font-bold tracking-wider text-content-secondary-dark uppercase">
                  {language || 'code'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(codeText, idx)}
                  className="flex items-center gap-1.5 text-xs text-content-muted-dark hover:text-content-primary-dark transition-colors duration-150"
                  title="Copy to clipboard"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-success" />
                      <span className="text-success text-[10px] font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-semibold">Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code pre panel */}
              <pre className="overflow-x-auto p-4 font-mono text-xs text-[#d4d4d4] leading-relaxed">
                <code>{codeText.trim()}</code>
              </pre>
            </div>
          );
        }

        // Regular text block - replace inline backticks if any
        const inlineBlocks = block.split(/(`[^`]+`)/g);

        return (
          <p key={idx} className="whitespace-pre-line">
            {inlineBlocks.map((inlineBlock, subIdx) => {
              if (inlineBlock.startsWith('`') && inlineBlock.endsWith('`')) {
                return (
                  <code
                    key={subIdx}
                    className="mx-1 rounded bg-brand-light dark:bg-brand-dark border border-border-light dark:border-border-dark px-1.5 py-0.5 font-mono text-xs text-primary dark:text-ai font-semibold"
                  >
                    {inlineBlock.slice(1, -1)}
                  </code>
                );
              }
              return inlineBlock;
            })}
          </p>
        );
      })}
    </div>
  );
};
