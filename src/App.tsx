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
import { getThoughtEcho, voiceLabels, type ThoughtPrompt } from './data/thoughts'

type GuideState = {
  chapter: Chapter
  hotspot: Hotspot
} | null

type TransitionPhase = 'idle' | 'fading' | 'traveling' | 'settling'
type ThoughtSwapPhase = 'idle' | 'out' | 'in' | 'closing'
type SoundCue =
  | 'toggle-on'
  | 'toggle-off'
  | 'chapter'
  | 'thought-open'
  | 'thought-close'
  | 'prompt'
  | 'branch'
  | 'collect'
  | 'evidence'
  | 'typing'

type AmbientNodes = {
  gain: GainNode
  nodes: AudioScheduledSourceNode[]
}

const mapColumns = 3
const fadeDuration = 640
const travelDuration = 1780
const settleDuration = 1540
const thoughtSwapOutDuration = 520
const thoughtSwapInDuration = 1120
const thoughtCloseDuration = 760
const ambientMusicPath = '/audio/ambient.mp3'
const musicBaseVolume = 0.2
const audioFocusByChapter: Record<string, { x: number; y: number; radius: number; stretch: number }> = {
  'archive-entry': { x: 0.51, y: 0.49, radius: 0.22, stretch: 1.36 },
  'city-memory': { x: 0.66, y: 0.52, radius: 0.25, stretch: 1.26 },
  'library-life': { x: 0.51, y: 0.49, radius: 0.24, stretch: 1.36 },
  'forking-paths': { x: 0.61, y: 0.64, radius: 0.29, stretch: 1.32 },
  'mirror-dream': { x: 0.72, y: 0.47, radius: 0.24, stretch: 1.16 },
  'circular-ruins': { x: 0.53, y: 0.54, radius: 0.25, stretch: 1.2 },
  'method-archive': { x: 0.54, y: 0.52, radius: 0.24, stretch: 1.22 },
  aleph: { x: 0.82, y: 0.51, radius: 0.27, stretch: 1.18 },
  'book-of-sand': { x: 0.66, y: 0.46, radius: 0.26, stretch: 1.34 },
  'reader-path': { x: 0.58, y: 0.52, radius: 0.23, stretch: 1.26 },
}
const audioConstellationNodes = Array.from({ length: 112 }, (_, index) => ({
  angle: (index / 112) * Math.PI * 2,
  orbit: 0.38 + ((index * 17) % 72) / 100,
  size: 0.45 + ((index * 7) % 10) / 10,
  speed: 0.000012 + ((index * 13) % 18) * 0.0000008,
  jitter: 2 + ((index * 19) % 12),
  band: index % 3,
}))

const thoughtPromptLabelsByChapter: Record<string, Partial<Record<string, string>>> = {
  'archive-entry': {
    motif: '这个入口真正打开什么？',
    evidence: '它凭什么不是空设定？',
  },
  'city-memory': {
    motif: '城市为什么会记忆？',
    evidence: '哪条街通向文本？',
  },
  'library-life': {
    motif: '图书馆为什么像命运？',
    evidence: '生平怎么压进书架？',
  },
  'forking-paths': {
    motif: '如果不选会怎样？',
    evidence: '小说结构在哪里？',
  },
  'mirror-dream': {
    motif: '镜子哪里危险？',
    evidence: '梦和身份怎么接上？',
  },
  'circular-ruins': {
    motif: '谁在梦见谁？',
    evidence: '结尾为何反咬？',
  },
  aleph: {
    motif: '看见全部为何崩溃？',
    evidence: '这个光点连向哪里？',
  },
  'book-of-sand': {
    motif: '书为什么不能拥有？',
    evidence: '碎片如何成为路径？',
  },
  'method-archive': {
    motif: '方法藏在哪里？',
    evidence: '资料如何撑住视觉？',
  },
}

