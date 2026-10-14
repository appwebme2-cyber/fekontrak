import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileSpreadsheet } from 'lucide-react';
import type { ChatBlock } from '@/hooks/useChatbot';
import { ChatChart } from './ChatChart';
import { exportChatTable } from './exportChatTable';

// **tebal** -> <strong>; sisanya teks biasa (React meng-escape isinya)
const renderInline = (text: string): ReactNode[] =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4
      ? <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
      : <Fragment key={i}>{part}</Fragment>,
  );

const TextBlock = ({ text }: { text: string }) => {
  const lines = text.split('\n');
  const groups: { bullet: boolean; lines: string[] }[] = [];
  for (const raw of lines) {
    const line = raw.trimEnd();
    const bullet = /^\s*[-•*]\s+/.test(line);
    const content = bullet ? line.replace(/^\s*[-•*]\s+/, '') : line;
    const last = groups[groups.length - 1];
    if (last && last.bullet === bullet && (bullet || content !== '')) last.lines.push(content);
    else groups.push({ bullet, lines: [content] });
  }

  return (
    <div className="space-y-2 text-sm leading-relaxed text-gray-700">
      {groups.map((g, gi) =>
        g.bullet ? (
          <ul key={gi} className="list-disc space-y-0.5 pl-5">
            {g.lines.map((l, li) => <li key={li}>{renderInline(l)}</li>)}
          </ul>
        ) : (
          g.lines.join('').trim() !== '' && (
            <p key={gi} className="whitespace-pre-wrap">{renderInline(g.lines.join('\n'))}</p>
          )
        ),
      )}
    </div>
  );
};

const TableBlock = ({ block }: { block: ChatBlock }) => {
  const columns = block.columns ?? [];
  const rows = block.rows ?? [];
  if (columns.length === 0 && rows.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-1.5">
        <div className="min-w-0 flex-1 truncate text-xs font-semibold text-gray-900">{block.title || 'Tabel'}</div>
        <button
          type="button"
          onClick={() => exportChatTable(block.title, columns, rows)}
          title="Download sebagai file Excel"
          className="inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-green-700 hover:bg-green-50"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Excel
        </button>
      </div>
      <div className="max-h-72 overflow-auto">
        <table className="w-full text-xs">
          {columns.length > 0 && (
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-gray-200 text-left text-gray-500">
                {columns.map((c, i) => <th key={i} className="whitespace-nowrap px-3 py-1.5 font-medium">{c}</th>)}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-1.5 align-top tabular-nums text-gray-800">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-100 px-3 py-1 text-[11px] text-gray-400">{rows.length} baris</div>
    </div>
  );
};

const LinkBlock = ({ block, onNavigate }: { block: ChatBlock; onNavigate?: () => void }) => {
  // Hanya path internal aplikasi yang diizinkan
  const href = block.href ?? '';
  if (!href.startsWith('/') || href.startsWith('//')) return null;
  return (
    <Link
      to={href}
      onClick={onNavigate}
      className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
    >
      {block.label || 'Buka halaman'}
      <ArrowRight className="h-3 w-3" />
    </Link>
  );
};

export const ChatAnswerBlocks = ({ blocks, onNavigate }: { blocks: ChatBlock[]; onNavigate?: () => void }) => (
  <div className="space-y-3">
    {blocks.map((block, i) => {
      switch (block.type) {
        case 'table':
          return <TableBlock key={i} block={block} />;
        case 'chart':
          return <ChatChart key={i} block={block} />;
        case 'link':
          return <LinkBlock key={i} block={block} onNavigate={onNavigate} />;
        default:
          return block.text ? <TextBlock key={i} text={block.text} /> : null;
      }
    })}
  </div>
);
