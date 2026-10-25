import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export function CatalogPage() {
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getModels()
      .then(data => setModels(data.models))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <h1>Model Catalog</h1>
      <div className="card">
        {loading ? (
          <p>Loading models...</p>
        ) : (
          <div className="model-grid">
            {models.map(model => (
              <div key={model.id} className="model-card">
                <h3>{model.name}</h3>
                <p>Provider: {model.provider}</p>
                <p>Context: {model.context_length} tokens</p>
                <p>Cost: ${model.cost_per_1k_tokens}/1k tokens</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}