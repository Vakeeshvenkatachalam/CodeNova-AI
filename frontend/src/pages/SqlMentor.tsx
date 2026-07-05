import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { sqlMentorService, SqlGenerateResponse, SqlReviewResponse, SqlExecuteResponse } from '../services/sqlMentorService';
import { Database, Play, Sparkles, AlertCircle, HelpCircle, CheckCircle } from 'lucide-react';

export const SqlMentor: React.FC = () => {
  const [prompt, setPrompt] = useState('Find the email of users who submitted code in Java');
  const [editorSql, setEditorSql] = useState('SELECT email FROM users;');
  
  // Loading flags
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);
  const [loadingExecute, setLoadingExecute] = useState(false);

  // Result storage
  const [generationResult, setGenerationResult] = useState<SqlGenerateResponse | null>(null);
  const [reviewResult, setReviewResult] = useState<SqlReviewResponse | null>(null);
  const [executeResult, setExecuteResult] = useState<SqlExecuteResponse | null>(null);
  const [consoleTab, setConsoleTab] = useState<'results' | 'db_debugger'>('results');

  const handleGenerateSql = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoadingGenerate(true);
    setGenerationResult(null);
    setReviewResult(null);
    setExecuteResult(null);
    try {
      const data = await sqlMentorService.generateSql(prompt);
      setGenerationResult(data);
      // Populate generated SQL in editor
      setEditorSql(data.sql);
    } catch (err) {
      console.error('SQL generation failed:', err);
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleReviewSql = async () => {
    if (!prompt.trim() || !editorSql.trim()) return;

    setLoadingReview(true);
    setLoadingExecute(true);
    setReviewResult(null);
    setExecuteResult(null);
    try {
      const [reviewData, executeData] = await Promise.all([
        sqlMentorService.reviewSql(prompt, editorSql),
        sqlMentorService.executeSql(editorSql)
      ]);
      setReviewResult(reviewData);
      setExecuteResult(executeData);
      if (!executeData.success) {
        setConsoleTab('db_debugger');
      } else {
        setConsoleTab('results');
      }
    } catch (err) {
      console.error('SQL review failed:', err);
    } finally {
      setLoadingReview(false);
      setLoadingExecute(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-content-primary-light dark:text-content-primary-dark">
          SQL Mentor
        </h2>
        <p className="text-sm text-content-secondary-light dark:text-content-secondary-dark mt-1">
          Convert natural language queries to SQL and test your query constructions.
        </p>
      </div>

      {/* Grid splits layout */}
      <div className="grid gap-6 lg:grid-cols-5 items-stretch h-[calc(100vh-13rem)]">
        {/* Left pane: schema definitions */}
        <Card className="lg:col-span-2 flex flex-col p-4 overflow-hidden h-full">
          <div className="flex items-center gap-2 border-b border-border-light pb-2 mb-3 dark:border-border-dark shrink-0">
            <Database className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-content-primary-light dark:text-content-primary-dark">
              Relational Tables
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs text-content-secondary-light dark:text-content-secondary-dark pr-1">
            <div className="rounded-lg border border-border-light dark:border-border-dark p-3 bg-brand-light dark:bg-brand-dark">
              <p className="font-bold text-primary mb-1">users</p>
              <ul className="pl-3 space-y-0.5 list-disc">
                <li>id (BIGINT, PK)</li>
                <li>email (VARCHAR, Unique)</li>
                <li>role (VARCHAR)</li>
              </ul>
            </div>

            <div className="rounded-lg border border-border-light dark:border-border-dark p-3 bg-brand-light dark:bg-brand-dark">
              <p className="font-bold text-primary mb-1">submissions</p>
              <ul className="pl-3 space-y-0.5 list-disc">
                <li>id (BIGINT, PK)</li>
                <li>user_id (BIGINT, FK - points to users.id)</li>
                <li>code (TEXT)</li>
                <li>language (VARCHAR)</li>
                <li>status (VARCHAR)</li>
                <li>created_at (DATETIME)</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Right workspace pane: generators & editor */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden">
          {/* Prompt builder card */}
          <Card className="p-4 shrink-0">
            <Badge variant="ai" className="flex items-center gap-1 w-fit mb-2.5">
              <Sparkles className="h-3.5 w-3.5" /> English-to-SQL Generator
            </Badge>
            <form onSubmit={handleGenerateSql} className="flex gap-2">
              <input
                type="text"
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Find users having role USER..."
                className="flex-1 text-xs p-2 bg-brand-light border border-border-light dark:bg-brand-dark dark:border-border-dark text-content-primary-light dark:text-content-primary-dark rounded-lg focus:outline-none"
              />
              <Button
                type="submit"
                isLoading={loadingGenerate}
                variant="ai"
                className="text-xs py-1.5 px-3 shadow-glow-ai/20 flex items-center justify-center shrink-0"
              >
                Generate Query
              </Button>
            </form>

            {generationResult && (
              <div className="mt-3 bg-brand-light dark:bg-brand-dark border border-border-light dark:border-border-dark p-3 rounded-lg text-xs leading-relaxed">
                <p className="font-semibold text-primary">Generated SQL:</p>
                <pre className="font-mono text-[10px] bg-[#1e1e1e] p-2 rounded text-[#d4d4d4] my-1.5 overflow-x-auto">
                  {generationResult.sql}
                </pre>
                <p className="text-content-secondary-light dark:text-content-secondary-dark mt-1">
                  <strong>Explanation:</strong> {generationResult.explanation}
                </p>
              </div>
            )}
          </Card>

          {/* Workbench code pre editor */}
          <div className="flex-1 flex flex-col gap-4 h-full overflow-hidden">
            <Card className="h-44 flex flex-col p-0 bg-[#1e1e1e] border-none shadow-md overflow-hidden shrink-0">
              <div className="flex h-9 items-center justify-between bg-[#2d2d2d] px-4 border-b border-[#3c3c3c]">
                <div className="flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-content-secondary-dark" />
                  <span className="text-xs font-mono text-content-secondary-dark">SQL Editor</span>
                </div>
                <Play className="h-3.5 w-3.5 text-content-muted-dark" />
              </div>
              <textarea
                value={editorSql}
                onChange={(e) => setEditorSql(e.target.value)}
                className="flex-1 p-4 font-mono text-xs text-green-400 bg-[#1e1e1e] border-none resize-none focus:outline-none leading-relaxed overflow-y-auto"
              />
            </Card>

            {/* Results Console */}
            <Card className="flex-1 flex flex-col p-4 overflow-hidden min-h-[180px]">
              <div className="flex border-b border-border-light dark:border-border-dark pb-2 gap-4 shrink-0">
                <button
                  onClick={() => setConsoleTab('results')}
                  className={`text-xs font-bold font-sans py-1 transition-all duration-200 border-b-2 ${
                    consoleTab === 'results'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-content-secondary-light dark:text-content-secondary-dark'
                  }`}
                >
                  Query Results
                </button>
                <button
                  onClick={() => setConsoleTab('db_debugger')}
                  className={`text-xs font-bold font-sans py-1 transition-all duration-200 border-b-2 ${
                    consoleTab === 'db_debugger'
                      ? 'border-danger text-danger'
                      : 'border-transparent text-content-secondary-light dark:text-content-secondary-dark'
                  }`}
                >
                  Database Debugger Console
                </button>
              </div>

              <div className="flex-1 mt-3 overflow-y-auto">
                {loadingExecute ? (
                  <div className="flex items-center justify-center h-full py-6">
                    <span className="text-xs text-content-muted-light dark:text-content-muted-dark animate-pulse">Running query on database...</span>
                  </div>
                ) : consoleTab === 'results' ? (
                  !executeResult ? (
                    <div className="flex flex-col items-center justify-center h-full py-6 border border-dashed border-border-light dark:border-border-dark rounded-lg text-content-muted-light dark:text-content-muted-dark">
                      <HelpCircle className="h-5 w-5 mb-1 opacity-60" />
                      <p className="text-[11px]">Execute a valid SELECT statement to inspect data rows.</p>
                    </div>
                  ) : !executeResult.success ? (
                    <div className="p-3 bg-danger/10 border border-danger/25 text-danger rounded-lg text-xs leading-relaxed">
                      <p className="font-bold flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> Database Execution Failed
                      </p>
                      <p className="mt-1 font-sans">Check the "Database Debugger Console" tab for details.</p>
                    </div>
                  ) : executeResult.rowCount === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-6 border border-dashed border-border-light dark:border-border-dark rounded-lg text-content-muted-light dark:text-content-muted-dark">
                      <p className="text-xs font-bold">Empty Set (0 rows returned)</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-border-light dark:border-border-dark rounded-lg">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-brand-light dark:bg-brand-dark border-b border-border-light dark:border-border-dark">
                            {executeResult.columns.map((col, idx) => (
                              <th key={idx} className="p-2 font-mono font-bold text-primary border-r last:border-r-0 border-border-light dark:border-border-dark">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {executeResult.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-border-light dark:border-border-dark last:border-b-0 hover:bg-brand-light/50 dark:hover:bg-brand-dark/50">
                              {row.map((val, cIdx) => (
                                <td key={cIdx} className="p-2 font-mono border-r last:border-r-0 border-border-light dark:border-border-dark text-content-primary-light dark:text-content-primary-dark">{val}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  !executeResult ? (
                    <div className="flex flex-col items-center justify-center h-full py-6 border border-dashed border-border-light dark:border-border-dark rounded-lg text-content-muted-light dark:text-content-muted-dark">
                      <p className="text-[11px]">No execution logs. Run a query to inspect trace output.</p>
                    </div>
                  ) : executeResult.success ? (
                    <div className="p-3 bg-success/10 border border-success/25 text-success rounded-lg text-xs leading-relaxed">
                      <p className="font-bold">SQL Execution Passed successfully.</p>
                      <p className="mt-1 font-mono">Row count: {executeResult.rowCount} rows fetched. Connection status: Active.</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-danger/10 border border-danger/35 text-danger rounded-lg text-xs leading-relaxed font-mono">
                      <p className="font-bold flex items-center gap-1 text-red-500">
                        <AlertCircle className="h-4 w-4" /> SQL EXCEPTION / RUNTIME ERROR
                      </p>
                      <pre className="mt-2 p-2 bg-black/30 rounded text-red-400 text-[10px] whitespace-pre-wrap overflow-x-auto leading-relaxed border border-danger/20">
                        {executeResult.errorMessage}
                      </pre>
                      <p className="mt-2 text-[10px] text-content-secondary-light dark:text-content-secondary-dark">
                        Tip: Verify that table names, column constraints, joins, and where clause attributes match the database schema diagram on the left.
                      </p>
                    </div>
                  )
                )}
              </div>
            </Card>

            {/* Review Query submission action block */}
            <div className="shrink-0 flex flex-col gap-2">
              {reviewResult && (
                <div className={`rounded-lg border p-3 text-xs leading-relaxed ${
                  reviewResult.status === 'CORRECT'
                    ? 'bg-success/15 border-success/35 text-success'
                    : 'bg-danger/15 border-danger/35 text-danger'
                }`}>
                  <p className="font-bold flex items-center gap-1">
                    {reviewResult.status === 'CORRECT' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    Query Review Assessment: {reviewResult.status}
                  </p>
                  <p className="mt-1 font-mono text-[10px]">{reviewResult.feedback}</p>
                </div>
              )}

              <Button
                onClick={handleReviewSql}
                isLoading={loadingReview || loadingExecute}
                disabled={!editorSql.trim()}
                variant="primary"
                className="w-full text-xs py-2"
              >
                Review and Run SQL
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