const readerPromptsByChapter: Record<string, ThoughtPrompt> = {
  'archive-entry': {
    id: 'reader',
    label: '我先进入哪一层？',
    reply:
      '先不要急着找“正确顺序”。从入口开始，你要做的是把人物、作品和证据看成同一座档案的三层墙面。',
  },
  'city-memory': {
    id: 'reader',
    label: '我在城市里找什么？',
    reply:
      '找那些不像景点的地方：街角、边缘、回返的路线。博尔赫斯的城市不是地图导览，而是记忆反复折回的痕迹。',
  },
  'library-life': {
    id: 'reader',
    label: '失明以后怎么读？',
    reply:
      '读法会从眼睛退到声音、记忆和想象里。正因为看不见，图书馆才从一排书架变成一种更巨大的精神结构。',
  },
  'forking-paths': {
    id: 'reader',
    label: '我必须做选择吗？',
    reply:
      '必须。不是为了排除其他路径，而是为了让你意识到：任何被点亮的路线，都带着未被选择路线的阴影。',
  },
  'mirror-dream': {
    id: 'reader',
    label: '另一个我可信吗？',
    reply:
      '不太可信，但很有用。镜像里的“我”会把稳定身份拆开，让你看见作者、人物和读者之间并没有绝对边界。',
  },
  'circular-ruins': {
    id: 'reader',
    label: '我会不会也是梦？',
    reply:
      '这正是这一章的陷阱：当你开始怀疑被创造者是否真实，创造者本身也会被同一个问题反过来照亮。',
  },
  aleph: {
    id: 'reader',
    label: '我该盯着光点吗？',
    reply:
      '可以盯着，但不要相信自己能整理它。阿莱夫的力量不是给你答案，而是让“全部同时出现”这件事变得几乎不可承受。',
  },
  'book-of-sand': {
    id: 'reader',
    label: '我要收集多少页？',
    reply:
      '不用收集完。无限文本最诚实的读法，就是承认自己只能带走碎片；碎片会组成你的路径，而不是组成整本书。',
  },
  'method-archive': {
    id: 'reader',
    label: '证据先看哪里？',
    reply:
      '先看年份、作品和来源能不能彼此对上。视觉可以很锋利，但数字人文最后还是要让每个漂亮节点都能被追溯。',
  },
}

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

function getThoughtPromptLabel(chapterId: string, prompt: ThoughtPrompt) {
  return thoughtPromptLabelsByChapter[chapterId]?.[prompt.id] ?? prompt.label
}

