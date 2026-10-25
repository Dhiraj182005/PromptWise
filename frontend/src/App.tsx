import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { OptimizePage } from './pages/OptimizePage'
import { BenchmarkPage } from './pages/BenchmarkPage'
import { CatalogPage } from './pages/CatalogPage'
import { Layout } from './components/Layout'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<OptimizePage />} />
          <Route path="/benchmark" element={<BenchmarkPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App