import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const root = process.cwd()

function loadTsModule(relativePath) {
  const fullPath = path.join(root, relativePath)
  const source = fs.readFileSync(fullPath, 'utf8')
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText
  const module = { exports: {} }
  const context = vm.createContext({ exports: module.exports, module, require, console })
  vm.runInContext(transpiled, context, { filename: fullPath })
  return module.exports
}

const { chapters, branchChoices, sources } = loadTsModule('src/data/chapters.ts')
const { thoughtEchoes, voiceLabels } = loadTsModule('src/data/thoughts.ts')
const { spatialActors } = loadTsModule('src/data/spatialActors.ts')

const lines = []
const add = (line = '') => lines.push(line)
const bullet = (label, value) => add(`- ${label}: ${value ?? ''}`)

add('# Borges Archive Path 网站文本信息 Log')
add('')
add('> 按页面与交互逻辑整理。内容来自当前原型的数据文件和主要 UI 文案。')
add('')
add('## 0. 全局导航与状态文案')
add('')
bullet('顶部路径标题', 'BORGES ARCHIVE PATH')
bullet('章节导航', '00-08 圆点导航；hover/title 使用「章节编号 + 章节标题」')
bullet('下一章按钮', '下一章')
bullet('背景音乐按钮', '开启背景音乐 / 关闭背景音乐')
bullet('路径状态', '已收集 {数量} / 阅读路径未分岔 或 当前路径结果')
bullet('思想回声窗口标题', 'THOUGHT ECHO / {章节编号}')
bullet('思想追问区', '思想追问')
bullet('思想回声关闭', '关闭思想回声 / ×')
bullet('证据按钮', '文本证据 / 收起证据')
bullet('小径分岔路径选择程序', 'PATH + 三个路径按钮')
bullet('沙之书收集面板', '沙之书收集 / 等待一次分岔选择 / 已收集条目')
bullet('档案室来源墙', 'S1-S6 来源卡片')
add('')
add('## 1. 页面主线与热点')

for (const chapter of chapters) {
  add('')
  add(`### ${chapter.index} ${chapter.title}（${chapter.id}）`)
  bullet('副标题', chapter.subtitle)
  bullet('时间', chapter.years)
  bullet('生平', chapter.lifeNode)
  bullet('文本', chapter.work)
  bullet('母题', chapter.motif)
  bullet('章节说明', chapter.summary)
  bullet('主引用/观点句', chapter.quote)
  bullet('用户动作提示', chapter.action)
  add('')
  add('#### 页面热点')
  for (const hotspot of chapter.hotspots) {
    add(`- ${hotspot.label}（${hotspot.id}）`)
    add(`  - 位置: x=${hotspot.x}, y=${hotspot.y}`)
    add(`  - 文案: ${hotspot.text}`)
    add(`  - 来源: ${hotspot.source}`)
    add(`  - 可收藏: ${hotspot.collectable ? '是' : '否'}`)
  }

  const actors = spatialActors[chapter.id]
  if (actors?.length) {
    add('')
    add('#### 页面语义动效/可点击视觉元素')
    for (const actor of actors) {
      if (actor.type === 'node') {
        add(
          `- 节点: ${actor.label}（${actor.id}）${actor.hotspotId ? ` -> 热点 ${actor.hotspotId}` : ''}${
            actor.branchChoiceId ? ` -> 分岔 ${actor.branchChoiceId}` : ''
          }`,
        )
      } else if (actor.type === 'light') {
        add(`- 光点: ${actor.label}（${actor.id}） -> 热点 ${actor.hotspotId}`)
      } else if (actor.type === 'term') {
        add(`- 漂浮词: ${actor.label}（${actor.id}） -> 热点 ${actor.hotspotId}`)
      } else if (actor.type === 'book') {
        add(`- 漂浮书封: ${actor.title} / ${actor.meta}（${actor.id}） -> 热点 ${actor.hotspotId}`)
      } else if (actor.type === 'spine') {
        add(`- 书脊/页轴: ${actor.id} -> 热点 ${actor.hotspotId}`)
      } else if (actor.type === 'path') {
        add(`- 路径线: ${actor.id}${actor.role ? ` / ${actor.role}` : ''}`)
      }
    }
  }
}

add('')
add('## 2. 小径分岔：路径选择逻辑')
add('')
for (const choice of branchChoices) {
  add(`### ${choice.label}（${choice.id}）`)
  bullet('跳转章节', choice.targetId)
  bullet('路径结果名', choice.result)
  bullet('结果说明', choice.summary)
  add('')
}

add('## 3. 思想回声系统')
add('')
add('> 每个热点打开后出现思想回声面板。基础结构为：声音标签、母题标签、标题、主回应、证据、收藏按钮、追问按钮。')
add('')
for (const [key, echo] of Object.entries(thoughtEchoes)) {
  const [chapterId, hotspotId] = key.split(':')
  const chapter = chapters.find((item) => item.id === chapterId)
  const hotspot = chapter?.hotspots.find((item) => item.id === hotspotId)
  add(`### ${chapter?.index ?? '--'} ${chapter?.title ?? chapterId} / ${hotspot?.label ?? hotspotId}`)
  bullet('键值', key)
  bullet('声音标签', voiceLabels[echo.voice] ?? echo.voice)
  bullet('标题', echo.title)
  bullet('母题', echo.motif)
  bullet('主回应', echo.text)
  bullet('证据', echo.evidence)
  if (echo.collectLabel) bullet('收藏按钮', echo.collectLabel)
  if (echo.collectHint) bullet('收藏提示', echo.collectHint)
  if (echo.prompts?.length) {
    add('- 追问')
    for (const prompt of echo.prompts) {
      add(`  - ${prompt.label}（${prompt.id}）: ${prompt.reply}`)
    }
  }
  add('')
}

add('## 4. 沙之书收集面板逻辑')
add('')
bullet('默认状态', '等待一次分岔选择')
bullet('路径结果', '显示 branchChoices 中的 result，例如“时间型阅读路径”')
bullet('收集条目', '显示已经收藏的热点：{章节编号} / {热点标签}')
bullet('无收集提示', '如果尚未收藏，仅保留路径状态和说明文本')
add('')
add('## 5. 档案室来源墙')
add('')
for (const source of sources) {
  add(`- ${source.id}: ${source.org} / ${source.title}`)
  add(`  - URL: ${source.url}`)
}
add('')
add('## 6. 演示时可用的交互逻辑讲法')
add('')
add('1. 观众通过顶部章节轨道或“下一章”在同一张空间地图中移动。')
add('2. 每章左侧给出时间、生平、文本和母题，右侧底图承担该章节的视觉叙事。')
add('3. 点击热点后进入“思想回声”面板，面板提供主解释、文本证据和可追问回应。')
add('4. 在“小径分岔”章节，路径选择会改变全站的阅读路径状态。')
add('5. 在“沙之书”章节，用户已收藏的碎片汇总为个人阅读路径。')
add('6. 在“档案室”章节，项目回到来源墙和方法说明，回应数字人文作业对准确性的要求。')
add('')

const outputDir = path.join(root, 'docs')
fs.mkdirSync(outputDir, { recursive: true })
const outputPath = path.join(outputDir, 'site-text-log.md')
fs.writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8')
console.log(outputPath)
