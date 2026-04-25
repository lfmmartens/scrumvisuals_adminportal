import { useState, useEffect, useMemo } from 'react'
import { BRAND, S } from '../brand'
import { frameworks, enums } from '../api'
import { StatusBadge, TagChip, Checkbox, Modal, Spinner, EmptyState, useToast } from '../components/ui'

const SORT_OPTS = [
  { v: 'name-asc', l: 'Name A→Z' },
  { v: 'name-desc', l: 'Name Z→A' },
  { v: 'tpl-desc', l: 'Most templates' },
  { v: 'tpl-asc', l: 'No template first' },
]

function PlaceholderThumb() {
  return (
    <svg width="36" height="24" viewBox="0 0 40 28" style={{ opacity: 0.15 }}>
      <rect x="1" y="1" width="16" height="11" rx="2" fill="none" stroke="#4A4A4A" strokeWidth="0.8" />
      <rect x="20" y="1" width="19" height="11" rx="2" fill="none" stroke="#4A4A4A" strokeWidth="0.8" />
      <rect x="1" y="15" width="19" height="12" rx="2" fill="none" stroke="#4A4A4A" strokeWidth="0.8" />
      <rect x="23" y="15" width="16" height="12" rx="2" fill="none" stroke="#4A4A4A" strokeWidth="0.8" />
    </svg>
  )
}

const EMPTY_FORM = {
  slug: '', name: '', also_known_as: '', structure: '', zone_pattern: '',
  zone_range_min: 3, zone_range_max: 5, orientation: 'landscape',
  energy: '', thematic_variant_principle: '', source: '', tags: [], status: 'draft', notes: '',
}

