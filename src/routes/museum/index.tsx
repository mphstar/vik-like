import { useParams } from 'react-router-dom'
import { MUSEUMS } from '../MuseumData'
import PsvWithMarkers from "../../components/organisms/PsvWithMarkers"
import { Header } from '../../components/templates/Header'

// Sederhana: daftar section dummy agar Header tidak error (hanya label museum)
const headerSections = [{ id: 'museum', title: 'Museum', navLabel: 'Info' }];

const DetailMuseumPage = () => {
  const { id } = useParams()
  const museum = MUSEUMS.find(m => m.id === id)
  if (!museum) return <div className="p-6 text-sm">Museum tidak ditemukan.</div>
  return (
    <div className="relative h-dvh w-full">
      <div className="absolute inset-0">
        <PsvWithMarkers
          panoramaUrl={museum.panorama}
          explanations={museum.explanations || []}
          museumName={museum.name}
        />
      </div>
      <div className="absolute top-0 left-0 right-0">
        <Header
          active={0}
          onJump={() => {}}
          sections={headerSections as any}
          brand={museum.name}
          backHref="/museums"
        />
      </div>
    </div>
  )
}

export default DetailMuseumPage