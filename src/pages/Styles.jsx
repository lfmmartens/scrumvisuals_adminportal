import { useState, useEffect } from 'react'
import { BRAND, S } from '../brand'
import { styles } from '../api'
import { Spinner } from '../components/ui'

export default function Styles() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    styles.list().then(res => { setList(res.data || []); setLoading(false) })
  }, [])

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100 }}>
      <h1 style={S.h1}>Style library</h1>
      <p style={S.subtitle}>Visual rendering styles — colors, opacity, mood. Full editor coming soon.</p>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={28} /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10, marginTop: 24 }}>
          {list.map(s => (
            <div key={s.id} style={{ borderRadius: BRAND.radius, overflow: 'hidden', border: BRAND.border, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <div style={{ height: 56, background: s.background_hex || '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{
                  fontFamily: BRAND.mono, fontSize: 10,
                  color: s.is_dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.2)',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  {s.tier}
                </span>
              </div>
              <div style={{ padding: '10px 12px', background: BRAND.card }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontFamily: BRAND.mono, fontSize: 10, color: BRAND.faint, marginTop: 3 }}>{s.slug}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {[s.primary_hex, s.secondary_hex, s.tertiary_hex].filter(Boolean).map((hex, i) => (
                    <div key={i} style={{ width: 14, height: 14, borderRadius: 3, background: hex, border: '1px solid rgba(0,0,0,0.08)' }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
