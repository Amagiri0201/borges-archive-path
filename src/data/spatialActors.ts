export type SpatialActor =
  | SpatialPathActor
  | SpatialNodeActor
  | SpatialLightActor
  | SpatialTermActor
  | SpatialBookActor
  | SpatialSpineActor

export type SpatialPathActor = {
  type: 'path'
  id: string
  d: string
  role?: 'main' | 'branch' | 'lower'
  delay?: string
}

export type SpatialNodeActor = {
  type: 'node'
  id: string
  x: number
  y: number
  label: string
  hotspotId?: string
  branchChoiceId?: string
  targetId?: string
  role?: 'choice' | 'focus'
}

export type SpatialLightActor = {
  type: 'light'
  id: string
  x: number
  y: number
  hotspotId: string
  label: string
}

export type SpatialTermActor = {
  type: 'term'
  id: string
  x: number
  y: number
  label: string
  hotspotId: string
  delay?: string
}

export type SpatialBookActor = {
  type: 'book'
  id: string
  x: number
  y: number
  title: string
  meta: string
  hotspotId: string
  rotate: number
  driftRotate: number
  delay: number
  scale?: number
}

export type SpatialSpineActor = {
  type: 'spine'
  id: string
  x: number
  y: number
  width: number
  angle: number
  hotspotId: string
}

export const spatialActors: Record<string, SpatialActor[]> = {
  'forking-paths': [
    {
      type: 'path',
      id: 'route-to-north',
      role: 'main',
      d: 'M58.5 64 C57 54 55 43 52 32 C50 25 49 19 48 14',
    },
    {
      type: 'path',
      id: 'route-to-west-garden',
      role: 'branch',
      delay: '-1.1s',
      d: 'M58.4 64 C52 61 47 56 42 50 C37 44 32 37 28 31',
    },
    {
      type: 'path',
      id: 'route-to-east-garden',
      role: 'branch',
      delay: '-2.4s',
      d: 'M58.8 64 C66 60 71 57 76 52 C82 46 87 40 93 31',
    },
    {
      type: 'path',
      id: 'route-to-left-memory',
      role: 'lower',
      delay: '-3.2s',
      d: 'M58.1 65 C55 71 52 77 49 84',
    },
    {
      type: 'path',
      id: 'route-to-right-memory',
      role: 'lower',
      delay: '-4.1s',
      d: 'M59 65 C64 70 69 75 75 82',
    },
    {
      type: 'node',
      id: 'fork-core',
      role: 'focus',
      hotspotId: 'time-node',
      label: '交汇',
      x: 58.5,
      y: 64,
    },
    {
      type: 'node',
      id: 'time-choice',
      role: 'choice',
      branchChoiceId: 'time',
      targetId: 'aleph',
      label: '时间',
      x: 48,
      y: 14,
    },
    {
      type: 'node',
      id: 'mirror-choice',
      role: 'choice',
      branchChoiceId: 'mirror',
      targetId: 'mirror-dream',
      label: '镜像',
      x: 84,
      y: 28,
    },
    {
      type: 'node',
      id: 'city-choice',
      role: 'choice',
      branchChoiceId: 'city',
      targetId: 'city-memory',
      label: '城市',
      x: 40,
      y: 58,
    },
    {
      type: 'node',
      id: 'route-lines',
      role: 'focus',
      hotspotId: 'path-lines',
      label: '并存路径',
      x: 72,
      y: 44,
    },
  ],
  aleph: [
    {
      type: 'light',
      id: 'aleph-core-light',
      hotspotId: 'aleph-core',
      label: '中心光点',
      x: 73.6,
      y: 50.6,
    },
    {
      type: 'term',
      id: 'term-library',
      hotspotId: 'node-burst',
      label: 'LIBRARY',
      x: 54,
      y: 37,
    },
    {
      type: 'term',
      id: 'term-city',
      hotspotId: 'node-burst',
      label: 'CITY',
      x: 66,
      y: 61,
      delay: '-1.2s',
    },
    {
      type: 'term',
      id: 'term-dream',
      hotspotId: 'node-burst',
      label: 'DREAM',
      x: 62,
      y: 29,
      delay: '-2.1s',
    },
    {
      type: 'term',
      id: 'term-mirror',
      hotspotId: 'node-burst',
      label: 'MIRROR',
      x: 79,
      y: 28,
      delay: '-3.4s',
    },
    {
      type: 'term',
      id: 'term-time',
      hotspotId: 'node-burst',
      label: 'TIME',
      x: 75,
      y: 44,
      delay: '-4.3s',
    },
    {
      type: 'term',
      id: 'term-sand',
      hotspotId: 'node-burst',
      label: 'SAND',
      x: 82,
      y: 66,
      delay: '-5.2s',
    },
  ],
  'book-of-sand': [
    {
      type: 'book',
      id: 'book-ficciones',
      title: 'Ficciones',
      meta: '1944 / labyrinth',
      hotspotId: 'floating-quotes',
      x: 49,
      y: 54,
      rotate: -9,
      driftRotate: 5,
      delay: 0,
      scale: 0.62,
    },
    {
      type: 'book',
      id: 'book-aleph',
      title: 'The Aleph',
      meta: '1949 / total vision',
      hotspotId: 'floating-quotes',
      x: 56,
      y: 47,
      rotate: 7,
      driftRotate: -5,
      delay: 360,
      scale: 0.58,
    },
    {
      type: 'book',
      id: 'book-library',
      title: 'The Library of Babel',
      meta: '1941 / infinite archive',
      hotspotId: 'sand-pages',
      x: 62,
      y: 41,
      rotate: -4,
      driftRotate: 7,
      delay: 720,
      scale: 0.68,
    },
    {
      type: 'book',
      id: 'book-garden',
      title: 'The Garden of Forking Paths',
      meta: '1941 / branching time',
      hotspotId: 'floating-quotes',
      x: 70,
      y: 48,
      rotate: 8,
      driftRotate: -6,
      delay: 1100,
      scale: 0.6,
    },
    {
      type: 'book',
      id: 'book-sand',
      title: 'The Book of Sand',
      meta: '1975 / endless pages',
      hotspotId: 'sand-pages',
      x: 65,
      y: 61,
      rotate: -5,
      driftRotate: 4,
      delay: 1480,
      scale: 0.68,
    },
    {
      type: 'book',
      id: 'book-circular',
      title: 'The Circular Ruins',
      meta: '1940 / dream',
      hotspotId: 'floating-quotes',
      x: 54,
      y: 66,
      rotate: 7,
      driftRotate: -8,
      delay: 1900,
      scale: 0.56,
    },
    {
      type: 'book',
      id: 'book-menard',
      title: 'Pierre Menard',
      meta: '1939 / rewrite',
      hotspotId: 'sand-pages',
      x: 73,
      y: 62,
      rotate: -9,
      driftRotate: 6,
      delay: 2300,
      scale: 0.56,
    },
    {
      type: 'book',
      id: 'book-tlon',
      title: 'Tlon, Uqbar, Orbis Tertius',
      meta: '1940 / invented world',
      hotspotId: 'floating-quotes',
      x: 80,
      y: 42,
      rotate: 4,
      driftRotate: -5,
      delay: 2700,
      scale: 0.58,
    },
    {
      type: 'spine',
      id: 'sand-page-spine',
      hotspotId: 'sand-pages',
      x: 61.5,
      y: 76.5,
      width: 34,
      angle: -1,
    },
  ],
}

export const spatialActorChapterIds = new Set(Object.keys(spatialActors))
