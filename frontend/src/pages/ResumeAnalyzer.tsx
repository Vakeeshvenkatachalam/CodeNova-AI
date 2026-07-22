import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { FileText, Sparkles, AlertCircle, CheckCircle, BookOpen, Compass } from 'lucide-react';

export const ResumeAnalyzer: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<boolean>(false);

  const handleUploadSimulator = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setReport(true);
    }, 2000); // 2-second parse simulation
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-content-primary-light dark:text-content-primary-dark">
          AI Resume ATS Analyzer
        </h2>
        <p className="text-sm text-content-secondary-light dark:text-content-secondary-dark mt-1">
          Upload your resume to calculate keyword densities, match target recruiter scores, and map skills gaps.
        </p>
      </div>

      {!report ? (
        <Card className="max-w-xl mx-auto p-8 text-center space-y-4 border-2 border-dashed border-border-light dark:border-border-dark bg-brand-light/30 dark:bg-brand-dark/20">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-content-primary-light dark:text-content-primary-dark">Drag & Drop Resume PDF/Word</p>
            <p className="text-xs text-content-secondary-light dark:text-gray-400 mt-1 leading-relaxed">
              Acceptable file formats: .pdf, .docx under 5MB. Matches against target Software Engineer roles.
            </p>
          </div>
          <Button
            onClick={handleUploadSimulator}
            isLoading={analyzing}
            variant="primary"
            className="w-full text-xs py-2.5 max-w-xs mx-auto flex items-center justify-center gap-1.5"
          >
            <Sparkles className="h-4 w-4" /> Simulate Parse Scan
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3 items-start">
          {/* Left panel: Score cards & Gaps */}
          <div className="md:col-span-1 space-y-4">
            <Card className="p-5 text-center space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-gray-400">ATS Match Rating</span>
              <p className="text-3xl font-black text-primary">82%</p>
              <Badge variant="brand" className="mx-auto font-bold text-[9px] py-0.5">High Potential</Badge>
            </Card>

            <Card className="p-4 space-y-3.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-content-primary-light dark:text-content-primary-dark flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-primary" /> Missing Keywords
              </h4>
              <div className="flex gap-2 flex-wrap text-[10px]">
                <Badge variant="danger">Docker</Badge>
                <Badge variant="danger">Redis Cache</Badge>
                <Badge variant="danger">CI/CD Pipeline</Badge>
                <Badge variant="danger">Spring Cloud</Badge>
              </div>
            </Card>
          </div>

          {/* Right: Detailed advice report & roadmap */}
          <div className="md:col-span-2 space-y-4">
            <Card className="p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-border-light pb-3 dark:border-border-dark">
                <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-content-primary-light dark:text-content-primary-dark">AI Diagnostics Report</h3>
              </div>

              <div className="space-y-3.5 text-xs leading-relaxed">
                <div>
                  <p className="font-bold text-green-500 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Identified Strengths:
                  </p>
                  <p className="text-content-secondary-light dark:text-gray-300 font-sans mt-0.5">
                    Solid coding foundations in Java, algorithms complexity understanding, and SQL schema mappings are well documented.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-[#f59e0b] flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" /> Priority Gaps & Weaknesses:
                  </p>
                  <p className="text-content-secondary-light dark:text-gray-300 font-sans mt-0.5">
                    Needs exposure to distributed systems terminology (Redis, RabbitMQ) and deployment scaling definitions (Docker, CI/CD).
                  </p>
                </div>
              </div>
            </Card>

            {/* Gap roadmap calendar */}
            <Card className="p-5 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-content-primary-light dark:text-content-primary-dark flex items-center gap-1.5">
                <BookOpen className="h-4.5 w-4.5 text-primary" /> Recommended Revision Roadmap
              </h4>
              <div className="space-y-2.5 text-xs bg-brand-light dark:bg-[#0d1117] p-4 rounded-xl border border-border-light dark:border-border-dark leading-relaxed">
                <p><strong>Step 1: Containerization Basics</strong> — Study Docker files, docker-compose configuration, and volumes. (Estimated hours: 6h)</p>
                <p><strong>Step 2: Database Caching Layers</strong> — Revise Redis key-value stores, eviction structures, and cache mappings. (Estimated hours: 8h)</p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
