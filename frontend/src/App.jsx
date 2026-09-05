import { useState, useEffect } from 'react'
import axios from 'axios'
import './index.css'

function App() {
  const [healthStatus, setHealthStatus] = useState('Checking...')

  useEffect(() => {
    axios.get('http://localhost:8080/api/health')
      .then(response => {
        setHealthStatus(response.data.status === 'UP' ? 'Backend is UP!' : 'Backend returned unexpected status')
      })
      .catch(error => {
        console.error("Health check failed", error)
        setHealthStatus('Backend is DOWN or unreachable')
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
        Hello SettleIn
      </h1>
      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700">
        <h2 className="text-2xl font-semibold mb-4">System Status</h2>
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full ${healthStatus === 'Backend is UP!' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.7)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]'}`}></div>
          <p className="text-lg text-gray-300">{healthStatus}</p>
        </div>
      </div>
    </div>
  )
}

export default App
