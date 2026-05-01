import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ResponseRenderer from '../components/ResponseRenderer';
import './Dashboard.css';

const LoadingDots = () => (
  <div className="loading-dots">
    {[0,1,2].map(i => (
      <motion.span
        key={i}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ask');
  const [selectedSource, setSelectedSource] = useState('auto');
  const textareaRef = useRef(null);
  const answerRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (currentAnswer && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentAnswer]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  }, [question]);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await axios.get('/history');
      setHistory(res.data.data);
    } catch (err) {
      console.error('Failed to fetch history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setCurrentAnswer(null);

    try {
      const payload = { question: question.trim() };
      if (selectedSource !== 'auto') payload.preferredSource = selectedSource;

      const res = await axios.post('/ask', payload);
      setCurrentAnswer(res.data.data);
      setQuestion('');

      // Refresh history
      fetchHistory();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to get AI response. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/history/${id}`);
      setHistory(prev => prev.filter(item => item._id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleHistoryClick = (item) => {
    setCurrentAnswer(item);
    setActiveTab('ask');
  };

  const suggestions = [
    'Explain async/await in JavaScript',
    'How does React useState work?',
    'What is MongoDB aggregation?',
    'Explain REST API design principles',
    'How does JWT authentication work?',
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="sidebar-name">{user?.name}</p>
              <p className="sidebar-email">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-section-title">Navigation</p>
          <button
            className={`sidebar-btn ${activeTab === 'ask' ? 'active' : ''}`}
            onClick={() => setActiveTab('ask')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Ask AI
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 0 .5-4.5"/>
              <polyline points="3 3 3 7 7 7"/>
            </svg>
            History
            {history.length > 0 && (
              <span className="history-count">{history.length}</span>
            )}
          </button>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-section-title">AI Source</p>
          {['auto', 'openai', 'huggingface', 'mock'].map(src => (
            <button
              key={src}
              className={`source-option ${selectedSource === src ? 'active' : ''}`}
              onClick={() => setSelectedSource(src)}
            >
              <span className={`source-dot ${src}`} />
              {src === 'auto' ? '⚡ Auto' : src === 'openai' ? '🤖 OpenAI' : src === 'huggingface' ? '🤗 HuggingFace' : '🧪 Mock / Demo'}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-main">
        {/* Ask Tab */}
        {activeTab === 'ask' && (
          <motion.div
            className="ask-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="ask-header">
              <h1 className="ask-title">Ask anything</h1>
              <p className="ask-sub">Get structured AI responses with code, examples, and explanations.</p>
            </div>

            {/* Question Form */}
            <form className="question-form" onSubmit={handleAsk}>
              <div className="question-box">
                <textarea
                  ref={textareaRef}
                  className="question-input"
                  placeholder="Ask a question... (e.g. How does async/await work in JavaScript?)"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAsk(e);
                    }
                  }}
                  rows={1}
                  maxLength={2000}
                  disabled={isLoading}
                />
                <div className="question-actions">
                  <span className="char-count">{question.length}/2000</span>
                  <motion.button
                    type="submit"
                    className="send-btn"
                    disabled={!question.trim() || isLoading}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {isLoading ? (
                      <div className="send-spinner" />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    )}
                  </motion.button>
                </div>
              </div>
              <p className="form-hint">Press Enter to send, Shift+Enter for new line</p>
            </form>

            {/* Suggestions */}
            {!currentAnswer && !isLoading && (
              <motion.div
                className="suggestions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <p className="suggestions-label">Try asking:</p>
                <div className="suggestions-grid">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      className="suggestion-chip"
                      onClick={() => setQuestion(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  className="loading-card card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="loading-header">
                    <div className="ai-badge">AI</div>
                    <span>Generating response...</span>
                  </div>
                  <LoadingDots />
                  <div className="loading-bars">
                    {[80,60,90,40,70].map((w, i) => (
                      <motion.div
                        key={i}
                        className="loading-bar"
                        style={{ width: `${w}%` }}
                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Answer */}
            <AnimatePresence>
              {currentAnswer && !isLoading && (
                <motion.div
                  ref={answerRef}
                  className="answer-card card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="answer-header">
                    <div className="question-display">
                      <div className="q-icon">Q</div>
                      <p className="q-text">{currentAnswer.question}</p>
                    </div>
                  </div>
                  <div className="answer-divider" />
                  <div className="answer-body">
                    <div className="a-icon">AI</div>
                    <div className="a-content">
                      <ResponseRenderer
                        response={currentAnswer.response}
                        source={currentAnswer.source}
                        animate={true}
                      />
                    </div>
                  </div>
                  <div className="answer-footer">
                    <span className="answer-time">
                      {new Date(currentAnswer.createdAt).toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div
            className="history-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="history-header">
              <h1 className="ask-title">Query History</h1>
              <p className="ask-sub">All your previous questions and AI answers.</p>
            </div>

            {historyLoading ? (
              <div className="history-loading">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="history-skeleton card">
                    <div className="skeleton-line long" />
                    <div className="skeleton-line medium" />
                    <div className="skeleton-line short" />
                  </div>
                ))}
              </div>
            ) : history.length === 0 ? (
              <motion.div
                className="empty-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="empty-icon">🔍</div>
                <h3>No history yet</h3>
                <p>Ask your first question to get started!</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('ask')}>
                  Ask AI →
                </button>
              </motion.div>
            ) : (
              <div className="history-list">
                {history.map((item, i) => (
                  <motion.div
                    key={item._id}
                    className="history-item card"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                  >
                    <div className="history-item-header">
                      <div className="history-q" onClick={() => handleHistoryClick(item)}>
                        <div className="q-icon small">Q</div>
                        <p className="history-question">{item.question}</p>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(item._id)}
                        title="Delete"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
                    <div className="history-preview">
                      {typeof item.response === 'object' && item.response?.raw
                        ? item.response.raw.slice(0, 180) + '...'
                        : String(item.response).slice(0, 180) + '...'}
                    </div>
                    <div className="history-meta">
                      <span className={`source-badge ${item.source}`}>
                        {item.source === 'mock' ? '🧪 Demo' : item.source === 'openai' ? '🤖 GPT' : item.source}
                      </span>
                      <span className="history-time">
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
