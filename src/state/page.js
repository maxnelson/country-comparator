// The info pages are query-string views of the one page, because GitHub Pages
// has no SPA fallback for real paths:  ?page=methodology  ?page=sources
// Anything else, or no page parameter, is the comparison.

export const PAGES = {
  methodology: 'Methodology',
  sources: 'Data sources',
}

const PAGE_PARAM = 'page'

export function pageFromSearch(search) {
  const page = new URLSearchParams(search).get(PAGE_PARAM)
  return Object.hasOwn(PAGES, page) ? page : null
}

// Link to a page, relative to the app's base path
export function pageHref(page) {
  return `${import.meta.env.BASE_URL}?${PAGE_PARAM}=${page}`
}
