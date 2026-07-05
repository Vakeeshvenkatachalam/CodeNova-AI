import React, { useEffect, useState, useRef } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { chatService, Conversation, Message } from '../services/chatService';
import { CodeRenderer } from '../components/common/CodeRenderer';
import { Bot, User, Send, Plus, MessageSquare, AlertTriangle } from 'lucide-react';

export const ChatMentor: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [inputText, setInputText] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load all user conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when active conversation switches
  useEffect(() => {
    if (activeConvId !== null) {
      fetchMessages(activeConvId);
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sendingMessage]);

  const fetchConversations = async (selectNewId?: number) => {
    try {
      const list = await chatService.getConversations();
      setConversations(list);
      
      if (list.length > 0 && activeConvId === null) {
        // Select the first conversation by default
        setActiveConvId(selectNewId || list[0].id);
      }
    } catch (err) {
      console.error('Failed to load chats list:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchMessages = async (id: number) => {
    setLoadingMessages(true);
    setRateLimitError(false);
    try {
      const logs = await chatService.getMessages(id);
      setMessages(logs);
    } catch (err) {
      console.error('Failed to load message log:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleStartNewChat = async () => {
    setRateLimitError(false);
    try {
      const newConv = await chatService.createConversation();
      // Refresh list and select the new session
      await fetchConversations(newConv.id);
      setActiveConvId(newConv.id);
    } catch (err) {
      console.error('Failed to create new chat session:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || activeConvId === null || sendingMessage) return;

    const messageText = inputText;
    setInputText('');
    setSendingMessage(true);
    setRateLimitError(false);

    // Optimistically insert user message in view
    const tempUserMessage: Message = {
      id: Date.now(),
      sender: 'USER',
      content: messageText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const aiReply = await chatService.sendMessage(activeConvId, messageText);
      // Replace message list with real log from server to align logs correctly
      fetchMessages(activeConvId);
      // Refresh sidebar list to update titles and dates
      fetchConversations(activeConvId);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      if (err.response?.status === 429) {
        setRateLimitError(true);
      }
      // Re-fetch messages to discard optimistic message if failed
      fetchMessages(activeConvId);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-4 h-[calc(100vh-8.5rem)]">
      {/* Sidebar Conversation Logs */}
      <Card className="lg:col-span-1 flex flex-col p-4 h-full bg-surface-light border border-border-light dark:bg-surface-dark dark:border-border-dark overflow-hidden">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="font-bold text-content-primary-light dark:text-content-primary-dark">
            Conversations
          </h3>
          <button
            onClick={handleStartNewChat}
            className="flex items-center justify-center p-1.5 rounded-lg border border-border-light hover:bg-brand-light dark:border-border-dark dark:hover:bg-brand-dark text-primary transition-all duration-200"
            title="Start new chat"
          >
            <Plus className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loadingList ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="animate-pulse h-12 rounded-lg bg-brand-light dark:bg-brand-dark" />
            ))
          ) : conversations.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare className="h-8 w-8 text-content-muted-light dark:text-content-muted-dark mx-auto mb-2" />
              <p className="text-xs text-content-secondary-light dark:text-content-secondary-dark">No chats found.</p>
              <Button onClick={handleStartNewChat} variant="secondary" className="text-xs py-1.5 px-3 mt-3 w-full">
                New Chat
              </Button>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full flex items-center gap-2.5 rounded-lg p-3 text-left transition-all duration-150 ${
                  activeConvId === conv.id
                    ? 'bg-primary/10 border border-primary/20 text-primary'
                    : 'border border-transparent hover:bg-brand-light dark:hover:bg-brand-dark text-content-secondary-light dark:text-content-secondary-dark'
                }`}
              >
                <MessageSquare className="h-4.5 w-4.5 shrink-0" />
                <span className="text-xs font-semibold truncate flex-1">
                  {conv.title}
                </span>
              </button>
            ))
          )}
        </div>
      </Card>

      {/* Main Chat Workspace */}
      <div className="lg:col-span-3 flex flex-col h-full overflow-hidden">
        {/* Mentor Header */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-content-primary-light dark:text-content-primary-dark">
              AI Coding Mentor
            </h2>
            <p className="text-xs text-content-secondary-light dark:text-content-secondary-dark mt-0.5">
              Ask coding concepts, syntax reviews, or debugging directions.
            </p>
          </div>
          <Badge variant="ai">Gemini Flash Active</Badge>
        </div>

        {/* Message logs view */}
        <Card className="flex-1 overflow-y-auto space-y-4 bg-surface-light dark:bg-surface-dark p-4 border border-border-light dark:border-border-dark mb-3">
          {activeConvId === null ? (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <Bot className="h-12 w-12 text-content-muted-light dark:text-content-muted-dark mx-auto mb-3" />
                <p className="text-sm font-semibold text-content-secondary-light dark:text-content-secondary-dark">
                  Select or start a new conversation to chat with AI Mentor.
                </p>
              </div>
            </div>
          ) : loadingMessages ? (
            <div className="flex h-full items-center justify-center">
              <svg className="animate-spin h-7 w-7 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : messages.length === 0 ? (
            // Default Welcome Bubble
            <div className="flex gap-3 max-w-2xl">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ai/10 text-ai border border-ai/20 shadow-glow-ai/10">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div className="rounded-xl border border-ai/20 bg-ai/5 px-4 py-3 shadow-sm dark:bg-surface-dark dark:border-border-dark">
                <p className="text-sm text-content-primary-light dark:text-content-primary-dark">
                  Hello! I am your AI Coding Mentor. What concept or problem are we solving today? 
                  Ask me to explain tree traversals, review recursive logic, or point out syntax hints.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${msg.sender === 'USER' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Bubble avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                    msg.sender === 'USER'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-ai/10 text-ai border-ai/20 shadow-glow-ai/10'
                  }`}
                >
                  {msg.sender === 'USER' ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
                </div>

                {/* Bubble content */}
                <div
                  className={`rounded-xl px-4 py-3 shadow-sm ${
                    msg.sender === 'USER'
                      ? 'bg-primary text-white'
                      : 'border border-ai/20 bg-ai/5 dark:bg-surface-dark dark:border-border-dark'
                  }`}
                >
                  {msg.sender === 'USER' ? (
                    <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
                  ) : (
                    <CodeRenderer content={msg.content} />
                  )}
                </div>
              </div>
            ))
          )}

          {/* Typing Loading State */}
          {sendingMessage && (
            <div className="flex gap-3 max-w-2xl">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ai/10 text-ai border border-ai/20 animate-pulse">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div className="rounded-xl border border-ai/20 bg-ai/5 px-4 py-3 dark:bg-surface-dark dark:border-border-dark flex items-center gap-1">
                <div className="h-1.5 w-1.5 bg-ai rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-1.5 w-1.5 bg-ai rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-1.5 w-1.5 bg-ai rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Chat boundary anchor */}
          <div ref={chatEndRef} />
        </Card>

        {/* Input box form */}
        <form onSubmit={handleSendMessage} className="shrink-0 space-y-2">
          {rateLimitError && (
            <div className="flex items-center gap-2 rounded-lg bg-danger/10 border border-danger/20 p-2.5 text-xs text-danger">
              <AlertTriangle className="h-4 w-4 shrink-0 animate-bounce" />
              You have exceeded your message quota. Please wait a minute before replying.
            </div>
          )}

          <Card className="p-3">
            <div className="flex items-end gap-2.5">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={activeConvId === null || sendingMessage}
                placeholder={
                  activeConvId === null
                    ? 'Select a conversation first'
                    : 'Type a message... (Shift+Enter for newline)'
                }
                rows={1}
                className="flex-1 bg-brand-light dark:bg-brand-dark border border-border-light dark:border-border-dark rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-content-primary-light dark:text-content-primary-dark transition-all duration-200 resize-none max-h-32 disabled:opacity-50"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={!inputText.trim() || activeConvId === null || sendingMessage}
                className="flex items-center gap-1.5 py-2 px-4 text-xs h-[38px] shrink-0"
              >
                Send <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
};
