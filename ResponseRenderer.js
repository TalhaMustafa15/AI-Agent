import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ResponseRenderer.css';

const TypingText = ({ text, speed = 15, onComplete }) => {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return <span>{displayed}<span className="typing-cursor">|</span></span>;
};

const CodeBlock = ({ language, content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-lang">{language || 'code'}</span>
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
          ) : (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'javascript'}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: '0 0 10px 10px',
          fontSize: '13px',
          lineHeight: '1.7',
          padding: '16px 20px',
          background: '#0d1117',
        }}
        showLineNumbers={content.split('\n').length > 4}
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
};

const ResponseRenderer = ({ response, animate = true, source }) => {
  const [typingDone, setTypingDone] = useState(!animate);

  const sections = response?.structured || [];

  if (!sections.length && response?.raw) {
    return (
      <div className="response-raw">
        {animate && !typingDone ? (
          <TypingText text={response.raw} onComplete={() => setTypingDone(true)} />
        ) : (
          <p>{response.raw}</p>
        )}
      </div>
    );
  }

  return (
    <div className="response-content">
      {source && (
        <div className="response-meta">
          <span className={`source-badge ${source}`}>
            {source === 'openai' && '🤖 GPT'}
            {source === 'huggingface' && '🤗 HuggingFace'}
            {source === 'mock' && '🧪 Demo AI'}
            {source === 'claude' && '🧠 Claude'}
          </span>
        </div>
      )}

      {sections.map((section, idx) => (
        <motion.div
          key={idx}
          initial={animate ? { opacity: 0, y: 8 } : {}}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: animate ? idx * 0.06 : 0 }}
        >
          {section.type === 'heading' && (
            <div className={`res-heading level-${section.level}`}>
              {section.content}
            </div>
          )}

          {section.type === 'paragraph' && (
            <p className="res-paragraph">
              {animate && idx === 0 && !typingDone ? (
                <TypingText
                  text={section.content}
                  speed={8}
                  onComplete={() => setTypingDone(true)}
                />
              ) : (
                section.content
              )}
            </p>
          )}

          {section.type === 'list' && (
            <ul className="res-list">
              {section.items.map((item, i) => (
                <motion.li
                  key={i}
                  className="res-list-item"
                  initial={animate ? { opacity: 0, x: -10 } : {}}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: animate ? (idx * 0.06) + (i * 0.04) : 0 }}
                >
                  <span className="list-dot" />
                  {item}
                </motion.li>
              ))}
            </ul>
          )}

          {section.type === 'code' && (
            <CodeBlock language={section.language} content={section.content} />
          )}

          {section.type === 'highlight' && (
            <div className="res-highlight">
              <span className="highlight-icon">💡</span>
              {section.content}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default ResponseRenderer;
