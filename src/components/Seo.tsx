import { useEffect } from 'react'

const SITE = 'https://wearinterval.space'

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

/** Per-route title, description, canonical URL and Open Graph tags. */
export function usePageMeta({ title, description, path, noindex }: { title: string; description: string; path: string; noindex?: boolean }) {
  useEffect(() => {
    const full = title.includes('Wearinterval') ? title : `${title} · Wearinterval`
    document.title = full
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', full)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', SITE + path)
    setMeta('name', 'robots', noindex ? 'noindex' : 'index,follow')
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = SITE + path
  }, [title, description, path, noindex])
}
