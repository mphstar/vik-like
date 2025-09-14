import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RootApp } from './App.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AdminLayout from './admin/layout/AdminLayout'
import TemplatesPage from './admin/pages/TemplatesPage'
import TourismSectionsPage from './admin/pages/TourismSectionsPage'
import TourismSectionFormPage from './admin/pages/TourismSectionFormPage'
import MuseumsAdminPage from './admin/pages/MuseumsPage'
import MuseumDetailAdminPage from './admin/pages/MuseumDetailPage'
import MuseumFormPage from './admin/pages/MuseumFormPage'
import { MuseumsPage } from './routes/MuseumsPage'
import MuseumIndex from './routes/museum/index.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootApp />} />
        <Route path="/museums" element={<MuseumsPage />} />
        <Route path="/museum/:id" element={<MuseumIndex />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<TemplatesPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="tourism-sections" element={<TourismSectionsPage />} />
          <Route path="tourism-sections/new" element={<TourismSectionFormPage />} />
          <Route path="tourism-sections/:id" element={<TourismSectionFormPage />} />
          <Route path="museums" element={<MuseumsAdminPage />} />
          <Route path="museums/new" element={<MuseumFormPage />} />
          <Route path="museums/:id" element={<MuseumDetailAdminPage />} />
          <Route path="museums/:id/edit" element={<MuseumFormPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
