import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { codeAnalysisService, ExplanationBlock, ComplexityResponse } from '../services/codeAnalysisService';
import { debugService, DebugResponse } from '../services/debugService';
import { chatService } from '../services/chatService';
import { CodeRenderer } from '../components/common/CodeRenderer';
import {
  Terminal, Settings, Play, Sparkles, AlertCircle, RefreshCw, Cpu,
  Code2, CheckCircle, TerminalSquare, MessageSquareCode, GitCompare, BookOpen, HelpCircle
} from 'lucide-react';

export const CodeWorkspace: React.FC = () => {
  const [code, setCode] = useState(() => {
    return localStorage.getItem('workspace_code') || 
      `public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        for (int i = 0; i < nums.length; i++) {\n            for (int j = i + 1; j < nums.length; j++) {\n                if (nums[i] + nums[j] == target) {\n                    return new int[] { i, j };\n                }\n            }\n        }\n        return new int[] {};\n    }\n}`;
  });
  const [language, setLanguage] = useState(() => localStorage.getItem('workspace_language') || 'Java');
  const [activeTab, setActiveTab] = useState<any>(() => localStorage.getItem('workspace_active_tab') || 'analysis');
  const [errorMessage, setErrorMessage] = useState(() => localStorage.getItem('workspace_error_message') || 'java.lang.ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 5');
  
  // Terminal logs simulation
  const [terminalLogs, setTerminalLogs] = useState<string[]>(() => {
    const saved = localStorage.getItem('workspace_terminal_logs');
    return saved ? JSON.parse(saved) : [
      'Welcome to CodeNova AI Cloud IDE v1.0.0',
      'System ready. Select a language and click "Run Code" to compile.'
    ];
  });

  // Loading flags
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [loadingComplexity, setLoadingComplexity] = useState(false);
  const [loadingDebug, setLoadingDebug] = useState(false);
  const [loadingAutocomplete, setLoadingAutocomplete] = useState(false);

  // Response storage
  const [explainResult, setExplainResult] = useState<ExplanationBlock[]>(() => {
    const saved = localStorage.getItem('workspace_explain_result');
    return saved ? JSON.parse(saved) : [];
  });
  const [complexityResult, setComplexityResult] = useState<ComplexityResponse | null>(() => {
    const saved = localStorage.getItem('workspace_complexity_result');
    return saved ? JSON.parse(saved) : null;
  });
  const [debugResult, setDebugResult] = useState<DebugResponse | null>(() => {
    const saved = localStorage.getItem('workspace_debug_result');
    return saved ? JSON.parse(saved) : null;
  });
  const [nextLineText, setNextLineText] = useState(() => localStorage.getItem('workspace_next_line_text') || '');
  
  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'mentor'; text: string }[]>(() => {
    const saved = localStorage.getItem('workspace_chat_messages');
    return saved ? JSON.parse(saved) : [
      { sender: 'mentor', text: 'Hi! I am your AI Coding Mentor. Ask me any conceptual questions about your code, debugging paths, or design patterns.' }
    ];
  });

  const [workspaceConvId, setWorkspaceConvId] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Persist state in localStorage on changes
  useEffect(() => {
    localStorage.setItem('workspace_code', code);
  }, [code]);

  useEffect(() => {
    localStorage.setItem('workspace_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('workspace_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('workspace_error_message', errorMessage);
  }, [errorMessage]);

  useEffect(() => {
    localStorage.setItem('workspace_terminal_logs', JSON.stringify(terminalLogs));
  }, [terminalLogs]);

  useEffect(() => {
    localStorage.setItem('workspace_explain_result', JSON.stringify(explainResult));
  }, [explainResult]);

  useEffect(() => {
    localStorage.setItem('workspace_complexity_result', JSON.stringify(complexityResult));
  }, [complexityResult]);

  useEffect(() => {
    localStorage.setItem('workspace_debug_result', JSON.stringify(debugResult));
  }, [debugResult]);

  useEffect(() => {
    localStorage.setItem('workspace_next_line_text', nextLineText);
  }, [nextLineText]);

  useEffect(() => {
    localStorage.setItem('workspace_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Load workspace state from localStorage on mount
  useEffect(() => {
    try {
      const savedCode = localStorage.getItem('workspace_code');
      if (savedCode) setCode(savedCode);

      const savedLanguage = localStorage.getItem('workspace_language');
      if (savedLanguage) setLanguage(savedLanguage);

      const savedActiveTab = localStorage.getItem('workspace_active_tab');
      if (savedActiveTab) setActiveTab(savedActiveTab as any);

      const savedExplain = localStorage.getItem('workspace_explain_result');
      if (savedExplain) setExplainResult(JSON.parse(savedExplain));

      const savedComplexity = localStorage.getItem('workspace_complexity_result');
      if (savedComplexity) setComplexityResult(JSON.parse(savedComplexity));

      const savedDebug = localStorage.getItem('workspace_debug_result');
      if (savedDebug) setDebugResult(JSON.parse(savedDebug));

      const savedNextLine = localStorage.getItem('workspace_next_line_text');
      if (savedNextLine) setNextLineText(savedNextLine);

      const savedLogs = localStorage.getItem('workspace_terminal_logs');
      if (savedLogs) setTerminalLogs(JSON.parse(savedLogs));

      const savedChat = localStorage.getItem('workspace_chat_messages');
      if (savedChat) setChatMessages(JSON.parse(savedChat));
    } catch (e) {
      console.error('Error loading workspace state from localStorage:', e);
    }
  }, []);

  // Initialize workspace conversation session on mount
  useEffect(() => {
    const initWorkspaceChat = async () => {
      try {
        const list = await chatService.getConversations();
        let workspaceConv = list.find(c => c.title === 'Code Workspace Chat');
        if (!workspaceConv) {
          workspaceConv = await chatService.createConversation();
        }
        setWorkspaceConvId(workspaceConv.id);
        
        // Fetch messages to restore history if not cached locally
        const savedMessages = localStorage.getItem('workspace_chat_messages');
        if (!savedMessages) {
          const logs = await chatService.getMessages(workspaceConv.id);
          if (logs.length > 0) {
            const mapped: Array<{ sender: 'user' | 'mentor'; text: string }> = logs.map(msg => ({
              sender: (msg.sender === 'USER' ? 'user' : 'mentor') as 'user' | 'mentor',
              text: msg.content.startsWith('[Context:') 
                ? msg.content.substring(msg.content.indexOf(']\n\n') + 3)
                : msg.content
            }));
            setChatMessages(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to initialize workspace chat session:', err);
      }
    };
    initWorkspaceChat();
  }, []);

  // Professional IDE Smart Indentation & Auto Bracket Closures Handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    const closingPairs: Record<string, string> = {
      '{': '}',
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
        setCode(newValue);
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
      setCode(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
      return;
    }

    // 3. Enter: Auto-indentation and Brace Splitting
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
      const isBraceSplit = (charBefore === '{' && charAfter === '}') ||
                          (charBefore === '(' && charAfter === ')') ||
                          (charBefore === '[' && charAfter === ']');

      let newValue = '';
      let newCursorPos = 0;

      if (isBraceSplit) {
        const nestedIndent = currentIndent + '    ';
        newValue = beforeCursor + '\n' + nestedIndent + '\n' + currentIndent + afterCursor;
        newCursorPos = start + 1 + nestedIndent.length;
      } else {
        let extraIndent = '';
        const trimmedLine = currentLine.trim();
        if (trimmedLine.endsWith('{') || trimmedLine.endsWith('(') || trimmedLine.endsWith('[') || trimmedLine.endsWith(':')) {
          extraIndent = '    ';
        }
        newValue = beforeCursor + '\n' + currentIndent + extraIndent + afterCursor;
        newCursorPos = start + 1 + currentIndent.length + extraIndent.length;
      }

      setCode(newValue);
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
        setCode(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start - 1;
        }, 0);
        return;
      }
    }

    // 5. Overwrite matching closing characters
    if (closingPairs[e.key] !== undefined || e.key === '}' || e.key === ')' || e.key === ']') {
      const charAfter = value.charAt(start);
      if (e.key === charAfter && (e.key === '}' || e.key === ')' || e.key === ']' || e.key === '"' || e.key === "'")) {
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
      setCode(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
      return;
    }
  };

  const handleAutocomplete = async () => {
    setLoadingAutocomplete(true);
    try {
      const data = await codeAnalysisService.autocomplete(code, language);
      if (data.suggestion) {
        setNextLineText(data.suggestion);
        setActiveTab('nextline');
      }
    } catch (err) {
      console.error('Autocomplete failed:', err);
    } finally {
      setLoadingAutocomplete(false);
    }
  };

  const handleApplyNextLine = () => {
    if (!nextLineText) return;
    setCode(prev => prev.trim() + '\n' + nextLineText);
    setNextLineText('');
  };

  const handleExplain = async () => {
    setLoadingExplain(true);
    try {
      const data = await codeAnalysisService.explainCode(code, language);
      setExplainResult(data.explanations);
      setActiveTab('analysis');
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
      setActiveTab('complexity');
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
      setActiveTab('debug');
    } catch (err) {
      console.error('Debug analysis failed:', err);
    } finally {
      setLoadingDebug(false);
    }
  };

  const handleRunCode = async () => {
    const ext = language === 'Java' ? 'java' : language === 'JavaScript' ? 'js' : 'py';
    const timestamp = new Date().toLocaleTimeString();
    
    setTerminalLogs(prev => [
      ...prev,
      `[${timestamp}] Compiling and executing Solution.${ext}...`
    ]);

    try {
      const res = await codeAnalysisService.runCode(code, language);
      const logsToAdd: string[] = [];
      
      if (res.exitCode === 0) {
        logsToAdd.push(`✔ Execution successful (Time: ${res.executionTimeMs}ms).`);
      } else {
        logsToAdd.push(`❌ Execution failed with exit code ${res.exitCode} (Time: ${res.executionTimeMs}ms).`);
      }
      
      if (res.stdout && res.stdout.trim()) {
        logsToAdd.push(`stdout:\n${res.stdout.trim()}`);
      }
      if (res.stderr && res.stderr.trim()) {
        logsToAdd.push(`stderr:\n${res.stderr.trim()}`);
      }
      
      setTerminalLogs(prev => [...prev, ...logsToAdd]);
    } catch (err: any) {
      console.error('Code execution failed:', err);
      setTerminalLogs(prev => [
        ...prev,
        `❌ Connection failure running compiler: ${err.message || 'API endpoint unreachable'}`
      ]);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || workspaceConvId === null) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);

    try {
      const fullPrompt = `[Context: Current language is ${language}. Code in editor:\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\`]\n\nUser Question: ${userMsg}`;
      const aiReply = await chatService.sendMessage(workspaceConvId, fullPrompt);
      setChatMessages(prev => [
        ...prev,
        { sender: 'mentor', text: aiReply.content }
      ]);
    } catch (err) {
      console.error('Failed to send workspace chat message:', err);
      setChatMessages(prev => [
        ...prev,
        { sender: 'mentor', text: 'Sorry, I failed to process your request. Please check your OpenRouter connection.' }
      ]);
    }
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-4">
      {/* Editor Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-content-primary-light dark:text-content-primary-dark">
            AI Cloud IDE Workspace
          </h2>
          <p className="text-xs text-content-secondary-light dark:text-content-secondary-dark mt-0.5">
            Full-featured cloud editor workspace with smart auto-indentation and failover fallbacks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-surface-light border border-border-light text-content-primary-light dark:bg-surface-dark dark:border-border-dark dark:text-content-primary-dark text-xs rounded-xl py-1.5 px-3 focus:outline-none"
          >
            <option>Java</option>
            <option>JavaScript</option>
            <option>Python</option>
          </select>
          <Button
            onClick={handleExplain}
            isLoading={loadingExplain}
            variant="secondary"
            className="text-xs py-1.5 px-3 flex items-center gap-1"
          >
            <BookOpen className="h-3.5 w-3.5" /> Explain Code
          </Button>
          <Button
            onClick={handleAutocomplete}
            isLoading={loadingAutocomplete}
            variant="ai"
            className="flex items-center gap-1 py-1.5 px-3 text-xs shadow-glow-ai/10"
          >
            <Sparkles className="h-3.5 w-3.5" /> Suggest Next Line
          </Button>
        </div>
      </div>

      {/* Grid splits Editor and AI sidebar */}
      <div className="grid gap-6 lg:grid-cols-5 h-[calc(100vh-14rem)] items-stretch">
        
        {/* Left column: Editor & Console Terminal */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden">
          
          {/* Custom Editor Panel */}
          <Card className="flex-1 flex flex-col p-0 overflow-hidden bg-[#1e1e1e] border-none shadow-xl rounded-2xl relative">
            <div className="flex h-10 w-full items-center justify-between bg-[#2d2d2d] px-4 border-b border-[#3c3c3c] shrink-0">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" />
                <span className="text-xs font-mono font-semibold text-content-secondary-dark">
                  Solution.{language === 'Java' ? 'java' : language === 'JavaScript' ? 'js' : 'py'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRunCode} className="text-[10px] py-0.5 px-2 bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-600/20">
                  <Play className="h-3 w-3" /> Run Code
                </Button>
                <Settings className="h-4 w-4 text-content-muted-dark self-center" />
              </div>
            </div>

            {/* Custom textarea editor overlaying numbers */}
            <div className="flex-1 flex overflow-hidden">
              <div className="w-10 bg-[#1e1e1e] select-none text-right pr-2 text-[#858585] font-mono text-[10px] leading-relaxed pt-4 border-r border-[#2d2d2d]">
                {lineNumbers.map(n => <div key={n}>{n}</div>)}
              </div>
              <textarea
                ref={textareaRef}
                value={code}
                onKeyDown={handleKeyDown}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 p-4 font-mono text-xs text-green-400 bg-[#1e1e1e] border-none resize-none focus:outline-none focus:ring-0 leading-relaxed overflow-y-auto"
                style={{ tabSize: 4 }}
              />
            </div>
          </Card>

          {/* Modern Console Terminal */}
          <div className="h-44 bg-[#121212] border border-[#2d2d2d] p-4 rounded-2xl flex flex-col overflow-hidden shrink-0 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#2d2d2d] pb-2 mb-2 shrink-0">
              <span className="text-[10px] font-mono font-bold text-primary flex items-center gap-1">
                <TerminalSquare className="h-3.5 w-3.5 text-primary" /> Output Logs Terminal
              </span>
              <button 
                onClick={() => setTerminalLogs([])} 
                className="text-[9px] text-gray-500 font-mono hover:text-gray-300 transition-colors"
              >
                Clear Logs
              </button>
            </div>
            <div className="flex-1 overflow-y-auto font-mono text-[10px] text-gray-200 space-y-1.5 pr-1 whitespace-pre-line">
              {terminalLogs.map((log, idx) => (
                <div 
                  key={idx} 
                  className={
                    log.startsWith('✔') || log.includes('successful') 
                      ? 'text-emerald-400 font-semibold' 
                      : log.startsWith('❌') || log.includes('failed') || log.startsWith('stderr:') 
                      ? 'text-rose-400 font-semibold' 
                      : log.includes('Compiling') 
                      ? 'text-sky-400' 
                      : 'text-gray-300'
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: AI Companion Sidebar */}
        <Card className="lg:col-span-2 flex flex-col p-4 overflow-hidden h-full rounded-2xl">
          {/* Tab buttons */}
          <div className="flex border-b border-border-light dark:border-border-dark pb-2.5 gap-1 shrink-0 overflow-x-auto">
            {[
              { id: 'analysis', label: 'Explainer' },
              { id: 'complexity', label: 'Big-O' },
              { id: 'nextline', label: 'Next Line' },
              { id: 'debug', label: 'Debugger' },
              { id: 'chat', label: 'Mentor Chat' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-[10px] font-bold font-sans py-1.5 px-2.5 rounded-lg transition-all duration-200 shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-primary/15 text-primary'
                    : 'text-content-secondary-light hover:bg-brand-light dark:text-content-secondary-dark dark:hover:bg-brand-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sidebar Tab Content */}
          <div className="flex-1 mt-4 overflow-y-auto space-y-4 pr-1">
            
            {activeTab === 'analysis' && (
              <div className="space-y-4">
                <Badge variant="ai" className="flex items-center gap-1 w-fit">
                  <Sparkles className="h-3 w-3" /> Line-by-Line Explainer
                </Badge>
                {explainResult.length === 0 ? (
                  <p className="text-xs text-content-muted-light dark:text-gray-400 text-center py-10 border border-dashed border-border-light dark:border-border-dark rounded-xl">
                    Click "Explain Code" on the top right to analyze every block of code.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {explainResult.map((exp, idx) => (
                      <div key={idx} className="rounded-xl border border-border-light dark:border-border-dark p-3 bg-brand-light dark:bg-brand-dark text-xs">
                        <pre className="font-mono text-[9px] text-[#d4d4d4] overflow-x-auto bg-[#1e1e1e] p-2 rounded-lg mb-1.5">
                          {exp.block}
                        </pre>
                        <CodeRenderer content={exp.explanation} />
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
                    <Cpu className="h-3 w-3" /> Big-O Complexity
                  </Badge>
                  <Button onClick={handleComplexity} isLoading={loadingComplexity} variant="secondary" className="text-[10px] py-1 px-2.5">
                    Analyze Complexities
                  </Button>
                </div>
                {!complexityResult ? (
                  <p className="text-xs text-content-muted-light dark:text-gray-400 text-center py-10 border border-dashed border-border-light dark:border-border-dark rounded-xl">
                    Request complexity audit to trace Big-O bounds.
                  </p>
                ) : (
                  <div className="rounded-xl border border-border-light dark:border-border-dark p-3 bg-brand-light dark:bg-brand-dark space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                        <p className="text-[10px] uppercase font-bold text-content-muted-light dark:text-gray-400">Time</p>
                        <p className="text-sm font-mono font-bold text-primary">{complexityResult.timeComplexity}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-ai/10 border border-ai/20">
                        <p className="text-[10px] uppercase font-bold text-content-muted-light dark:text-gray-400">Space</p>
                        <p className="text-sm font-mono font-bold text-ai">{complexityResult.spaceComplexity}</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-content-primary-light dark:text-content-primary-dark">Explanation justification:</p>
                      <p className="text-content-secondary-light dark:text-gray-300 mt-1 leading-relaxed whitespace-pre-line font-sans">
                        {complexityResult.justification}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'nextline' && (
              <div className="space-y-4 text-xs">
                <Badge variant="brand" className="flex items-center gap-1 w-fit">
                  <Sparkles className="h-3 w-3" /> Next Line recommendation
                </Badge>
                {loadingAutocomplete ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <RefreshCw className="h-5 w-5 animate-spin text-primary mb-2" />
                    <p className="text-content-secondary-light dark:text-gray-400">Loading next line suggestion...</p>
                  </div>
                ) : !nextLineText ? (
                  <p className="text-content-muted-light dark:text-gray-400 text-center py-10 border border-dashed border-border-light dark:border-border-dark rounded-xl">
                    Click "Suggest Next Line" on the top control panel to populate assistant codes.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-[#1e1e1e] p-3 rounded-xl border border-gray-800 font-mono text-[#d4d4d4] overflow-x-auto">
                      <pre>{nextLineText}</pre>
                    </div>
                    <Button onClick={handleApplyNextLine} variant="primary" className="w-full text-[10px] py-1.5">
                      Apply suggestion to editor
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'debug' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Badge variant="danger" className="flex items-center gap-1 w-fit">
                    <AlertCircle className="h-3 w-3" /> AI Debugger Console
                  </Badge>
                  <Button onClick={handleDebug} isLoading={loadingDebug} variant="secondary" className="text-[10px] py-1 px-2.5">
                    Diagnose Bugs
                  </Button>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary-light dark:text-gray-400">
                    Paste Traceback logs
                  </label>
                  <textarea
                    value={errorMessage}
                    onChange={(e) => setErrorMessage(e.target.value)}
                    rows={2}
                    className="w-full text-xs font-mono p-2.5 border border-border-light rounded-xl bg-brand-light dark:bg-brand-dark dark:border-border-dark text-content-primary-light dark:text-content-primary-dark resize-none focus:outline-none"
                  />
                </div>
                {!debugResult ? (
                  <p className="text-xs text-content-muted-light dark:text-gray-400 text-center py-10 border border-dashed border-border-light dark:border-border-dark rounded-xl">
                    Click "Diagnose Bugs" to analyze current traceback.
                  </p>
                ) : (
                  <div className="rounded-xl border border-border-light dark:border-border-dark p-3 bg-brand-light dark:bg-brand-dark space-y-3 text-xs">
                    <div>
                      <p className="font-bold text-danger">Root Cause:</p>
                      <p className="text-content-secondary-light dark:text-gray-300 mt-0.5 leading-relaxed font-sans whitespace-pre-line">{debugResult.rootCause}</p>
                    </div>
                    <div>
                      <p className="font-bold text-success">Fix Suggestions:</p>
                      <p className="text-content-secondary-light dark:text-gray-300 mt-0.5 leading-relaxed font-sans whitespace-pre-line">{debugResult.fixReasoning}</p>
                    </div>
                    {debugResult.suggestedCode && (
                      <div className="space-y-2">
                        <pre className="font-mono text-[9px] text-[#d4d4d4] overflow-x-auto bg-[#1e1e1e] p-2.5 rounded-lg border border-gray-800">
                          {debugResult.suggestedCode}
                        </pre>
                        <Button onClick={() => setCode(debugResult.suggestedCode)} variant="secondary" className="w-full text-[10px] py-1.5 flex items-center justify-center gap-1">
                          <RefreshCw className="h-3.5 w-3.5" /> Apply Code Patch
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex flex-col h-[calc(100vh-22rem)] overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 text-xs">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`p-2.5 rounded-xl max-w-[85%] font-sans leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white ml-auto'
                        : 'bg-brand-light dark:bg-brand-dark border border-border-light dark:border-border-dark text-content-secondary-light dark:text-gray-300 mr-auto'
                    }`}>
                      {msg.sender === 'user' ? (
                        <p className="whitespace-pre-line">{msg.text}</p>
                      ) : (
                        <CodeRenderer content={msg.text} />
                      )}
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendChatMessage} className="flex gap-2 border-t border-border-light dark:border-border-dark pt-3 shrink-0">
                  <input
                    type="text"
                    required
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about arrays or complexity..."
                    className="flex-1 text-xs p-2 bg-brand-light border border-border-light dark:bg-brand-dark dark:border-border-dark text-content-primary-light dark:text-content-primary-dark rounded-xl focus:outline-none"
                  />
                  <Button type="submit" variant="primary" className="text-xs px-3">Send</Button>
                </form>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
