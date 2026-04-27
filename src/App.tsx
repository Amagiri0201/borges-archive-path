import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import { branchChoices, chapters, sources, type Chapter, type Hotspot } from './data/chapters'
import {
  spatialActors,
  spatialActorChapterIds,
  type SpatialActor,
  type SpatialBookActor,
  type SpatialLightActor,
  type SpatialNodeActor,
  type SpatialPathActor,
  type SpatialSpineActor,
  type SpatialTermActor,
} from './data/spatialActors'
import { getThoughtEcho, voiceLabels } from './data/thoughts'

type GuideState = {
  chapter: Chapter
  hotspot: Hotspot
} | null

type TransitionPhase = 'idle' | 'fading' | 'traveling' | 'settling'
type ThoughtSwapPhase = 'idle' | 'out' | 'in'

const mapColumns = 3
const fadeDuration = 560
const travelDuration = 1550
const settleDuration = 780
const thoughtSwapOutDuration = 420
const thoughtSwapInDuration = 960

const alephParticles = Array.from({ length: 12 }, (_, index) => {
  const angle = (index / 12) * Math.PI * 2
  const radius = 7 + ((index * 11) % 21)

  return {
    dx: Math.cos(angle) * radius,
    dy: Math.sin(angle) * radius * 0.58,
    index,
  }
})

function getInitialChapterId() {
  if (typeof window === 'undefined') return chapters[0].id

  const thoughtChapterId = new URLSearchParams(window.location.search).get('thought')?.split(':')[0]
  if (chapters.some((chapter) => chapter.id === thoughtChapterId)) return thoughtChapterId as string

  const hashId = window.location.hash.replace('#', '')
  return chapters.some((chapter) => chapter.id === hashId) ? hashId : chapters[0].id
}

function getInitialGuide() {
  if (typeof window === 'undefined') return null

  const thoughtParam = new URLSearchParams(window.location.search).get('thought')
  if (!thoughtParam) return null

  const [chapterId, hotspotId] = thoughtParam.split(':')
  const chapter = chapters.find((item) => item.id === chapterId)
  if (!chapter) return null

  const hotspot = getHotspot(chapter, hotspotId)
  return hotspot ? { chapter, hotspot } : null
}

function getMapPosition(index: number) {
  return {
    column: index % mapColumns,
    row: Math.floor(index / mapColumns),
  }
}

function hasSemanticActors(id: string) {
  return spatialActorChapterIds.has(id)
}

function getHotspot(chapter: Chapter, id: string) {
  return chapter.hotspots.find((hotspot) => hotspot.id === id) ?? chapter.hotspots[0]
}

function getGuideKey(guide: GuideState) {
  return guide ? `${guide.chapter.id}:${guide.hotspot.id}` : ''
}

function actorsOfType<T extends SpatialActor['type']>(
  actors: SpatialActor[],
  type: T,
): Extract<SpatialActor, { type: T }>[] {
  return actors.filter((actor): actor is Extract<SpatialActor, { type: T }> => actor.type === type)
}

function percentStyle(x: number, y: number) {
  return { '--actor-x': `${x}%`, '--actor-y': `${y}%` } as CSSProperties
}

