export type Hotspot = {
  id: string
  label: string
  x: number
  y: number
  text: string
  source: string
  collectable?: boolean
}

export type Chapter = {
  id: string
  index: string
  title: string
  subtitle: string
  years: string
  lifeNode: string
  work: string
  motif: string
  image: string
  summary: string
  quote: string
  action: string
  hotspots: Hotspot[]
}

export const chapters: Chapter[] = [
  {
    id: 'archive-entry',
    index: '00',
    title: '进入档案',
    subtitle: '一个人如何变成一座文本迷宫',
    years: '1899-1986',
    lifeNode: '作家、读者、图书馆员、失明者，也是迷宫、镜像与无限文本的制造者。',
    work: '生平总览',
    motif: '档案 / 图书馆 / 迷宫',
    image: '/images/01-hero-infinite-library-21x9.png',
    summary:
      '这一章把“人物介绍”转译成档案入口：父亲藏书、公共图书馆、失明与写作，都会在后续章节变成可进入的空间。',
    quote: '进入档案，不是为了看完一个人生平，而是为了看见生平如何变成文本结构。',
    action: '点击走廊、私人藏书和证据线索，开启主线。',
    hotspots: [
      {
        id: 'archive-door',
        label: '档案入口',
        x: 49,
        y: 49,
        text: '这条走廊不是目录，而是一套阅读路径。你将沿着生平节点进入作品意象。',
        source: 'S1 Britannica / S2 Poetry Foundation',
        collectable: true,
      },
      {
        id: 'first-library',
        label: '父亲藏书',
        x: 30,
        y: 32,
        text: '博尔赫斯早年的阅读经验与家庭藏书相连：英语书、翻译、异国故事，先把房间变成第一座图书馆。',
        source: 'S1 Britannica',
        collectable: true,
      },
      {
        id: 'evidence-thread',
        label: '证据线',
        x: 74,
        y: 28,
        text: '每个章节都保留作品、年份、地点和来源。炫酷可以先开门，但证据必须负责把门撑住。',
        source: '项目资料结构 / S1-S6',
      },
    ],
  },
  {
    id: 'city-memory',
    index: '01',
    title: '城市记忆',
    subtitle: '布宜诺斯艾利斯作为文学起点',
    years: '1899 / 1923',
    lifeNode: '博尔赫斯出生于布宜诺斯艾利斯，早期诗歌持续回望街道、庭院、南方和城市记忆。',
    work: '《布宜诺斯艾利斯激情》',
    motif: '城市 / 街道 / 记忆',
    image: '/images/06-buenos-aires-memory-map-21x9.png',
    summary:
      '城市在这里不是出生地注释，而是一张心理地图。街区、街道和边缘地带会成为后续迷宫结构的现实底稿。',
    quote: '城市不是背景；城市是记忆被铺成街道之后的形状。',
    action: '点击 Palermo、早期诗歌和城市边缘，查看城市如何进入文本。',
    hotspots: [
      {
        id: 'palermo',
        label: 'Palermo',
        x: 68,
        y: 44,
        text: 'Palermo 是童年和城市记忆的入口。人在城市里迷路，后来才在文本里制造迷宫。',
        source: 'S1 Britannica / S6 Buenos Aires references',
        collectable: true,
      },
      {
        id: 'fervor',
        label: '早期诗歌',
        x: 43,
        y: 55,
        text: '《布宜诺斯艾利斯激情》让城市不再只是地图，而成为被回忆、想象和重写的空间。',
        source: 'S1 Britannica / S3 Library of Congress',
      },
      {
        id: 'southern-edge',
        label: '南方边缘',
        x: 76,
        y: 63,
        text: '博尔赫斯的城市常带着边缘感：街角、郊区、庭院，像现实世界里尚未完全写成的句子。',
        source: 'S2 Poetry Foundation / 作品母题编码',
        collectable: true,
      },
    ],
  },
  {
    id: 'library-life',
    index: '02',
    title: '图书馆人生',
    subtitle: '编目、失明与无限书架',
    years: '1938-1955',
    lifeNode:
      '博尔赫斯曾在 Miguel Cane 图书馆工作，1955 年出任阿根廷国家图书馆馆长；失明与图书馆经验交织成强烈的生命隐喻。',
    work: '《巴别图书馆》 / 《赠予之诗》',
    motif: '图书馆 / 失明 / 无限',
    image: '/images/01-hero-infinite-library-21x9.png',
    summary:
      '这一章把图书馆从职业地点转译成文学结构：书架、目录、黑夜、六边形空间与不可穷尽的阅读。',
    quote: '命运把书和黑夜同时交给他，于是图书馆变成了最精确的悖论。',
    action: '点击工作台、黑暗书架和六边形结构，进入图书馆母题。',
    hotspots: [
      {
        id: 'miguel-cane',
        label: '编目工作台',
        x: 36,
        y: 44,
        text: '白天，他给书分类；空隙里，他写下另一种分类法：镜子、梦、图书馆和不可能的书。',
        source: 'S5 Buenos Aires official / S1 Britannica',
        collectable: true,
      },
      {
        id: 'books-night',
        label: '书与黑夜',
        x: 64,
        y: 42,
        text: '当他成为国家图书馆馆长时，失明已经逼近。越接近全部书籍，越无法用眼睛阅读。',
        source: 'S1 Britannica / S4 Buenos Aires official',
        collectable: true,
      },
      {
        id: 'hexagon',
        label: '六边形书库',
        x: 52,
        y: 36,
        text: '《巴别图书馆》中的无限不是浪漫远方，而是一种冷酷排列：所有可能都存在，因此意义更难被找到。',
        source: 'S2 Poetry Foundation / The Library of Babel',
      },
    ],
  },
  {
    id: 'forking-paths',
    index: '03',
    title: '小径分岔',
    subtitle: '把时间写成迷宫',
    years: '1941 / 1944',
    lifeNode: '1940 年代，博尔赫斯的幻想小说进入成熟期，时间、选择和迷宫成为核心结构。',
    work: '《小径分岔的花园》 / 《虚构集》',
    motif: '时间 / 选择 / 迷宫',
    image: '/images/02-garden-of-forking-paths-21x9.png',
    summary:
      '这一章是全站的选择节点。选择不会消灭其他路径，只会让某一条路径暂时被照亮。',
    quote: '时间不是单线，而是同时分岔的可能性。',
    action: '选择时间、镜像或城市路径，影响后续阅读方向。',
    hotspots: [
      {
        id: 'time-node',
        label: '交汇节点',
        x: 58.5,
        y: 64,
        text: '所有路径在这里短暂相交。选择不是关闭道路，而是改变你先看见哪一条道路。',
        source: 'S2 Poetry Foundation / The Garden of Forking Paths',
        collectable: true,
      },
      {
        id: 'time-branch',
        label: '选择时间',
        x: 48,
        y: 14,
        text: '时间不是一条线，而是一座花园：每个决定都向外长出新的路径。',
        source: 'The Garden of Forking Paths / 1941',
      },
      {
        id: 'mirror-branch',
        label: '选择镜像',
        x: 84,
        y: 28,
        text: '另一条路上也许有另一个你。他做了相反选择，却仍然抵达同一座迷宫。',
        source: '作品母题编码 / 镜像与分身',
      },
      {
        id: 'city-branch',
        label: '选择城市',
        x: 40,
        y: 58,
        text: '有些迷宫不是建在花园里，而是建在街道、旧图书馆和反复返回的童年里。',
        source: 'S1 Britannica / Buenos Aires references',
      },
      {
        id: 'path-lines',
        label: '并存路径',
        x: 72,
        y: 44,
        text: '每一条路都声称自己是唯一的。但博尔赫斯不会让唯一性这么轻易获胜。',
        source: 'The Garden of Forking Paths / Ficciones',
        collectable: true,
      },
    ],
  },
  {
    id: 'mirror-dream',
    index: '04',
    title: '镜像与梦',
    subtitle: '自我、分身与虚构现实',
    years: '1940s',
    lifeNode: '博尔赫斯反复书写镜像、自我分裂、梦创造现实等主题。',
    work: '《环形废墟》及相关文本',
    motif: '镜像 / 分身 / 梦',
    image: '/images/05-mirrors-and-doubles-21x9.png',
    summary:
      '这一章把“我是谁”处理成镜面空间：每个倒影都可能是另一个文本入口。',
    quote: '镜子不只是复制现实，它让现实开始怀疑自己是否是原件。',
    action: '点击镜面、分身和梦门，查看自我与现实如何被拆解。',
    hotspots: [
      {
        id: 'mirror-plane',
        label: '镜面',
        x: 68,
        y: 43,
        text: '镜子不是复制现实。它制造一个可疑副本，反过来质问原件是否真实。',
        source: 'S2 Poetry Foundation / Borges motifs',
        collectable: true,
      },
      {
        id: 'double-self',
        label: '另一个我',
        x: 55,
        y: 50,
        text: '在博尔赫斯这里，自我并不稳定。它像被反射、误认和重写出来的临时角色。',
        source: 'S2 Poetry Foundation / 作品母题编码',
      },
      {
        id: 'dream-gate',
        label: '梦的入口',
        x: 44,
        y: 61,
        text: '梦不是逃离现实，而是一台制造现实的机器，只是它从不承认自己的机器性。',
        source: 'The Circular Ruins / 1940',
        collectable: true,
      },
    ],
  },
  {
    id: 'circular-ruins',
    index: '05',
    title: '环形废墟',
    subtitle: '虚构如何生成现实',
    years: '1940',
    lifeNode: '在梦与创造的主题中，博尔赫斯将作者、人物和世界的关系层层反转。',
    work: '《环形废墟》',
    motif: '梦 / 创造 / 虚构现实',
    image: '/images/07-dream-circular-ruins-21x9.png',
    summary:
      '这一章承接镜像主题：现实开始变得不稳定，文本开始像仪式一样生成世界。',
    quote: '被创造者与创造者之间的边界，最终会变成另一个圆环。',
    action: '点击废墟、烟雾形体和火焰启示，进入梦境式讲解。',
    hotspots: [
      {
        id: 'ruin-ring',
        label: '仪式圆环',
        x: 52,
        y: 54,
        text: '圆环不是装饰，而是一种结构：创造者绕着被创造者行走，最后发现自己也在另一个圆环里。',
        source: 'The Circular Ruins / 1940',
        collectable: true,
      },
      {
        id: 'smoke-body',
        label: '被梦见的人',
        x: 62,
        y: 37,
        text: '如果一个人是被梦出来的，他还算不算真实？博尔赫斯不急着回答，只把问题推向下一层梦。',
        source: 'The Circular Ruins / fiction-making',
      },
      {
        id: 'fire-revelation',
        label: '火焰启示',
        x: 70,
        y: 58,
        text: '火焰没有毁灭他，反而揭示他也是梦的产物。真相在这里不是醒来，而是继续下沉。',
        source: 'The Circular Ruins / ending motif',
        collectable: true,
      },
    ],
  },
  {
    id: 'aleph',
    index: '06',
    title: '阿莱夫',
    subtitle: '万物压缩成一点',
    years: '1949',
    lifeNode: '《阿莱夫》将世界、记忆、城市和文本压缩进一个无法完全观看的点。',
    work: '《阿莱夫》',
    motif: '总体性 / 光点 / 无限视觉',
    image: '/images/03-aleph-21x9.png',
    summary:
      '这一章是视觉高潮：中心光点呼吸，节点向外连接，像一个可点击的总体性索引。',
    quote: '一个点里同时看见城市、书、记忆和所有方向。',
    action: '点击中心光点、节点爆发和语言崩塌，展开与其他章节的母题连接。',
    hotspots: [
      {
        id: 'aleph-core',
        label: '中心光点',
        x: 74.4,
        y: 50.6,
        text: '阿莱夫是全站的汇聚点：时间、城市、镜像、梦和文本碎片在这里短暂相遇。',
        source: 'S2 Poetry Foundation / The Aleph',
        collectable: true,
      },
      {
        id: 'node-burst',
        label: '节点爆发',
        x: 79,
        y: 28,
        text: '从中心点向外发散的碎片，可以被转译为作品、地点和母题网络。',
        source: '项目交互编码 / 作品母题网络',
      },
      {
        id: 'language-collapse',
        label: '语言失序',
        x: 66,
        y: 61,
        text: '真正可怕的不是看不见，而是看见太多，以至于语言无法按顺序把它们说完。',
        source: 'The Aleph / unsayable vision',
        collectable: true,
      },
    ],
  },
  {
    id: 'book-of-sand',
    index: '07',
    title: '沙之书',
    subtitle: '无限文本与阅读困境',
    years: '1975',
    lifeNode: '晚期作品继续推进“无限文本”的想象，阅读变成一种无法抵达尽头的行动。',
    work: '《沙之书》',
    motif: '无限文本 / 句子碎片 / 收集',
    image: '/images/04-book-of-sand-21x9.png',
    summary:
      '用户收集文本碎片，最终生成个人阅读路径：时间型、镜像型或城市型。',
    quote: '书页像沙粒一样无法穷尽，阅读也变成一种迷失。',
    action: '点击漂浮书页、句子碎片和隐藏书架，收集并合成阅读路径。',
    hotspots: [
      {
        id: 'sand-pages',
        label: '无限页码',
        x: 52,
        y: 50,
        text: '一本没有第一页的书，也不会有最后一页。读者不再掌握文本，文本反过来困住读者。',
        source: 'S2 Poetry Foundation / The Book of Sand',
        collectable: true,
      },
      {
        id: 'floating-quotes',
        label: '句子碎片',
        x: 71,
        y: 38,
        text: '你无法拥有整本书。你只能带走几个碎片，并假装它们足以证明你曾经进入过无限。',
        source: 'The Book of Sand / late Borges',
        collectable: true,
      },
      {
        id: 'hidden-shelf',
        label: '隐藏书架',
        x: 63,
        y: 66,
        text: '当无限无法被读完，唯一的策略也许是把它藏回书架，让恐惧暂时变成秩序。',
        source: 'The Book of Sand / ending motif',
      },
    ],
  },
  {
    id: 'method-archive',
    index: '08',
    title: '档案室',
    subtitle: '方法、来源与可追溯性',
    years: 'method',
    lifeNode: '回到数字人文方法：如何把文本、时间、空间和母题转化成数据结构。',
    work: '来源墙 / 作品表 / 母题编码',
    motif: '证据 / 方法 / 来源',
    image: '/images/08-fictional-archive-room-21x9.png',
    summary:
      '最后一章解释项目可信度：每个视觉节点背后都有作品、年份、母题和来源。',
    quote: '酷炫交互必须回到证据：文本从哪里来，如何被编码，如何被展示。',
    action: '查看来源墙、编码表和个人阅读档案。',
    hotspots: [
      {
        id: 'source-wall',
        label: '来源墙',
        x: 38,
        y: 44,
        text: '迷宫可以是虚构的，但砖块必须能被追溯：年份、地点、作品、来源，每个节点都要留下证据。',
        source: 'S1-S6',
      },
      {
        id: 'method-table',
        label: '编码表',
        x: 60,
        y: 57,
        text: '数字人文不是把文学变成装饰，而是把文本拆成可比较、可连接、可追踪的结构。',
        source: '项目方法 / motif encoding',
        collectable: true,
      },
      {
        id: 'reader-archive',
        label: '你的档案',
        x: 70,
        y: 38,
        text: '用户的选择和收集会在这里汇总，形成一条个人阅读路径。',
        source: '项目交互设计 / collection logic',
      },
    ],
  },
]

