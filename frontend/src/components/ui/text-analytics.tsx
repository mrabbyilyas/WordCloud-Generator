"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, Hash, FileText, Clock, ChevronDown, ChevronUp } from "lucide-react";

interface WordFrequency {
  [word: string]: number;
}

interface TextAnalyticsProps {
  wordFrequencies: WordFrequency;
  cleanedText: string;
  originalText?: string;
  processingTime?: number;
  className?: string;
}

export function TextAnalytics({
  wordFrequencies,
  cleanedText,
  originalText,
  processingTime,
  className,
}: TextAnalyticsProps) {
  const [showAllWords, setShowAllWords] = useState(false);
  const [showCleanedText, setShowCleanedText] = useState(false);

  // Sort words by frequency
  const sortedWords = Object.entries(wordFrequencies)
    .sort(([, a], [, b]) => b - a)
    .slice(0, showAllWords ? undefined : 20);

  const totalWords = Object.values(wordFrequencies).reduce((sum, freq) => sum + freq, 0);
  const uniqueWords = Object.keys(wordFrequencies).length;
  const avgWordLength = cleanedText.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / totalWords || 0;

  const getFrequencyBarWidth = (frequency: number) => {
    const maxFreq = Math.max(...Object.values(wordFrequencies));
    return (frequency / maxFreq) * 100;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Hash className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Words
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">{totalWords.toLocaleString()}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Unique Words
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">{uniqueWords.toLocaleString()}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Avg Length
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">{avgWordLength.toFixed(1)}</p>
        </div>
        
        {processingTime && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Processing
              </span>
            </div>
            <p className="text-2xl font-bold mt-1">{processingTime.toFixed(2)}s</p>
          </div>
        )}
      </div>

      {/* Word Frequencies */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Word Frequencies</span>
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Top {showAllWords ? uniqueWords : Math.min(20, uniqueWords)} most frequent words
          </p>
        </div>
        
        <div className="p-4">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sortedWords.map(([word, frequency], index) => (
              <div key={word} className="flex items-center space-x-3">
                <span className="text-sm font-mono text-gray-500 w-6 text-right">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{word}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {frequency}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getFrequencyBarWidth(frequency)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {uniqueWords > 20 && (
            <button
              onClick={() => setShowAllWords(!showAllWords)}
              className="mt-4 flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
            >
              {showAllWords ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span>Show Less</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>Show All {uniqueWords} Words</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Cleaned Text */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowCleanedText(!showCleanedText)}
          className="w-full p-4 text-left border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Processed Text</span>
            </h3>
            {showCleanedText ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Click to {showCleanedText ? 'hide' : 'view'} the cleaned and processed text
          </p>
        </button>
        
        {showCleanedText && (
          <div className="p-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 max-h-64 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {cleanedText}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}