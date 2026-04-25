import { useState, useEffect } from 'react'
import { BRAND, S } from '../brand'
import { workshopTypes, enums } from '../api'
import { Modal, Spinner, useToast } from '../components/ui'

const EMPTY_FORM = { key: '', label: '', category: 'General Workshop', backend_context: '', show_in_frontend: true, sort_order: 0 }

export default function Workshops() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [catFilter, setCatFilter] = useState('all')
  const [categories, setCategories] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const { show: toast, Toast } = useToast()

  async function loadData() {
    setLoading(true)
    try {
      const [wtRes, catRes] = await Promise.all([
        workshopTypes.list({ category: catFilter !== 'all' ? catFilter : undefined }),
        enums.list('wt_category'),
      ])
      setList(wtRes.data || [])
      setCategories((catRes.data || []).map(e => e.enum_value))
    } catch { toast('Failed to load', 'error') }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [catFilter])

  async function handleToggle(id) {
    try {
      await workshopTypes.toggle(id)
      toast('Visibility toggled')
      loadData()
    } catch { toast('Toggle failed', 'error') }
  }

  function openCreate() { setEditItem(null); setForm({ ...EMPTY_FORM }); setShowModal(true) }
  function openEdit(wt) { setEditItem(wt); setForm({ ...EMPTY_FORM, ...wt }); setShowModal(true) }

  async function handleSave() {
    setSaving(true)
    try {
      if (editItem) {
        await workshopTypes.update({ ...form, id: editItem.id })
        toast('Workshop type updated')
      } else {
        await workshopTypes.create(form)
        toast('Workshop type created')
      }
      setShowModal(false)
      loadData()
    } catch (err) { toast(err.message || 'Save failed', 'error') }
    setSaving(false)
  }

  function F(field, value) { setForm(f => ({ ...f, [field]: value })) }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900 }}>
      <Toast />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={S.h1}>Workshop library</h1>
          <p style={S.subtitle}>Workshop types shown in the wizard dropdown. Each entry provides AI context for framework selection.</p>
        </div>
        <button onClick={openCreate} style={{ ...S.btn, ...S.btnPrimary }}>+ Add type</button>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {['all', ...categories].map(cat => (
          <button key={cat} onClick={() => setCatFilter(cat)} style={{
            ...S.btn, fontWeight: 500, textTransform: 'none',
            border: catFilter === cat ? `1.5px solid ${BRAND.terracotta}` : BRAND.border,
            background: catFilter === cat ? BRAND.terracotta + '10' : 'transparent',
            color: catFilter === cat ? BRAND.terracotta : BRAND.muted,
          }}>{cat}</button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={28} /></div>
      ) : (
        list.map(wt => {
          const isExpanded = expanded === wt.id
          return (
            <div key={wt.id} style={{ background: BRAND.card, border: BRAND.border, borderRadius: BRAND.radius, marginBottom: 8, overflow: 'hidden' }}>
              <div
                onClick={() => setExpanded(isExpanded ? null : wt.id)}
                style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: BRAND.faint, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : '' }}>▸</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{wt.label}</div>
                    <div style={{ fontFamily: BRAND.mono, fontSize: 11, color: BRAND.faint, marginTop: 2 }}>{wt.key} · {wt.category}</div>
                  </div>
                </div>
                <div
                  onClick={e => { e.stopPropagation(); handleToggle(wt.id) }}
                  style={{ width: 36, height: 20, borderRadius: 10, cursor: 'pointer', position: 'relative', background: wt.show_in_frontend ? BRAND.green : BRAND.faint }}
                >
                  <div style={{ width: 16, height: 16, borderRadius: 8, background: '#fff', position: 'absolute', top: 2, left: wt.show_in_frontend ? 18 : 2, transition: 'left 0.2s' }} />
                </div>
              </div>
              {isExpanded && (
                <div style={{ padding: '0 18px 16px 42px', borderTop: BRAND.borderLight }}>
                  <label style={{ ...S.label, marginTop: 12 }}>Backend context</label>
                  <div style={{ background: BRAND.sidebar, border: BRAND.borderLight, borderRadius: BRAND.radiusSm, padding: 12, fontSize: 13, color: BRAND.muted, lineHeight: 1.6 }}>
                    {wt.backend_context || '(empty)'}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={() => openEdit(wt)} style={{ ...S.btn, ...S.btnGhost(BRAND.teal) }}>Edit</button>
                    <button onClick={async () => { await workshopTypes.archive(wt.id); toast('Archived'); loadData() }} style={{ ...S.btn, ...S.btnGhost(BRAND.red) }}>Archive</button>
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}

      {/* Create/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit workshop type' : 'New workshop type'} width={560}>
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={S.label}>Key *</label>
              <input value={form.key} onChange={e => F('key', e.target.value)} style={S.input} placeholder="kebab-case" disabled={!!editItem} />
            </div>
            <div>
              <label style={S.label}>Label *</label>
              <input value={form.label} onChange={e => F('label', e.target.value)} style={S.input} placeholder="Display name" />
            </div>
          </div>
          <div>
            <label style={S.label}>Category</label>
            <select value={form.category} onChange={e => F('category', e.target.value)} style={S.input}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Backend context (AI prompt)</label>
            <textarea value={form.backend_context} onChange={e => F('backend_context', e.target.value)} style={{ ...S.input, minHeight: 120, resize: 'vertical' }} placeholder="AI context for framework selection..." />
          </div>
          <div>
            <label style={S.label}>Sort order</label>
            <input type="number" value={form.sort_order} onChange={e => F('sort_order', parseInt(e.target.value) || 0)} style={{ ...S.input, width: 80 }} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20, paddingTop: 16, borderTop: BRAND.borderLight }}>
          <button onClick={() => setShowModal(false)} style={{ ...S.btn, background: 'transparent', color: BRAND.muted, border: BRAND.border }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.key || !form.label} style={{ ...S.btn, ...S.btnPrimary, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : (editItem ? 'Update' : 'Create')}
          </button>
        </div>
      </Modal>
    </div>
  )
}