function getBrowserAudioContext() {
  const AudioContextCtor =
    window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

  return AudioContextCtor ? new AudioContextCtor() : null
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
  onCharacter,
  text,
}: {
  className: string
  onCharacter?: (index: number, character: string) => void
  text: string
}) {
  const [displayText, setDisplayText] = useState('')
  const onCharacterRef = useRef(onCharacter)

  useEffect(() => {
    onCharacterRef.current = onCharacter
  }, [onCharacter])

  useEffect(() => {
    const characters = Array.from(text)

    let index = 0
    let typingTimer: number | null = null
    let startTimer: number | null = null
    const resetTimer = window.setTimeout(() => {
      setDisplayText('')

      if (characters.length === 0) return

      startTimer = window.setTimeout(() => {
        typingTimer = window.setInterval(() => {
          index += 1
          setDisplayText(characters.slice(0, index).join(''))
          onCharacterRef.current?.(index, characters[index - 1] ?? '')

          if (index >= characters.length && typingTimer) {
            window.clearInterval(typingTimer)
          }
        }, 58)
      }, 180)
    }, 0)

    return () => {
      window.clearTimeout(resetTimer)
      if (startTimer) window.clearTimeout(startTimer)
      if (typingTimer) window.clearInterval(typingTimer)
    }
  }, [text])

  const isTyping = Array.from(displayText).length < Array.from(text).length

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
  const [isMusicEnabled, setIsMusicEnabled] = useState(false)
  const [readingPath, setReadingPath] = useState<string | null>(null)
  const [collectedIds, setCollectedIds] = useState<string[]>([])
  const swapTimerRef = useRef<number | null>(null)
  const settleTimerRef = useRef<number | null>(null)
  const idleTimerRef = useRef<number | null>(null)
  const guideSwapTimerRef = useRef<number | null>(null)
  const guideIdleTimerRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioMasterRef = useRef<GainNode | null>(null)
  const ambientNodesRef = useRef<AmbientNodes | null>(null)
  const musicElementRef = useRef<HTMLAudioElement | null>(null)
  const musicSourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const musicAnalyserRef = useRef<AnalyserNode | null>(null)
  const musicVisualizerFrameRef = useRef<number | null>(null)
  const musicVisualizerCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const musicVisualizerSizeRef = useRef({ width: 0, height: 0 })
  const musicEnabledRef = useRef(false)
  const activeIdRef = useRef(activeId)

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
      ambientNodesRef.current?.nodes.forEach((node) => {
        try {
          node.stop()
        } catch {
          // The source may already have ended; that is harmless.
        }
      })
      ambientNodesRef.current = null
      if (musicVisualizerFrameRef.current) window.cancelAnimationFrame(musicVisualizerFrameRef.current)
      musicVisualizerFrameRef.current = null
      musicSourceRef.current?.disconnect()
      musicAnalyserRef.current?.disconnect()
      musicSourceRef.current = null
      musicAnalyserRef.current = null
      if (musicElementRef.current) musicElementRef.current.pause()
      if (audioContextRef.current) void audioContextRef.current.close()
    }
  }, [])

  useEffect(() => {
    musicEnabledRef.current = isMusicEnabled
  }, [isMusicEnabled])

  useEffect(() => {
    activeIdRef.current = activeId
  }, [activeId])

  function ensureAudioGraph() {
    if (typeof window === 'undefined') return null

    if (!audioContextRef.current) {
      const context = getBrowserAudioContext()
      if (!context) return null

      const master = context.createGain()
      master.gain.setValueAtTime(0.96, context.currentTime)
      master.connect(context.destination)

      audioContextRef.current = context
      audioMasterRef.current = master
    }

    if (audioContextRef.current.state === 'suspended') {
      void audioContextRef.current.resume()
    }

    return audioContextRef.current
  }

  function syncMusicVisualizerCanvas() {
    const canvas = musicVisualizerCanvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = Math.max(1, Math.floor(rect.width))
    const height = Math.max(1, Math.floor(rect.height))
    const pixelWidth = Math.floor(width * dpr)
    const pixelHeight = Math.floor(height * dpr)

    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth
      canvas.height = pixelHeight
    }
    musicVisualizerSizeRef.current = { width, height }

    const context = canvas.getContext('2d')
    if (!context) return null

    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    return { context, width, height }
  }

  function stopParticleMeter() {
    if (musicVisualizerFrameRef.current) {
      window.cancelAnimationFrame(musicVisualizerFrameRef.current)
      musicVisualizerFrameRef.current = null
    }
  }

  function startParticleMeter() {
    stopParticleMeter()

    const canvasState = syncMusicVisualizerCanvas()
    if (!canvasState) return

    const frequencyData = new Uint8Array(256)
    const waveData = new Uint8Array(512)

    const averageBand = (start: number, end: number) => {
      let total = 0
      let count = 0
      const cappedEnd = Math.min(end, frequencyData.length)

      for (let index = start; index < cappedEnd; index += 1) {
        total += frequencyData[index]
        count += 1
      }

      return count > 0 ? total / count / 255 : 0
    }

    const drawRing = (
      context: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      baseRadius: number,
      stretch: number,
      ringIndex: number,
      low: number,
      mid: number,
      high: number,
    ) => {
      const pointCount = 160
      const ringRadius = baseRadius * (0.36 + ringIndex * 0.105 + low * 0.055)
      const waveLift = 2.4 + ringIndex * 1.6 + mid * 8

      context.beginPath()
      for (let index = 0; index <= pointCount; index += 1) {
        const angle = (index / pointCount) * Math.PI * 2
        const wave = (waveData[(index * 3 + ringIndex * 17) % waveData.length] - 128) / 128
        const ripple = wave * waveLift + Math.sin(angle * (3 + ringIndex) + performance.now() * 0.0007) * high * 9
        const radius = ringRadius + ripple
        const x = cx + Math.cos(angle) * radius * stretch
        const y = cy + Math.sin(angle) * radius * 0.72

        if (index === 0) context.moveTo(x, y)
        else context.lineTo(x, y)
      }

      context.strokeStyle = `rgba(215, 183, 100, ${0.092 + ringIndex * 0.017 + high * 0.082})`
      context.lineWidth = (0.42 + ringIndex * 0.06) * (musicEnabledRef.current ? 1.18 : 1)
      context.stroke()
    }

    const tick = (time: number) => {
      const analyserNode = musicAnalyserRef.current
      const currentCanvas = musicVisualizerCanvasRef.current
      if (!currentCanvas) {
        stopParticleMeter()
        return
      }

      const { context } = canvasState
      const { width, height } = musicVisualizerSizeRef.current
      if (width <= 0 || height <= 0) {
        stopParticleMeter()
        return
      }
      if (musicEnabledRef.current && analyserNode) {
        analyserNode.getByteFrequencyData(frequencyData)
        analyserNode.getByteTimeDomainData(waveData)
      } else {
        frequencyData.fill(0)
        for (let index = 0; index < waveData.length; index += 1) {
          waveData[index] = 128 + Math.sin(time * 0.0011 + index * 0.08) * 8
        }
      }

      const idlePulse = (Math.sin(time * 0.0012) + 1) * 0.5
      const isMusicLive = musicEnabledRef.current && !!analyserNode
      const low = isMusicLive ? averageBand(2, 18) : 0.13 + idlePulse * 0.055
      const mid = isMusicLive ? averageBand(18, 74) : 0.1 + idlePulse * 0.04
      const high = isMusicLive ? averageBand(74, frequencyData.length) : 0.075 + idlePulse * 0.028
      const energy = Math.min(1, (isMusicLive ? 0.16 : 0.06) + low * 0.48 + mid * 0.44 + high * 0.24)
      const focus = audioFocusByChapter[activeIdRef.current] ?? audioFocusByChapter['archive-entry']
      const cx = width * focus.x
      const cy = height * focus.y
      const baseRadius = Math.min(width, height) * focus.radius * (isMusicLive ? 0.9 : 0.82)

      context.clearRect(0, 0, width, height)
      context.save()
      context.globalCompositeOperation = 'lighter'
      context.globalAlpha = (isMusicLive ? 0.74 : 0.62) + energy * (isMusicLive ? 0.48 : 0.24)

      const glow = context.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 1.48)
      glow.addColorStop(0, `rgba(215, 183, 100, ${isMusicLive ? 0.32 + low * 0.32 : 0.22 + low * 0.12})`)
      glow.addColorStop(0.16, `rgba(215, 183, 100, ${isMusicLive ? 0.18 + mid * 0.22 : 0.12 + mid * 0.09})`)
      glow.addColorStop(0.5, `rgba(215, 183, 100, ${isMusicLive ? 0.065 + high * 0.08 : 0.045 + high * 0.04})`)
      glow.addColorStop(1, 'rgba(215, 183, 100, 0)')
      context.fillStyle = glow
      context.fillRect(0, 0, width, height)

      for (let ringIndex = 0; ringIndex < 10; ringIndex += 1) {
        drawRing(context, cx, cy, baseRadius, focus.stretch, ringIndex, low, mid, high)
      }

      context.save()
      context.translate(cx, cy)
      context.scale(focus.stretch, 0.72)
      context.rotate(time * 0.000035)
      context.beginPath()
      context.arc(0, 0, baseRadius * (0.28 + low * 0.04), 0, Math.PI * 2)
      context.arc(0, 0, baseRadius * (0.64 + mid * 0.05), 0, Math.PI * 2)
      context.strokeStyle = `rgba(255, 225, 142, ${isMusicLive ? 0.14 + high * 0.2 : 0.06 + high * 0.06})`
      context.lineWidth = isMusicLive ? 0.82 : 0.48
      context.stroke()
      context.restore()

      for (let index = 0; index < 128; index += 1) {
        const angle = (index / 128) * Math.PI * 2 - Math.PI * 0.22
        const bin = frequencyData[Math.floor((index / 128) * frequencyData.length)] / 255
        const inner = baseRadius * (0.42 + low * 0.08)
        const length = 3 + bin * (isMusicLive ? 52 : 24) + high * (isMusicLive ? 18 : 7)
        const x1 = cx + Math.cos(angle) * inner * focus.stretch
        const y1 = cy + Math.sin(angle) * inner * 0.72
        const x2 = cx + Math.cos(angle) * (inner + length) * focus.stretch
        const y2 = cy + Math.sin(angle) * (inner + length) * 0.72

        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.strokeStyle = `rgba(215, 183, 100, ${isMusicLive ? 0.05 + bin * 0.24 : 0.024 + bin * 0.09})`
        context.lineWidth = (isMusicLive ? 0.38 : 0.26) + bin * (isMusicLive ? 0.82 : 0.36)
        context.stroke()
      }

      for (let spokeIndex = 0; spokeIndex < 18; spokeIndex += 1) {
        const angle = (spokeIndex / 18) * Math.PI * 2 + time * 0.000025
        const inner = baseRadius * 0.18
        const outer = baseRadius * (0.92 + mid * 0.12)
        context.beginPath()
        context.moveTo(cx + Math.cos(angle) * inner * focus.stretch, cy + Math.sin(angle) * inner * 0.72)
        context.lineTo(cx + Math.cos(angle) * outer * focus.stretch, cy + Math.sin(angle) * outer * 0.72)
        context.strokeStyle = `rgba(215, 183, 100, ${isMusicLive ? 0.045 + high * 0.08 : 0.02 + high * 0.03})`
        context.lineWidth = isMusicLive ? 0.46 : 0.28
        context.stroke()
      }

      audioConstellationNodes.forEach((node, index) => {
        const band = node.band === 0 ? low : node.band === 1 ? mid : high
        const angle = node.angle + time * node.speed
        const orbit = baseRadius * node.orbit * (1 + low * 0.06)
        const jitter = Math.sin(time * 0.0011 + index * 1.37) * node.jitter * (0.18 + band)
        const x = cx + Math.cos(angle) * (orbit + jitter) * focus.stretch
        const y = cy + Math.sin(angle) * (orbit + jitter) * 0.72
        const size = node.size * (isMusicLive ? 0.72 + band * 1.72 : 0.42 + band * 0.72)

        if (index % 9 === 0) {
          context.beginPath()
          const innerX = cx + Math.cos(angle) * baseRadius * 0.2 * focus.stretch
          const innerY = cy + Math.sin(angle) * baseRadius * 0.2 * 0.72
          context.moveTo(innerX, innerY)
          context.lineTo(x, y)
          context.strokeStyle = `rgba(215, 183, 100, ${isMusicLive ? 0.018 + band * 0.07 : 0.01 + band * 0.028})`
          context.lineWidth = isMusicLive ? 0.38 : 0.24
          context.stroke()
        }

        context.beginPath()
        context.arc(x, y, size, 0, Math.PI * 2)
        context.fillStyle =
          index % 5 === 0
            ? `rgba(255, 245, 223, ${isMusicLive ? 0.86 : 0.48})`
            : `rgba(215, 183, 100, ${isMusicLive ? 0.78 : 0.42})`
        context.shadowColor = 'rgba(215, 183, 100, 0.56)'
        context.shadowBlur = (isMusicLive ? 6 : 2) + band * (isMusicLive ? 22 : 8)
        context.fill()
        context.shadowBlur = 0
      })

      for (let tickIndex = 0; tickIndex < 72; tickIndex += 1) {
        const angle = (tickIndex / 72) * Math.PI * 2
        const bin = frequencyData[(tickIndex * 5) % frequencyData.length] / 255
        const inner = baseRadius * (1.02 + low * 0.04)
        const outer = inner + 4 + bin * 16

        context.beginPath()
        context.moveTo(cx + Math.cos(angle) * inner * focus.stretch, cy + Math.sin(angle) * inner * 0.72)
        context.lineTo(cx + Math.cos(angle) * outer * focus.stretch, cy + Math.sin(angle) * outer * 0.72)
        context.strokeStyle = `rgba(255, 225, 142, ${isMusicLive ? 0.06 + bin * 0.22 : 0.026 + bin * 0.08})`
        context.lineWidth = isMusicLive ? 0.46 : 0.28
        context.stroke()
      }

      context.restore()
      musicVisualizerFrameRef.current = window.requestAnimationFrame(tick)
    }

    musicVisualizerFrameRef.current = window.requestAnimationFrame(tick)
  }

  useEffect(() => {
    const startTimer = window.setTimeout(() => startParticleMeter(), 80)
    const handleResize = () => startParticleMeter()

    window.addEventListener('resize', handleResize)

    return () => {
      window.clearTimeout(startTimer)
      window.removeEventListener('resize', handleResize)
    }
    // The visualizer reads live refs, so mount-only wiring is intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function stopAmbientSound(fadeTime = 0.9) {
    stopParticleMeter()

    const context = audioContextRef.current
    const ambient = ambientNodesRef.current
    if (context && ambient) {
      const now = context.currentTime
      ambient.gain.gain.cancelScheduledValues(now)
      ambient.gain.gain.setValueAtTime(ambient.gain.gain.value, now)
      ambient.gain.gain.linearRampToValueAtTime(0.0001, now + fadeTime)
      window.setTimeout(() => {
        ambient.nodes.forEach((node) => {
          try {
            node.stop()
          } catch {
            // The source may already have ended; that is harmless.
          }
        })
        ambientNodesRef.current = null
      }, fadeTime * 1000 + 80)
    }

    const music = musicElementRef.current
    if (music) {
      music.volume = 0
      music.pause()
      music.currentTime = 0
    }

    musicSourceRef.current?.disconnect()
    musicAnalyserRef.current?.disconnect()
    musicSourceRef.current = null
    musicAnalyserRef.current = null

    window.setTimeout(() => {
      if (!musicEnabledRef.current) startParticleMeter()
    }, fadeTime * 1000 + 140)
  }

  function startGeneratedAmbient(context: AudioContext) {
    if (ambientNodesRef.current || !audioMasterRef.current) return

    const now = context.currentTime
    const gain = context.createGain()
    const filter = context.createBiquadFilter()
    const lfo = context.createOscillator()
    const lfoGain = context.createGain()
    const nodes: AudioScheduledSourceNode[] = []

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.linearRampToValueAtTime(0.082, now + 1.8)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(820, now)
    filter.Q.setValueAtTime(0.48, now)

    lfo.type = 'sine'
    lfo.frequency.setValueAtTime(0.045, now)
    lfoGain.gain.setValueAtTime(0.018, now)
    lfo.connect(lfoGain)
    lfoGain.connect(gain.gain)
    lfo.start(now)
    nodes.push(lfo)

    const droneDefs: Array<{ frequency: number; type: OscillatorType; level: number; detune?: number }> = [
      { frequency: 55, type: 'sine', level: 0.46 },
      { frequency: 82.41, type: 'triangle', level: 0.18, detune: -6 },
      { frequency: 110, type: 'sine', level: 0.1, detune: 5 },
    ]

    droneDefs.forEach((def) => {
      const osc = context.createOscillator()
      const voiceGain = context.createGain()
      osc.type = def.type
      osc.frequency.setValueAtTime(def.frequency, now)
      if (def.detune) osc.detune.setValueAtTime(def.detune, now)
      voiceGain.gain.setValueAtTime(def.level, now)
      osc.connect(voiceGain)
      voiceGain.connect(filter)
      osc.start(now)
      nodes.push(osc)
    })

    const noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let index = 0; index < data.length; index += 1) {
      const value = Math.sin(index * 12.9898 + 78.233) * 43758.5453
      data[index] = ((value - Math.floor(value)) * 2 - 1) * 0.16
    }

    const noise = context.createBufferSource()
    const noiseFilter = context.createBiquadFilter()
    const noiseGain = context.createGain()
    noise.buffer = noiseBuffer
    noise.loop = true
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.setValueAtTime(1240, now)
    noiseFilter.Q.setValueAtTime(0.36, now)
    noiseGain.gain.setValueAtTime(0.08, now)
    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(filter)
    noise.start(now)
    nodes.push(noise)

    filter.connect(gain)
    gain.connect(audioMasterRef.current)
    ambientNodesRef.current = { gain, nodes }
  }

  function startAmbientSound() {
    const context = ensureAudioGraph()
    if (!context) return

    stopAmbientSound(0.04)

    const music = new Audio(ambientMusicPath)
    music.loop = true
    music.volume = musicBaseVolume
    music.preload = 'auto'
    musicElementRef.current = music
    musicSourceRef.current?.disconnect()
    musicAnalyserRef.current?.disconnect()
    musicSourceRef.current = null
    musicAnalyserRef.current = null

    if (audioMasterRef.current) {
      const source = context.createMediaElementSource(music)
      const analyser = context.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.82
      source.connect(analyser)
      analyser.connect(audioMasterRef.current)
      musicSourceRef.current = source
      musicAnalyserRef.current = analyser
      startParticleMeter()
    }

    const fallbackToGenerated = () => {
      if (!musicEnabledRef.current) return
      startGeneratedAmbient(context)
    }

    music.addEventListener('error', fallbackToGenerated, { once: true })
    void music.play().catch(fallbackToGenerated)
  }

  function playTone({
    frequency,
    duration,
    delay = 0,
    gain = 0.08,
    type = 'sine',
    endFrequency,
  }: {
    frequency: number
    duration: number
    delay?: number
    gain?: number
    type?: OscillatorType
    endFrequency?: number
  }) {
    const context = ensureAudioGraph()
    if (!context || !audioMasterRef.current) return

    const now = context.currentTime + delay
    const osc = context.createOscillator()
    const toneGain = context.createGain()
    const filter = context.createBiquadFilter()

    osc.type = type
    osc.frequency.setValueAtTime(frequency, now)
    if (endFrequency) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), now + duration)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2200, now)
    filter.Q.setValueAtTime(0.2, now)

    toneGain.gain.setValueAtTime(0.0001, now)
    toneGain.gain.linearRampToValueAtTime(gain, now + Math.min(0.035, duration * 0.22))
    toneGain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    osc.connect(filter)
    filter.connect(toneGain)
    toneGain.connect(audioMasterRef.current)
    osc.start(now)
    osc.stop(now + duration + 0.04)
  }

  function playNoiseTick({
    duration = 0.036,
    delay = 0,
    gain = 0.055,
    frequency = 2800,
    q = 3.2,
    filterType = 'bandpass',
  }: {
    duration?: number
    delay?: number
    gain?: number
    frequency?: number
    q?: number
    filterType?: BiquadFilterType
  }) {
    const context = ensureAudioGraph()
    if (!context || !audioMasterRef.current) return

    const now = context.currentTime + delay
    const length = Math.max(1, Math.floor(context.sampleRate * duration))
    const buffer = context.createBuffer(1, length, context.sampleRate)
    const data = buffer.getChannelData(0)
    const seed = frequency * 0.017 + duration * 1000

    for (let index = 0; index < length; index += 1) {
      const value = Math.sin((index + 1) * 91.731 + seed) * 28143.449
      const envelope = 1 - index / length
      data[index] = ((value - Math.floor(value)) * 2 - 1) * envelope
    }

    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const tickGain = context.createGain()

    source.buffer = buffer
    filter.type = filterType
    filter.frequency.setValueAtTime(frequency, now)
    filter.Q.setValueAtTime(q, now)
    tickGain.gain.setValueAtTime(0.0001, now)
    tickGain.gain.linearRampToValueAtTime(gain, now + Math.min(0.01, duration * 0.3))
    tickGain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    source.connect(filter)
    filter.connect(tickGain)
    tickGain.connect(audioMasterRef.current)
    source.start(now)
    source.stop(now + duration + 0.02)
  }

  function playSound(cue: SoundCue) {
    switch (cue) {
      case 'toggle-on':
        playNoiseTick({ frequency: 3200, q: 4.6, gain: 0.09, duration: 0.038 })
        playTone({ frequency: 185, endFrequency: 220, duration: 0.16, delay: 0.018, gain: 0.048, type: 'triangle' })
        break
      case 'toggle-off':
        playNoiseTick({ frequency: 2100, q: 3.6, gain: 0.072, duration: 0.04 })
        playTone({ frequency: 210, endFrequency: 120, duration: 0.2, delay: 0.018, gain: 0.044, type: 'triangle' })
        break
      case 'chapter':
        playTone({ frequency: 74, endFrequency: 48, duration: 0.68, gain: 0.12, type: 'sine' })
        playNoiseTick({ frequency: 820, q: 0.9, gain: 0.062, duration: 0.18, delay: 0.08, filterType: 'lowpass' })
        playNoiseTick({ frequency: 2500, q: 2.6, gain: 0.042, duration: 0.055, delay: 0.22 })
        break
      case 'thought-open':
        playNoiseTick({ frequency: 3400, q: 5.2, gain: 0.085, duration: 0.044 })
        playNoiseTick({ frequency: 1700, q: 2.4, gain: 0.046, duration: 0.06, delay: 0.055 })
        playTone({ frequency: 233, duration: 0.16, delay: 0.03, gain: 0.032, type: 'triangle' })
        break
      case 'thought-close':
        playNoiseTick({ frequency: 1900, q: 3.8, gain: 0.068, duration: 0.05 })
        playTone({ frequency: 260, endFrequency: 150, duration: 0.2, delay: 0.02, gain: 0.034, type: 'triangle' })
        break
      case 'prompt':
        playNoiseTick({ frequency: 3600, q: 5.8, gain: 0.078, duration: 0.032 })
        playNoiseTick({ frequency: 2500, q: 4.4, gain: 0.05, duration: 0.03, delay: 0.055 })
        break
      case 'branch':
        playNoiseTick({ frequency: 3000, q: 4.2, gain: 0.078, duration: 0.038 })
        playNoiseTick({ frequency: 1200, q: 1.8, gain: 0.052, duration: 0.07, delay: 0.07 })
        playTone({ frequency: 196, duration: 0.12, delay: 0.035, gain: 0.03, type: 'triangle' })
        break
      case 'collect':
        playNoiseTick({ frequency: 4100, q: 6.4, gain: 0.074, duration: 0.028 })
        playNoiseTick({ frequency: 3150, q: 5.2, gain: 0.052, duration: 0.026, delay: 0.052 })
        playTone({ frequency: 520, duration: 0.08, delay: 0.035, gain: 0.026, type: 'triangle' })
        break
      case 'evidence':
        playNoiseTick({ frequency: 2300, q: 3.2, gain: 0.076, duration: 0.05 })
        playNoiseTick({ frequency: 780, q: 1.1, gain: 0.038, duration: 0.09, delay: 0.035, filterType: 'lowpass' })
        break
      case 'typing':
        playNoiseTick({ frequency: 3900, q: 7.2, gain: 0.048, duration: 0.022 })
        playNoiseTick({ frequency: 1450, q: 2.6, gain: 0.022, duration: 0.028, delay: 0.01 })
        break
    }
  }

  function toggleMusic() {
    if (isMusicEnabled) {
      playSound('toggle-off')
      setIsMusicEnabled(false)
      musicEnabledRef.current = false
      window.setTimeout(() => stopAmbientSound(0.7), 120)
      return
    }

    musicEnabledRef.current = true
    setIsMusicEnabled(true)
    startAmbientSound()
    playSound('toggle-on')
  }

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

    playSound('chapter')

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

    playSound('thought-open')
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

    playSound('thought-close')
    clearGuideTimers()
    setThoughtSwapPhase('closing')
    guideSwapTimerRef.current = window.setTimeout(() => {
      setGuide(null)
      setActiveThoughtPromptId(null)
      setThoughtSwapPhase('idle')
    }, thoughtCloseDuration)
  }

  function selectThoughtPrompt(promptId: string | null) {
    if (promptId === activeThoughtPromptId) return

    playSound('prompt')
    clearGuideTimers()
    setThoughtSwapPhase('out')
    guideSwapTimerRef.current = window.setTimeout(() => {
      setActiveThoughtPromptId(promptId)
      setThoughtSwapPhase('in')
      settleThoughtGuide(760)
    }, thoughtSwapOutDuration)
  }

  function chooseBranch(choiceId: string, targetId: string) {
    playSound('branch')
    setReadingPath(choiceId)
    window.setTimeout(() => activateChapter(targetId), 320)
  }

  function goNextChapter() {
    activateChapter(nextChapter.id)
  }

  function collectCurrentThought() {
    if (!guide) return

    playSound('collect')
    const key = `${guide.chapter.id}:${guide.hotspot.id}`
    setCollectedIds((current) => (current.includes(key) ? current : [...current, key]))
  }

  function toggleEvidence() {
    playSound('evidence')
    setIsEvidenceOpen((current) => !current)
  }

  const currentThought = guide ? getThoughtEcho(guide.chapter.id, guide.hotspot.id) : null
  const currentThoughtVoice = currentThought ? voiceLabels[currentThought.voice] : '档案回声'
  const currentThoughtTitle = currentThought?.title ?? guide?.hotspot.label ?? ''
  const currentThoughtPrompts = [
    ...(currentThought?.prompts ?? []),
    ...(guide && readerPromptsByChapter[guide.chapter.id] ? [readerPromptsByChapter[guide.chapter.id]] : []),
  ]
  const activeThoughtPrompt =
    currentThoughtPrompts.find((prompt) => prompt.id === activeThoughtPromptId) ?? null
  const activeThoughtPromptLabel =
    guide && activeThoughtPrompt ? getThoughtPromptLabel(guide.chapter.id, activeThoughtPrompt) : ''
  const currentThoughtText = activeThoughtPrompt?.reply ?? currentThought?.text ?? guide?.hotspot.text ?? ''
  const currentThoughtMotif = currentThought?.motif ?? guide?.chapter.motif ?? ''
  const currentThoughtTag = currentThoughtMotif.split('/')[0]?.trim() || currentThoughtVoice
  const currentThoughtEvidence = currentThought?.evidence ?? guide?.hotspot.source ?? ''
  const currentGuideKey = getGuideKey(guide)
  const currentThoughtLineKey = `${currentGuideKey}:${activeThoughtPromptId ?? 'opening'}`

  function playTypingCharacter(index: number, character: string) {
    if (!character.trim()) return

    const isPunctuation = /[，。；、,.!?！？:：;]/.test(character)
    if (isPunctuation || index % 3 === 0) playSound('typing')
  }

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

      <button
        className={`audio-toggle ${isMusicEnabled ? 'is-on' : ''}`}
        onClick={toggleMusic}
        aria-label={isMusicEnabled ? '关闭背景音乐' : '开启背景音乐'}
        title={isMusicEnabled ? '关闭背景音乐' : '开启背景音乐'}
      >
        <span className="audio-toggle-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
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
                  {chapter.hotspots.map((hotspot, hotspotIndex) => (
                    <button
                      className={`hotspot ${hotspot.collectable ? 'is-collectable' : ''}`}
                      key={hotspot.id}
                      onClick={() => openGuide(chapter, hotspot)}
                      style={{
                        left: `${hotspot.x}%`,
                        top: `${hotspot.y}%`,
                        '--hotspot-index': hotspotIndex,
                      } as CSSProperties}
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
        <canvas
          className={`music-visualizer-canvas ${isMusicEnabled ? 'is-on' : ''}`}
          ref={musicVisualizerCanvasRef}
          aria-hidden="true"
        />
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
                <strong>{activeThoughtPromptLabel}</strong>
              </div>
            ) : null}
            <TypewriterText
              className="thought-line"
              key={currentThoughtLineKey}
              onCharacter={playTypingCharacter}
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
                    <span>{guide ? getThoughtPromptLabel(guide.chapter.id, prompt) : prompt.label}</span>
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
                <button className="thought-evidence-toggle" onClick={toggleEvidence}>
                  <span>{isEvidenceOpen ? '收起证据' : '文本证据'}</span>
                </button>
              </div>
            ) : (
              <div className="thought-actions">
                <button onClick={collectCurrentThought}>
                  <span>{currentThought?.collectLabel ?? '收入路径'}</span>
                </button>
                <button onClick={toggleEvidence}>
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
