import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageCircle, HelpCircle, Loader, Bot, User, Plus, BookOpen } from 'lucide-react';
import { askAICoach, getGeminiApiKey } from '../lib/gemini';

const SAMPLE_QUESTIONS = [
  { text: "What is organic composting?", answer: "Composting is the natural process of recycling organic matter, such as leaves and food scraps, into a valuable fertilizer that can enrich soil and plants. It prevents anaerobic decay which creates methane in landfills." },
  { text: "How can I recycle old lithium batteries?", answer: "Never put lithium batteries in standard trash. They are fire hazards and leak heavy metals. Take them to designated battery drop-off bins at hardware stores, municipal collection bins, or certified e-waste facilities." },
  { text: "What are alternatives to single-use water bottles?", answer: "Choose reusable flasks made of food-grade stainless steel, copper, or thermal glass. If you must buy bottled water, choose aluminum cans over plastic, as metal has a much higher circular recycling efficiency." }
];

export default function Coach({ language, logs = [] }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'coach',
      text: "Hello! I am your SortiWise AI Sustainability Coach. I can help analyze your habits, answer complex material classification questions, or suggest eco-friendly lifestyle choices. What is on your mind?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    const appContainer = document.querySelector('.app-container');
    
    if (mainContent && appContainer) {
      const origMainOverflow = mainContent.style.overflow;
      const origMainHeight = mainContent.style.height;
      const origMainDisplay = mainContent.style.display;
      const origMainFlexDir = mainContent.style.flexDirection;
      const origMainFlex = mainContent.style.flex;
      
      const origAppHeight = appContainer.style.height;
      const origAppOverflow = appContainer.style.overflow;

      const handleLayout = () => {
        const isMobile = window.innerWidth <= 768;
        
        appContainer.style.height = '100vh';
        appContainer.style.overflow = 'hidden';

        mainContent.style.overflow = 'hidden';
        mainContent.style.display = 'flex';
        mainContent.style.flexDirection = 'column';
        
        if (isMobile) {
          mainContent.style.flex = '1';
          mainContent.style.height = 'auto';
        } else {
          mainContent.style.height = '100%';
          mainContent.style.flex = '1';
        }
      };

      window.addEventListener('resize', handleLayout);
      handleLayout();

      return () => {
        window.removeEventListener('resize', handleLayout);
        
        mainContent.style.overflow = origMainOverflow;
        mainContent.style.height = origMainHeight;
        mainContent.style.display = origMainDisplay;
        mainContent.style.flexDirection = origMainFlexDir;
        mainContent.style.flex = origMainFlex;

        appContainer.style.height = origAppHeight;
        appContainer.style.overflow = origAppOverflow;
      };
    }
  }, []);


  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    if (!textToSend) setInputValue('');

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);

    setLoading(true);

    try {
      // Check if user is asking a standard mock question offline
      const matchedSample = SAMPLE_QUESTIONS.find(q => text.toLowerCase().includes(q.text.toLowerCase()) || q.text.toLowerCase().includes(text.toLowerCase()));
      
      let replyText = '';
      const hasApiKey = getGeminiApiKey();

      if (matchedSample && !hasApiKey) {
        await new Promise(r => setTimeout(r, 800));
        replyText = matchedSample.answer;
      } else if (!hasApiKey) {
        await new Promise(r => setTimeout(r, 800));
        replyText = "I see your question! Since the Gemini API key is not configured, I'm running in offline help mode. Feel free to click one of the suggested questions below, or enter your Gemini API Key in Settings to chat with my advanced model.";
      } else {
        // Query Gemini API
        replyText = await askAICoach(messages.concat(userMsg), text, language);
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'coach',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      console.error(err);
      let friendlyError = "I ran into an issue connecting to the AI brain. Please review your settings or network connection.";
      if (err.message && (err.message.toLowerCase().includes('leaked') || err.message.includes('403') || err.message.toLowerCase().includes('api key'))) {
        friendlyError = "Gemini API Error: The API key was reported as leaked or is invalid. Please go to the Settings panel and configure a valid Gemini API key.";
      }
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'coach',
        text: friendlyError,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'coach',
        text: "Hello! I am your SortiWise AI Sustainability Coach. I can help analyze your habits, answer complex material classification questions, or suggest eco-friendly lifestyle choices. What is on your mind?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: '20px', flex: 1, height: '100%', width: '100%', minHeight: '450px' }}>
      
      {/* Left Sidebar - Chat History & Scans (ChatGPT Style) */}
      <div className="glass-card hide-mobile" style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '16px', flexShrink: 0, padding: '16px', height: '100%', overflowY: 'hidden' }}>
        
        {/* New Chat Button */}
        <button 
          onClick={handleNewChat}
          className="neon-glow-btn"
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600'
          }}
        >
          <Plus size={16} /> New Chat
        </button>

        {/* Recent Scans Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
              Recent Scanned Items
            </label>
            {logs && logs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {logs.slice(0, 5).map((log, idx) => (
                  <button
                    key={log.id || idx}
                    onClick={() => handleSendMessage(`Tell me more about recycling ${log.itemName} and its carbon footprint.`)}
                    className="secondary-btn"
                    style={{
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      padding: '8px 10px',
                      fontSize: '0.8rem',
                      borderRadius: '8px',
                      gap: '8px',
                      width: '100%',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block'
                    }}
                  >
                    <span style={{ marginRight: '6px' }}>♻️</span> {log.itemName}
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingInline: '4px' }}>
                No items scanned yet.
              </p>
            )}
          </div>

          {/* Quick AI Topics */}
          <div style={{ marginTop: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
              AI Quick Topics
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { title: 'Composting Guide', query: 'What is organic composting?' },
                { title: 'Battery Disposal', query: 'How can I recycle old lithium batteries?' },
                { title: 'Eco Water Bottles', query: 'What are alternatives to single-use water bottles?' }
              ].map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(topic.query)}
                  className="secondary-btn"
                  style={{
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    padding: '8px 10px',
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    gap: '8px',
                    width: '100%'
                  }}
                >
                  <BookOpen size={12} color="var(--accent)" style={{ marginRight: '6px', display: 'inline', verticalAlign: 'middle' }} />
                  <span style={{ verticalAlign: 'middle' }}>{topic.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Right Chat Assistant - Borderless wrapper to maximize display space */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', overflow: 'hidden' }}>
        
        {/* Compact Header (Glass Card) */}
        <div className="glass-card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ background: 'var(--accent-glow)', padding: '6px', borderRadius: '8px' }}>
            <Sparkles size={16} color="var(--accent)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>AI Sustainability Coach</h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Zero-shot green consultant</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.08)', padding: '4px 10px', borderRadius: '20px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--compostable)' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--compostable)' }}>Online</span>
          </div>
        </div>

        {/* Results Display Area (Occupies the entire center section) */}
        <div style={{ flex: '1 1 0%', minHeight: 0, overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, index) => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div 
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start'
                }}
              >
                {/* Avatar */}
                <div 
                  style={{ 
                    background: msg.sender === 'user' ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid var(--card-border)',
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    flexShrink: 0 
                  }}
                >
                  {msg.sender === 'user' ? <User size={16} color="#fff" /> : <Bot size={16} color="var(--accent)" />}
                </div>

                {/* Bubble & Time */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div 
                    style={{
                      background: msg.sender === 'user' ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.03)',
                      border: msg.sender === 'user' ? 'none' : '1px solid var(--card-border)',
                      color: msg.sender === 'user' ? '#fff' : 'var(--text-primary)',
                      padding: '10px 14px',
                      borderRadius: msg.sender === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                      fontSize: '0.88rem',
                      lineHeight: '1.45',
                      whiteSpace: 'pre-wrap',
                      boxShadow: msg.sender === 'user' ? '0 4px 12px rgba(13, 148, 136, 0.1)' : 'none'
                    }}
                  >
                    {msg.text}
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', marginInline: '4px' }}>
                    {msg.time}
                  </span>
                </div>
              </div>

              {/* Render suggestions right below the first message if it is the only message */}
              {index === 0 && messages.length === 1 && (
                <div style={{ paddingLeft: '44px', marginTop: '16px', animation: 'fadeIn 0.5s ease-out' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '10px' }}>
                    Frequently Asked Questions:
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    {SAMPLE_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q.text)}
                        className="glass-card interactive"
                        style={{
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          padding: '12px',
                          fontSize: '0.8rem',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.01)',
                          border: '1px solid var(--card-border)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <HelpCircle size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontWeight: '500', lineHeight: '1.35' }}>{q.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start', alignItems: 'flex-start' }}>
              <div 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid var(--card-border)',
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0 
                }}
              >
                <Bot size={16} color="var(--accent)" />
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', padding: '10px 14px', borderRadius: '4px 18px 18px 18px' }}>
                <Loader size={14} className="animate-float" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI is formulating response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Ask UI at the bottom (Standalone Glass Card docked at the bottom) */}
        <div className="glass-card" style={{ marginTop: 'auto', flexShrink: 0, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
          >
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: '10px', paddingInline: '12px' }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about carbon footprint, recycling codes, upcycling ideas..."
                disabled={loading}
                style={{ flex: 1, padding: '12px 4px', background: 'transparent', border: 'none', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
              />
            </div>
            <button type="submit" className="neon-glow-btn" style={{ padding: '12px 18px', borderRadius: '10px', height: '100%' }} disabled={loading}>
              <Send size={14} />
              <span style={{ fontSize: '0.82rem', fontWeight: '600' }} className="hide-mobile">Send</span>
            </button>
          </form>

          {/* Footer info tag */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            <span>Powered by Gemini AI</span>
            <span>•</span>
            <span>Offline support active</span>
          </div>
        </div>

      </div>

    </div>
  );
}
