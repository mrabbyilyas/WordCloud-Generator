"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MagicCard } from "@/components/ui/magic-card";
import NumberTicker from "@/components/ui/number-ticker";
import { TextAnimate } from "@/components/ui/text-animate";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Globe, Hash, TrendingUp, FileText, Zap } from "lucide-react";
import { motion } from "motion/react";

interface WordData {
  text: string;
  size: number;
  frequency: number;
}

interface AnalyticsDashboardProps {
  words: WordData[];
  selectedLanguage: string;
  originalText?: string;
  cleanedText?: string;
}

export function AnalyticsDashboard({ words, selectedLanguage, originalText, cleanedText }: AnalyticsDashboardProps) {
  const analytics = useMemo(() => {
    if (!words || words.length === 0) {
      return {
        totalWords: 0,
        uniqueWords: 0,
        lexicalDiversity: 0,
        averageWordFrequency: 0,
        topWords: [],
        processedTextSample: ""
      };
    }

    const totalWords = words.reduce((sum, word) => sum + word.frequency, 0);
    const uniqueWords = words.length;
    const lexicalDiversity = uniqueWords > 0 ? (uniqueWords / totalWords) : 0;
    const averageWordFrequency = uniqueWords > 0 ? (totalWords / uniqueWords) : 0;
    const topWords = words.slice(0, 20).sort((a, b) => b.frequency - a.frequency);
    const processedTextSample = cleanedText || originalText || "";

    return {
      totalWords,
      uniqueWords,
      lexicalDiversity,
      averageWordFrequency,
      topWords,
      processedTextSample
    };
  }, [words, originalText, cleanedText]);

  const StatCard = ({ icon: Icon, title, value, subtitle, delay = 0 }: {
    icon: React.ElementType;
    title: string;
    value: number;
    subtitle?: string;
    delay?: number;
  }) => (
    <MagicCard className="p-6 h-full">
      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-full bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <TextAnimate 
            animation="fadeIn" 
            className="text-sm font-medium text-muted-foreground mb-1"
            delay={delay}
          >
            {title}
          </TextAnimate>
          <div className="text-2xl font-bold">
            <NumberTicker 
              value={value} 
              delay={delay + 0.2}
              decimalPlaces={title.includes("Diversity") || title.includes("Average") ? 2 : 0}
            />
          </div>
          {subtitle && (
            <TextAnimate 
              animation="slideUp" 
              className="text-xs text-muted-foreground mt-1"
              delay={delay + 0.4}
            >
              {subtitle}
            </TextAnimate>
          )}
        </div>
      </div>
    </MagicCard>
  );

  const LanguageCard = ({ icon: Icon, title, language, delay = 0 }: {
    icon: React.ElementType;
    title: string;
    language: string;
    delay?: number;
  }) => (
    <MagicCard className="p-6 h-full">
      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-full bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <TextAnimate 
            animation="fadeIn" 
            className="text-sm font-medium text-muted-foreground mb-1"
            delay={delay}
          >
            {title}
          </TextAnimate>
          <TextAnimate 
            animation="fadeIn" 
            className="text-2xl font-bold capitalize"
            delay={delay + 0.2}
          >
            {language}
          </TextAnimate>
        </div>
      </div>
    </MagicCard>
  );

  const WordRankItem = ({ word, rank, frequency }: { word: string; rank: number; frequency: number }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <div className="flex items-center space-x-3">
        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold">
          {rank}
        </Badge>
        <span className={`font-medium ${selectedLanguage === 'chinese' ? 'font-chinese' : ''}`}>{word}</span>
      </div>
      <div className="text-sm text-muted-foreground font-mono">
        {frequency}
      </div>
    </div>
  );

  if (!words || words.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Analytics Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No data available. Generate a word cloud to see analytics.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <TextAnimate animation="slideRight">Analytics Dashboard</TextAnimate>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard 
              icon={Hash} 
              title="Total Words" 
              value={analytics.totalWords}
              subtitle="After processing"
              delay={0}
            />
            <StatCard 
              icon={Zap} 
              title="Unique Words" 
              value={analytics.uniqueWords}
              subtitle="Distinct terms"
              delay={0.1}
            />
            <LanguageCard 
              icon={Globe} 
              title="Language Used" 
              language={selectedLanguage}
              delay={0.2}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <StatCard 
              icon={TrendingUp} 
              title="Lexical Diversity" 
              value={analytics.lexicalDiversity}
              subtitle="Unique/Total ratio"
              delay={0.3}
            />
            <StatCard 
              icon={BarChart3} 
              title="Average Word Frequency" 
              value={analytics.averageWordFrequency}
              subtitle="Total/Unique ratio"
              delay={0.4}
            />
          </div>

          {/* Top Words Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <TrendingUp className="h-5 w-5" />
                  <TextAnimate animation="fadeIn" delay={0.5}>Top 20 Words</TextAnimate>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          delayChildren: 0.5,
                          staggerChildren: 0.05
                        }
                      }
                    }}
                  >
                    {analytics.topWords.map((word, index) => (
                      <motion.div
                        key={`${word.text}-${index}`}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { 
                            opacity: 1, 
                            y: 0,
                            transition: {
                              duration: 0.3,
                              ease: "easeOut"
                            }
                          }
                        }}
                      >
                        <WordRankItem 
                          word={word.text}
                          rank={index + 1}
                          frequency={word.frequency}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            {/* Text Sample Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <FileText className="h-5 w-5" />
                  <TextAnimate animation="fadeIn" delay={0.6}>Cleaned Text</TextAnimate>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <TextAnimate 
                    animation="fadeIn" 
                    className={`text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap ${selectedLanguage === 'chinese' ? 'font-chinese' : ''}`}
                    delay={0.7}
                  >
                    {analytics.processedTextSample || "No cleaned text available"}
                  </TextAnimate>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}