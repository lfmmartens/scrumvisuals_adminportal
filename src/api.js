// Admin Portal API Client
// All calls go to the single N8N webhook endpoint

const API_URL = '/webhook/admin-api'

const API_KEY = 'AdminPortal2026Secure!'

async function api(entity, action, data = {}, filters = {}) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({ entity, action, data, filters }),
    })
    const json = await res.json()
    if (!json.success) {
      throw new Error(json.error || json.message || 'API error')
    }
    return json
  } catch (err) {
    console.error(`API ${entity}.${action} failed:`, err)
    throw err
  }
}

// ── Frameworks ──
export const frameworks = {
  list: (filters = {}) => api('frameworks', 'list', {}, filters),
  get: (idOrSlug) => {
    const key = typeof idOrSlug === 'number' ? 'id' : 'slug'
    return api('frameworks', 'get', { [key]: idOrSlug })
  },
  create: (data) => api('frameworks', 'create', data),
  update: (data) => api('frameworks', 'update', data),
  archive: (id) => api('frameworks', 'delete', { id }),
  bulkStatus: (ids, status) => api('frameworks', 'bulk_status', { ids, status }),
  count: () => api('frameworks', 'count'),
}

// ── Workshop Types ──
export const workshopTypes = {
  list: (filters = {}) => api('workshop_types', 'list', {}, filters),
  get: (id) => api('workshop_types', 'get', { id }),
  create: (data) => api('workshop_types', 'create', data),
  update: (data) => api('workshop_types', 'update', data),
  toggle: (id) => api('workshop_types', 'toggle', { id }),
  archive: (id) => api('workshop_types', 'delete', { id }),
}

// ── Styles ──
export const styles = {
  list: () => api('styles', 'list'),
  get: (idOrSlug) => {
    const key = typeof idOrSlug === 'string' ? 'slug' : 'id'
    return api('styles', 'get', { [key]: idOrSlug })
  },
  update: (data) => api('styles', 'update', data),
}

// ── Templates ──
export const templates = {
  list: (filters = {}) => api('templates', 'list', {}, filters),
  create: (data) => api('templates', 'create', data),
  update: (data) => api('templates', 'update', data),
  archive: (id) => api('templates', 'delete', { id }),
}

// ── Enums ──
export const enums = {
  list: (type) => api('enums', 'list', {}, type ? { type } : {}),
  add: (enumType, enumValue, sortOrder) => api('enums', 'add', { enum_type: enumType, enum_value: enumValue, sort_order: sortOrder }),
  remove: (enumType, enumValue) => api('enums', 'remove', { enum_type: enumType, enum_value: enumValue }),
}

// ── Jobs ──
export const jobs = {
  list: (filters = {}) => api('jobs', 'list', {}, filters),
  get: (id) => api('jobs', 'get', { id }),
  remove: (id) => api('jobs', 'delete', { id }),
}
