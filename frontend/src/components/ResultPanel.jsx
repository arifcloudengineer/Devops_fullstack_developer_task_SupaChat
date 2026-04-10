import { useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const COLORS = ['#00ff88', '#7c3aed', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1a1a24', border: '1px solid #2a2a3a',
      borderRadius: 8, padding: '10px 14px', fontSize: 12
    }}>
      <p style={{ color: '#9090a8', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#00ff88' }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
        </p>
      ))}
    </div>
  )
}

function DataTable({ data, columns }) {
  if (!data?.length) return (
    <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '40px 0', fontSize: 13 }}>
      No data to display
    </div>
  )

  const cols = columns?.length ? columns : Object.keys(data[0] || {})

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            {cols.map(col => (
              <th key={col} style={{
                padding: '8px 12px', textAlign: 'left',
                color: 'var(--text3)', fontFamily: 'var(--font-mono)',
                fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                borderBottom: '1px solid var(--border)', fontWeight: 400,
                whiteSpace: 'nowrap'
              }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{
              borderBottom: '1px solid rgba(42,42,58,0.5)',
              transition: 'background 0.1s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              {cols.map(col => (
                <td key={col} style={{ padding: '8px 12px', color: 'var(--text)', verticalAlign: 'top' }}>
                  {row[col] !== null && row[col] !== undefined
                    ? (typeof row[col] === 'number' ? row[col].toLocaleString() : String(row[col]))
                    : <span style={{ color: 'var(--text3)' }}>—</span>
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Chart({ data, chartType, question }) {
  if (!data?.length) return null

  const keys = Object.keys(data[0] || {})
  const xKey = keys[0]
  const numericKeys = keys.slice(1).filter(k => typeof data[0][k] === 'number')

  if (chartType === 'pie' && numericKeys.length >= 1) {
    const valueKey = numericKeys[0]
    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} dataKey={valueKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
          <XAxis dataKey={xKey} tick={{ fill: '#9090a8', fontSize: 11 }} angle={-30} textAnchor="end" />
          <YAxis tick={{ fill: '#9090a8', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#9090a8' }} />
          {numericKeys.map((k, i) => (
            <Line key={k} type="monotone" dataKey={k} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
        <XAxis dataKey={xKey} tick={{ fill: '#9090a8', fontSize: 11 }} angle={-30} textAnchor="end" />
        <YAxis tick={{ fill: '#9090a8', fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, color: '#9090a8' }} />
        {numericKeys.map((k, i) => (
          <Bar key={k} dataKey={k} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

export default function ResultPanel({ result }) {
  const [view, setView] = useState('chart')

  if (!result) {
    return (
      <div style={{
        background: 'var(--bg)', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text3)', gap: 12
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: 16,
          border: '2px dashed var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24
        }}>📊</div>
        <p style={{ fontSize: 13 }}>Results will appear here</p>
        <p style={{ fontSize: 11, color: 'var(--text3)' }}>Ask a question to get started</p>
      </div>
    )
  }

  const { data, columns, chart_type, question, sql } = result
  const hasNumericData = data?.length && Object.values(data[0] || {}).some(v => typeof v === 'number')

  return (
    <div style={{
      background: 'var(--bg)', display: 'flex',
      flexDirection: 'column', overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {question}
          </h2>
          <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
            {data?.length || 0} rows returned
          </p>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 12 }}>
          {['chart', 'table'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '5px 12px', borderRadius: 6, border: '1px solid',
              cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)',
              background: view === v ? 'var(--accent)' : 'none',
              borderColor: view === v ? 'var(--accent)' : 'var(--border)',
              color: view === v ? 'var(--bg)' : 'var(--text3)',
              transition: 'all 0.15s'
            }}>{v}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {view === 'chart' && hasNumericData ? (
          <div className="animate-in">
            <Chart data={data} chartType={chart_type} question={question} />
            <p style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'center', marginTop: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Chart type: {chart_type}
            </p>
          </div>
        ) : view === 'chart' ? (
          <p style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>
            No numeric data to chart — showing table view
          </p>
        ) : null}

        {(view === 'table' || !hasNumericData) && (
          <div className="animate-in">
            <DataTable data={data} columns={columns} />
          </div>
        )}
      </div>

      {/* SQL Footer */}
      {sql && (
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
            Generated SQL
          </p>
          <pre style={{
            fontSize: 11, color: 'var(--accent)', overflowX: 'auto',
            lineHeight: 1.5, fontFamily: 'var(--font-mono)'
          }}>{sql}</pre>
        </div>
      )}
    </div>
  )
}
