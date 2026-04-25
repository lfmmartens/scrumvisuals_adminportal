import { useState } from 'react'
import { BRAND } from './brand'
import Frameworks from './pages/Frameworks'
import Workshops from './pages/Workshops'
import Styles from './pages/Styles'
import Orders from './pages/Orders'
import TestRunner from './pages/TestRunner'

const NAV = [
  { id: 'frameworks', label: 'Framework library', icon: '◫' },
  { id: 'workshops', label: 'Workshop library', icon: '☰' },
  { id: 'styles', label: 'Style library', icon: '◑' },
  { id: 'orders', label: 'Orders & CS', icon: '◉' },
  { id: 'tests', label: 'Test runner', icon: '▷' },
]

const PAGES = {
  frameworks: Frameworks,
  workshops: Workshops,
  styles: Styles,
  orders: Orders,
  tests: TestRunner,
}

export default function App() {
  const [nav, setNav] = useState('frameworks')
  const Page = PAGES[nav]

  return (
    <div style={{ display: 'flex', height: '100vh', background: BRAND.canvas, color: BRAND.ink, fontFamily: BRAND.sans, fontSize: 14 }}>

      {/* Sidebar */}
      <div style={{ width: 210, background: BRAND.sidebar, borderRight: BRAND.border, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px 22px', borderBottom: '1px solid rgba(184,176,168,0.25)' }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>ScrumVisuals</div>
          <div style={{ fontFamily: BRAND.mono, fontSize: 10, color: BRAND.terracotta, marginTop: 3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Admin portal
          </div>
        </div>

        <nav style={{ padding: '10px 8px', flex: 1 }}>
          {NAV.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setNav(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 500, textAlign: 'left', marginBottom: 1,
                fontFamily: BRAND.sans,
                background: nav === id ? BRAND.terracotta + '12' : 'transparent',
                color: nav === id ? BRAND.terracotta : BRAND.muted,
              }}
            >
              <span style={{ fontSize: 14, opacity: 0.5 }}>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(184,176,168,0.25)', fontFamily: BRAND.mono, fontSize: 10, color: BRAND.faint }}>
          portal.scrumvisuals.com
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Page />
      </div>
    </div>
  )
}