function ForkingActorLayer({
  chapter,
  actors,
  onOpenGuide,
  onChooseBranch,
  readingPath,
}: {
  chapter: Chapter
  actors: SpatialActor[]
  onOpenGuide: (chapter: Chapter, hotspot: Hotspot) => void
  onChooseBranch: (choiceId: string, targetId: string) => void
  readingPath: string | null
}) {
  const paths = actorsOfType(actors, 'path') as SpatialPathActor[]
  const nodes = actorsOfType(actors, 'node') as SpatialNodeActor[]

  return (
    <div className="semantic-actor-layer forking-actor-layer" aria-label="forking visual actors">
      <svg className="forking-map" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {paths.map((path) => (
          <path className={`fork-path fork-path-soft path-${path.role ?? 'branch'}`} d={path.d} key={`${path.id}-soft`} />
        ))}
        {paths.map((path) => (
          <path
            className={`fork-path fork-path-flow path-${path.role ?? 'branch'}`}
            d={path.d}
            key={`${path.id}-flow`}
            style={{ animationDelay: path.delay } as CSSProperties}
          />
        ))}
      </svg>
      <span className="forking-figure-mask" aria-hidden="true" />

      {nodes.map((node) => {
        if (node.branchChoiceId && node.targetId) {
          return (
            <button
              className={`branch-map-node ${readingPath === node.branchChoiceId ? 'is-selected' : ''}`}
              key={node.id}
              onClick={() => onChooseBranch(node.branchChoiceId as string, node.targetId as string)}
              style={percentStyle(node.x, node.y)}
            >
              <span />
              <strong>{node.label}</strong>
            </button>
          )
        }

        const hotspot = getHotspot(chapter, node.hotspotId ?? 'time-node')

        return (
          <button
            className={`path-actor ${node.role === 'focus' ? 'is-focus' : ''}`}
            key={node.id}
            onClick={() => onOpenGuide(chapter, hotspot)}
            aria-label={hotspot.label}
            style={percentStyle(node.x, node.y)}
          >
            <span />
            <strong>{node.label}</strong>
          </button>
        )
      })}
    </div>
  )
}

