"use client";
import { useState, useCallback, useMemo } from "react";
import { Particles } from "@/components/ui/particles";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { TextAnimate } from "@/components/ui/text-animate";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, X, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { WordCloudVisualization } from "@/components/ui/wordcloud-visualization";
import { AnalyticsDashboard } from "@/components/ui/analytics-dashboard";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [wordCloudData, setWordCloudData] = useState<{
    word_frequencies: {[key: string]: number},
    cleaned_text?: string,
    total_words?: number,
    unique_words?: number
  } | null>(null);
  const [hoveredWord, setHoveredWord] = useState<{text: string; frequency?: number} | null>(null);
  const [hasBeenHovered, setHasBeenHovered] = useState(false);

  // Memoize callback functions to prevent unnecessary re-renders
  const handleWordHover = useCallback((word: {text: string; frequency?: number} | null) => {
    setHoveredWord(word);
    if (word) {
      setHasBeenHovered(true);
    }
  }, []);

  const handleWordClick = useCallback((word: {text: string; frequency?: number}) => {
    // Handle word click if needed
    console.log('Word clicked:', word);
  }, []);

  const handleWordCloudError = useCallback((errorMessage: string) => {
    setError(`Word cloud rendering error: ${errorMessage}`);
    setSuccessMessage(null); // Clear success message when error occurs
  }, []);

  // Memoize words array to prevent unnecessary re-renders
  const memoizedWords = useMemo(() => {
    if (!wordCloudData?.word_frequencies || typeof wordCloudData.word_frequencies !== 'object' || Object.keys(wordCloudData.word_frequencies).length === 0) {
      return [];
    }
    
    console.log('Original word_frequencies:', wordCloudData.word_frequencies);
    
    // Enhanced deduplication logic with better word cleaning
    const deduplicatedFreqs: { [key: string]: number } = {};
    const processedWords: string[] = [];
    
    Object.entries(wordCloudData.word_frequencies).forEach(([word, frequency]: [string, number]) => {
      // More precise word cleaning: trim, lowercase (for non-Chinese), remove only punctuation
      let cleanWord = word.trim();
      
      // Check if word contains Chinese characters
      const containsChinese = /[\u4e00-\u9fff]/.test(cleanWord);
      
      if (!containsChinese) {
        // For non-Chinese words, apply lowercase and existing cleaning
        cleanWord = cleanWord.toLowerCase();
        
        // Remove common punctuation but preserve letters and numbers
        cleanWord = cleanWord.replace(/[.,;:!?"'()\[\]{}]/g, '');
        
        // Remove any remaining non-letter characters except hyphens and apostrophes
        cleanWord = cleanWord.replace(/[^a-zA-Z'-]/g, '');
        
        // Clean up multiple hyphens or apostrophes
        cleanWord = cleanWord.replace(/[-']{2,}/g, '');
        
        // Remove leading/trailing hyphens or apostrophes
        cleanWord = cleanWord.replace(/^[-']+|[-']+$/g, '');
        
        // Final trim
        cleanWord = cleanWord.trim();
        
        // Filter for non-Chinese words
        if (cleanWord.length >= 3 && /^[a-zA-Z][a-zA-Z'-]*[a-zA-Z]$|^[a-zA-Z]{3,}$/.test(cleanWord)) {
          processedWords.push(`${word} -> ${cleanWord}`);
          const freq = typeof frequency === 'number' ? frequency : 1;
          deduplicatedFreqs[cleanWord] = (deduplicatedFreqs[cleanWord] || 0) + freq;
        }
      } else {
        // For Chinese words, minimal cleaning - just trim
        cleanWord = cleanWord.trim();
        
        // Chinese words are usually 1-4 characters, so accept all lengths
        if (cleanWord.length >= 1) {
          processedWords.push(`${word} -> ${cleanWord}`);
          const freq = typeof frequency === 'number' ? frequency : 1;
          deduplicatedFreqs[cleanWord] = (deduplicatedFreqs[cleanWord] || 0) + freq;
        }
      }
    });
    
    console.log('Processed words mapping:', processedWords);
    console.log('Final deduplicated frequencies:', deduplicatedFreqs);
    
    // Convert to final array format with guaranteed uniqueness
    const finalWords = Object.entries(deduplicatedFreqs).map(([word, frequency]) => ({
      text: word,
      size: Math.max(12, Math.min(60, frequency * 8)), // Scale frequency to reasonable size
      frequency: frequency
    }));
    
    const sortedWords = finalWords.sort((a, b) => b.frequency - a.frequency);
    console.log('Final words for visualization:', sortedWords);
    
    return sortedWords;
  }, [wordCloudData]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Clear previous messages
      setError(null);
      setSuccessMessage(null);
      
      // Check file type
      if (file.type !== "text/plain" && !file.name.toLowerCase().endsWith('.txt')) {
        setError(`Invalid file type. Please upload a .txt file only. Selected file: ${file.name}`);
        return;
      }
      
      // Check file size (optional: limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError(`File too large. Please upload a file smaller than 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Clear previous messages
      setError(null);
      setSuccessMessage(null);
      
      // Check file type
      if (file.type !== "text/plain" && !file.name.toLowerCase().endsWith('.txt')) {
        setError(`Invalid file type. Please upload a .txt file only. Selected file: ${file.name}`);
        return;
      }
      
      // Check file size (optional: limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError(`File too large. Please upload a file smaller than 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
    setSuccessMessage(null);
    setWordCloudData(null);
  };

  const generateWordCloud = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('language', selectedLanguage);

      console.log('Sending request with:', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        language: selectedLanguage
      });

      // Add timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('https://mrabbyilyas-wordcloud-generator.hf.space/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          // Don't set Content-Type header for FormData, let browser set it with boundary
        },
      });

      clearTimeout(timeoutId);
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = 'Failed to generate word cloud';
        
        try {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          
          // Provide specific error messages based on status code
          switch (response.status) {
            case 400:
              errorMessage = 'Invalid file or request. Please check your file format and try again.';
              break;
            case 413:
              errorMessage = 'File is too large. Please upload a smaller file.';
              break;
            case 415:
              errorMessage = 'Unsupported file type. Please upload a .txt file only.';
              break;
            case 429:
              errorMessage = 'Too many requests. Please wait a moment and try again.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            case 503:
              errorMessage = 'Service temporarily unavailable. Please try again later.';
              break;
            default:
              errorMessage = `Server error (${response.status}): ${errorText || 'Unknown error'}`;
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_parseError) {
          errorMessage = `Server error (${response.status}): Unable to parse error response`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      // Validate response data
      if (!data || !data.word_frequencies || Object.keys(data.word_frequencies).length === 0) {
        throw new Error('No words found in the uploaded file. Please upload a file with more text content.');
      }
      
      setWordCloudData(data);
      const successMsg = `Word cloud generated successfully! Found ${Object.keys(data.word_frequencies).length} unique words.`;
      setSuccessMessage(successMsg);
      
      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Full error:', err);
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request timed out. Please check your internet connection and try again.');
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('Network error. Please check your internet connection and try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred while generating word cloud. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <Particles
        className="fixed inset-0 w-full h-full"
        quantity={100}
        ease={80}
        staticity={50}
        color="#000000"
        size={0.8}
        refresh
      />
      <SmoothCursor />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16 w-full max-w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <TextAnimate
            animation="blurInUp"
            by="word"
            className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6"
            as="h1"
          >
            WordCloud Generator
          </TextAnimate>
          <TextAnimate
            animation="fadeIn"
            by="word"
            delay={0.5}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            as="p"
          >
            Transform your text into beautiful, interactive word clouds. Upload a .txt file and select your language to get started.
          </TextAnimate>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Upload File Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Upload Text File</h3>
            <Card 
              className={`border-2 border-dashed transition-all duration-200 ${
                isDragOver 
                  ? "border-primary bg-primary/5 scale-105" 
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <CardContent className="p-8">
                {!selectedFile ? (
                  <label className="flex flex-col items-center justify-center cursor-pointer space-y-4">
                    <Upload className={`w-12 h-12 transition-colors ${
                      isDragOver ? "text-primary" : "text-muted-foreground"
                    }`} />
                    <div className="text-center">
                      <p className={`text-lg font-medium transition-colors ${
                        isDragOver ? "text-primary" : ""
                      }`}>
                        {isDragOver ? "Drop your file here" : "Click to upload"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isDragOver ? "Release to upload" : "or drag and drop your .txt file here"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Only .txt files are supported (max 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">{selectedFile.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="p-1.5 sm:p-2 hover:bg-destructive/10 rounded-full transition-colors flex-shrink-0 ml-2"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Select Language Section */}
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold">Select Language</h3>
            <Card>
              <CardContent className="p-6">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">🇺🇸 English</SelectItem>
                    <SelectItem value="indonesian">🇮🇩 Indonesian</SelectItem>
                    <SelectItem value="chinese">🇨🇳 Chinese (Simplified)</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <ShimmerButton
            className="px-8 py-4 text-lg font-semibold"
            disabled={!selectedFile || isLoading}
            background={selectedFile && !isLoading ? "rgba(0, 0, 0, 1)" : "rgba(100, 100, 100, 0.5)"}
            onClick={generateWordCloud}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Upload className="w-5 h-5 mr-2" />
            )}
            {isLoading ? 'Generating Word Cloud...' : 'Generate Word Cloud'}
          </ShimmerButton>
        </div>

        {/* Loading Status */}
        {isLoading && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-2">
              <Loader2 className="w-5 h-5 mr-2 animate-spin text-blue-500" />
              <p className="font-semibold text-blue-800">Processing</p>
            </div>
            <p className="text-sm leading-relaxed">Analyzing your text and generating word cloud...</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              <p className="font-semibold text-green-800">Success</p>
            </div>
            <p className="text-sm leading-relaxed">{successMessage}</p>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="mt-3 px-4 py-2 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors duration-200"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-2">
              <X className="w-5 h-5 mr-2 text-red-500" />
              <p className="font-semibold text-red-800">Error</p>
            </div>
            <p className="text-sm leading-relaxed">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-3 px-4 py-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors duration-200"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Word Cloud Result */}
        {wordCloudData && (
          <div className="mt-8 w-full max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-center">Generated Word Cloud</h3>
                
                <div className="bg-muted rounded-lg p-4">
                  {memoizedWords.length > 0 ? (
                    (() => {
                      console.log('=== RENDERING WordCloudVisualization ===');
                      console.log('memoizedWords length:', memoizedWords.length);
                      console.log('memoizedWords data:', memoizedWords);
                      console.log('Unique words check:', new Set(memoizedWords.map(w => w.text)).size);
                      console.log('Words with same text:', memoizedWords.reduce((acc: Array<{text: string, count: number, instances: Array<{text: string, size: number}>}>, word) => {
                         const existing = acc.find(w => w.text === word.text);
                         if (existing) {
                           existing.count++;
                           existing.instances.push(word);
                         } else {
                           acc.push({ text: word.text, count: 1, instances: [word] });
                         }
                         return acc;
                       }, []).filter(w => w.count > 1));
                      console.log('==========================================');
                      
                      return (
                        <WordCloudVisualization
                          key={`wordcloud-${memoizedWords.length}-${JSON.stringify(memoizedWords.slice(0, 3).map(w => w.text))}`}
                          words={memoizedWords}
                          width={Math.min(750, typeof window !== 'undefined' ? window.innerWidth - 150 : 750)}
                          height={400}
                          language={selectedLanguage}
                          onWordHover={handleWordHover}
                          onWordClick={handleWordClick}
                          onError={handleWordCloudError}
                        />
                      );
                    })()
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No word data available for visualization</p>
                    </div>
                  )}
                </div>
                
                {/* Tooltip for hovered word - shows after first hover */}
                {hasBeenHovered && (
                  <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-center">
                    {hoveredWord ? (
                      <>
                        <p className="font-medium">{hoveredWord.text}</p>
                        {hoveredWord.frequency && (
                          <p className="text-sm text-muted-foreground">Frequency: {hoveredWord.frequency}</p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="font-medium">Hover Me</p>
                        <p className="text-sm text-muted-foreground">Hover over a word to see details</p>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analytics Dashboard */}
            <div className="mt-8">
              <AnalyticsDashboard 
                words={memoizedWords}
                selectedLanguage={selectedLanguage}
                originalText={selectedFile ? "Sample text from uploaded file" : undefined}
                cleanedText={wordCloudData?.cleaned_text}
              />
            </div>
          </div>
        )}
       </div>

      {/* Creator Attribution */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <a 
            href="https://www.linkedin.com/in/rabbyilyas/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors duration-200"
          >
            <div className="relative">
              <img 
                src="/images/Casual_rabby.JPG" 
                alt="Creator Profile" 
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-400 transition-colors duration-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDIxdi0yYTQgNCAwIDAgMC00LTRIOGE0IDQgMCAwIDAtNCA0djIiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo8L3N2Zz4K';
                }}
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                <ExternalLink className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div className="text-sm">
              <p className="font-medium leading-tight">Created by</p>
              <p className="text-blue-600 font-semibold leading-tight">M Rabby Ilyas</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}