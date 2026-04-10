import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar.jsx'
import ChatPanel from './components/ChatPanel.jsx'
import ResultPanel from './components/ResultPanel.jsx'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || '/api'

const SAMPLE_QUERIES = [
  "Show top trending topics in last 30 days",
  "Compare article engagement by topic",
  "Plot daily views trend for AI articles",
  "Which author has most views?",
  "Show articles with most comments",
  "Top 5 most liked articles"
]

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: "Hey! I'm SupaChat 👋 Ask me anything about your blog analytics. Try: \"Show top trending topics\" or \"Compare engagement by topic\"",
      timestamp: new Date()
    }
  ])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentResult, setCurrentResult] = useState(null)
  const [error, setError] = useState(null)

  const sendQuery = useCallback(async (question) => {
    if (!question.trim() || loading) return

    const userMsg = { id: Date.now(), role: 'user', text: question, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    setError(null)

    try {
      const { data } = await axios.post(`${API}/query`, { question, history })

      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        text: data.answer,
        sql: data.sql,
        timestamp: new Date(),
        hasResult: data.data?.length > 0
      }

      setMessages(prev => [...prev, assistantMsg])
      setCurrentResult({
        data: data.data,
        columns: data.columns,
        chart_type: data.chart_type,
        question,
        sql: data.sql
      })
      setHistory(prev => [...prev, { question, answer: data.answer }].slice(-10))
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || 'Something went wrong'
      setError(errMsg)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: `⚠️ Error: ${errMsg}`,
        isError: true,
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }, [loading, history])

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '220px 1fr 1fr',
      gridTemplateRows: '100vh',
      height: '100vh',
      gap: 0,
      overflow: 'hidden'
    }}>
      <Sidebar history={history} sampleQueries={SAMPLE_QUERIES} onQuery={sendQuery} />
      <ChatPanel
        messages={messages}
        loading={loading}
        onSend={sendQuery}
        sampleQueries={SAMPLE_QUERIES}
      />
      <ResultPanel result={currentResult} />
    </div>
  )
}
