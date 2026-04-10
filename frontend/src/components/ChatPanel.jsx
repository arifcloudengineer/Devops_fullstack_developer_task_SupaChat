import { useState, useRef, useEffect } from 'react'

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className="animate-in" style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 16,
      gap: 8,
      alignItems: 'flex-start'
    }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: 6, flexShrink: 0, marginTop: 2,
          background: 'linear-gradient(135deg, var(--accent2), var(--accent3))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)'
        }}>AI</div>
      )}
      <div style={{
        maxWidth: '78%',
        background: isUser ? 'var(--accent2)' : 'var(--bg3)',
        border: `1px solid ${isUser ? 'transparent' : 'var(--border)'}`,
        borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
        padding: '10px 14px',
        color: isUser ? '#fff' : (msg.isError ? 'var(--error)' : 'var(--text)'),
        fontSize: 13,
        lineHeight: 1.6
      }}>
        <p>{msg.text}</p>
        {msg.sql && (
          <details style={{ marginTop: 8 }}>
            <summary style={{
              fontSize: 10, color: 'var(--text3)', cursor: 'pointer',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)'
            }}>View SQL</summary>
            <pre style={{
              marginTop: 6, padding: '8px 10px',
              background: 'var(--bg)', borderRadius: 'var(--radius)',
              fontSize: 10, color: 'var(--accent)', overflowX: 'auto',
              lineHeight: 1.5, fontFamily: 'var(--font-mono)'
            }}>{msg.sql}</pre>
          </details>
        )}
        <span style={{ fontSize: 10, color: isUser ? 'rgba(255,255,255,0.5)' : 'var(--text3)', marginTop: 4, display: 'block' }}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 16 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 6, flexShrink: 0,
        background: 'linear-gradient(135deg, var(--accent2), var(--accent3))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, color: '#fff'
      }}>AI</div>
      <div style={{
        background: 'var(--bg3)', border: '1px solid var(--border)',
        borderRadius: '4px 16px 16px 16px', padding: '14px 18px',
        display: 'flex', gap: 4, alignItems: 'center'
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--accent)',
            animation: `pulse 1.2s infinite`,
            animationDelay: `${i * 0.2}s`
          }} />
        ))}
      </div>
    </div>
  )
}

export default function ChatPanel({ messages, loading, onSend, sampleQueries }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSubmit = () => {
    if (!input.trim()) return
    onSend(input)
    setInput('')
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      borderRight: '1px solid var(--border)',
      overflow: 'hidden', background: 'var(--bg)'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
            Query Console
          </h2>
          <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
            Ask questions in natural language
          </p>
        </div>
        <div style={{
          fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)',
          background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)',
          padding: '4px 10px', borderRadius: 20, letterSpacing: '0.06em'
        }}>
          NL → SQL
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', gap: 8, alignItems: 'flex-end',
          background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '8px 8px 8px 14px',
          transition: 'border-color 0.2s'
        }}
        onFocus={() => {}} >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
            placeholder="Ask about your analytics... (Enter to send)"
            rows={2}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: 13, resize: 'none',
              fontFamily: 'var(--font-body)', lineHeight: 1.5,
              caretColor: 'var(--accent)'
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: input.trim() && !loading ? 'var(--accent)' : 'var(--border)',
              border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              color: input.trim() && !loading ? 'var(--bg)' : 'var(--text3)',
              fontSize: 16, transition: 'all 0.2s', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}
          >↑</button>
        </div>
        <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 8, textAlign: 'center' }}>
          Shift+Enter for new line • Enter to send
        </p>
      </div>
    </div>
  )
}
