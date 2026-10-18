// Ranks picker items against a query. Lower rank is a better match; -1 is no match.
// Matching ignores case and accents, so "sao" finds "São Tomé".

const strip = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

export function rank(item, query) {
  const q = strip(query)
  if (!q) return 0
  const label = strip(item.label)
  const keys = (item.keywords ?? []).map(strip)
  if (label.startsWith(q)) return 0
  if (keys.some((k) => k === q)) return 1
  if (label.split(/\s+/).some((w) => w.startsWith(q))) return 2
  if (keys.some((k) => k.startsWith(q))) return 3
  if (label.includes(q)) return 4
  if (keys.some((k) => k.includes(q))) return 5
  return -1
}

export function filterItems(items, query) {
  return items
    .map((item, index) => ({ item, index, score: rank(item, query) }))
    .filter((r) => r.score >= 0)
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map((r) => r.item)
}
