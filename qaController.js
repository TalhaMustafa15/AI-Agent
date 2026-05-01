const { validationResult } = require('express-validator');
const QA = require('../models/QA');

// Smart response formatter - detects code, lists, structure
const formatResponse = (text) => {
  const sections = [];
  const lines = text.split('\n');
  let currentSection = null;
  let inCodeBlock = false;
  let codeContent = '';
  let codeLanguage = '';

  const flushSection = () => {
    if (currentSection) {
      sections.push(currentSection);
      currentSection = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block detection
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        flushSection();
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim() || 'plaintext';
        codeContent = '';
      } else {
        sections.push({ type: 'code', language: codeLanguage, content: codeContent.trim() });
        inCodeBlock = false;
        codeContent = '';
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      continue;
    }

    // Heading detection
    if (line.startsWith('# ')) {
      flushSection();
      sections.push({ type: 'heading', level: 1, content: line.slice(2).trim() });
      continue;
    }
    if (line.startsWith('## ')) {
      flushSection();
      sections.push({ type: 'heading', level: 2, content: line.slice(3).trim() });
      continue;
    }
    if (line.startsWith('### ')) {
      flushSection();
      sections.push({ type: 'heading', level: 3, content: line.slice(4).trim() });
      continue;
    }

    // Bullet point detection
    if (line.match(/^[-*•]\s+/) || line.match(/^\d+\.\s+/)) {
      if (!currentSection || currentSection.type !== 'list') {
        flushSection();
        currentSection = { type: 'list', items: [] };
      }
      currentSection.items.push(line.replace(/^[-*•\d.]\s+/, '').trim());
      continue;
    }

    // Bold/highlighted text
    if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      flushSection();
      sections.push({ type: 'highlight', content: line.slice(2, -2) });
      continue;
    }

    // Regular paragraph
    if (line.trim()) {
      if (!currentSection || currentSection.type !== 'paragraph') {
        flushSection();
        currentSection = { type: 'paragraph', content: '' };
      }
      currentSection.content += (currentSection.content ? ' ' : '') + line.trim();
    } else {
      if (currentSection?.type === 'list') {
        // keep collecting list items
      } else {
        flushSection();
      }
    }
  }

  flushSection();
  return sections;
};

// Mock AI responses for demo/fallback
const getMockResponse = (question) => {
  const q = question.toLowerCase();

  if (q.includes('javascript') || q.includes('js')) {
    return `# JavaScript Overview

JavaScript is a versatile, high-level programming language primarily used for web development. It enables interactive and dynamic content on websites.

## Key Features

- **Interpreted language** — runs directly in the browser
- **Event-driven** — responds to user interactions
- **Prototype-based** — object-oriented with flexible inheritance
- **First-class functions** — functions are treated as values

## Example Code

\`\`\`javascript
// Simple function example
const greet = (name) => {
  return \`Hello, \${name}! Welcome to JavaScript.\`;
};

console.log(greet('World')); // Hello, World!

// Async/Await example
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
\`\`\`

## Common Use Cases

- Frontend web development (React, Vue, Angular)
- Backend development (Node.js)
- Mobile apps (React Native)
- Desktop apps (Electron)`;
  }

  if (q.includes('react')) {
    return `# React.js

React is a JavaScript library for building user interfaces, developed by Meta (Facebook).

## Core Concepts

- **Components** — reusable UI building blocks
- **JSX** — JavaScript XML syntax for writing UI
- **State & Props** — data management within components
- **Hooks** — functions to use React features in functional components

## Example Component

\`\`\`jsx
import { useState, useEffect } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);

  return (
    <div className="counter">
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
};

export default Counter;
\`\`\`

## Why Use React?

- Virtual DOM for efficient updates
- Huge ecosystem and community
- Reusable component architecture
- Great developer experience with hot reload`;
  }

  if (q.includes('python')) {
    return `# Python Programming Language

Python is a high-level, interpreted programming language known for its simplicity and readability.

## Key Characteristics

- **Clean syntax** — reads like English
- **Dynamically typed** — no need to declare variable types
- **Multi-paradigm** — supports OOP, functional, procedural
- **Batteries included** — rich standard library

## Example Code

\`\`\`python
# List comprehension
squares = [x**2 for x in range(1, 11)]
print(squares)  # [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]

# Class definition
class Animal:
    def __init__(self, name, species):
        self.name = name
        self.species = species

    def speak(self):
        return f"{self.name} says hello!"

dog = Animal("Rex", "Dog")
print(dog.speak())  # Rex says hello!

# Async function
import asyncio

async def fetch_data():
    await asyncio.sleep(1)
    return {"status": "success", "data": [1, 2, 3]}
\`\`\`

## Popular Use Cases

- Data science & machine learning (NumPy, Pandas, TensorFlow)
- Web development (Django, FastAPI, Flask)
- Automation & scripting
- Scientific computing`;
  }

  if (q.includes('mongodb') || q.includes('database')) {
    return `# MongoDB Database

MongoDB is a NoSQL, document-oriented database that stores data in flexible, JSON-like documents called BSON.

## Key Concepts

- **Collections** — equivalent to SQL tables
- **Documents** — JSON-like records with flexible schema
- **Indexes** — improve query performance
- **Aggregation** — powerful data processing pipeline

## Mongoose Schema Example

\`\`\`javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Instance method
userSchema.methods.greet = function() {
  return \`Hello, \${this.name}!\`;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
\`\`\`

## Advantages over SQL

- Flexible schema design
- Horizontal scaling (sharding)
- Native JSON storage
- Great for unstructured or semi-structured data`;
  }

  // Default response
  return `# Answer to: "${question}"

Great question! Here's a comprehensive answer based on my knowledge.

## Overview

${question} is an important topic in modern technology and software development. Understanding it thoroughly can significantly improve your skills and capabilities.

## Key Points to Remember

- Always start with the fundamentals before diving into advanced concepts
- Practice consistently to reinforce your learning
- Refer to official documentation for the most accurate information
- Join communities and forums to learn from others' experiences

## Practical Steps

1. **Research** — Gather reliable information from multiple sources
2. **Understand** — Make sure you grasp the core concepts
3. **Practice** — Apply what you've learned in real projects
4. **Review** — Revisit and refine your understanding over time

## Additional Tips

For deeper learning on this topic, consider:

- Exploring online courses and tutorials
- Reading books and technical documentation
- Building small projects to apply concepts
- Contributing to open-source projects related to this topic

> 💡 **Pro Tip**: The best way to master any concept is to teach it to someone else — it solidifies your own understanding.

I hope this gives you a solid foundation. Feel free to ask more specific questions for deeper insights!`;
};

