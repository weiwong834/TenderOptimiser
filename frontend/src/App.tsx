import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import TenderInput from './pages/TenderInput'
import Analysis from './pages/Analysis'
import Optimization from './pages/Optimization'
import Summary from './pages/Summary'
import { TenderProvider } from './context/TenderContext'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <TenderProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/input" element={<TenderInput />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/optimization" element={<Optimization />} />
                <Route path="/summary" element={<Summary />} />
              </Routes>
            </main>
          </div>
        </Router>
      </TenderProvider>
    </ThemeProvider>
  )
}

export default App 