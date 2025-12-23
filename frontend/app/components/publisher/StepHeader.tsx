'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StepHeaderProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  description: string;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
  showNext?: boolean;
}

export function StepHeader({
  currentStep,
  totalSteps,
  title,
  description,
  onBack,
  onNext,
  nextLabel = 'Next Step',
  nextDisabled = false,
  showBack = true,
  showNext = true,
}: StepHeaderProps) {
  return (
    <div className="mb-8">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-midnight-300">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-midnight-400">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="h-2 bg-midnight-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Title & Description */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
        <p className="text-base text-midnight-400">{description}</p>
      </div>

      {/* Navigation Buttons */}
      {(showBack || showNext) && (
        <div className="flex items-center gap-3">
          {showBack && onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2.5 bg-midnight-800 hover:bg-midnight-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          {showNext && onNext && (
            <button
              onClick={onNext}
              disabled={nextDisabled}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <span>{nextLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}




