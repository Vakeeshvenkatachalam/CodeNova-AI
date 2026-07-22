import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { sqlMentorService, SqlGenerateResponse, SqlReviewResponse, SqlExecuteResponse } from '../services/sqlMentorService';
import {
  Database, Play, Sparkles, AlertCircle, HelpCircle, CheckCircle,
  Clock, GitCompare, BookOpen, Layers, RefreshCw
} from 'lucide-react';

export const SqlMentor: React.FC = () => {
  const [prompt, setPrompt] = useState(() => localStorage.getItem('sql_mentor_prompt') || 'Find the email of users who submitted code in Java');
  const [editorSql, setEditorSql] = useState(() => localStorage.getItem('sql_mentor_sql') || 'SELECT email FROM users WHERE role = \'ROLE_USER\';');
  
  // Loading flags
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);
  const [loadingExecute, setLoadingExecute] = useState(false);

  // Result storage
  const [generationResult, setGenerationResult] = useState<SqlGenerateResponse | null>(() => {
    const saved = localStorage.getItem('sql_mentor_gen_result');
    return saved ? JSON.parse(saved) : null;
  });
  const [reviewResult, setReviewResult] = useState<SqlReviewResponse | null>(() => {
    const saved = localStorage.getItem('sql_mentor_review_result');
    return saved ? JSON.parse(saved) : null;
  });
  const [executeResult, setExecuteResult] = useState<SqlExecuteResponse | null>(() => {
    const saved = localStorage.getItem('sql_mentor_exec_result');
    return saved ? JSON.parse(saved) : null;
  });
  const [consoleTab, setConsoleTab] = useState<'results' | 'db_debugger'>(() => {
    return (localStorage.getItem('sql_mentor_console_tab') as any) || 'results';
  });

  // Stats
  const [executionTime, setExecutionTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('sql_mentor_execution_time');
    return saved ? Number(saved) : null;
  });

  // Persist SQL workbench state in localStorage
  useEffect(() => {
    localStorage.setItem('sql_mentor_prompt', prompt);
  }, [prompt]);

  useEffect(() => {
    localStorage.setItem('sql_mentor_sql', editorSql);
  }, [editorSql]);

  useEffect(() => {
    localStorage.setItem('sql_mentor_gen_result', JSON.stringify(generationResult));
  }, [generationResult]);

  useEffect(() => {
    localStorage.setItem('sql_mentor_review_result', JSON.stringify(reviewResult));
  }, [reviewResult]);

  useEffect(() => {
    localStorage.setItem('sql_mentor_exec_result', JSON.stringify(executeResult));
  }, [executeResult]);

  useEffect(() => {
    localStorage.setItem('sql_mentor_console_tab', consoleTab);
  }, [consoleTab]);

  useEffect(() => {
    if (executionTime !== null) {
      localStorage.setItem('sql_mentor_execution_time', executionTime.toString());
    } else {
      localStorage.removeItem('sql_mentor_execution_time');
    }
  }, [executionTime]);

  // Professional SQL Console Smart Indentation & Auto Bracket Closures Handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    const closingPairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '"': '"',
      "'": "'"
    };

    // 1. Shift+Tab: Unindent (deducts 4 spaces)
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      const beforeCursor = value.substring(0, start);
      const lineStartIdx = beforeCursor.lastIndexOf('\n') + 1;
      const currentLine = value.substring(lineStartIdx, start);

      const spaceMatch = currentLine.match(/^(\s{1,4})/);
      if (spaceMatch) {
        const charsToRemove = spaceMatch[1].length;
        const newValue = value.substring(0, lineStartIdx) + currentLine.substring(charsToRemove) + value.substring(start);
        setEditorSql(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = Math.max(lineStartIdx, start - charsToRemove);
        }, 0);
      }
      return;
    }

    // 2. Tab: Indent (inserts 4 spaces)
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      setEditorSql(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
      return;
    }

    // 3. Enter: Auto-indentation
    if (e.key === 'Enter') {
      e.preventDefault();
      const beforeCursor = value.substring(0, start);
      const afterCursor = value.substring(end);
      const lines = beforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];

      const match = currentLine.match(/^(\s*)/);
      const currentIndent = match ? match[1] : '';

      const charBefore = beforeCursor.charAt(beforeCursor.length - 1);
      const charAfter = afterCursor.charAt(0);
      const isBracketSplit = (charBefore === '(' && charAfter === ')') ||
                            (charBefore === '[' && charAfter === ']');

      let newValue = '';
      let newCursorPos = 0;

      if (isBracketSplit) {
        const nestedIndent = currentIndent + '    ';
        newValue = beforeCursor + '\n' + nestedIndent + '\n' + currentIndent + afterCursor;
        newCursorPos = start + 1 + nestedIndent.length;
      } else {
        newValue = beforeCursor + '\n' + currentIndent + afterCursor;
        newCursorPos = start + 1 + currentIndent.length;
      }

      setEditorSql(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;
      }, 0);
      return;
    }

    // 4. Backspace: Delete matching pairs
    if (e.key === 'Backspace' && start === end && start > 0) {
      const charBefore = value.charAt(start - 1);
      const charAfter = value.charAt(start);
      if (closingPairs[charBefore] === charAfter) {
        e.preventDefault();
        const newValue = value.substring(0, start - 1) + value.substring(start + 1);
        setEditorSql(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start - 1;
        }, 0);
        return;
      }
    }

    // 5. Overwrite matching closing characters
    if (closingPairs[e.key] !== undefined || e.key === ')' || e.key === ']') {
      const charAfter = value.charAt(start);
      if (e.key === charAfter && (e.key === ')' || e.key === ']' || e.key === '"' || e.key === "'")) {
        e.preventDefault();
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        return;
      }
    }

    // 6. Auto-insert closing pair
    if (closingPairs[e.key] !== undefined) {
      e.preventDefault();
      const closingChar = closingPairs[e.key];
      const newValue = value.substring(0, start) + e.key + closingChar + value.substring(end);
      setEditorSql(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
      return;
    }
  };

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
      setEditorSql(data.sql);
    } catch (err) {
      console.error('SQL generation failed:', err);
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleFormatSql = () => {
    if (!editorSql.trim()) return;
    // Simple formatter: uppercase key SQL keywords
    const keywords = [
      'select', 'from', 'where', 'join', 'on', 'group by', 'order by',
      'having', 'and', 'or', 'insert', 'update', 'delete', 'left join',
      'right join', 'inner join', 'cross join', 'as', 'in'
    ];
    let formatted = editorSql;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formatted = formatted.replace(regex, keyword.toUpperCase());
    });
    setEditorSql(formatted);
  };

  const handleExecuteSqlOnly = async () => {
    if (!editorSql.trim()) return;
    setLoadingExecute(true);
    setExecuteResult(null);
    const start = Date.now();
    try {
      const executeData = await sqlMentorService.executeSql(editorSql);
      setExecuteResult(executeData);
      setExecutionTime(Date.now() - start);
      setConsoleTab('results');
    } catch (err) {
      console.error('SQL execution failed:', err);
    } finally {
      setLoadingExecute(false);
    }
  };

  const handleReviewSql = async () => {
    if (!prompt.trim() || !editorSql.trim()) return;

    setLoadingReview(true);
    setLoadingExecute(true);
    setReviewResult(null);
    setExecuteResult(null);
    const start = Date.now();
    try {
      const [reviewData, executeData] = await Promise.all([
        sqlMentorService.reviewSql(prompt, editorSql),
        sqlMentorService.executeSql(editorSql)
      ]);
      setReviewResult(reviewData);
      setExecuteResult(executeData);
      setExecutionTime(Date.now() - start);
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
          AI SQL Mentor
        </h2>
        <p className="text-sm text-content-secondary-light dark:text-content-secondary-dark mt-1">
          Write relational SQL statements, execute queries, and get AI performance audits.
        </p>
      </div>

      {/* Grid splits layout */}
      <div className="grid gap-6 lg:grid-cols-5 items-stretch">
        {/* Left column: schemas & AI hints */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-border-light pb-2 dark:border-border-dark shrink-0">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-sm text-content-primary-light dark:text-content-primary-dark">
                Schema Schema Metadata
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs text-content-secondary-light dark:text-content-secondary-dark max-h-56 overflow-y-auto pr-1">
              <div className="rounded-lg border border-border-light dark:border-border-dark p-3 bg-brand-light dark:bg-brand-dark">
                <p className="font-bold text-primary mb-1">users</p>
                <ul className="pl-3 space-y-0.5 list-disc text-[10px]">
                  <li>id (BIGINT, PK)</li>
                  <li>email (VARCHAR, Unique)</li>
                  <li>role (VARCHAR)</li>
                </ul>
              </div>

              <div className="rounded-lg border border-border-light dark:border-border-dark p-3 bg-brand-light dark:bg-brand-dark">
                <p className="font-bold text-primary mb-1">submissions</p>
                <ul className="pl-3 space-y-0.5 list-disc text-[10px]">
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

          {/* AI suggestion panel */}
          {reviewResult && (
            <Card className="p-4 space-y-3 border-2 border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 border-b border-border-light pb-2 dark:border-border-dark">
                <Layers className="h-4.5 w-4.5 text-primary" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-content-primary-light dark:text-content-primary-dark">AI Optimization Audit</h4>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div>
                  <p className="font-bold text-primary flex items-center gap-1">
                    <GitCompare className="h-3.5 w-3.5" /> Optimal Query Comparison:
                  </p>
                  <pre className="font-mono text-[9px] bg-[#1e1e1e] p-2 rounded text-[#d4d4d4] my-1 overflow-x-auto">
                    {reviewResult.optimalQuery || 'SELECT email FROM users;'}
                  </pre>
                </div>

                <div>
                  <p className="font-bold text-primary">Performance Advice:</p>
                  <p className="text-content-secondary-light dark:text-gray-300 font-sans mt-0.5">{reviewResult.optimizationAdvice || 'Consider adding indices on FK user_id.'}</p>
                </div>

                <div>
                  <p className="font-bold text-[#f59e0b] flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" /> Suggested Roadmap:
                  </p>
                  <p className="text-content-secondary-light dark:text-gray-300 font-sans mt-0.5">{reviewResult.learningRoadmap || 'Revise nested joins and SQL indexing schemas.'}</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right workspace: Prompt & Editor workbench */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full">
          {/* Prompt builder */}
          <Card className="p-4">
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
                className="flex-1 text-xs p-2.5 bg-brand-light border border-border-light dark:bg-brand-dark dark:border-border-dark text-content-primary-light dark:text-content-primary-dark rounded-xl focus:outline-none"
              />
              <Button
                type="submit"
                isLoading={loadingGenerate}
                variant="ai"
                className="text-xs py-2 px-3 shadow-glow-ai/20 flex items-center justify-center shrink-0"
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
                <p className="text-content-secondary-light dark:text-content-secondary-dark mt-1 font-sans">
                  <strong>Explanation:</strong> {generationResult.explanation}
                </p>
              </div>
            )}
          </Card>

          {/* Code Workbench */}
          <div className="flex-1 flex flex-col gap-4">
            <Card className="h-48 flex flex-col p-0 bg-[#1e1e1e] border-none shadow-md overflow-hidden shrink-0">
              <div className="flex h-9 items-center justify-between bg-[#2d2d2d] px-4 border-b border-[#3c3c3c]">
                <div className="flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-content-secondary-dark" />
                  <span className="text-xs font-mono text-content-secondary-dark">SQL Editor Workbench</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={handleFormatSql}
                    className="text-[10px] bg-[#3c3c3c] hover:bg-[#4c4c4c] px-2 py-0.5 rounded text-gray-300 font-mono transition-colors"
                  >
                    Format Query
                  </button>
                  <Badge variant="brand">Ready</Badge>
                </div>
              </div>
              <textarea
                value={editorSql}
                onKeyDown={handleKeyDown}
                onChange={(e) => setEditorSql(e.target.value)}
                className="flex-1 p-4 font-mono text-xs text-green-400 bg-[#1e1e1e] border-none resize-none focus:outline-none leading-relaxed overflow-y-auto"
              />
            </Card>

            <div className="flex gap-3 shrink-0">
              <Button
                onClick={handleExecuteSqlOnly}
                isLoading={loadingExecute}
                variant="secondary"
                className="flex-1 text-xs py-2 flex items-center justify-center gap-1"
              >
                <Play className="h-3.5 w-3.5" /> Run Query Only
              </Button>
              <Button
                onClick={handleReviewSql}
                isLoading={loadingReview}
                variant="primary"
                className="flex-1 text-xs py-2 flex items-center justify-center gap-1.5 shadow-glow-brand/10"
              >
                <Sparkles className="h-3.5 w-3.5" /> Submit & AI Audit
              </Button>
            </div>

            {/* Results Console */}
            <Card className="flex-1 flex flex-col p-4 overflow-hidden min-h-[220px]">
              <div className="flex justify-between items-center border-b border-border-light dark:border-border-dark pb-2 shrink-0">
                <div className="flex gap-4">
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
                    Debugger Output
                  </button>
                </div>

                {executionTime !== null && (
                  <span className="text-[10px] text-content-muted-light dark:text-gray-400 font-mono">
                    Speed: {executionTime}ms | Rows: {executeResult?.rowCount ?? 0}
                  </span>
                )}
              </div>

              <div className="flex-1 mt-3 overflow-y-auto">
                {loadingExecute ? (
                  <div className="flex items-center justify-center h-full py-6">
                    <span className="text-xs text-content-muted-light dark:text-content-muted-dark animate-pulse">Running query on database...</span>
                  </div>
                ) : consoleTab === 'results' ? (
                  !executeResult ? (
                    <div className="flex flex-col items-center justify-center h-full py-6 border border-dashed border-border-light dark:border-border-dark rounded-xl text-content-muted-light dark:text-content-muted-dark">
                      <HelpCircle className="h-5 w-5 mb-1 opacity-60" />
                      <p className="text-[10px]">Execute a valid SELECT statement to inspect data rows.</p>
                    </div>
                  ) : !executeResult.success ? (
                    <div className="p-3 bg-danger/10 border border-danger/25 text-danger rounded-xl text-xs leading-relaxed">
                      <p className="font-bold flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> Database Execution Failed
                      </p>
                      <p className="mt-1 font-sans">Check the "Debugger Output" tab for trace details.</p>
                    </div>
                  ) : executeResult.rowCount === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-6 border border-dashed border-border-light dark:border-border-dark rounded-xl text-content-muted-light dark:text-content-muted-dark">
                      <p className="text-xs font-bold font-mono">Empty Set (0 rows returned)</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-border-light dark:border-border-dark rounded-xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-brand-light dark:bg-brand-dark border-b border-border-light dark:border-border-dark">
                            {executeResult.columns.map((col, idx) => (
                              <th key={idx} className="p-2.5 font-mono font-bold text-primary border-r last:border-r-0 border-border-light dark:border-border-dark">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {executeResult.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-border-light dark:border-border-dark last:border-b-0 hover:bg-brand-light/50 dark:hover:bg-brand-dark/50">
                              {row.map((val, cIdx) => (
                                <td key={cIdx} className="p-2.5 font-mono border-r last:border-r-0 border-border-light dark:border-border-dark text-content-primary-light dark:text-content-primary-dark">{val}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  !executeResult ? (
                    <div className="flex flex-col items-center justify-center h-full py-6 border border-dashed border-border-light dark:border-border-dark rounded-xl text-content-muted-light dark:text-content-muted-dark">
                      <p className="text-[10px]">No execution logs. Run a query to inspect trace output.</p>
                    </div>
                  ) : executeResult.success ? (
                    <div className="p-3 bg-success/10 border border-success/25 text-success rounded-xl text-xs leading-relaxed font-mono">
                      <p className="font-bold">SQL Execution Passed successfully.</p>
                      <p className="mt-1">Row count: {executeResult.rowCount} rows fetched. Connection status: Active.</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-danger/10 border border-danger/25 text-danger rounded-xl text-xs leading-relaxed font-mono">
                      <p className="font-bold">Error Message Log:</p>
                      <p className="mt-1">{executeResult.errorMessage}</p>
                    </div>
                  )
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
