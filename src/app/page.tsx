import { MapView } from '@/components/map-view'
import { WelcomeOverlay } from '@/components/welcome-overlay'

export default function HomePage() {
  return (
    <main className="relative h-screen w-full overflow-hidden">
      <MapView />
      <WelcomeOverlay />
    </main>
  )
}
