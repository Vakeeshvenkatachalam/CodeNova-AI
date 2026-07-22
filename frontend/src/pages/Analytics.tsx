import React from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Clock, BookOpen, AlertCircle, Compass, Target,
  CheckCircle, ArrowRight, BarChart3
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const navigate = useNavigate();

  const solvedCount = 8;
  const placementScore = 78;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-content-primary-light dark:text-content-primary-dark">
            Learning Analytics Board
          </h2>
          <p className="text-sm text-content-secondary-light dark:text-content-secondary-dark mt-1">
            Audit your mock interview success ratios, diagnostic curves, and placement readiness scales.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left: Readiness Gauge */}
        <div className="md:col-span-1 space-y-4">
          <Card className="p-5 text-center space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted-light dark:text-gray-400">AI Placement Readiness</span>
            <div className="relative h-28 w-28 rounded-full border-8 border-primary/20 flex items-center justify-center text-primary font-black text-2xl mx-auto shadow-inner">
              {placementScore}%
            </div>
            <div className="space-y-1">
              <Badge variant="brand" className="mx-auto font-bold text-[9px] py-0.5">Recruiter Ready</Badge>
              <p className="text-[10px] text-content-secondary-light dark:text-gray-400 mt-1.5 font-sans leading-relaxed">
                Matches current Java/Python engineering requirements for Tier-1 companies.
              </p>
            </div>
          </Card>

          {/* Core Target Gaps */}
          <Card className="p-4 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-content-primary-light dark:text-content-primary-dark flex items-center gap-1.5">
              <Target className="h-4.5 w-4.5 text-primary" /> Target Competencies
            </h4>
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between items-center bg-brand-light dark:bg-brand-dark p-2 rounded-lg">
                <span className="text-content-primary-light dark:text-gray-300">Data Structures</span>
                <span className="font-bold text-green-500 font-mono">88%</span>
              </div>
              <div className="flex justify-between items-center bg-brand-light dark:bg-brand-dark p-2 rounded-lg">
                <span className="text-content-primary-light dark:text-gray-300">SQL Normalization</span>
                <span className="font-bold text-green-500 font-mono">75%</span>
              </div>
              <div className="flex justify-between items-center bg-brand-light dark:bg-brand-dark p-2 rounded-lg">
                <span className="text-content-primary-light dark:text-gray-300">System Design APIs</span>
                <span className="font-bold text-[#f59e0b] font-mono">60%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Growth Chart (SVG charts simulator) & Weekly distribution */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-border-light dark:border-border-dark pb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-content-primary-light dark:text-content-primary-dark flex items-center gap-1.5">
                <BarChart3 className="h-4.5 w-4.5 text-primary" /> Weekly Solving Activity Graph
              </h3>
              <span className="text-[9px] text-content-muted-light dark:text-gray-400">XP gained per day</span>
            </div>

            {/* Custom SVG Line Chart representation */}
            <div className="h-36 w-full flex items-end justify-between gap-2.5 px-2 pb-2 select-none border-b border-border-light dark:border-border-dark">
              <div className="flex flex-col items-center flex-1 space-y-1">
                <div className="w-full bg-primary/20 rounded-t h-12" />
                <span className="text-[8px] font-mono text-content-muted-light dark:text-gray-500">Mon</span>
              </div>
              <div className="flex flex-col items-center flex-1 space-y-1">
                <div className="w-full bg-primary/30 rounded-t h-16" />
                <span className="text-[8px] font-mono text-content-muted-light dark:text-gray-500">Tue</span>
              </div>
              <div className="flex flex-col items-center flex-1 space-y-1">
                <div className="w-full bg-primary/40 rounded-t h-8" />
                <span className="text-[8px] font-mono text-content-muted-light dark:text-gray-500">Wed</span>
              </div>
              <div className="flex flex-col items-center flex-1 space-y-1">
                <div className="w-full bg-primary/60 rounded-t h-20" />
                <span className="text-[8px] font-mono text-content-muted-light dark:text-gray-500">Thu</span>
              </div>
              <div className="flex flex-col items-center flex-1 space-y-1">
                <div className="w-full bg-primary rounded-t h-28 animate-pulse" />
                <span className="text-[8px] font-mono text-content-muted-light dark:text-gray-500">Fri</span>
              </div>
            </div>
          </Card>

          {/* Study recommendations case */}
          <Card className="p-5 space-y-3.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-content-primary-light dark:text-content-primary-dark flex items-center gap-1.5">
              <Compass className="h-4.5 w-4.5 text-primary" /> Placement Improvement Steps
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex gap-3 items-start">
                <div className="h-5 w-5 bg-primary/10 rounded-full flex items-center justify-center font-bold text-[10px] text-primary mt-0.5 font-mono">1</div>
                <div>
                  <p className="font-bold text-content-primary-light dark:text-content-primary-dark">Strengthen System design components</p>
                  <p className="text-[10px] text-content-muted-light dark:text-gray-400">Practice database sharding and scaling algorithms in the workspace.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
