import { BRAND, S } from '../brand'

export default function Orders() {
  return (
    <div style={{ padding: '28px 32px' }}>
      <h1 style={S.h1}>Orders & CS</h1>
      <div style={{ marginTop: 28, padding: 48, textAlign: 'center', color: BRAND.faint, border: `1px dashed ${BRAND.borderColor}`, borderRadius: BRAND.radius }}>
        Planned — Shopify + PostgreSQL order management via N8N.
      </div>
    </div>
  )
}
