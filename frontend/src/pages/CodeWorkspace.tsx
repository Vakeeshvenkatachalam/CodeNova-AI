import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { codeAnalysisService, ExplanationBlock, ComplexityResponse } from '../services/codeAnalysisService';
import { debugService, DebugResponse } from '../services/debugService';
import { Terminal, Settings, Play, Sparkles, AlertCircle, RefreshCw, Cpu } from 'lucide-react';

export const CodeWorkspace: React.FC = () => {
  const [code, setCode] = useState(
    `public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        for (int i = 0; i < nums.length; i++) {\n            for (int j = i + 1; j < nums.length; j++) {\n                if (nums[i] + nums[j] == target) {\n                    return new int[] { i, j };\n                }\n            }\n        }\n        return new int[] {};\n    }\n}`
  );
  const [language, setLanguage] = useState('Java');
  const [activeTab, setActiveTab] = useState<'analysis' | 'debug' | 'complexity'>('analysis');
  const [errorMessage, setErrorMessage] = useState('java.lang.ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 5');

  // Loading flags
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [loadingComplexity, setLoadingComplexity] = useState(false);
  const [loadingDebug, setLoadingDebug] = useState(false);
  const [loadingAutocomplete, setLoadingAutocomplete] = useState(false);

  // Response storage
  const [explainResult, setExplainResult] = useState<ExplanationBlock[]>([]);
  const [complexityResult, setComplexityResult] = useState<ComplexityResponse | null>(null);
  const [debugResult, setDebugResult] = useState<DebugResponse | null>(null);

  const handleAutocomplete = async () => {
    setLoadingAutocomplete(true);
    try {
      const data = await codeAnalysisService.autocomplete(code, language);
      if (data.suggestion) {
        setCode((prev) => prev.trim() + '\n' + data.suggestion);
      }
    } catch (err) {
      console.error('Autocomplete failed:', err);
    } finally {
      setLoadingAutocomplete(false);
    }
  };

  const handleExplain = async () => {
    setLoadingExplain(true);
    try {
      const data = await codeAnalysisService.explainCode(code, language);
      setExplainResult(data.explanations);
    } catch (err) {
      console.error('Explanation failed:', err);
    } finally {
      setLoadingExplain(false);
    }
  };

  const handleComplexity = async () => {
    setLoadingComplexity(true);
    try {
      const data = await codeAnalysisService.analyzeComplexity(code, language);
      setComplexityResult(data);
    } catch (err) {
      console.error('Complexity analysis failed:', err);
    } finally {
      setLoadingComplexity(false);
    }
  };

  const handleDebug = async () => {
    setLoadingDebug(true);
    try {
      const data = await debugService.analyzeBug(code, errorMessage);
      setDebugResult(data);
    } catch (err) {
      console.error('Debug analysis failed:', err);
    } finally {
      setLoadingDebug(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Editor Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-content-primary-light dark:text-content-primary-dark">
            Code Workspace
          </h2>
          <p className="text-xs text-content-secondary-light dark:text-content-secondary-dark mt-0.5">
            Optimize, explain, and repair your algorithms
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-surface-light border border-border-light text-content-primary-light dark:bg-surface-dark dark:border-border-dark dark:text-content-primary-dark text-xs rounded-lg py-1.5 px-3 focus:outline-none"
          >
            <option>Java</option>
            <option>JavaScript</option>
            <option>Python</option>
          </select>
          <Button
            onClick={handleAutocomplete}
            isLoading={loadingAutocomplete}
            variant="ai"
            className="flex items-center gap-1 py-1.5 px-3 text-xs"
          >
            <Sparkles className="h-3.5 w-3.5" /> Suggest Next Line
          </Button>
        </div>
      </div>

      {/* Split Pane Container */}
      <div className="grid gap-6 lg:grid-cols-5 h-[calc(100vh-12rem)]">
        {/* Left Pane - simulated Monaco editor */}
        <Card className="lg:col-span-3 flex flex-col p-0 overflow-hidden bg-[#1e1e1e] border-none shadow-lg">
          {/* Header tabs */}
          <div className="flex h-10 w-full items-center justify-between bg-[#2d2d2d] px-4 border-b border-[#3c3c3c]">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-content-muted-dark" />
              <span className="text-xs font-mono font-semibold text-content-secondary-dark">
                Solution.{language === 'Java' ? 'java' : language === 'JavaScript' ? 'js' : 'py'}
              </span>
            </div>
            <Settings className="h-4 w-4 text-content-muted-dark" />
          </div>
          
          {/* Text Editor */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 p-4 font-mono text-xs text-green-400 bg-[#1e1e1e] border-none resize-none focus:outline-none focus:ring-0 leading-relaxed overflow-y-auto"
            style={{ tabSize: 4 }}
          />
        </Card>

        {/* Right Pane - AI Sidebar panel */}
        <Card className="lg:col-span-2 flex flex-col p-4 overflow-hidden h-full">
          {/* Tab buttons */}
          <div className="flex border-b border-border-light dark:border-border-dark pb-3 gap-2 shrink-0">
            {[
              { id: 'analysis', label: 'Explainer' },
              { id: 'complexity', label: 'Complexity' },
              { id: 'debug', label: 'Debugger' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-xs font-bold font-sans py-1.5 px-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary/15 text-primary'
                    : 'text-content-secondary-light hover:bg-brand-light dark:text-content-secondary-dark dark:hover:bg-brand-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 mt-4 overflow-y-auto space-y-4 pr-1">
            {activeTab === 'analysis' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Badge variant="ai" className="flex items-center gap-1 w-fit">
                    <Sparkles className="h-3 w-3" /> Line Explainer
                  </Badge>
                  <Button onClick={handleExplain} isLoading={loadingExplain} variant="secondary" className="text-xs py-1 px-2.5">
                    Generate Explanations
                  </Button>
                </div>

                {explainResult.length === 0 ? (
                  <p className="text-xs text-content-muted-light dark:text-content-muted-dark text-center py-10 border border-dashed border-border-light dark:border-border-dark rounded-lg">
                    Click 'Generate Explanations' to review line notes.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {explainResult.map((exp, idx) => (
                      <div key={idx} className="rounded-lg border border-border-light dark:border-border-dark p-3 bg-brand-light dark:bg-brand-dark">
                        <pre className="font-mono text-[10px] text-content-primary-light dark:text-content-primary-dark overflow-x-auto bg-[#1e1e1e] p-1.5 rounded mb-1.5">
                          {exp.block}
                        </pre>
                        <p className="text-xs text-content-secondary-light dark:text-content-secondary-dark leading-relaxed">
                          {exp.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'complexity' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Badge variant="info" className="flex items-center gap-1 w-fit">
                    <Cpu className="h-3 w-3" /> Big O Analyzer
                  </Badge>
                  <Button onClick={handleComplexity} isLoading={loadingComplexity} variant="secondary" className="text-xs py-1 px-2.5">
                    Analyze Complexities
                  </Button>
                </div>

                {!complexityResult ? (
                  <p className="text-xs text-content-muted-light dark:text-content-muted-dark text-center py-10 border border-dashed border-border-light dark:border-border-dark rounded-lg">
                    Click 'Analyze Complexities' to trace Big-O bounds.
                  </p>
                ) : (
                  <div className="rounded-lg border border-border-light dark:border-border-dark p-3 bg-brand-light dark:bg-brand-dark space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-2 rounded bg-primary/10 border border-primary/20">
                        <p className="text-[10px] uppercase font-bold text-content-muted-light dark:text-content-muted-dark">Time</p>
                        <p className="text-sm font-mono font-bold text-primary">{complexityResult.timeComplexity}</p>
                      </div>
                      <div className="p-2 rounded bg-ai/10 border border-ai/20">
                        <p className="text-[10px] uppercase font-bold text-content-muted-light dark:text-content-muted-dark">Space</p>
                        <p className="text-sm font-mono font-bold text-ai">{complexityResult.spaceComplexity}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-content-primary-light dark:text-content-primary-dark">Justification:</p>
                      <p className="text-xs text-content-secondary-light dark:text-content-secondary-dark mt-1 leading-relaxed whitespace-pre-line">
                        {complexityResult.justification}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'debug' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Badge variant="danger" className="flex items-center gap-1 w-fit">
                    <AlertCircle className="h-3 w-3" /> AI Debugger
                  </Badge>
                  <Button onClick={handleDebug} isLoading={loadingDebug} variant="secondary" className="text-xs py-1 px-2.5">
                    Debug Code
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary-light dark:text-content-secondary-dark">
                    Error Log / Traceback
                  </label>
                  <textarea
                    value={errorMessage}
                    onChange={(e) => setErrorMessage(e.target.value)}
                    rows={2}
                    className="w-full text-xs font-mono p-2 border border-border-light rounded-lg bg-brand-light dark:bg-brand-dark dark:border-border-dark text-content-secondary-light dark:text-content-secondary-dark resize-none focus:outline-none"
                  />
                </div>

                {!debugResult ? (
                  <p className="text-xs text-content-muted-light dark:text-content-muted-dark text-center py-10 border border-dashed border-border-light dark:border-border-dark rounded-lg">
                    Click 'Debug Code' to run diagnosis.
                  </p>
                ) : (
                  <div className="rounded-lg border border-border-light dark:border-border-dark p-3 bg-brand-light dark:bg-brand-dark space-y-3">
                    <div>
                      <p className="text-xs font-bold text-danger">Root Cause:</p>
                      <p className="text-xs text-content-primary-light dark:text-content-primary-dark mt-0.5 leading-relaxed">
                        {debugResult.rootCause}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-success">Fix Suggestion:</p>
                      <p className="text-xs text-content-secondary-light dark:text-content-secondary-dark mt-0.5 leading-relaxed">
                        {debugResult.fixReasoning}
                      </p>
                    </div>
                    {debugResult.suggestedCode && (
                      <div>
                        <p className="text-xs font-bold text-primary mb-1">Patched Code:</p>
                        <pre className="font-mono text-[10px] text-content-primary-light dark:text-content-primary-dark overflow-x-auto bg-[#1e1e1e] p-2 rounded">
                          {debugResult.suggestedCode}
                        </pre>
                        <Button
                          onClick={() => setCode(debugResult.suggestedCode)}
                          variant="secondary"
                          className="text-[10px] py-1 px-2 mt-2 w-full flex items-center justify-center gap-1"
                        >
                          <RefreshCw className="h-3 w-3" /> Apply to Editor
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
