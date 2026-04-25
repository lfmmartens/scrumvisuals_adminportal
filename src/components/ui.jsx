import { useState, useEffect } from 'react'
import { BRAND, STATUS_COLORS, S } from '../brand'

// ── Status Badge ──
export function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.draft
  return (
    <span style={{
      fontFamily: BRAND.mono, fontSize: 9, padding: '2px 6px', borderRadius: BRAND.radiusXs,
      background: color + '18', color, border: '1px solid ' + color + '33',
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {status}
    </span>
  )
}

// ── Tag Chip ──
export function TagChip({ label, onRemove }) {
  return (
    <span style={{
      fontFamily: BRAND.mono, fontSize: 9, padding: '1px 6px', borderRadius: BRAND.radiusXs,
      background: '#A8B8A025', color: BRAND.teal, letterSpacing: '0.02em',
      display: 'inline-flex', alignItems: 'center', gap: 3,
    }}>
      {label}
      {onRemove && (
        <span onClick={onRemove} style={{ cursor: 'pointer', opacity: 0.5 }}>×</span>
      )}
    </span>
  )
}

// ── Checkbox ──
export function Checkbox({ checked, partial, onChange }) {
  const active = checked || partial
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      style={{
        width: 16, height: 16, borderRadius: BRAND.radiusXs, flexShrink: 0, cursor: 'pointer',
        border: '1.5px solid ' + (active ? BRAND.terracotta : BRAND.faint),
        background: checked ? BRAND.terracotta : (partial ? BRAND.terracotta + '30' : 'transparent'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {checked && <svg width="10" height="8"><path d="M1 4l3 3 5-6" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>}
      {partial && !checked && <div style={{ width: 8, height: 2, background: BRAND.terracotta, borderRadius: 1 }} />}
    </div>
  )
}

// ── Modal ──
export function Modal({ open, onClose, title, width = 520, children }) {
  if (!open) return null
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: BRAND.canvas, borderRadius: BRAND.radius, width, maxWidth: '90vw', maxHeight: '85vh',
          overflow: 'auto', boxShadow: '0 20px 60px rgba(26,26,26,0.2)',
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: BRAND.borderLight, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ ...S.h2, fontSize: 18 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: BRAND.faint, cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Toast ──
let toastTimeout = null
export function useToast() {
  const [toast, setToast] = useState(null)

  function show(message, type = 'success') {
    clearTimeout(toastTimeout)
    setToast({ message, type })
    toastTimeout = setTimeout(() => setToast(null), 3000)
  }

  function Toast() {
    if (!toast) return null
    const bg = toast.type === 'error' ? BRAND.red : BRAND.green
    return (
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 500,
        background: bg, color: '#fff', padding: '12px 20px',
        borderRadius: BRAND.radiusSm, fontSize: 13, fontWeight: 500,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        animation: 'slideIn 0.2s ease-out',
      }}>
        {toast.message}
      </div>
    )
  }

  return { show, Toast }
}

// ── Loading Spinner ──
export function Spinner({ size = 20 }) {
  return (
    <div style={{
      width: size, height: size, border: `2px solid ${BRAND.faint}40`,
      borderTopColor: BRAND.terracotta, borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
    }} />
  )
}

// ── Empty State ──
export function EmptyState({ message = 'No results' }) {
  return (
    <div style={{
      padding: 48, textAlign: 'center', color: BRAND.faint,
      border: '1px dashed ' + BRAND.borderColor, borderRadius: BRAND.radius,
    }}>
      {message}
    </div>
  )
}

// ── Inject keyframe animations ──
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `
  document.head.appendChild(style)
}
