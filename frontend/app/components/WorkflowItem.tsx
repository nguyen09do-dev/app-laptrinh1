'use client';

import { CalendarDays, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface WorkflowItemProps {
  id: number;
  stage: 'Ideate' | 'Research' | 'Create' | 'Optimize' | 'Publish';
  label: string;
  progress: number;
  status: 'done' | 'in_progress' | 'queued';
  due: string;
  href?: string;
}

const stageColors = {
  Ideate: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  Research: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
  Create: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
  Optimize: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
  Publish: 'bg-green-500/20 text-green-300 border-green-400/30',
};

const statusColors = {
  done: 'bg-green-500/20 text-green-300',
  in_progress: 'bg-yellow-500/20 text-yellow-300',
  queued: 'bg-gray-500/20 text-gray-300',
};

export default function WorkflowItem({
  stage,
  label,
  progress,
  status,
  due,
  href,
}: WorkflowItemProps) {
  const content = (
    <div className="rounded-xl border border-midnight-700 p-4 flex items-center gap-4 bg-midnight-900/30 hover:bg-midnight-900/50 transition-all">
      <span className={`text-xs px-3 py-1 rounded-full border shrink-0 ${stageColors[stage]}`}>
        {stage}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-midnight-100 mb-1 truncate">{label}</div>
        <div className="w-full bg-midnight-900 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all ${
              status === 'done' 
                ? 'bg-green-500' 
                : status === 'in_progress' 
                ? 'bg-yellow-500' 
                : 'bg-gray-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-midnight-400">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            Due: {due}
          </span>
          {status === 'done' ? (
            <span className="flex items-center gap-1 text-green-400">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {progress}%
            </span>
          )}
        </div>
      </div>
      {href && (
        <button className="flex items-center gap-1 px-4 py-2 bg-midnight-800/50 hover:bg-midnight-800 text-midnight-200 rounded-lg text-sm font-medium transition-all border border-midnight-700 hover:border-coral-500 shrink-0">
          Next Action
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

