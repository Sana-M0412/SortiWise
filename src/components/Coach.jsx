import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageCircle, HelpCircle, Loader } from 'lucide-react';
import { askAICoach } from '../lib/gemini';

const SAMPLE_QUESTIONS = [
  { text: "What is organic composting?", answer: "Composting is the natural process of recycling organic matter, such as leaves and food scraps, into a valuable fertilizer that can enrich soil and plants. It prevents anaerobic decay which creates methane in landfills." },
  { text: "How can I recycle old lithium batteries?", answer: "Never put lithium batteries in standard trash. They are fire hazards and leak heavy metals. Take them to designated battery drop-off bins at hardware stores, municipal collection bins, or certified e-waste facilities." },
  { text: "What are alternatives to single-use water bottles?", answer: "Choose reusable flasks made of food-grade stainless steel, copper, or thermal glass. If you must buy bottled water, choose aluminum cans over plastic, as metal has a much higher circular recycling efficiency." }
];

export default function Coach({ language }) {
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
      const hasApiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('sortiwise_gemini_key');

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
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'coach',
        text: "I ran into an issue connecting to the AI brain. Please review your settings or network connection.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', height: '100%', minHeight: '500px' }}>
      
      {/* Suggestions panel */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }} className="gradient-text">
          Sustainability Coach
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Learn about carbon metrics, proper landfill diversion, and smart upcycling ideas from your personal AI consultant.
        </p>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>
            Frequently Asked Questions:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {SAMPLE_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q.text)}
                className="secondary-btn"
                style={{ textAlign: 'left', justifyContent: 'flex-start', padding: '10px 14px', fontSize: '0.82rem', borderRadius: '8px', gap: '8px' }}
              >
                <HelpCircle size={14} color="var(--accent)" style={{ flexShrink: 0 }} /> {q.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Terminal panel */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '500px', padding: '16px' }}>
        
        {/* Terminal Header */}
        <div style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageCircle size={18} color="var(--accent)" />
          <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>AI Consultant Terminal</span>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--compostable)', marginLeft: 'auto' }} />
        </div>

        {/* Message Logs */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBlock: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map(msg => (
            <div 
              key={msg.id}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div 
                style={{
                  background: msg.sender === 'user' ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.03)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--card-border)',
                  color: msg.sender === 'user' ? '#fff' : 'var(--text-primary)',
                  padding: '10px 14px',
                  borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  fontSize: '0.88rem',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {msg.text}
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {msg.time}
              </span>
            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '6px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '12px' }}>
              <Loader size={14} className="animate-float" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI is formulating response...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Text Input Footer */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--card-border)', paddingTop: '12px' }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about carbon, reuse tips, or green lifestyle..."
            disabled={loading}
            style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', color: '#fff', fontSize: '0.9rem' }}
          />
          <button type="submit" className="neon-glow-btn" style={{ padding: '10px 16px' }} disabled={loading}>
            <Send size={16} />
          </button>
        </form>

      </div>

    </div>
  );
}
