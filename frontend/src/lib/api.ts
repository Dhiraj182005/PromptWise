const API_BASE = '/api'

export const api = {
  async optimize(data: { prompt: string }) {
    const response = await fetch(`${API_BASE}/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  async benchmark(data: { prompts: string[] }) {
    const response = await fetch(`${API_BASE}/benchmark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  async getModels() {
    const response = await fetch(`${API_BASE}/models`)
    return response.json()
  }
}