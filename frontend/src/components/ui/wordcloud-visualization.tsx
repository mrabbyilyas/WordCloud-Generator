"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";

interface WordData {
  text: string;
  size: number;
  frequency?: number;
  x?: number;
  y?: number;
  rotate?: number;
  index?: number;
}

interface WordCloudVisualizationProps {
  words: WordData[];
  width?: number;
  height?: number;
  onWordClick?: (word: WordData) => void;
  onWordHover?: (word: WordData | null) => void;
  onError?: (error: string) => void;
}

export function WordCloudVisualization({
  words,
  width = 800,
  height = 400,
  onWordClick,
  onWordHover,
  onError,
}: WordCloudVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layoutRef = useRef<any>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    console.log('=== WordCloudVisualization useEffect ===');
    console.log('Received words:', words);
    console.log('Words length:', words?.length || 0);
    
    // Prevent multiple simultaneous processing
    if (isProcessingRef.current) {
      console.log('Already processing, skipping...');
      return;
    }
    
    if (!words || words.length === 0 || !svgRef.current) {
      console.log('No words provided, returning early');
      setIsLoading(false);
      return;
    }

    console.log('Checking for duplicate words in visualization:');
     const duplicateCheck = words.reduce((acc: Array<{text: string, indices: number[], instances: WordData[]}>, word, index) => {
       const existing = acc.find(w => w.text === word.text);
       if (existing) {
         existing.indices.push(index);
         existing.instances.push(word);
       } else {
         acc.push({ text: word.text, indices: [index], instances: [word] });
       }
       return acc;
     }, []).filter(w => w.indices.length > 1);
    
    console.log('Duplicate words found:', duplicateCheck);
    console.log('Unique words count:', new Set(words.map(w => w.text)).size);
    console.log('Total words count:', words.length);

    isProcessingRef.current = true;
    setIsLoading(true);

    // Clear previous content and stop any existing layout
    if (layoutRef.current) {
      layoutRef.current.stop();
    }
    d3.select(svgRef.current).selectAll("*").remove();

    // Create color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Prepare words data with increased sizing for better visibility
    const wordsData = words.map((d, i) => ({
      text: d.text,
      size: Math.max(16, Math.min(50, d.size * 1.3)), // Increased minimum and maximum font sizes
      frequency: d.frequency,
      index: i
    }));



    // Create layout with maximum collision avoidance
    const layout = cloud()
      .size([width, height])
      .words(wordsData)
      .padding(20) // Increased padding to prevent collision
      .rotate(() => {
        // Primarily horizontal layout for better readability
        const angles = [0, 0, 0, 90, -90]; // Favor horizontal orientation
        return angles[Math.floor(Math.random() * angles.length)];
      })
      .font("Arial, sans-serif")
      .fontSize(d => d.size || 20)
      .spiral("archimedean") // Back to archimedean for smoother distribution
      .random(() => 0.5) // Fixed random seed for consistent layout
      .timeInterval(20) // More time for optimal positioning to reduce collision
      .on("end", draw)
      .on("word", () => {
        // Word positioned callback
      });

    // Store layout reference for cleanup
    layoutRef.current = layout;

    try {
      layout.start();
    } catch (error) {
      console.error('Error starting word cloud layout:', error);
      setIsLoading(false);
      isProcessingRef.current = false;
      
      // Send error to parent component
      if (onError) {
        onError(error instanceof Error ? error.message : 'Failed to render word cloud');
      }
    }

    function draw(layoutWords: WordData[]) {
      
      if (!layoutWords || layoutWords.length === 0) {
        console.warn('No words to draw');
        isProcessingRef.current = false;
        setIsLoading(false);
        return;
      }

      const svg = d3.select(svgRef.current);
      
      const g = svg
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      const text = g
        .selectAll("text")
        .data(layoutWords)
        .enter()
        .append("text")
        .style("font-size", d => `${d.size}px`)
        .style("font-family", "Arial, sans-serif")
        .style("font-weight", "bold")
        .style("fill", (d, i) => color(d.index?.toString() || i.toString()))
        .style("cursor", "pointer")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("transform", d => {
          const x = d.x || 0;
          const y = d.y || 0;
          const rotate = d.rotate || 0;
          return `translate(${x},${y})rotate(${rotate})`;
        })
        .text(d => d.text)
        .on("click", function(event, d) {
          if (onWordClick) {
            onWordClick(d as WordData);
          }
        })
        .on("touchstart", function(event, d) {
          event.preventDefault();
          d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 0.7)
            .style("text-decoration", "underline");
          
          if (onWordHover) {
            onWordHover(d as WordData);
          }
        })
        .on("touchend", function(event, d) {
          event.preventDefault();
          d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("text-decoration", "none");
          
          if (onWordClick) {
            onWordClick(d as WordData);
          }
          
          if (onWordHover) {
            onWordHover(null);
          }
        })
        .on("mouseover", function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 0.7)
            .style("text-decoration", "underline");
          
          if (onWordHover) {
            onWordHover(d as WordData);
          }
        })
        .on("mouseout", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("text-decoration", "none");
          
          if (onWordHover) {
            onWordHover(null);
          }
        });

      // Add entrance animation
      text
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .on("end", () => {
          isProcessingRef.current = false;
          setIsLoading(false);
        });
    }
    
    // Cleanup function
    return () => {
      if (layoutRef.current) {
        layoutRef.current.stop();
      }
      isProcessingRef.current = false;
    };
  }, [words, width, height, onWordHover, onWordClick, onError]);

  return (
    <div className="w-full flex justify-center relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg z-10">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Generating word cloud...</p>
          </div>
        </div>
      )}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border border-muted-foreground/20 rounded-lg bg-background"
      />
    </div>
  );
}