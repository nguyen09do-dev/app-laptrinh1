'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { showToast } from '@/lib/toast';
import { cn } from '@/lib/utils';

interface CopyToClipboardProps {
  text: string;
  label?: string;
  className?: string;
  showLabel?: boolean;
}

export function CopyToClipboard({
  text,
  label = 'Copy',
  className,
  showLabel = false,
}: CopyToClipboardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showToast.error('Failed to copy');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
        'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600',
        'text-gray-700 dark:text-gray-300 text-sm font-medium',
        className
      )}
      aria-label={copied ? 'Copied' : label}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          {showLabel && <span>Copied!</span>}
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          {showLabel && <span>{label}</span>}
        </>
      )}
    </button>
  );
}
