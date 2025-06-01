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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const { addNotification } = useNotifications();

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setWordCloudData(null);
    setUploadProgress(0);
    setProcessingStep("");

    try {
      // Step 1: File validation
      setProcessingStep("Validating file...");
      setUploadProgress(10);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate validation time

      // Step 2: Upload preparation
      setProcessingStep("Preparing upload...");
      setUploadProgress(25);
      await new Promise(resolve => setTimeout(resolve, 300));

      addNotification({
        type: "loading",
        message: "Processing your file...",
        persistent: true,
      });

      // Step 3: Uploading file
      setProcessingStep("Uploading file...");
      setUploadProgress(50);

      // Step 4: Processing on server
      setProcessingStep("Analyzing text content...");
      setUploadProgress(70);

      const response = await WordCloudApiService.uploadFile(
        file,
        selectedLanguage as "english" | "indonesian"
      );

      // Step 5: Generating visualization
      setProcessingStep("Generating word cloud...");
      setUploadProgress(90);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 6: Complete
      setProcessingStep("Complete!");
      setUploadProgress(100);

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
      setProcessingStep("Error occurred");
      addNotification({
        type: "error",
        title: "Generation Failed",
        message: errorMessage,
        duration: 8000,
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
      setProcessingStep("");
    }
  };

  const handleDownload = async () => {
    if (!wordCloudData?.wordcloud_base64) return;
    
    setIsDownloading(true);
    
    try {
      addNotification({
        type: "loading",
        message: "Preparing download...",
        duration: 2000,
      });
      
      // Simulate download preparation time
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${wordCloudData.wordcloud_base64}`;
      link.download = `wordcloud-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addNotification({
        type: "success",
        title: "Download Complete!",
        message: "Word cloud image saved successfully",
        duration: 3000,
      });
    } catch (err) {
      addNotification({
        type: "error",
        title: "Download Failed",
        message: "Failed to download the word cloud image",
        duration: 5000,
      });
    } finally {
      setIsDownloading(false);
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
              <div className={`${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                  className="w-full"
                />
                {isLoading && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Language selection disabled during processing
                  </p>
                )}
              </div>
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
                accept={{
                  'text/plain': ['.txt'],
                  'application/pdf': ['.pdf'],
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                }}
                maxSize={10 * 1024 * 1024} // 10MB
                className="mb-6"
                disabled={isLoading}
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
                 <div className="flex flex-col items-center justify-center py-12 space-y-4">
                   <Loading 
                     message={processingStep || "Generating your word cloud..."}
                     variant="processing"
                   />
                   
                   {/* Progress Bar */}
                   <div className="w-full max-w-md">
                     <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                       <span>{processingStep}</span>
                       <span>{uploadProgress}%</span>
                     </div>
                     <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                       <div 
                         className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                         style={{ width: `${uploadProgress}%` }}
                       />
                     </div>
                   </div>
                   
                   {/* Processing Steps Indicator */}
                   <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                     <div className={`w-2 h-2 rounded-full ${
                       uploadProgress >= 10 ? 'bg-green-500' : 'bg-gray-300'
                     }`} />
                     <span>Validate</span>
                     
                     <div className={`w-2 h-2 rounded-full ${
                       uploadProgress >= 50 ? 'bg-green-500' : 'bg-gray-300'
                     }`} />
                     <span>Upload</span>
                     
                     <div className={`w-2 h-2 rounded-full ${
                       uploadProgress >= 70 ? 'bg-green-500' : 'bg-gray-300'
                     }`} />
                     <span>Analyze</span>
                     
                     <div className={`w-2 h-2 rounded-full ${
                       uploadProgress >= 90 ? 'bg-green-500' : 'bg-gray-300'
                     }`} />
                     <span>Generate</span>
                   </div>
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
                <div className="space-y-4">
                  <WordCloudDisplay
                    imageData={wordCloudData.wordcloud_base64}
                    alt="Generated Word Cloud"
                    onDownload={handleDownload}
                    className="w-full"
                  />
                  
                  {/* Enhanced Download Section */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Word cloud ready for download
                      </span>
                    </div>
                    
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        isDownloading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                      }`}
                    >
                      {isDownloading ? (
                        <>
                          <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download PNG
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              {!wordCloudData && !isLoading && !error && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="relative">
                    <Cloud className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Ready to Create
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-4">
                    Upload a text file to generate your personalized word cloud visualization.
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>System ready</span>
                  </div>
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