export const branchChoices = [
  {
    id: 'time',
    label: '选择时间',
    targetId: 'aleph',
    result: '时间型阅读路径',
    summary: '你相信每个选择都会制造另一个时间，于是先进入阿莱夫的总体视野。',
  },
  {
    id: 'mirror',
    label: '选择镜像',
    targetId: 'mirror-dream',
    result: '镜像型阅读路径',
    summary: '你相信自我是被复制、误认和反射出来的，于是进入镜像与梦。',
  },
  {
    id: 'city',
    label: '选择城市',
    targetId: 'city-memory',
    result: '城市型阅读路径',
    summary: '你相信迷宫首先藏在街道、图书馆和回忆里，于是回到布宜诺斯艾利斯。',
  },
]

export const sources = [
  {
    id: 'S1',
    title: 'Jorge Luis Borges',
    org: 'Encyclopaedia Britannica',
    url: 'https://www.britannica.com/biography/Jorge-Luis-Borges',
  },
  {
    id: 'S2',
    title: 'Jorge Luis Borges',
    org: 'Poetry Foundation',
    url: 'https://www.poetryfoundation.org/poets/jorge-luis-borges',
  },
  {
    id: 'S3',
    title: 'Jorge Luis Borges (Argentina, 1899-1986)',
    org: 'Library of Congress',
    url: 'https://www.loc.gov/item/n79007035/jorge-luis-borges-argentina-1899-1986/',
  },
  {
    id: 'S4',
    title: 'Former National Library building',
    org: 'Official English Website for the City of Buenos Aires',
    url: 'https://turismo.buenosaires.gob.ar/en/atractivo/former-national-library-building',
  },
  {
    id: 'S5',
    title: 'Biblioteca Miguel Cane',
    org: 'Buenos Aires Ciudad',
    url: 'https://turismo.buenosaires.gob.ar/es/otros-establecimientos/biblioteca-miguel-cane',
  },
  {
    id: 'S6',
    title: 'Borges city route references',
    org: 'Buenos Aires tourism / Argentina Travel',
    url: 'https://turismo.buenosaires.gob.ar/',
  },
]
