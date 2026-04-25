import { useState, useEffect } from 'react'
import { BRAND, STATUS_COLORS, S } from '../brand'
import { jobs } from '../api'

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

// ── Job Progress Modal ──
// Polls jobs.get(id) every 2s until status is terminal (complete/failed/error),
// shows page-by-page progress, and renders per-page results when finished.
export function JobProgressModal({ jobId, fileName, onClose, onComplete }) {
  const [job, setJob] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!jobId) { setJob(null); setError(null); return }
    let stopped = false
    let timer
    let completedNotified = false

    async function poll() {
      try {
        const res = await jobs.get(jobId)
        const row = (res.data && res.data[0]) || res.data || res
        if (stopped) return
        setJob(row)
        const terminal = row && (row.status === 'complete' || row.status === 'failed' || row.status === 'error')
        if (terminal) {
          if (!completedNotified && onComplete) { completedNotified = true; onComplete(row) }
          return
        }
        timer = setTimeout(poll, 2000)
      } catch (err) {
        if (stopped) return
        setError(err.message || 'Polling failed')
        timer = setTimeout(poll, 4000)
      }
    }
    poll()
    return () => { stopped = true; clearTimeout(timer) }
  }, [jobId])

  if (!jobId) return null

  const totalPages = parseInt(job?.total_pages) || 0
  const processed = parseInt(job?.pages_processed) || 0
  const pct = totalPages > 0 ? Math.min(100, Math.round((processed / totalPages) * 100)) : 0
  const status = job?.status || 'pending'
  const isDone = status === 'complete'
  const isError = status === 'failed' || status === 'error' || error
  const results = Array.isArray(job?.results) ? job.results : (typeof job?.results === 'string' ? safeParse(job.results) : [])

  return (
    <Modal open={true} onClose={isDone || isError ? onClose : undefined} title={isDone ? 'Processing complete' : isError ? 'Processing failed' : 'Processing template…'} width={640}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: BRAND.mono, fontSize: 11, color: BRAND.faint, marginBottom: 4 }}>FILE</div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{fileName || job?.source_file_name || '—'}</div>
        <div style={{ fontFamily: BRAND.mono, fontSize: 10, color: BRAND.faint, marginTop: 2 }}>
          Job #{jobId} · {totalPages || '?'} page{totalPages === 1 ? '' : 's'} · {status}
        </div>
      </div>

      {!isDone && !isError && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: BRAND.mono, fontSize: 10, color: BRAND.faint, marginBottom: 6 }}>
            <span>{processed} / {totalPages || '?'} pages</span>
            <span>{pct}%</span>
          </div>
          <div style={{ height: 6, background: BRAND.faint + '30', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: pct + '%', background: BRAND.terracotta, transition: 'width 0.3s' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, fontSize: 12, color: BRAND.muted }}>
            <Spinner size={14} />
            <span>{status === 'pending' ? 'Waiting to start…' : 'Analyzing pages with AI…'}</span>
          </div>
        </div>
      )}

      {isError && (
        <div style={{ padding: 14, background: BRAND.red + '12', border: '1px solid ' + BRAND.red + '33', borderRadius: BRAND.radiusSm, color: BRAND.red, fontSize: 13, marginBottom: 16 }}>
          {error || 'The job did not finish successfully. Check the n8n execution log.'}
        </div>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontFamily: BRAND.mono, fontSize: 11, color: BRAND.faint, marginBottom: 8 }}>
            PAGES ({results.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
            {results.sort((a, b) => (a.page_number || 0) - (b.page_number || 0)).map((r, i) => (
              <PageResultCard key={i} r={r} />
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20, paddingTop: 16, borderTop: BRAND.borderLight }}>
        <button
          onClick={onClose}
          disabled={!isDone && !isError}
          style={{
            ...S.btn,
            ...(isDone || isError ? S.btnPrimary : { background: BRAND.faint + '30', color: BRAND.faint, cursor: 'not-allowed' }),
          }}
        >
          {isDone ? 'Done' : isError ? 'Close' : 'Processing…'}
        </button>
      </div>
    </Modal>
  )
}

function PageResultCard({ r }) {
  const ai = r.ai_suggestion || {}
  const isTpl = r.is_template
  const tone = isTpl ? BRAND.green : (r.classification === 'unknown' ? BRAND.red : BRAND.faint)
  return (
    <div style={{ border: BRAND.border, borderRadius: BRAND.radiusSm, overflow: 'hidden', background: BRAND.card }}>
      <div style={{ height: 96, background: BRAND.sidebar, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {r.thumbnail_url
          ? <img src={r.thumbnail_url} alt={'Page ' + r.page_number} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontFamily: BRAND.mono, fontSize: 10, color: BRAND.faint }}>no thumb</span>}
      </div>
      <div style={{ padding: '8px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontFamily: BRAND.mono, fontSize: 10, color: BRAND.faint }}>p.{r.page_number}</span>
          <span style={{ fontFamily: BRAND.mono, fontSize: 9, padding: '1px 6px', borderRadius: BRAND.radiusXs, background: tone + '20', color: tone }}>
            {r.classification}
          </span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3, minHeight: 16 }}>
          {ai.framework_name || (isTpl ? '(unnamed)' : '—')}
        </div>
        {r.has_match && (
          <div style={{ fontFamily: BRAND.mono, fontSize: 9, color: BRAND.amber, marginTop: 3 }}>
            ↻ matches existing
          </div>
        )}
      </div>
    </div>
  )
}

function safeParse(s) { try { return JSON.parse(s) } catch { return [] } }

// ── Inject keyframe animations ──
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `
  document.head.appendChild(style)
}
