import { useState } from 'react'

export default function Sidebar({ history, sampleQueries, onQuery }) {
  const [activeTab, setActiveTab] = useState('samples')

  return (
    <aside style={{
      background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: 'var(--font-mono)'
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 16px 16px',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28,
            background: 'var(--accent)',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: 'var(--bg)'
          }}>S</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            SupaChat
          </span>
        </div>
        <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Analytics Intelligence
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {['samples', 'history'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '10px 4px', background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 10, letterSpacing: '0.08em',
            textTransform: 'uppercase', fontFamily: 'var(--font-mono)',
            color: activeTab === tab ? 'var(--accent)' : 'var(--text3)',
            borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
            transition: 'color 0.2s'
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {activeTab === 'samples' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {sampleQueries.map((q, i) => (
              <button key={i} onClick={() => onQuery(q)} style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '8px 10px',
                cursor: 'pointer', textAlign: 'left', color: 'var(--text2)',
                fontSize: 11, lineHeight: 1.4, transition: 'all 0.15s',
                fontFamily: 'var(--font-body)'
              }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--text)' }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text2)' }}>
                {q}
              </button>
            ))}
          </div>
        )}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {history.length === 0 && (
              <p style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 20 }}>
                No history yet
              </p>
            )}
            {[...history].reverse().map((h, i) => (
              <button key={i} onClick={() => onQuery(h.question)} style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '8px 10px',
                cursor: 'pointer', textAlign: 'left', color: 'var(--text2)',
                fontSize: 11, lineHeight: 1.4, transition: 'all 0.15s',
                fontFamily: 'var(--font-body)'
              }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--accent3)'; e.target.style.color = 'var(--text)' }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text2)' }}>
                ↺ {h.question}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 8
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--accent)',
          animation: 'pulse 2s infinite'
        }} />
        <span style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Connected
        </span>
      </div>
    </aside>
  )
}
