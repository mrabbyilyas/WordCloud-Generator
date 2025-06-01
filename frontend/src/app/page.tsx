"use client";
import { useState } from "react";
import Image from "next/image";
import Particles from "@/components/ui/particles";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { TextAnimate } from "@/components/ui/text-animate";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, X } from "lucide-react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isDragOver, setIsDragOver] = useState(false);

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
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={80}
        staticity={50}
        color="#000000"
        size={0.8}
        refresh
      />
      <SmoothCursor />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
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
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="id">🇮🇩 Indonesian</SelectItem>
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
            disabled={!selectedFile}
            background={selectedFile ? "rgba(0, 0, 0, 1)" : "rgba(100, 100, 100, 0.5)"}
          >
            <Upload className="w-5 h-5 mr-2" />
            Generate Word Cloud
          </ShimmerButton>
        </div>
       </div>
    </div>
  );
}