function AlephActorLayer({
  chapter,
  actors,
  onOpenGuide,
}: {
  chapter: Chapter
  actors: SpatialActor[]
  onOpenGuide: (chapter: Chapter, hotspot: Hotspot) => void
}) {
  const core = actorsOfType(actors, 'light')[0] as SpatialLightActor | undefined
  const terms = actorsOfType(actors, 'term') as SpatialTermActor[]

  if (!core) return null

  const coreHotspot = getHotspot(chapter, core.hotspotId)

  return (
    <div
      className="semantic-actor-layer aleph-actor-layer"
      aria-label="aleph visual actors"
      style={{ '--aleph-core-x': `${core.x}%`, '--aleph-core-y': `${core.y}%` } as CSSProperties}
    >
      <div className="aleph-field" aria-hidden="true">
        {alephParticles.map((particle) => (
          <span
            className={`aleph-particle particle-${particle.index % 6}`}
            key={particle.index}
            style={
              {
                '--particle-index': particle.index,
                '--particle-x': `${core.x + particle.dx}%`,
                '--particle-y': `${core.y + particle.dy}%`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <button className="aleph-core-actor" onClick={() => onOpenGuide(chapter, coreHotspot)} aria-label={core.label}>
        <span className="aleph-core-light" />
        <span className="aleph-core-ring" />
        <span className="aleph-core-ring ring-slow" />
      </button>
      {terms.map((term) => (
        <button
          className="aleph-index-chip"
          key={term.id}
          onClick={() => onOpenGuide(chapter, getHotspot(chapter, term.hotspotId))}
          style={
            {
              '--actor-x': `${term.x}%`,
              '--actor-y': `${term.y}%`,
              animationDelay: term.delay,
            } as CSSProperties
          }
        >
          {term.label}
        </button>
      ))}
    </div>
  )
}

function BookActorLayer({
  chapter,
  actors,
  onOpenGuide,
}: {
  chapter: Chapter
  actors: SpatialActor[]
  onOpenGuide: (chapter: Chapter, hotspot: Hotspot) => void
}) {
  const books = actorsOfType(actors, 'book') as SpatialBookActor[]
  const spines = actorsOfType(actors, 'spine') as SpatialSpineActor[]

  return (
    <div className="semantic-actor-layer book-actor-layer" aria-label="book visual actors">
      {books.map((book, index) => (
        <button
          className="page-fragment"
          key={book.id}
          onClick={() => onOpenGuide(chapter, getHotspot(chapter, book.hotspotId))}
          aria-label={book.title}
          style={
            {
              '--actor-x': `${book.x}%`,
              '--actor-y': `${book.y}%`,
              '--page-index': index,
              '--page-rotate': `${book.rotate}deg`,
              '--page-drift-rotate': `${book.driftRotate}deg`,
              '--book-scale': book.scale ?? 1,
              animationDelay: `${book.delay * -1}ms`,
            } as CSSProperties
          }
        >
          <strong>{book.title}</strong>
          <small>{book.meta}</small>
          <span className="page-rule" />
        </button>
      ))}
      {spines.map((spine) => {
        const hotspot = getHotspot(chapter, spine.hotspotId)

        return (
          <button
            className="sand-spine"
            key={spine.id}
            onClick={() => onOpenGuide(chapter, hotspot)}
            aria-label={hotspot.label}
            style={
              {
                '--actor-x': `${spine.x}%`,
                '--actor-y': `${spine.y}%`,
                '--spine-width': `${spine.width}%`,
                '--spine-angle': `${spine.angle}deg`,
              } as CSSProperties
            }
          />
        )
      })}
    </div>
  )
}

function SemanticActorLayer({
  chapter,
  onOpenGuide,
  onChooseBranch,
  readingPath,
}: {
  chapter: Chapter
  onOpenGuide: (chapter: Chapter, hotspot: Hotspot) => void
  onChooseBranch: (choiceId: string, targetId: string) => void
  readingPath: string | null
}) {
  const actors = spatialActors[chapter.id]

  if (!actors) return null

  if (chapter.id === 'forking-paths') {
    return (
      <ForkingActorLayer
        actors={actors}
        chapter={chapter}
        onChooseBranch={onChooseBranch}
        onOpenGuide={onOpenGuide}
        readingPath={readingPath}
      />
    )
  }

  if (chapter.id === 'aleph') {
    return <AlephActorLayer actors={actors} chapter={chapter} onOpenGuide={onOpenGuide} />
  }

  if (chapter.id === 'book-of-sand') {
    return <BookActorLayer actors={actors} chapter={chapter} onOpenGuide={onOpenGuide} />
  }

  return null
}

function TypewriterText({
  className,
  isActive,
  text,
}: {
  className: string
  isActive: boolean
  text: string
}) {
  const [displayText, setDisplayText] = useState(isActive ? '' : text)

  useEffect(() => {
    const characters = Array.from(text)

    if (!isActive || characters.length === 0) {
      const instantTimer = window.setTimeout(() => setDisplayText(text), 0)

      return () => {
        window.clearTimeout(instantTimer)
      }
    }

    let index = 0
    let typingTimer: number | null = null
    const startTimer = window.setTimeout(() => {
      setDisplayText('')

      typingTimer = window.setInterval(() => {
        index += 1
        setDisplayText(characters.slice(0, index).join(''))

        if (index >= characters.length && typingTimer) {
          window.clearInterval(typingTimer)
        }
      }, 42)
    }, 0)

    return () => {
      window.clearTimeout(startTimer)
      if (typingTimer) window.clearInterval(typingTimer)
    }
  }, [isActive, text])

  const isTyping = isActive && displayText.length < Array.from(text).length

  return (
    <p className={`${className} ${isTyping ? 'is-typing' : 'is-typed'}`} aria-label={text}>
      {displayText}
      {isTyping ? <span className="type-caret" aria-hidden="true" /> : null}
    </p>
  )
}

function App() {
  const [activeId, setActiveId] = useState(getInitialChapterId)
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>('idle')
  const [guide, setGuide] = useState<GuideState>(getInitialGuide)
  const [thoughtSwapPhase, setThoughtSwapPhase] = useState<ThoughtSwapPhase>(() =>
    getInitialGuide() ? 'in' : 'idle',
  )
  const [activeThoughtPromptId, setActiveThoughtPromptId] = useState<string | null>(null)
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false)
  const [readingPath, setReadingPath] = useState<string | null>(null)
  const [collectedIds, setCollectedIds] = useState<string[]>([])
  const swapTimerRef = useRef<number | null>(null)
  const settleTimerRef = useRef<number | null>(null)
  const idleTimerRef = useRef<number | null>(null)
  const guideSwapTimerRef = useRef<number | null>(null)
  const guideIdleTimerRef = useRef<number | null>(null)

  const activeChapter = useMemo(
    () => chapters.find((chapter) => chapter.id === activeId) ?? chapters[0],
    [activeId],
  )
  const activeIndex = Math.max(
    chapters.findIndex((chapter) => chapter.id === activeId),
    0,
  )
  const nextChapter = chapters[activeIndex + 1] ?? chapters[0]
  const activeMapPosition = getMapPosition(activeIndex)
  const isTransitioning = transitionPhase !== 'idle'

  const selectedBranch = branchChoices.find((choice) => choice.id === readingPath)
  const collectedHotspots = chapters.flatMap((chapter) =>
    chapter.hotspots
      .filter((hotspot) => collectedIds.includes(`${chapter.id}:${hotspot.id}`))
      .map((hotspot) => ({ chapter, hotspot })),
  )

  useEffect(() => {
    function syncFromHash() {
      const sectionId = window.location.hash.replace('#', '')
      if (!sectionId || !chapters.some((chapter) => chapter.id === sectionId)) return

      setActiveId(sectionId)
    }

    window.addEventListener('hashchange', syncFromHash)

    return () => {
      window.removeEventListener('hashchange', syncFromHash)
      if (swapTimerRef.current) window.clearTimeout(swapTimerRef.current)
      if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current)
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current)
      if (guideSwapTimerRef.current) window.clearTimeout(guideSwapTimerRef.current)
      if (guideIdleTimerRef.current) window.clearTimeout(guideIdleTimerRef.current)
    }
  }, [])

  function clearGuideTimers() {
    if (guideSwapTimerRef.current) window.clearTimeout(guideSwapTimerRef.current)
    if (guideIdleTimerRef.current) window.clearTimeout(guideIdleTimerRef.current)
  }

  function settleThoughtGuide(delay = thoughtSwapInDuration) {
    if (guideIdleTimerRef.current) window.clearTimeout(guideIdleTimerRef.current)

    guideIdleTimerRef.current = window.setTimeout(() => {
      setThoughtSwapPhase('idle')
    }, delay)
  }

  function collectHotspot(chapter: Chapter, hotspot: Hotspot) {
    if (!hotspot.collectable) return

    const key = `${chapter.id}:${hotspot.id}`
    setCollectedIds((current) => (current.includes(key) ? current : [...current, key]))
  }

  function activateChapter(id: string) {
    if (id === activeId || !chapters.some((chapter) => chapter.id === id)) return

    if (swapTimerRef.current) window.clearTimeout(swapTimerRef.current)
    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current)
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current)
    clearGuideTimers()

    setGuide(null)
    setActiveThoughtPromptId(null)
    setThoughtSwapPhase('idle')
    setTransitionPhase('fading')

    swapTimerRef.current = window.setTimeout(() => {
      setActiveId(id)
      window.history.replaceState(null, '', `#${id}`)
      setTransitionPhase('traveling')
    }, fadeDuration)

    settleTimerRef.current = window.setTimeout(() => {
      setTransitionPhase('settling')
    }, fadeDuration + travelDuration)

    idleTimerRef.current = window.setTimeout(() => {
      setTransitionPhase('idle')
    }, fadeDuration + travelDuration + settleDuration)
  }

  function openGuide(chapter: Chapter, hotspot: Hotspot) {
    const nextGuide = { chapter, hotspot }
    const currentGuideKey = getGuideKey(guide)
    const nextGuideKey = getGuideKey(nextGuide)

    clearGuideTimers()
    setActiveThoughtPromptId(null)
    setIsEvidenceOpen(false)
    collectHotspot(chapter, hotspot)

    if (!guide) {
      setGuide(nextGuide)
      setThoughtSwapPhase('in')
      settleThoughtGuide()
      return
    }

    if (currentGuideKey === nextGuideKey) {
      setGuide(nextGuide)
      setThoughtSwapPhase('in')
      settleThoughtGuide()
      return
    }

    setThoughtSwapPhase('out')
    guideSwapTimerRef.current = window.setTimeout(() => {
      setGuide(nextGuide)
      setThoughtSwapPhase('in')
      settleThoughtGuide()
    }, thoughtSwapOutDuration)
  }

  function closeGuide() {
    if (!guide) return

    clearGuideTimers()
    setThoughtSwapPhase('out')
    guideSwapTimerRef.current = window.setTimeout(() => {
      setGuide(null)
      setActiveThoughtPromptId(null)
      setThoughtSwapPhase('idle')
    }, thoughtSwapOutDuration)
  }

  function selectThoughtPrompt(promptId: string | null) {
    if (promptId === activeThoughtPromptId) return

    clearGuideTimers()
    setThoughtSwapPhase('out')
    guideSwapTimerRef.current = window.setTimeout(() => {
      setActiveThoughtPromptId(promptId)
      setThoughtSwapPhase('in')
      settleThoughtGuide(760)
    }, thoughtSwapOutDuration)
  }

  function chooseBranch(choiceId: string, targetId: string) {
    setReadingPath(choiceId)
    window.setTimeout(() => activateChapter(targetId), 320)
  }

  function goNextChapter() {
    activateChapter(nextChapter.id)
  }

  function collectCurrentThought() {
    if (!guide) return

    const key = `${guide.chapter.id}:${guide.hotspot.id}`
    setCollectedIds((current) => (current.includes(key) ? current : [...current, key]))
  }

  const currentThought = guide ? getThoughtEcho(guide.chapter.id, guide.hotspot.id) : null
  const currentThoughtVoice = currentThought ? voiceLabels[currentThought.voice] : '档案回声'
  const currentThoughtTitle = currentThought?.title ?? guide?.hotspot.label ?? ''
  const currentThoughtPrompts = currentThought?.prompts ?? []
  const activeThoughtPrompt =
    currentThoughtPrompts.find((prompt) => prompt.id === activeThoughtPromptId) ?? null
  const currentThoughtText = activeThoughtPrompt?.reply ?? currentThought?.text ?? guide?.hotspot.text ?? ''
  const currentThoughtMotif = currentThought?.motif ?? guide?.chapter.motif ?? ''
  const currentThoughtTag = currentThoughtMotif.split('/')[0]?.trim() || currentThoughtVoice
  const currentThoughtEvidence = currentThought?.evidence ?? guide?.hotspot.source ?? ''
  const currentGuideKey = getGuideKey(guide)
  const currentThoughtLineKey = `${currentGuideKey}:${activeThoughtPromptId ?? 'opening'}`
  const isThoughtEntering = thoughtSwapPhase === 'in'

  return (
    <main
      className={`app-shell transition-${transitionPhase} ${isTransitioning ? 'is-transitioning' : ''}`}
      style={
        {
          '--camera-x': `${activeMapPosition.column * -100}vw`,
          '--camera-y': `${activeMapPosition.row * -100}svh`,
          '--map-origin-x': `${activeMapPosition.column * 100}vw`,
          '--map-origin-y': `${activeMapPosition.row * 100}svh`,
        } as CSSProperties
      }
    >
      <div className="ambient-grain" aria-hidden="true" />
      <nav className="chapter-rail" aria-label="章节路径">
        <div className="rail-title">
          <span>BORGES ARCHIVE PATH</span>
          <strong>{activeChapter.index}</strong>
        </div>
        <div className="rail-nodes">
          {chapters.map((chapter) => (
            <button
              className={`rail-node ${chapter.id === activeId ? 'is-active' : ''}`}
              key={chapter.id}
              onClick={() => activateChapter(chapter.id)}
              title={`${chapter.index} ${chapter.title}`}
            >
              <span>{chapter.index}</span>
            </button>
          ))}
        </div>
      </nav>

      <aside className="path-status" aria-live="polite">
        <span>已收集 {collectedIds.length}</span>
        <strong>{selectedBranch?.result ?? '阅读路径未分岔'}</strong>
      </aside>

      <article className="chapter-panel chapter-dossier" key={activeChapter.id}>
        <p className="chapter-kicker">CHAPTER {activeChapter.index}</p>
        <h1>{activeChapter.title}</h1>
        <h2>{activeChapter.subtitle}</h2>
        <dl>
          <div>
            <dt>时间</dt>
            <dd>{activeChapter.years}</dd>
          </div>
          <div>
            <dt>生平</dt>
            <dd>{activeChapter.lifeNode}</dd>
          </div>
          <div>
            <dt>文本</dt>
            <dd>{activeChapter.work}</dd>
          </div>
          <div>
            <dt>母题</dt>
            <dd>{activeChapter.motif}</dd>
          </div>
        </dl>
        <p className="chapter-summary">{activeChapter.summary}</p>
        <blockquote>{activeChapter.quote}</blockquote>
      </article>

      <button className="next-chapter hud-next" onClick={goNextChapter}>
        下一章
      </button>

      <div className="spatial-map-viewport" aria-label="博尔赫斯空间地图">
        <div className="spatial-map">
          {chapters.map((chapter, index) => {
            const position = getMapPosition(index)

            return (
              <section
                className={`story-section map-cell ${chapter.id === activeId ? 'is-active' : ''} ${hasSemanticActors(chapter.id) ? 'has-semantic-actors' : ''}`}
                id={chapter.id}
                key={chapter.id}
                style={
                  {
                    gridColumn: position.column + 1,
                    gridRow: position.row + 1,
                  } as CSSProperties
                }
              >
                <img className="section-bg" src={chapter.image} alt="" />
                <div className="section-scrim" />
                <div className="section-grid" />

                {hasSemanticActors(chapter.id) ? (
                  <SemanticActorLayer
                    chapter={chapter}
                    onOpenGuide={openGuide}
                    onChooseBranch={chooseBranch}
                    readingPath={readingPath}
                  />
                ) : null}

                <div
                  className={`hotspot-layer ${hasSemanticActors(chapter.id) ? 'hotspot-layer-semantic' : ''}`}
                  aria-label={`${chapter.title} 热点`}
                >
                  {chapter.hotspots.map((hotspot) => (
                    <button
                      className={`hotspot ${hotspot.collectable ? 'is-collectable' : ''}`}
                      key={hotspot.id}
                      onClick={() => openGuide(chapter, hotspot)}
                      style={{
                        left: `${hotspot.x}%`,
                        top: `${hotspot.y}%`,
                      }}
                    >
                      <span className="hotspot-pulse" />
                      <span className="hotspot-core" />
                      <span className="hotspot-label">{hotspot.label}</span>
                    </button>
                  ))}
                </div>

                {chapter.id === 'forking-paths' ? (
                  <div className="branch-panel" aria-label="小径分岔路径选择程序">
                    <div className="branch-panel-core" aria-hidden="true">
                      <span>PATH</span>
                      <strong>03</strong>
                      <small>SELECTION</small>
                    </div>
                    <div className="branch-choice-grid">
                      {branchChoices.map((choice) => (
                        <button
                          className={`branch-choice ${readingPath === choice.id ? 'is-selected' : ''}`}
                          key={choice.id}
                          onClick={() => chooseBranch(choice.id, choice.targetId)}
                        >
                          <span>{choice.label}</span>
                          <small>{choice.summary}</small>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {chapter.id === 'book-of-sand' && (selectedBranch || collectedHotspots.length > 0) ? (
                  <div className="collection-panel">
                    <p>沙之书收集</p>
                    <strong>{selectedBranch?.result ?? '等待一次分岔选择'}</strong>
                    <span>{selectedBranch?.summary ?? '在小径分岔章节选择路径后，这里会生成阅读方向。'}</span>
                    <div className="fragment-list">
                      {collectedHotspots.slice(0, 5).map(({ chapter: sourceChapter, hotspot }) => (
                        <button
                          key={`${sourceChapter.id}:${hotspot.id}`}
                          onClick={() => openGuide(sourceChapter, hotspot)}
                        >
                          {sourceChapter.index} / {hotspot.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {chapter.id === 'method-archive' ? (
                  <div className="source-wall">
                    {sources.map((source) => (
                      <div key={source.id}>
                        <strong>{source.id}</strong>
                        <span>{source.org}</span>
                        <small>{source.title}</small>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            )
          })}
        </div>
      </div>

      {guide ? (
        <aside
          className={`thought-panel thought-panel-${currentThought?.voice ?? 'archivist'} thought-${thoughtSwapPhase}`}
          role="dialog"
          aria-label="思想回声"
        >
          <div className="thought-frame-ornaments" aria-hidden="true">
            <span className="thought-frame-corner thought-frame-corner-tr" />
            <span className="thought-frame-corner thought-frame-corner-br" />
          </div>

          <div className="thought-portrait" aria-hidden="true">
            <img src="/images/borges-archive-echo-clean.png" alt="" />
          </div>

          <div className="thought-body" key={currentGuideKey}>
            <button className="thought-close" onClick={closeGuide} aria-label="关闭思想回声">
              ×
            </button>
            <p className="thought-kicker">THOUGHT ECHO / {guide.chapter.index}</p>
            <div className="thought-meta">
              <span>{currentThoughtVoice}</span>
              <span>{currentThoughtTag}</span>
            </div>
            <h3>{currentThoughtTitle}</h3>
            {activeThoughtPrompt ? (
              <div className="thought-question-line">
                <span>你问</span>
                <strong>{activeThoughtPrompt.label}</strong>
              </div>
            ) : null}
            <TypewriterText
              className="thought-line"
              isActive={isThoughtEntering}
              key={currentThoughtLineKey}
              text={currentThoughtText}
            />

            {currentThoughtPrompts.length > 0 ? (
              <div className="thought-prompts" aria-label="思想追问">
                {currentThoughtPrompts.map((prompt) => (
                  <button
                    className={activeThoughtPromptId === prompt.id ? 'is-selected' : ''}
                    key={prompt.id}
                    onClick={() => selectThoughtPrompt(prompt.id)}
                    aria-pressed={activeThoughtPromptId === prompt.id}
                  >
                    <span>{prompt.label}</span>
                  </button>
                ))}
                {activeThoughtPrompt ? (
                  <button className="thought-reset" onClick={() => selectThoughtPrompt(null)}>
                    <span>回到起句</span>
                  </button>
                ) : null}
              </div>
            ) : null}

            {guide.chapter.id === 'forking-paths' ? (
              <div className="thought-actions thought-actions-branch">
                {branchChoices.map((choice) => (
                  <button
                    className={readingPath === choice.id ? 'is-selected' : ''}
                    key={choice.id}
                    onClick={() => chooseBranch(choice.id, choice.targetId)}
                  >
                    <span>{choice.label}</span>
                  </button>
                ))}
                <button className="thought-evidence-toggle" onClick={() => setIsEvidenceOpen((current) => !current)}>
                  <span>{isEvidenceOpen ? '收起证据' : '文本证据'}</span>
                </button>
              </div>
            ) : (
              <div className="thought-actions">
                <button onClick={collectCurrentThought}>
                  <span>{currentThought?.collectLabel ?? '收入路径'}</span>
                </button>
                <button onClick={() => setIsEvidenceOpen((current) => !current)}>
                  <span>{isEvidenceOpen ? '收起证据' : '文本证据'}</span>
                </button>
              </div>
            )}

            {isEvidenceOpen ? (
              <div className="thought-evidence">
                <span>{currentThoughtEvidence}</span>
                <blockquote>{guide.chapter.quote}</blockquote>
              </div>
            ) : null}
          </div>
        </aside>
      ) : null}
    </main>
  )
}

export default App
