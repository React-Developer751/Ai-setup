// Motion runtime: makes a generated page move. No animation library, just the browser.
//
// The templates mark elements with plain data attributes:
//   data-reveal="up|down|left|right|scale|fade"  fade / slide in when scrolled into view
//   data-delay="1..8"                            stagger step (times the plan's stagger)
//   data-count                                   number that counts up
//   data-draw                                    line that draws itself
//   data-split                                   headline that appears word by word
//   data-carousel / data-slide / data-dot        rotating testimonials
// Pages built from the stored components get the same attributes added automatically (`autoTag`).
//
// Safety rules
//   * Nothing is hidden until this runs (the CSS only hides under [data-motion="on"]), so with JavaScript off,
//     or before the page has mounted, all content is visible.
//   * prefers-reduced-motion switches everything off.
//   * It returns a cleanup function, so it is safe in React StrictMode (effects run twice in development).
import type { MotionPlan } from './motionBrain'

const prefersReducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** The element (or the window) that scrolls the page. In the preview it is the preview box. */
function scrollParent(el: HTMLElement): HTMLElement | Window {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const overflow = getComputedStyle(node).overflowY
    if ((overflow === 'auto' || overflow === 'scroll') && node.scrollHeight > node.clientHeight) return node
  }
  return window
}

const scrollTop = (sp: HTMLElement | Window) => (sp instanceof Window ? window.scrollY : sp.scrollTop)
const scrollRange = (sp: HTMLElement | Window) =>
  sp instanceof Window ? document.documentElement.scrollHeight - window.innerHeight : sp.scrollHeight - sp.clientHeight

// ───────────── count-up ─────────────
// Only plain numbers count: "99.9%", "2M+", "<50ms", "1,200". "24/7" or "Lifetime" are left alone.
const COUNTABLE = /^([<>~+]?)\s*(\d[\d,]*(?:\.\d+)?)\s*(%|[kKmM]\+?|\+|x|ms|s)?$/

function parseCount(text: string) {
  const match = COUNTABLE.exec(text.trim())
  if (!match) return null
  const [, prefix, number, suffix = ''] = match
  const decimals = number.includes('.') ? number.split('.')[1].length : 0
  return { prefix, suffix, target: parseFloat(number.replace(/,/g, '')), decimals, grouped: number.includes(',') }
}

const formatCount = (c: NonNullable<ReturnType<typeof parseCount>>, value: number) => {
  const text = value.toLocaleString('en-US', { minimumFractionDigits: c.decimals, maximumFractionDigits: c.decimals, useGrouping: c.grouped })
  return `${c.prefix}${text}${c.suffix}`
}

// ───────────── pages built from the stored components ─────────────
const signature = (el: Element) => `${el.tagName}|${el.getAttribute('class') ?? ''}`

/** Adds reveal / hover attributes to a page made of the stored components, without touching their code. Returns an undo. */
function autoTag(root: HTMLElement, plan: MotionPlan): () => void {
  const tagged: Element[] = []
  const lifted: Element[] = []

  const mark = (el: Element | null | undefined, kind: string, delay = 0) => {
    if (!el || el.hasAttribute('data-reveal') || el.closest('[data-reveal]')) return
    el.setAttribute('data-reveal', kind)
    if (delay) el.setAttribute('data-delay', String(Math.min(delay, 8)))
    tagged.push(el)
  }

  root.querySelectorAll<HTMLElement>('[data-role]').forEach((section) => {
    const role = section.dataset.role
    if (role === 'nav' || role === 'footer') return
    mark(section.querySelector('h1, h2'), 'up')
    mark(section.querySelector('p'), 'up', 1)

    const seen = new Set<Element>()
    section.querySelectorAll('div, ul, ol').forEach((container) => {
      if (container.closest('[data-reveal]') || [...seen].some((s) => s.contains(container))) return
      const kids = [...container.children]
      if (kids.length < 2 || kids.length > 12) return
      const first = signature(kids[0])
      const cards = kids.every((k) => signature(k) === first && k.getBoundingClientRect().height > 80 && k.getBoundingClientRect().width > 120)
      if (!cards) return
      seen.add(container)
      kids.forEach((card, i) => {
        mark(card, 'up', (i % 4) + 1)
        if (plan.features.hover) {
          card.classList.add('m-lift')
          lifted.push(card)
        }
      })
    })
  })

  return () => {
    tagged.forEach((el) => {
      el.removeAttribute('data-reveal')
      el.removeAttribute('data-delay')
      el.classList.remove('is-in')
    })
    lifted.forEach((el) => el.classList.remove('m-lift'))
  }
}

