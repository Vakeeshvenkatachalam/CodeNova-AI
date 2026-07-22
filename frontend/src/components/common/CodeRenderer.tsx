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

  // Helper to parse inline formatting: bold, italic, inline code
  const parseInline = (text: string): React.ReactNode[] => {
    const tokens = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return tokens.map((token: string, idx: number) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={idx} className="font-extrabold text-content-primary-light dark:text-content-primary-dark">{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith('*') && token.endsWith('*')) {
        return <em key={idx} className="italic text-content-primary-light dark:text-content-primary-dark">{token.slice(1, -1)}</em>;
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code
            key={idx}
            className="mx-1 rounded bg-brand-light dark:bg-[#2d2d2d] border border-border-light dark:border-border-dark px-1.5 py-0.5 font-mono text-[10px] text-primary dark:text-ai font-semibold"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      return token;
    });
  };

  // Helper to parse table rows
  const parseTable = (lines: string[]): React.ReactNode => {
    const rows = lines.map(line => {
      const parts = line.split('|').map(p => p.trim());
      if (parts[0] === '') parts.shift();
      if (parts[parts.length - 1] === '') parts.pop();
      return parts;
    });

    if (rows.length === 0) return null;

    const filteredRows = rows.filter(row => {
      return !row.every(cell => cell.match(/^[:\-\s]+$/));
    });

    const headers = filteredRows[0] || [];
    const bodyRows = filteredRows.slice(1);

    return (
      <div className="my-3 overflow-x-auto rounded-xl border border-border-light dark:border-border-dark shadow-sm">
        <table className="min-w-full divide-y divide-border-light dark:divide-border-dark text-left font-sans text-xs">
          <thead className="bg-brand-light dark:bg-brand-dark">
            <tr>
              {headers.map((h: string, i: number) => (
                <th key={i} className="px-3.5 py-2 font-semibold text-content-primary-light dark:text-content-primary-dark">
                  {parseInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark bg-surface-light dark:bg-[#121212]">
            {bodyRows.map((row: string[], rowIdx: number) => (
              <tr key={rowIdx} className="hover:bg-brand-light/50 dark:hover:bg-brand-dark/50 transition-colors">
                {row.map((cell: string, cellIdx: number) => (
                  <td key={cellIdx} className="px-3.5 py-2 text-content-secondary-light dark:text-gray-300">
                    {parseInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Helper to parse text blocks line-by-line and group elements
  const renderTextBlock = (text: string, blockIdx: number) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
    let currentTableLines: string[] = [];
    let currentBlockquoteLines: string[] = [];

    const flushList = (key: string) => {
      if (currentList) {
        const Tag = currentList.type;
        elements.push(
          <Tag key={key} className={currentList.type === 'ul' ? 'list-disc pl-5 my-2.5 space-y-1 text-content-secondary-light dark:text-gray-300 font-sans' : 'list-decimal pl-5 my-2.5 space-y-1 text-content-secondary-light dark:text-gray-300 font-sans'}>
            {currentList.items.map((item, idx) => (
              <li key={idx}>{parseInline(item)}</li>
            ))}
          </Tag>
        );
        currentList = null;
      }
    };

    const flushTable = (key: string) => {
      if (currentTableLines.length > 0) {
        elements.push(<React.Fragment key={key}>{parseTable(currentTableLines)}</React.Fragment>);
        currentTableLines = [];
      }
    };

    const flushBlockquote = (key: string) => {
      if (currentBlockquoteLines.length > 0) {
        elements.push(
          <blockquote key={key} className="pl-3.5 border-l-4 border-primary/45 bg-brand-light/40 dark:bg-brand-dark/40 py-2 pr-3 my-2.5 rounded-r-lg italic text-content-secondary-light dark:text-gray-300 font-sans">
            {currentBlockquoteLines.map((line, idx) => (
              <p key={idx} className={idx > 0 ? 'mt-1' : ''}>{parseInline(line)}</p>
            ))}
          </blockquote>
        );
        currentBlockquoteLines = [];
      }
    };

    const flushAll = (key: string) => {
      flushList(key + '_l');
      flushTable(key + '_t');
      flushBlockquote(key + '_b');
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const lineKey = `${blockIdx}_line_${i}`;

      // 1. Headings
      if (trimmed.startsWith('# ')) {
        flushAll(lineKey);
        elements.push(
          <h1 key={lineKey} className="text-base font-bold text-content-primary-light dark:text-content-primary-dark mt-3 mb-1.5 font-sans border-b border-border-light dark:border-border-dark pb-0.5">
            {parseInline(trimmed.substring(2))}
          </h1>
        );
        continue;
      }
      if (trimmed.startsWith('## ')) {
        flushAll(lineKey);
        elements.push(
          <h2 key={lineKey} className="text-sm font-bold text-content-primary-light dark:text-content-primary-dark mt-3 mb-1.5 font-sans">
            {parseInline(trimmed.substring(3))}
          </h2>
        );
        continue;
      }
      if (trimmed.startsWith('### ')) {
        flushAll(lineKey);
        elements.push(
          <h3 key={lineKey} className="text-xs font-bold text-content-primary-light dark:text-content-primary-dark mt-2.5 mb-1 font-sans">
            {parseInline(trimmed.substring(4))}
          </h3>
        );
        continue;
      }

      // 2. Blockquotes
      if (trimmed.startsWith('>')) {
        flushList(lineKey);
        flushTable(lineKey);
        const quoteContent = line.substring(line.indexOf('>') + 1).trim();
        currentBlockquoteLines.push(quoteContent);
        continue;
      }

      // 3. Tables
      if (trimmed.startsWith('|')) {
        flushList(lineKey);
        flushBlockquote(lineKey);
        currentTableLines.push(line);
        continue;
      }

      // 4. Bullet lists
      const bulletMatch = line.match(/^(\s*)([-*•]|\s+\d+\.)\s+(.+)$/);
      if (bulletMatch) {
        flushTable(lineKey);
        flushBlockquote(lineKey);
        const listType = bulletMatch[2].match(/\d/) ? 'ol' : 'ul';
        const content = bulletMatch[3];
        
        if (currentList && currentList.type === listType) {
          currentList.items.push(content);
        } else {
          flushList(lineKey);
          currentList = { type: listType, items: [content] };
        }
        continue;
      }

      // 5. Numbered lists
      const numberedMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
      if (numberedMatch) {
        flushTable(lineKey);
        flushBlockquote(lineKey);
        const content = numberedMatch[3];
        
        if (currentList && currentList.type === 'ol') {
          currentList.items.push(content);
        } else {
          flushList(lineKey);
          currentList = { type: 'ol', items: [content] };
        }
        continue;
      }

      // 6. Empty Line
      if (trimmed === '') {
        flushAll(lineKey);
        elements.push(<div key={lineKey} className="h-1.5" />);
        continue;
      }

      // 7. Regular paragraph text
      flushAll(lineKey);
      elements.push(
        <p key={lineKey} className="font-sans text-[12px] text-content-secondary-light dark:text-gray-300 leading-relaxed my-1 whitespace-pre-line">
          {parseInline(line)}
        </p>
      );
    }

    flushAll(`${blockIdx}_final`);
    return elements;
  };

  return (
    <div className="space-y-0.5 leading-relaxed text-content-primary-light dark:text-content-primary-dark">
      {blocks.map((block, idx) => {
        if (block.startsWith('```') && block.endsWith('```')) {
          const match = block.match(/```(\w*)\n([\s\S]*?)```/);
          const language = match ? match[1] : '';
          const codeText = match ? match[2] : block.slice(3, -3);

          return (
            <div
              key={idx}
              className="my-3 overflow-hidden rounded-xl border border-border-light bg-[#1e1e1e] dark:border-[#2d2d2d] shadow-md max-w-full"
            >
              {/* VS Code header bar */}
              <div className="flex h-8 items-center justify-between bg-[#2d2d2d] px-3.5 select-none border-b border-[#1e1e1e]">
                <span className="text-[9px] font-mono font-bold tracking-wider text-gray-400 uppercase">
                  {language || 'code'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(codeText, idx)}
                  className="flex items-center gap-1.5 text-[9px] text-gray-400 hover:text-white transition-colors duration-150"
                  title="Copy to clipboard"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="h-3 w-3 text-green-400" />
                      <span className="text-green-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span className="font-semibold">Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Panel */}
              <pre className="overflow-x-auto p-3 font-mono text-[11px] text-[#d4d4d4] leading-relaxed bg-[#1e1e1e]">
                <code>{codeText.trim()}</code>
              </pre>
            </div>
          );
        }

        return <div key={idx}>{renderTextBlock(block, idx)}</div>;
      })}
    </div>
  );
};
