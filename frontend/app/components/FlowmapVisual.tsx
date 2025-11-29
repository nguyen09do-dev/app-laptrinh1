'use client';

interface FlowmapVisualProps {
  feasibilityScore: number; // 1-10
  steps: Array<{
    phase: string;
    duration?: string;
  }>;
}

export default function FlowmapVisual({ feasibilityScore, steps }: FlowmapVisualProps) {
  // Determine color based on feasibility score
  const getFeasibilityColor = (score: number) => {
    if (score >= 8) return { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-400' };
    if (score >= 6) return { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400' };
    return { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400' };
  };

  const colors = getFeasibilityColor(feasibilityScore);

  return (
    <div className="space-y-4">
      {/* Feasibility Score */}
      <div className={`p-4 rounded-xl border ${colors.border} ${colors.bg}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-midnight-300">Feasibility Score</span>
          <span className={`text-2xl font-bold ${colors.text}`}>
            {feasibilityScore}/10
          </span>
        </div>
        <div className="mt-2 w-full bg-midnight-900 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${colors.border.replace('border', 'bg')}`}
            style={{ width: `${feasibilityScore * 10}%` }}
          ></div>
        </div>
      </div>

      {/* Flow visualization */}
      <div className="relative">
        <div className="flex flex-col gap-3">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connecting line */}
              {index > 0 && (
                <div className="absolute -top-3 left-6 w-0.5 h-3 bg-midnight-600"></div>
              )}

              {/* Step card */}
              <div className="flex items-center gap-3 p-3 bg-midnight-900/30 rounded-lg hover:bg-midnight-900/50 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-midnight-700 flex items-center justify-center text-midnight-200 font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-midnight-100">{step.phase}</h4>
                  {step.duration && (
                    <p className="text-xs text-midnight-400">⏱️ {step.duration}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
