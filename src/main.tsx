import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RootApp } from './App.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MuseumsPage } from './routes/MuseumsPage'
import { MuseumDetailPage } from './routes/MuseumDetailPage'
import MuseumIndex from './routes/museum/index.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<RootApp />} />
      <Route path="/museums" element={<MuseumsPage />} />
      <Route path="/museum/:id" element={<MuseumDetailPage />} />

      <Route path="/museum" element={<MuseumIndex />} />

    </Routes>
  </BrowserRouter>
  </StrictMode>,
)
