export type ThoughtVoice = 'archivist' | 'index' | 'labyrinth' | 'mirror' | 'light' | 'sand' | 'evidence'

export type ThoughtPrompt = {
  id: string
  label: string
  reply: string
}

export type ThoughtEcho = {
  voice: ThoughtVoice
  title: string
  motif: string
  text: string
  evidence: string
  collectLabel?: string
  collectHint?: string
  prompts?: ThoughtPrompt[]
}

export const voiceLabels: Record<ThoughtVoice, string> = {
  archivist: '档案员',
  index: '索引感',
  labyrinth: '迷宫感',
  mirror: '镜像感',
  light: '光点',
  sand: '沙粒',
  evidence: '证据室',
}

const askMotif = (reply: string): ThoughtPrompt => ({
  id: 'motif',
  label: '追问这个意象',
  reply,
})

const askEvidence = (reply: string): ThoughtPrompt => ({
  id: 'evidence',
  label: '它和文本怎么连？',
  reply,
})

export const thoughtEchoes: Record<string, ThoughtEcho> = {
  'archive-entry:archive-door': {
    voice: 'index',
    title: '档案入口',
    motif: '档案 / 入口 / 路径',
    text: '不要把这当成目录。目录只是伪装；真正展开的是一个人的生平如何变成文本结构。',
    evidence: '项目结构 / Borges biography',
    collectLabel: '记录入口',
    collectHint: '把入口加入你的阅读路径。',
    prompts: [
      askMotif('入口的意义不是“开始”，而是允许你承认自己还没有地图。博尔赫斯式的阅读总是先迷路，再理解迷路的结构。'),
      askEvidence('这个入口会把生平、作品、地点和母题绑定在一起。我们不是在介绍人物，而是在搭一座可追溯的文学档案。'),
    ],
  },
  'archive-entry:first-library': {
    voice: 'archivist',
    title: '第一座图书馆',
    motif: '私人藏书 / 语言 / 继承',
    text: '这座迷宫不是从公共图书馆开始的。它先从父亲的书房开始：英语书、翻译和异国故事，把童年的房间变成第一座图书馆。',
    evidence: 'Britannica / Borges early reading',
    collectLabel: '收入私人藏书',
    collectHint: '保存“父亲藏书”这个生平入口。',
    prompts: [
      askMotif('私人藏书让“图书馆”先成为亲密经验，再成为宏大的宇宙模型。后来的巴别图书馆，早就藏在一个孩子的书架里。'),
      askEvidence('传记资料常把博尔赫斯的早年阅读和家庭藏书联系在一起。这里把它转译成全站的第一个空间母题。'),
    ],
  },
  'archive-entry:evidence-thread': {
    voice: 'evidence',
    title: '证据线',
    motif: '来源 / 年份 / 可追溯',
    text: '迷宫可以是虚构的，但证据不能失踪。每个光点都要能回到作品、年份、地点或资料来源。',
    evidence: 'S1-S6 / project method',
    collectLabel: '记录证据线',
    prompts: [
      askMotif('证据线不是为了削弱诗意，而是让诗意站得住。数字人文最怕只剩视觉，所以这里必须有可追溯的骨架。'),
      askEvidence('后续每个面板都会保留 evidence 字段：外部资料、作品信息或项目编码方法都放在这里。'),
    ],
  },
  'city-memory:palermo': {
    voice: 'archivist',
    title: 'Palermo',
    motif: '城市 / 童年 / 记忆地图',
    text: '城市不是背景。Palermo 是记忆被铺成街道的地方：人先在城市里迷路，后来才在文本里制造迷宫。',
    evidence: 'Britannica / Buenos Aires references',
    collectLabel: '收入城市碎片',
    prompts: [
      askMotif('街区不是地图上的色块，而是记忆的语法。博尔赫斯的城市经常像一句被反复改写的开头。'),
      askEvidence('这一节点连接生平地理和早期城市诗歌，让“出生地”转化为可探索的文学空间。'),
    ],
  },
  'city-memory:fervor': {
    voice: 'labyrinth',
    title: '早期城市诗学',
    motif: '街道 / 回返 / 地方记忆',
    text: '回到故乡不等于回到原点。在早期诗歌里，布宜诺斯艾利斯已经不是地图，而是一座被想象重新铺开的城市。',
    evidence: 'Fervor de Buenos Aires / 1923',
    collectLabel: '追踪城市母题',
    prompts: [
      askMotif('“回返”很狡猾。它看起来向后走，实际是在重新发明来处。城市由此变成一座时间迷宫。'),
      askEvidence('《布宜诺斯艾利斯激情》是博尔赫斯早期诗集，适合作为城市记忆章节的文本锚点。'),
    ],
  },
  'city-memory:southern-edge': {
    voice: 'archivist',
    title: '南方边缘',
    motif: '街角 / 郊区 / 未完成的句子',
    text: '城市边缘最适合长出虚构。它既不是中心，也不是荒野，像一行还没有决定结尾的句子。',
    evidence: 'Borges city motifs / Buenos Aires references',
    collectLabel: '收入边缘街角',
    prompts: [
      askMotif('边缘地带的好处是暧昧：现实还没有完全统治它，文本就能趁机在这里开门。'),
      askEvidence('这一热点把城市空间和“迷宫入口”相连，为后续小径分岔提供现实底稿。'),
    ],
  },
  'library-life:miguel-cane': {
    voice: 'archivist',
    title: '编目者',
    motif: '图书馆 / 编目 / 隐秘写作',
    text: '白天，他给书分类。空隙里，他写下另一种分类法：把世界分成镜子、梦、图书馆和不可能的书。',
    evidence: 'Biblioteca Miguel Cane / Buenos Aires official',
    collectLabel: '收入编目台',
    prompts: [
      askMotif('编目是一种很冷静的迷信：只要给世界编号，世界就似乎可以被理解。但博尔赫斯偏要证明编号也会通向无限。'),
      askEvidence('Buenos Aires 相关资料提到 Miguel Cane 图书馆与博尔赫斯的工作经历，这里转译为“工作台”热点。'),
    ],
  },
  'library-life:books-night': {
    voice: 'index',
    title: '书与黑夜',
    motif: '失明 / 图书馆 / 命运悖论',
    text: '命运把书和黑夜同时交给他。这不是悲剧说明，而是博尔赫斯式悖论：越接近全部书籍，越无法用眼睛阅读。',
    evidence: 'National Library / blindness motif',
    collectLabel: '收入黑夜书架',
    prompts: [
      askMotif('黑夜不是知识的反面。它逼迫阅读从视觉转向记忆、声音和想象，反而让图书馆变得更巨大。'),
      askEvidence('1955 年出任国家图书馆馆长与失明经验常被并置讨论，这一节点承担生平和母题的连接。'),
    ],
  },
  'library-life:hexagon': {
    voice: 'index',
    title: '六边形书库',
    motif: '无限 / 组合 / 秩序与混乱',
    text: '无限不是浪漫的远方。在图书馆里，无限更像一种冷酷排列：所有可能都存在，因此意义更难被找到。',
    evidence: 'The Library of Babel / Ficciones',
    collectLabel: '追踪无限文本',
    prompts: [
      askMotif('六边形让无限变得可视。它越规则，就越可怕：秩序并没有拯救人，秩序只是更精确地展示了迷失。'),
      askEvidence('《巴别图书馆》的空间想象是本项目视觉底图的重要母题，适合做书架和几何热点。'),
    ],
  },
  'forking-paths:time-node': {
    voice: 'labyrinth',
    title: '交汇节点',
    motif: '时间 / 选择 / 多重可能',
    text: '你以为选择会关闭其他道路。但在这里，选择只是把某一条路暂时照亮；其余道路仍在黑暗里继续存在。',
    evidence: 'The Garden of Forking Paths / 1941',
    collectLabel: '记录交汇',
    prompts: [
      askMotif('交汇点不是答案，而是压力测试。它逼你承认：任何一条被选择的路，都带着没被选择的阴影。'),
      askEvidence('这一节点对应《小径分岔的花园》的核心结构：时间不是单线，而是分岔的并存可能。'),
    ],
  },
  'forking-paths:time-branch': {
    voice: 'labyrinth',
    title: '时间分岔',
    motif: '非线性时间 / 决定 / 花园',
    text: '时间不是一条线。它是一座花园，每个决定都向外长出新的路径。',
    evidence: 'The Garden of Forking Paths / branching time',
    collectLabel: '选择时间',
    prompts: [
      { id: 'choose', label: '沿时间走', reply: '于是你先进入阿莱夫：一个把所有时间压缩进同一点的观看位置。' },
      askEvidence('时间路径会把你带向《阿莱夫》，因为那里最适合表现“同时性”的视觉高潮。'),
    ],
  },
  'forking-paths:mirror-branch': {
    voice: 'mirror',
    title: '镜像分岔',
    motif: '分身 / 误认 / 现实裂缝',
    text: '另一条路上也许有另一个你。他做了相反的选择，却仍然抵达同一座迷宫。',
    evidence: 'Borges mirror motifs / fiction and reality',
    collectLabel: '选择镜像',
    prompts: [
      { id: 'choose', label: '沿镜像走', reply: '于是你进入镜像与梦：在那里，自我不会消失，只会复制出更多不可靠的版本。' },
      askEvidence('镜像路径连接“分身”和“梦造现实”，让小径分岔不只关乎时间，也关乎身份。'),
    ],
  },
  'forking-paths:city-branch': {
    voice: 'archivist',
    title: '城市分岔',
    motif: '街道 / 回忆 / 地理迷宫',
    text: '有些迷宫不是建在花园里。它们建在城市街道、旧图书馆和反复返回的童年里。',
    evidence: 'Buenos Aires / early Borges',
    collectLabel: '选择城市',
    prompts: [
      { id: 'choose', label: '沿城市走', reply: '于是你回到布宜诺斯艾利斯：迷宫从来不只在书里，也在走过的街道里。' },
      askEvidence('城市路径把《小径分岔》重新接回生平地理，让抽象迷宫落回现实空间。'),
    ],
  },
  'forking-paths:path-lines': {
    voice: 'labyrinth',
    title: '仍在延伸的路',
    motif: '路径 / 并存 / 非线性时间',
    text: '每一条路都声称自己是唯一的。但博尔赫斯不会让唯一性这么轻易获胜。',
    evidence: 'The Garden of Forking Paths / Ficciones',
    collectLabel: '收入并存路径',
    prompts: [
      askMotif('路径线的价值不是指路，而是提醒你：选择之外仍有选择，文本之外还有文本。'),
      askEvidence('这里的路径线对应网页交互逻辑：点击不是跳转页面，而是在同一张空间地图里改变阅读方向。'),
    ],
  },
  'mirror-dream:mirror-plane': {
    voice: 'mirror',
    title: '镜面',
    motif: '镜像 / 自我 / 复制',
    text: '镜子不是复制现实。它让现实产生一个可疑副本，而副本反过来质问原件是否真实。',
    evidence: 'Borges motifs / fiction and reality',
    collectLabel: '收入镜像',
    prompts: [
      askMotif('镜子可怕，不是因为它像你，而是因为它太像你。相似一旦过量，身份就开始松动。'),
      askEvidence('镜像母题贯穿博尔赫斯作品，这里作为“自我不稳定”的入口。'),
    ],
  },
  'mirror-dream:double-self': {
    voice: 'mirror',
    title: '另一个我',
    motif: '分身 / 误认 / 作者身份',
    text: '自我并不是一个坚硬实体。它像被反射、误认和重写出来的临时角色。',
    evidence: 'Borges essays and fiction motifs',
    collectLabel: '收入分身',
    prompts: [
      askMotif('“另一个我”不是恐怖片桥段。它更像写作本身：作者创造角色，角色反过来削弱作者的唯一性。'),
      askEvidence('这一热点把镜像章节和环形废墟章节连接起来：分身问题最终会变成创造者问题。'),
    ],
  },
  'mirror-dream:dream-gate': {
    voice: 'mirror',
    title: '梦的入口',
    motif: '梦 / 创造 / 虚构现实',
    text: '梦在这里不是逃避现实。梦是一台制造现实的机器，只是它从不承认自己的机器性。',
    evidence: 'The Circular Ruins / 1940',
    collectLabel: '追踪梦境',
    prompts: [
      askMotif('梦比现实更危险，因为它不需要证明自己。它只要继续发生，现实就会被迫让位。'),
      askEvidence('这里直接连接《环形废墟》：一个人试图在梦中创造另一个人。'),
    ],
  },
  'circular-ruins:ruin-ring': {
    voice: 'labyrinth',
    title: '仪式圆环',
    motif: '循环 / 创造 / 作者与造物',
    text: '圆环不是装饰。它是一种结构：创造者绕着被创造者行走，最后发现自己也站在另一个圆环里。',
    evidence: 'The Circular Ruins / 1940',
    collectLabel: '收入循环',
    prompts: [
      askMotif('圆环最残忍的地方是没有外部。你以为自己在观察仪式，下一秒就发现自己也是仪式的一部分。'),
      askEvidence('《环形废墟》以梦中创造为核心，圆环适合作为“嵌套现实”的可视化形状。'),
    ],
  },
  'circular-ruins:smoke-body': {
    voice: 'mirror',
    title: '被梦见的人',
    motif: '虚构身份 / 被创造者 / 梦',
    text: '如果一个人是被梦出来的，他还算不算真实？博尔赫斯不急着回答；他只把问题继续向下一层梦里推。',
    evidence: 'The Circular Ruins / fiction-making',
    collectLabel: '收入梦中人',
    prompts: [
      askMotif('被创造者的问题会反咬创造者：如果他能被梦出，那么梦他的人又凭什么保证自己不是梦？'),
      askEvidence('这一热点对应“人物由梦生成”的叙事核心，也连接镜像章节的身份不稳定。'),
    ],
  },
  'circular-ruins:fire-revelation': {
    voice: 'mirror',
    title: '火焰启示',
    motif: '揭示 / 不可伤害 / 梦的证据',
    text: '火焰没有毁灭他，反而证明他并不属于通常的现实。真相不是醒来，而是发现自己仍在梦里。',
    evidence: 'The Circular Ruins / ending motif',
    collectLabel: '收入火焰',
    prompts: [
      askMotif('火在这里不是灾难，是检测工具。它测试身体是否属于现实，也测试读者是否还相信现实。'),
      askEvidence('这个结尾让“虚构生成现实”形成闭环，适合做章节中的第三个强热点。'),
    ],
  },
  'aleph:aleph-core': {
    voice: 'light',
    title: '阿莱夫',
    motif: '总体性 / 无限视觉 / 语言失败',
    text: '这里不是一盏灯。它是一个不可能的观看位置：所有地点、所有时间、所有记忆同时挤进一个点。',
    evidence: 'The Aleph / 1949',
    collectLabel: '收入光点',
    prompts: [
      askMotif('阿莱夫诱人的地方在于它承诺“看见全部”。可一旦全部同时出现，观看就变成了无法整理的灾难。'),
      askEvidence('《阿莱夫》围绕一个能看见总体的点展开，本章把它作为全站母题网络的中心。'),
    ],
  },
  'aleph:node-burst': {
    voice: 'light',
    title: '不可说的观看',
    motif: '经验过载 / 语言顺序 / 万物同时',
    text: '真正可怕的不是看不见。是看见太多，以至于语言无法按顺序把它们说完。',
    evidence: 'The Aleph / unsayable vision',
    collectLabel: '收入视觉碎片',
    prompts: [
      askMotif('语言需要排队，可阿莱夫拒绝排队。它把所有图像同时塞到眼前，所以叙述只能迟到。'),
      askEvidence('这个热点解释为什么视觉爆发不能只是炫技：它对应的是“经验超过叙述能力”的文学问题。'),
    ],
  },
  'aleph:language-collapse': {
    voice: 'light',
    title: '语言失序',
    motif: '叙述失败 / 同时性 / 总体索引',
    text: '当一切同时出现，句子就失去它最熟悉的工作：先后顺序。',
    evidence: 'The Aleph / narrative order',
    collectLabel: '收入失序句子',
    prompts: [
      askMotif('句子只能一字一字写，阿莱夫却一瞬间给出全部。这里的裂缝，就是文学和视觉之间的裂缝。'),
      askEvidence('这个新增热点用于解释本页的粒子、节点和文字漂浮：它们不是装饰，而是语言失序的界面表现。'),
    ],
  },
  'book-of-sand:sand-pages': {
    voice: 'sand',
    title: '没有第一页',
    motif: '无限文本 / 页码 / 阅读困境',
    text: '一本没有第一页的书，也不会有最后一页。读者不再掌握文本，文本反过来困住读者。',
    evidence: 'The Book of Sand / 1975',
    collectLabel: '收入无限页码',
    prompts: [
      askMotif('页码本来是秩序工具。可如果页码无法抵达开头和结尾，秩序本身就变成了恐惧。'),
      askEvidence('《沙之书》把无限从空间转移到书页，本页的漂浮书封就是这个转译。'),
    ],
  },
  'book-of-sand:floating-quotes': {
    voice: 'sand',
    title: '文本碎片',
    motif: '碎片 / 收集 / 个人阅读路径',
    text: '你无法拥有整本书。你只能带走几个碎片，并假装它们足以证明你曾经进入过无限。',
    evidence: 'The Book of Sand / late Borges',
    collectLabel: '收入文本碎片',
    prompts: [
      askMotif('碎片比全集诚实。它承认你永远无法带走全部，但仍允许你留下经过的痕迹。'),
      askEvidence('收集系统会把这些碎片汇总到最后的档案室，形成用户自己的阅读路径。'),
    ],
  },
  'book-of-sand:hidden-shelf': {
    voice: 'sand',
    title: '藏回书架',
    motif: '恐惧 / 秩序 / 无法占有',
    text: '当无限无法被读完，唯一的策略也许是把它藏起来，让恐惧暂时伪装成秩序。',
    evidence: 'The Book of Sand / ending motif',
    collectLabel: '收入隐藏书架',
    prompts: [
      askMotif('把书藏起来不是解决无限，而是把无限从视线中移走。人类经常把不可处理的东西称为“已经收纳”。'),
      askEvidence('这个热点对应《沙之书》的阅读困境：无限文本并不会因为被放回书架而消失。'),
    ],
  },
  'method-archive:source-wall': {
    voice: 'evidence',
    title: '来源墙',
    motif: '证据 / 引用 / 可追溯性',
    text: '迷宫可以是虚构的。但这座迷宫的砖块必须能被追溯：年份、地点、作品、来源，每个节点都要留下证据。',
    evidence: 'Britannica / LOC / Poetry Foundation / Buenos Aires official',
    collectLabel: '查看来源',
    prompts: [
      askMotif('来源墙不是结尾的附录，而是整个项目的承重墙。没有它，所有漂亮动效都会变成轻飘飘的幻术。'),
      askEvidence('来源包括 Britannica、Poetry Foundation、Library of Congress 和 Buenos Aires 官方资料。'),
    ],
  },
  'method-archive:method-table': {
    voice: 'evidence',
    title: '编码表',
    motif: '数字人文 / 文本转译 / 结构化',
    text: '数字人文不是把文学变成装饰。它把文本拆成可比较、可连接、可追踪的结构，再让读者重新走进去。',
    evidence: 'Project method / motif encoding',
    collectLabel: '记录方法',
    prompts: [
      askMotif('编码不是把文学变冷。编码是把隐约的关系显影，让城市、作品、母题和交互动作彼此看得见。'),
      askEvidence('本项目的数据结构把章节、热点、来源、母题和用户动作绑定在一起，这就是网页的数字人文方法。'),
    ],
  },
  'method-archive:reader-archive': {
    voice: 'evidence',
    title: '你的阅读档案',
    motif: '用户路径 / 收集 / 个人索引',
    text: '你收集的不是战利品，而是一条阅读路线。路线越完整，越能看出你如何理解博尔赫斯。',
    evidence: 'Project interaction logic / collected fragments',
    collectLabel: '生成路径',
    prompts: [
      askMotif('阅读路径不是评分系统。它更像一份临时的自画像：你偏向时间、镜像，还是城市？'),
      askEvidence('后续可以把 collectedIds 汇总成个人档案图，作为最终展示的可扩展功能。'),
    ],
  },
}

export function getThoughtEcho(chapterId: string, hotspotId: string) {
  return thoughtEchoes[`${chapterId}:${hotspotId}`]
}