// ───────────── the engine ─────────────
export function initMotion(root: HTMLElement, plan: MotionPlan): () => void {
  if (plan.level === 'off' || prefersReducedMotion()) {
    root.dataset.motion = 'off'
    return () => {}
  }

  const cleanups: (() => void)[] = []
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    cleanups.push(() => window.clearTimeout(id))
  }

  root.dataset.motion = 'on'
  // what scrolls: the window on a real page, the preview box in the generator
  const sp = scrollParent(root)
  const observerRoot = sp instanceof Window ? null : sp
  root.style.setProperty('--m-dur', `${plan.duration}ms`)
  root.style.setProperty('--m-ease', plan.easing)
  root.style.setProperty('--m-dist', `${plan.distance}px`)
  root.style.setProperty('--m-stagger', `${plan.stagger}ms`)

  // library pages: tag cards and headings first
  if (root.hasAttribute('data-gen-theme') && plan.features.reveal) cleanups.push(autoTag(root, plan))

  // ── count-up: show 0 until the number scrolls into view
  const counters = plan.features.countUp
    ? [...root.querySelectorAll<HTMLElement>('[data-count]')].flatMap((el) => {
        const final = el.textContent ?? ''
        const parsed = parseCount(final)
        if (!parsed) return []
        el.textContent = formatCount(parsed, 0)
        cleanups.push(() => (el.textContent = final))
        return [{ el, final, parsed }]
      })
    : []

  const runCounter = (item: (typeof counters)[number]) => {
    const start = performance.now()
    const duration = 1400
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 3
      item.el.textContent = t < 1 ? formatCount(item.parsed, item.parsed.target * eased) : item.final
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    cleanups.push(() => cancelAnimationFrame(frame))
  }

  // ── headline word by word
  if (plan.features.split) {
    root.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
      if (el.dataset.splitDone) return
      const text = (el.textContent ?? '').trim()
      el.dataset.splitDone = '1'
      el.setAttribute('aria-label', text)
      el.textContent = ''
      text.split(/\s+/).forEach((word, i, words) => {
        const span = document.createElement('span')
        span.className = 'm-word'
        span.setAttribute('aria-hidden', 'true')
        span.style.transitionDelay = `${i * 60}ms`
        span.textContent = word
        el.append(span)
        if (i < words.length - 1) el.append(' ')
      })
      cleanups.push(() => {
        el.textContent = text
        delete el.dataset.splitDone
      })
    })
  }

  // ── reveal when scrolled into view
  const targets = [...root.querySelectorAll<HTMLElement>('[data-reveal], [data-draw], [data-split]')]
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = entry.target as HTMLElement
        observer.unobserve(el)
        el.classList.add('is-in')
        if (el.hasAttribute('data-reveal')) {
          // once it has arrived, drop the attributes so hover transitions are not slowed by the reveal delay
          const wait = plan.duration + Number(el.dataset.delay ?? 0) * plan.stagger + 120
          later(() => {
            el.removeAttribute('data-reveal')
            el.removeAttribute('data-delay')
            el.classList.remove('is-in')
          }, wait)
        }
      }
    },
    { root: observerRoot, threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  )
  targets.forEach((el) => observer.observe(el))
  cleanups.push(() => observer.disconnect())

  const counterObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        counterObserver.unobserve(entry.target)
        const item = counters.find((c) => c.el === entry.target)
        if (item) runCounter(item)
      }
    },
    { root: observerRoot, threshold: 0.4 },
  )
  counters.forEach((c) => counterObserver.observe(c.el))
  cleanups.push(() => counterObserver.disconnect())

  // ── scroll-driven pieces: navigation shadow and progress bar
  const nav = plan.features.navShrink ? root.querySelector<HTMLElement>('nav, header') : null
  let progress: HTMLElement | null = null
  if (plan.features.progress) {
    const track = document.createElement('div')
    track.setAttribute('aria-hidden', 'true')
    track.style.cssText = 'position:sticky;top:0;z-index:70;height:3px;pointer-events:none'
    progress = document.createElement('div')
    progress.style.cssText = 'height:100%;transform:scaleX(0);transform-origin:left;background:var(--g-accent, var(--color-indigo-500, #6366f1))'
    track.append(progress)
    root.prepend(track)
    cleanups.push(() => track.remove())
  }

  if (nav || progress) {
    const onScroll = () => {
      const top = scrollTop(sp)
      if (nav) nav.dataset.scrolled = top > 12 ? 'true' : 'false'
      if (progress) {
        const range = scrollRange(sp)
        progress.style.transform = `scaleX(${range > 0 ? Math.min(1, top / range) : 0})`
      }
    }
    sp.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    cleanups.push(() => {
      sp.removeEventListener('scroll', onScroll)
      if (nav) delete nav.dataset.scrolled
    })
  }

  // ── rotating testimonials
  if (plan.features.carousel) {
    root.querySelectorAll<HTMLElement>('[data-carousel]').forEach((carousel) => {
      const slides = [...carousel.querySelectorAll<HTMLElement>('[data-slide]')]
      const dots = [...carousel.querySelectorAll<HTMLElement>('[data-dot]')]
      if (slides.length < 2) return
      let index = 0
      const show = (next: number) => {
        index = (next + slides.length) % slides.length
        slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index))
        dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)))
      }
      let timer = window.setInterval(() => show(index + 1), 5500)
      const pause = () => window.clearInterval(timer)
      const resume = () => {
        pause()
        timer = window.setInterval(() => show(index + 1), 5500)
      }
      carousel.addEventListener('pointerenter', pause)
      carousel.addEventListener('pointerleave', resume)
      carousel.addEventListener('focusin', pause)
      carousel.addEventListener('focusout', resume)
      dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); resume() }))
      show(0)
      cleanups.push(() => {
        pause()
        carousel.removeEventListener('pointerenter', pause)
        carousel.removeEventListener('pointerleave', resume)
        carousel.removeEventListener('focusin', pause)
        carousel.removeEventListener('focusout', resume)
        slides.forEach((slide) => slide.classList.remove('is-active'))
      })
    })
  }

  return () => {
    cleanups.splice(0).reverse().forEach((fn) => fn())
    root.dataset.motion = 'off'
  }
}
