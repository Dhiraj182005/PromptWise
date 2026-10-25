import { useState } from 'react'
import { api } from '../lib/api'

export function OptimizePage() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleOptimize = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    try {
      const response = await api.optimize({ prompt })
      setResult(response.optimized_prompt)
    } catch (error) {
      console.error('Optimization failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h1>Prompt Optimizer</h1>
      <div className="card">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
          rows={6}
        />
        <button onClick={handleOptimize} disabled={loading}>
          {loading ? 'Optimizing...' : 'Optimize Prompt'}
        </button>
        {result && (
          <div className="result">
            <h3>Optimized Prompt</h3>
            <pre>{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}