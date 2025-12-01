'use client';

interface ActivityItemProps {
  time: string;
  text: string;
  type: 'publish' | 'optimize' | 'research' | 'create' | 'ideate';
}

const typeLabels = {
  publish: 'Publish',
  optimize: 'Optimize',
  research: 'Research',
  create: 'Create',
  ideate: 'Ideate',
};

const typeColors = {
  publish: 'bg-green-500/20 text-green-300 border-green-400/30',
  optimize: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
  research: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
  create: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
  ideate: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
};

export default function ActivityItem({ time, text, type }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 border border-midnight-700 rounded-xl p-3 bg-midnight-900/30 hover:bg-midnight-900/50 transition-all">
      <span className="px-2 py-1 bg-midnight-800/50 text-midnight-400 rounded text-xs font-medium border border-midnight-700 shrink-0">
        {time} ago
      </span>
      <div className="text-sm text-midnight-200 flex-1">{text}</div>
      <span className={`text-xs px-2 py-1 rounded border shrink-0 ${typeColors[type]}`}>
        {typeLabels[type]}
      </span>
    </div>
  );
}

