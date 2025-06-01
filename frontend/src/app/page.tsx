"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { LanguageSelector } from "@/components/ui/language-selector";
import { WordCloudDisplay } from "@/components/ui/word-cloud-display";
import { TextAnalytics } from "@/components/ui/text-analytics";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Loading } from "@/components/ui/loading";
import { NotificationProvider, useNotifications } from "@/components/ui/notification";
import { WordCloudApiService, WordCloudResponse } from "@/services/api";
import { Cloud, FileText, BarChart3 } from "lucide-react";

function WordCloudGenerator() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("english");
  const [isLoading, setIsLoading] = useState(false);
  const [wordCloudData, setWordCloudData] = useState<WordCloudResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setWordCloudData(null);

    try {
      addNotification({
        type: "loading",
        message: "Processing your file...",
        persistent: true,
      });

      const response = await WordCloudApiService.uploadFile(
        file,
        selectedLanguage as "english" | "indonesian"
      );

      setWordCloudData(response);
      addNotification({
        type: "success",
        title: "Success!",
        message: "Word cloud generated successfully",
        duration: 5000,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      addNotification({
        type: "error",
        title: "Generation Failed",
        message: errorMessage,
        duration: 8000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (wordCloudData?.wordcloud_base64) {
      const link = document.createElement("a");
      link.href = `data:image/png;base64,${wordCloudData.wordcloud_base64}`;
      link.download = "wordcloud.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addNotification({
        type: "success",
        message: "Word cloud downloaded successfully",
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Word Cloud Generator
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Transform your text into beautiful visualizations
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input Section */}
          <div className="space-y-6">
            {/* File Upload Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Upload Your Text File
                </h2>
              </div>
              <FileUpload
                onFileSelect={handleFileSelect}
                disabled={isLoading}
                accept={{ "text/*": [".txt"] }}
                maxSize={5 * 1024 * 1024}
              />
            </div>

            {/* Text Analytics Card */}
            {wordCloudData && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Text Analytics
                  </h2>
                </div>
                <TextAnalytics
                   wordFrequencies={wordCloudData.word_frequencies}
                   cleanedText={wordCloudData.cleaned_text}
                 />
              </div>
            )}
          </div>

          {/* Right Column - Output Section */}
          <div className="space-y-6">
            {/* Word Cloud Display Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Cloud className="h-5 w-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Generated Word Cloud
                  </h2>
                </div>
              </div>
              
              {isLoading && (
                 <div className="flex items-center justify-center py-12">
                   <Loading 
                     message="Generating your word cloud..."
                     variant="processing"
                   />
                 </div>
               )}
              
              {error && (
                 <div className="py-4">
                   <ErrorDisplay
                     message={error}
                     onRetry={() => window.location.reload()}
                     type="error"
                   />
                 </div>
               )}
              
              {wordCloudData && !isLoading && (
                <WordCloudDisplay
                  imageData={wordCloudData.wordcloud_base64}
                  alt="Generated Word Cloud"
                  onDownload={handleDownload}
                  className="w-full"
                />
              )}
              
              {!wordCloudData && !isLoading && !error && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Cloud className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Word Cloud Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                    Upload a text file to generate your personalized word cloud visualization.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              © 2024 Word Cloud Generator. Built with Next.js and Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <NotificationProvider>
      <WordCloudGenerator />
    </NotificationProvider>
  );
}