// Call OpenAI API
const callOpenAI = async (question) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Provide detailed, well-structured answers using markdown formatting. Include code examples when relevant, use bullet points for lists, and organize content with headers.'
        },
        { role: 'user', content: question }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return {
    text: data.choices[0].message.content,
    source: 'openai',
    tokens: data.usage?.total_tokens || 0
  };
};

// Call HuggingFace API
const callHuggingFace = async (question) => {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey || apiKey === 'your_huggingface_api_key_here') {
    throw new Error('HuggingFace API key not configured');
  }

  const response = await fetch(
    'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: question })
    }
  );

  if (!response.ok) throw new Error('HuggingFace API error');
  const data = await response.json();
  return {
    text: data[0]?.generated_text || 'No response generated',
    source: 'huggingface',
    tokens: 0
  };
};

// @desc    Ask AI a question
// @route   POST /api/ask
// @access  Private
const askQuestion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const { question, preferredSource } = req.body;
    let responseText, source, tokens = 0;

    // Try AI APIs in order, fall back to mock
    const sources = preferredSource
      ? [preferredSource, 'openai', 'huggingface', 'mock']
      : ['openai', 'huggingface', 'mock'];

    for (const src of sources) {
      try {
        if (src === 'openai') {
          const result = await callOpenAI(question);
          responseText = result.text;
          source = result.source;
          tokens = result.tokens;
          break;
        } else if (src === 'huggingface') {
          const result = await callHuggingFace(question);
          responseText = result.text;
          source = result.source;
          break;
        } else if (src === 'mock') {
          responseText = getMockResponse(question);
          source = 'mock';
          break;
        }
      } catch (apiError) {
        console.log(`${src} API failed, trying next... (${apiError.message})`);
        continue;
      }
    }

    // Parse the response into structured format
    const structuredResponse = formatResponse(responseText);

    // Save to DB
    const qa = await QA.create({
      userId: req.user._id,
      question,
      response: { raw: responseText, structured: structuredResponse },
      source,
      tokens
    });

    res.status(200).json({
      success: true,
      data: {
        id: qa._id,
        question: qa.question,
        response: qa.response,
        source: qa.source,
        createdAt: qa.createdAt
      }
    });
  } catch (error) {
    console.error('Ask question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process your question. Please try again.'
    });
  }
};

// @desc    Get user's Q&A history
// @route   GET /api/history
// @access  Private
const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      QA.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('question response source createdAt'),
      QA.countDocuments({ userId: req.user._id })
    ]);

    res.status(200).json({
      success: true,
      data: history,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: history.length,
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
};

// @desc    Delete a Q&A entry
// @route   DELETE /api/history/:id
// @access  Private
const deleteHistory = async (req, res) => {
  try {
    const qa = await QA.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!qa) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete record' });
  }
};

module.exports = { askQuestion, getHistory, deleteHistory };
