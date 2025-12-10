'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function CopyButton({
  text,
  className = '',
  variant = 'default',
  size = 'md',
  label,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast.success('Copied to clipboard!');
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      showToast.error('Failed to copy');
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const variantClasses = {
    default: 'bg-midnight-600 hover:bg-midnight-500 text-white',
    outline: 'border border-midnight-500 hover:bg-midnight-700 text-midnight-200',
    ghost: 'hover:bg-midnight-700 text-midnight-300',
  };

  return (
    <motion.button
      onClick={handleCopy}
      whileTap={{ scale: 0.95 }}
      className={`
        inline-flex items-center gap-1.5 rounded-lg font-medium
        transition-all duration-200
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-emerald-400"
          >
            <Check className="w-4 h-4" />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <Copy className="w-4 h-4" />
          </motion.span>
        )}
      </AnimatePresence>
      {label && <span>{copied ? 'Copied!' : label}</span>}
    </motion.button>
  );
}