export default function Frameworks() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name-asc')
  const [viewMode, setViewMode] = useState('grid')
  const [selected, setSelected] = useState(new Set())
  const [showConfig, setShowConfig] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [tags, setTags] = useState([])
  const [counts, setCounts] = useState({})
  const { show: toast, Toast } = useToast()

  // Load data
  async function loadData() {
    setLoading(true)
    try {
      const [fwRes, tagRes, countRes] = await Promise.all([
        frameworks.list({ status: filterStatus !== 'all' ? filterStatus : undefined, tag: filterTag || undefined, search: search || undefined, sort: sortBy }),
        enums.list('intent_tag'),
        frameworks.count(),
      ])
      setList(fwRes.data || [])
      setTags((tagRes.data || []).map(e => e.enum_value))
      const c = {}
      for (const row of (countRes.data || [])) c[row.status] = parseInt(row.cnt)
      setCounts(c)
    } catch (err) {
      toast('Failed to load frameworks', 'error')
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [filterStatus, filterTag, search, sortBy])

  // Selection
  function toggleSelect(id) {
    const n = new Set(selected)
    n.has(id) ? n.delete(id) : n.add(id)
    setSelected(n)
  }
  function selectAll() {
    setSelected(selected.size === list.length ? new Set() : new Set(list.map(f => f.id)))
  }
  const allChecked = list.length > 0 && selected.size === list.length
  const someChecked = selected.size > 0 && !allChecked

  // Bulk actions
  async function bulkAction(status) {
    try {
      await frameworks.bulkStatus([...selected], status)
      toast(`${selected.size} frameworks → ${status}`)
      setSelected(new Set())
      loadData()
    } catch { toast('Bulk update failed', 'error') }
  }

  // Open create/edit modal
  function openCreate() {
    setEditItem(null)
    setForm({ ...EMPTY_FORM })
    setShowModal(true)
  }
  function openEdit(fw) {
    setEditItem(fw)
    setForm({
      ...EMPTY_FORM,
      ...fw,
      also_known_as: Array.isArray(fw.also_known_as) ? fw.also_known_as.join(', ') : (fw.also_known_as || ''),
      tags: Array.isArray(fw.tags) ? fw.tags : [],
    })
    setShowModal(true)
  }

  // Save
  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        ...form,
        also_known_as: form.also_known_as ? form.also_known_as.split(',').map(s => s.trim()).filter(Boolean) : [],
        zone_range_min: parseInt(form.zone_range_min) || 3,
        zone_range_max: parseInt(form.zone_range_max) || 5,
      }
      if (editItem) {
        payload.id = editItem.id
        await frameworks.update(payload)
        toast('Framework updated')
      } else {
        await frameworks.create(payload)
        toast('Framework created')
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      toast(err.message || 'Save failed', 'error')
    }
    setSaving(false)
  }

  // Form field helper
  function F(field, value) { setForm(f => ({ ...f, [field]: value })) }

  // Tag toggle in form
  function toggleFormTag(tag) {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }))
  }

  const totalAll = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Toast />

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 50, background: BRAND.canvas,
          borderBottom: BRAND.border, padding: '10px 32px',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 4px 16px rgba(26,26,26,0.08)',
        }}>
          <Checkbox checked={allChecked} partial={someChecked} onChange={selectAll} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.size} selected</span>
          <div style={{ width: 1, height: 20, background: BRAND.borderColor, margin: '0 4px' }} />
          <button onClick={() => bulkAction('active')} style={{ ...S.btn, ...S.btnGhost(BRAND.green) }}>Set active</button>
          <button onClick={() => bulkAction('draft')} style={{ ...S.btn, ...S.btnGhost(BRAND.amber) }}>Set draft</button>
          <div style={{ flex: 1 }} />
          <button onClick={() => bulkAction('archived')} style={{ ...S.btn, ...S.btnGhost(BRAND.red) }}>Archive ({selected.size})</button>
          <button onClick={() => setSelected(new Set())} style={{ ...S.btn, background: 'none', border: 'none', color: BRAND.faint, textDecoration: 'underline', fontSize: 12 }}>Clear</button>
        </div>
      )}

      <div style={{ padding: '28px 32px', maxWidth: 1400 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h1 style={S.h1}>Framework library</h1>
            <p style={S.subtitle}>Structural blueprints + visual templates. Upload PPT/PDF to batch-add.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowConfig(true)} style={{ ...S.btn, background: 'transparent', color: BRAND.muted, border: BRAND.border }}>⚙ Config</button>
            <button style={{ ...S.btn, ...S.btnOutline, opacity: 0.5, cursor: 'not-allowed' }} title="Requires Cloudinary setup">Upload PPT / PDF</button>
            <button onClick={openCreate} style={{ ...S.btn, ...S.btnPrimary }}>+ New</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          {[
            ['Total', totalAll, BRAND.ink],
            ['Active', counts.active || 0, BRAND.green],
            ['Draft', counts.draft || 0, BRAND.amber],
          ].map(([label, val, color]) => (
            <div key={label} style={{ background: BRAND.card, border: BRAND.border, borderRadius: BRAND.radius, padding: '12px 18px', boxShadow: '0 2px 8px rgba(26,26,26,0.04)' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color }}>{val}</div>
              <div style={{ fontFamily: BRAND.mono, fontSize: 11, color: BRAND.faint }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <Checkbox checked={allChecked} partial={someChecked} onChange={selectAll} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search..." style={{ ...S.input, width: 140 }}
          />
          <select value={filterTag} onChange={e => setFilterTag(e.target.value)} style={{ ...S.input, width: 'auto', fontSize: 12, color: BRAND.muted }}>
            <option value="">All tags</option>
            {tags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {['all', 'active', 'draft'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              ...S.btn, textTransform: 'capitalize', fontWeight: 500,
              border: filterStatus === s ? `1.5px solid ${BRAND.terracotta}` : BRAND.border,
              background: filterStatus === s ? BRAND.terracotta + '10' : 'transparent',
              color: filterStatus === s ? BRAND.terracotta : BRAND.muted,
            }}>{s}</button>
          ))}
          <div style={{ flex: 1 }} />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...S.input, width: 'auto', fontSize: 12, color: BRAND.muted }}>
            {SORT_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
          <div style={{ display: 'flex', border: BRAND.border, borderRadius: BRAND.radiusSm, overflow: 'hidden' }}>
            {[['grid', '⊞'], ['list', '☰']].map(([mode, icon]) => (
              <button key={mode} onClick={() => setViewMode(mode)} style={{
                fontFamily: BRAND.sans, padding: '6px 10px', fontSize: 14, cursor: 'pointer', border: 'none',
                background: viewMode === mode ? BRAND.terracotta + '12' : 'transparent',
                color: viewMode === mode ? BRAND.terracotta : BRAND.faint,
              }}>{icon}</button>
            ))}
          </div>
          <span style={{ fontFamily: BRAND.mono, fontSize: 11, color: BRAND.faint }}>
            {loading ? '...' : list.length}
          </span>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={28} /></div>
        ) : list.length === 0 ? (
          <EmptyState message="No frameworks match your filters" />
        ) : viewMode === 'grid' ? (
          /* Grid view */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(178px, 1fr))', gap: 10 }}>
            {list.map(fw => {
              const isSel = selected.has(fw.id)
              const fwTags = Array.isArray(fw.tags) ? fw.tags : []
              const tplCount = parseInt(fw.template_count) || 0
              return (
                <div
                  key={fw.id}
                  onClick={() => openEdit(fw)}
                  style={{
                    background: BRAND.card, border: isSel ? `1.5px solid ${BRAND.terracotta}` : BRAND.border,
                    borderRadius: BRAND.radius, cursor: 'pointer', overflow: 'hidden',
                    boxShadow: isSel ? `0 0 0 2px ${BRAND.terracotta}20` : '0 2px 10px rgba(26,26,26,0.04)',
                    transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative',
                  }}
                >
                  <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
                    <Checkbox checked={isSel} onChange={() => toggleSelect(fw.id)} />
                  </div>
                  <div style={{
                    height: 84, background: 'linear-gradient(135deg, #F5F2EE, #E8DDD0)',
                    borderBottom: BRAND.borderLight,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                  }}>
                    <PlaceholderThumb />
                    <div style={{ position: 'absolute', top: 6, right: 6 }}><StatusBadge status={fw.status} /></div>
                    {tplCount > 0 && (
                      <div style={{ position: 'absolute', bottom: 5, left: 28, fontFamily: BRAND.mono, fontSize: 9, padding: '2px 6px', borderRadius: BRAND.radiusXs, background: 'rgba(250,248,245,0.92)', color: BRAND.teal }}>
                        {tplCount} tpl
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '9px 11px' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3, marginBottom: 3 }}>{fw.name}</div>
                    <div style={{ fontFamily: BRAND.mono, fontSize: 9, color: BRAND.faint, marginBottom: 5 }}>
                      {fw.zone_pattern} · {fw.zone_range_min}-{fw.zone_range_max}z
                    </div>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      {fwTags.slice(0, 2).map(t => <TagChip key={t} label={t} />)}
                      {fwTags.length > 2 && <span style={{ fontFamily: BRAND.mono, fontSize: 9, color: BRAND.faint }}>+{fwTags.length - 2}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* List view */
          <div style={{ border: BRAND.border, borderRadius: BRAND.radius, overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '32px 1fr 140px 100px 70px 50px',
              alignItems: 'center', gap: 8, padding: '8px 14px',
              background: BRAND.sidebar, borderBottom: BRAND.border,
              fontFamily: BRAND.mono, fontSize: 10, color: BRAND.faint,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              <Checkbox checked={allChecked} partial={someChecked} onChange={selectAll} />
              <span>Name</span><span>Tags</span><span>Pattern</span><span>Status</span><span>Tpl</span>
            </div>
            {list.map(fw => {
              const isSel = selected.has(fw.id)
              const fwTags = Array.isArray(fw.tags) ? fw.tags : []
              const tplCount = parseInt(fw.template_count) || 0
              return (
                <div
                  key={fw.id}
                  onClick={() => openEdit(fw)}
                  style={{
                    display: 'grid', gridTemplateColumns: '32px 1fr 140px 100px 70px 50px',
                    alignItems: 'center', gap: 8, padding: '8px 14px',
                    background: isSel ? BRAND.terracotta + '08' : BRAND.card,
                    borderBottom: BRAND.borderLight, cursor: 'pointer',
                  }}
                >
                  <Checkbox checked={isSel} onChange={() => toggleSelect(fw.id)} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{fw.name}</div>
                    <div style={{ fontFamily: BRAND.mono, fontSize: 10, color: BRAND.faint }}>{fw.slug}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    {fwTags.slice(0, 2).map(t => <TagChip key={t} label={t} />)}
                  </div>
                  <div style={{ fontFamily: BRAND.mono, fontSize: 10, color: BRAND.faint }}>{fw.zone_pattern}</div>
                  <StatusBadge status={fw.status} />
                  <div style={{ fontFamily: BRAND.mono, fontSize: 10, color: tplCount > 0 ? BRAND.teal : BRAND.faint }}>
                    {tplCount > 0 ? tplCount : '—'}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit framework' : 'New framework'} width={600}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={S.label}>Slug *</label>
            <input value={form.slug} onChange={e => F('slug', e.target.value)} style={S.input} placeholder="kebab-case" disabled={!!editItem} />
          </div>
          <div>
            <label style={S.label}>Name *</label>
            <input value={form.name} onChange={e => F('name', e.target.value)} style={S.input} placeholder="Human-readable name" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={S.label}>Also known as</label>
            <input value={form.also_known_as} onChange={e => F('also_known_as', e.target.value)} style={S.input} placeholder="Comma-separated aliases" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={S.label}>Structure</label>
            <textarea value={form.structure} onChange={e => F('structure', e.target.value)} style={{ ...S.input, minHeight: 60, resize: 'vertical' }} placeholder="Describe the framework layout..." />
          </div>
          <div>
            <label style={S.label}>Zone pattern</label>
            <input value={form.zone_pattern} onChange={e => F('zone_pattern', e.target.value)} style={S.input} placeholder="e.g. 2x2 grid" />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Zones min</label>
              <input type="number" value={form.zone_range_min} onChange={e => F('zone_range_min', e.target.value)} style={S.input} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Zones max</label>
              <input type="number" value={form.zone_range_max} onChange={e => F('zone_range_max', e.target.value)} style={S.input} />
            </div>
          </div>
          <div>
            <label style={S.label}>Orientation</label>
            <select value={form.orientation} onChange={e => F('orientation', e.target.value)} style={S.input}>
              <option value="landscape">Landscape</option>
              <option value="portrait">Portrait</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Status</label>
            <select value={form.status} onChange={e => F('status', e.target.value)} style={S.input}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={S.label}>Energy</label>
            <input value={form.energy} onChange={e => F('energy', e.target.value)} style={S.input} placeholder="e.g. reflective to active" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={S.label}>Thematic variant principle</label>
            <textarea value={form.thematic_variant_principle} onChange={e => F('thematic_variant_principle', e.target.value)} style={{ ...S.input, minHeight: 50, resize: 'vertical' }} />
          </div>
          <div>
            <label style={S.label}>Source</label>
            <input value={form.source} onChange={e => F('source', e.target.value)} style={S.input} placeholder="Origin / author" />
          </div>
          <div>
            <label style={S.label}>Notes</label>
            <input value={form.notes} onChange={e => F('notes', e.target.value)} style={S.input} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={S.label}>Tags</label>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {tags.map(t => (
                <button
                  key={t}
                  onClick={() => toggleFormTag(t)}
                  style={{
                    fontFamily: BRAND.mono, fontSize: 10, padding: '3px 8px', borderRadius: BRAND.radiusXs,
                    cursor: 'pointer', border: '1px solid',
                    background: form.tags.includes(t) ? BRAND.teal + '20' : 'transparent',
                    color: form.tags.includes(t) ? BRAND.teal : BRAND.faint,
                    borderColor: form.tags.includes(t) ? BRAND.teal + '50' : BRAND.borderColor,
                  }}
                >{t}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20, paddingTop: 16, borderTop: BRAND.borderLight }}>
          <button onClick={() => setShowModal(false)} style={{ ...S.btn, background: 'transparent', color: BRAND.muted, border: BRAND.border }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.slug || !form.name} style={{ ...S.btn, ...S.btnPrimary, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : (editItem ? 'Update' : 'Create')}
          </button>
        </div>
      </Modal>

      {/* Config slide-over — placeholder for now */}
      {showConfig && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'flex-end', zIndex: 100 }} onClick={() => setShowConfig(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: 440, background: BRAND.canvas, borderLeft: BRAND.border, height: '100%', overflow: 'auto', boxShadow: '-8px 0 30px rgba(26,26,26,0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: BRAND.borderLight, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ ...S.h2, fontSize: 20 }}>Library configuration</div>
                <div style={{ fontSize: 12, color: BRAND.muted, marginTop: 2 }}>Tags and zone settings driving the prompt engine</div>
              </div>
              <button onClick={() => setShowConfig(false)} style={{ background: 'none', border: 'none', color: BRAND.faint, cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <ConfigSection title="Intent tags" type="intent_tag" />
              <ConfigSection title="Zone positions" type="zone_position" />
              <ConfigSection title="Zone sizes" type="zone_size" />
              <ConfigSection title="Zone roles" type="zone_role" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Config section that loads from admin_enums
function ConfigSection({ title, type }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    enums.list(type).then(res => {
      setItems((res.data || []).map(e => e.enum_value))
      setLoading(false)
    })
  }, [type])

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>
          {title} <span style={{ fontFamily: BRAND.mono, fontSize: 11, color: BRAND.faint }}>({items.length})</span>
        </div>
      </div>
      {loading ? (
        <Spinner size={14} />
      ) : (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {items.map(i => (
            <span key={i} style={{
              fontFamily: BRAND.mono, fontSize: 10, padding: '3px 8px', borderRadius: BRAND.radiusXs,
              background: '#A8B8A020', color: BRAND.teal, border: '1px solid #A8B8A030',
            }}>{i}</span>
          ))}
        </div>
      )}
    </div>
  )
}
