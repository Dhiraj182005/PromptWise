import { useState } from 'react'
import { api } from '../lib/api'

export function BenchmarkPage() {
  const [prompts, setPrompts] = useState<string[]>([''])
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleBenchmark = async () => {
    if (prompts.every(p => !p.trim())) return
    setLoading(true)
    try {
      const response = await api.benchmark({ prompts: prompts.filter(p => p.trim()) })
      setResults(response.results)
    } catch (error) {
      console.error('Benchmark failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h1>Model Benchmark</h1>
      <div className="card">
        <div>
          {prompts.map((prompt, i) => (
            <div key={i} className="prompt-input">
              <textarea
                value={prompt}
                onChange={(e) => {
                  const newPrompts = [...prompts]
                  newPrompts[i] = e.target.value
                  setPrompts(newPrompts)
                }}
                placeholder={`Prompt ${i + 1}`}
                rows={3}
              />
              {prompts.length > 1 && (
                <button onClick={() => setPrompts(prompts.filter((_, idx) => idx !== i))}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button onClick={() => setPrompts([...prompts, ''])}>Add Prompt</button>
        </div>
        <button onClick={handleBenchmark} disabled={loading}>
          {loading ? 'Running Benchmark...' : 'Run Benchmark'}
        </button>
        {results.length > 0 && (
          <div className="results">
            <h3>Results</h3>
            {results.map((r, i) => (
              <div key={i} className="result-item">
                <h4>Prompt {i + 1}</h4>
                <pre>{JSON.stringify(r, null, 2)}</pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}