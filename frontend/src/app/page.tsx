"use client";
import { useState, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Particles from "@/components/ui/particles";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { TextAnimate } from "@/components/ui/text-animate";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, X } from "lucide-react";
import { WordCloudVisualization } from "@/components/ui/wordcloud-visualization";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wordCloudData, setWordCloudData] = useState<any>(null);
  const [hoveredWord, setHoveredWord] = useState<{text: string; frequency?: number} | null>(null);
  const [hasBeenHovered, setHasBeenHovered] = useState(false);

  // Memoize callback functions to prevent unnecessary re-renders
  const handleWordHover = useCallback((word: any) => {
    setHoveredWord(word);
    if (word && !hasBeenHovered) {
      setHasBeenHovered(true);
    }
  }, [hasBeenHovered]);

  const handleWordClick = useCallback((word: any) => {
    // Handle word click if needed
  }, []);

  // Memoize words array to prevent unnecessary re-renders
  const memoizedWords = useMemo(() => {
    if (!wordCloudData?.word_frequencies || typeof wordCloudData.word_frequencies !== 'object' || Object.keys(wordCloudData.word_frequencies).length === 0) {
      return [];
    }
    
    // Simplified and more robust deduplicate logic
    const deduplicatedFreqs: { [key: string]: number } = {};
    
    Object.entries(wordCloudData.word_frequencies).forEach(([word, frequency]: [string, any]) => {
      // Clean word: remove all non-alphabetic characters, convert to lowercase, trim
      const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase().trim();
      
      // Filter out very short words and non-alphabetic words
      if (cleanWord.length >= 3 && /^[a-zA-Z]+$/.test(cleanWord)) {
        // Always accumulate frequency for the same clean word
        deduplicatedFreqs[cleanWord] = (deduplicatedFreqs[cleanWord] || 0) + (typeof frequency === 'number' ? frequency : 1);
      }
    });
    
    // Convert to final array format with guaranteed uniqueness
    const finalWords = Object.entries(deduplicatedFreqs).map(([word, frequency]) => ({
      text: word,
      size: Math.max(12, Math.min(60, frequency * 8)), // Scale frequency to reasonable size
      frequency: frequency
    }));
    
    return finalWords.sort((a, b) => b.frequency - a.frequency); // Sort by frequency descending
  }, [wordCloudData?.word_frequencies]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/plain") {
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
      if (file.type === "text/plain") {
        setSelectedFile(file);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
    setWordCloudData(null);
  };

  const generateWordCloud = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

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

      const response = await fetch('https://mrabbyilyas-wordcloud-generator.hf.space/upload', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type header for FormData, let browser set it with boundary
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      setWordCloudData(data);
    } catch (err) {
      console.error('Full error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating word cloud');
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
                    </div>
                    <input
                      type="file"
                      accept=".txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="p-1 hover:bg-background rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Select Language Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Select Language</h3>
            <Card>
              <CardContent className="p-6">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">🇺🇸 English</SelectItem>
                    <SelectItem value="indonesian">🇮🇩 Indonesian</SelectItem>
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
            <Upload className="w-5 h-5 mr-2" />
            {isLoading ? 'Generating...' : 'Generate Word Cloud'}
          </ShimmerButton>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Word Cloud Result */}
        {wordCloudData && (
          <div className="mt-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-center">Generated Word Cloud</h3>
                
                <div className="bg-muted rounded-lg p-4">
                  {memoizedWords.length > 0 ? (
                    <WordCloudVisualization
                      words={memoizedWords}
                      width={Math.min(750, typeof window !== 'undefined' ? window.innerWidth - 150 : 750)}
                      height={400}
                      onWordHover={handleWordHover}
                      onWordClick={handleWordClick}
                    />
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
          </div>
        )}
       </div>
    </div>
  );
}
