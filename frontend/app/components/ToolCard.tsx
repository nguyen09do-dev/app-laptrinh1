'use client';

import Link from 'next/link';
import { LucideIcon, ChevronRight } from 'lucide-react';

interface ToolCardProps {
  title: string;
  desc: string;
  icon: LucideIcon;
  stat: number | string;
  cta: string;
  href: string;
}

export default function ToolCard({ title, desc, icon: Icon, stat, cta, href }: ToolCardProps) {
  return (
    <Link
      href={href}
      className="glass-card rounded-2xl p-6 hover:border-coral-500 transition-all hover:scale-[1.02] group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Icon className="h-5 w-5 text-midnight-300 group-hover:text-coral-400 transition-colors" />
            <h3 className="text-lg font-semibold text-midnight-100 group-hover:text-coral-400 transition-colors">
              {title}
            </h3>
          </div>
          <p className="text-sm text-midnight-400">{desc}</p>
        </div>
        <span className="px-3 py-1 bg-midnight-800/50 text-midnight-300 rounded-full text-xs font-medium border border-midnight-700">
          {stat}
        </span>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-midnight-700">
        <span className="text-xs text-midnight-400">Quick actions available</span>
        <button className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-midnight-500 to-coral-500 text-white rounded-lg text-sm font-medium hover:from-midnight-400 hover:to-coral-400 transition-all">
          {cta}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </Link>
  );
}

