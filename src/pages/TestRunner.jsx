import { BRAND, S } from '../brand'

export default function TestRunner() {
  return (
    <div style={{ padding: '28px 32px' }}>
      <h1 style={S.h1}>Test runner</h1>
      <div style={{ marginTop: 28, padding: 48, textAlign: 'center', color: BRAND.faint, border: `1px dashed ${BRAND.borderColor}`, borderRadius: BRAND.radius }}>
        Planned — N8N test workflows + AI-Eval for visual quality scoring.
      </div>
    </div>
  )
}
