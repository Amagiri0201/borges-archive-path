# Borges Archive Path 实体书本控制接口

> 目标：用实体书页的霍尔传感器检测翻页位置，并让网页进入对应章节。

## 1. 当前网页已预留的接口

网页运行后，会在浏览器里暴露：

```js
window.BorgesArchivePath.goToChapter('05')
window.BorgesArchivePath.next()
window.BorgesArchivePath.previous()
window.BorgesArchivePath.getState()
```

也可以用自定义事件触发：

```js
window.dispatchEvent(new CustomEvent('borges:chapter', {
  detail: { chapter: '05' },
}))
```

章节编号建议使用 `00` 到 `08`，最稳定、最不容易歧义。

## 2. 章节映射

| 章节编号 | 页面 ID | 标题 |
|---|---|---|
| 00 | archive-entry | 进入档案 |
| 01 | city-memory | 城市记忆 |
| 02 | library-life | 图书馆人生 |
| 03 | forking-paths | 小径分岔 |
| 04 | mirror-dream | 镜像与梦 |
| 05 | circular-ruins | 环形废墟 |
| 06 | aleph | 阿莱夫 |
| 07 | book-of-sand | 沙之书 |
| 08 | method-archive | 档案室 |

## 3. 霍尔传感器原理

霍尔传感器会检测附近磁场变化。磁铁靠近时，传感器输出电平变化；开发板读取这个电平，就能判断“某一页是否到位”。

常见模块有两类：

- 数字霍尔模块：输出 `HIGH/LOW`，适合本项目。
- 模拟霍尔模块：输出连续电压，能判断磁场强弱，但调试更麻烦。

建议先用数字霍尔模块做 MVP，因为它稳定、接线少、代码简单。

## 4. 实体书结构建议

每一章对应一个检测点：

```text
书页 A：贴磁片 / 小磁铁
书页 B：同一位置嵌霍尔传感器

翻到某一页并合上/压近时：
磁铁靠近霍尔传感器 -> Arduino 检测到信号 -> 串口发送 CHAPTER:05 -> 网页跳到环形废墟
```

注意事项：

- 磁铁优先用小钕磁铁，磁片可能太弱，需要实测距离。
- 每个传感器和磁铁的位置要错开一点，避免相邻页误触发。
- 书页最好加硬卡纸夹层，固定磁铁和传感器，不要让位置漂移。
- 触发逻辑要做防抖和冷却，不然轻微晃动会重复跳转。

## 5. Arduino UNO 接线建议

如果要 9 个章节，可以用 D2-D10 接 9 个数字霍尔模块：

```text
Hall 00 OUT -> D2
Hall 01 OUT -> D3
Hall 02 OUT -> D4
Hall 03 OUT -> D5
Hall 04 OUT -> D6
Hall 05 OUT -> D7
Hall 06 OUT -> D8
Hall 07 OUT -> D9
Hall 08 OUT -> D10

所有 Hall VCC -> 5V
所有 Hall GND -> GND
```

如果传感器模块太多、线太乱，后续可以加 `74HC4067` 多路复用器或 `MCP23017` I/O 扩展芯片。概念汇报阶段不必一开始就上扩展板。

## 6. Arduino 示例代码

不同霍尔模块的触发电平可能相反。如果磁铁靠近时读数变成 `LOW`，保留 `ACTIVE_LOW = true`；如果变成 `HIGH`，改成 `false`。

```cpp
const byte SENSOR_COUNT = 9;
const byte sensorPins[SENSOR_COUNT] = {2, 3, 4, 5, 6, 7, 8, 9, 10};
const char* chapters[SENSOR_COUNT] = {
  "00", "01", "02", "03", "04", "05", "06", "07", "08"
};

const bool ACTIVE_LOW = true;
const unsigned long DEBOUNCE_MS = 90;
const unsigned long SEND_COOLDOWN_MS = 650;

bool rawState[SENSOR_COUNT];
bool stableState[SENSOR_COUNT];
unsigned long lastChangeAt[SENSOR_COUNT];
unsigned long lastSentAt = 0;

bool readActive(byte pin) {
  int value = digitalRead(pin);
  return ACTIVE_LOW ? value == LOW : value == HIGH;
}

void setup() {
  Serial.begin(115200);

  for (byte i = 0; i < SENSOR_COUNT; i++) {
    pinMode(sensorPins[i], INPUT_PULLUP);
    rawState[i] = readActive(sensorPins[i]);
    stableState[i] = rawState[i];
    lastChangeAt[i] = millis();
  }
}

void loop() {
  unsigned long now = millis();

  for (byte i = 0; i < SENSOR_COUNT; i++) {
    bool current = readActive(sensorPins[i]);

    if (current != rawState[i]) {
      rawState[i] = current;
      lastChangeAt[i] = now;
    }

    if (now - lastChangeAt[i] < DEBOUNCE_MS) continue;
    if (current == stableState[i]) continue;

    stableState[i] = current;

    if (stableState[i] && now - lastSentAt > SEND_COOLDOWN_MS) {
      Serial.print("CHAPTER:");
      Serial.println(chapters[i]);
      lastSentAt = now;
    }
  }
}
```

## 7. 浏览器串口桥接思路

Chrome / Edge 支持 Web Serial API。后续可以在网页里做一个隐藏调试按钮，让用户选择 Arduino 串口并读取消息。

临时测试时，可以先在浏览器控制台运行：

```js
async function connectBookController() {
  const port = await navigator.serial.requestPort()
  await port.open({ baudRate: 115200 })

  const decoder = new TextDecoderStream()
  port.readable.pipeTo(decoder.writable)
  const reader = decoder.readable.getReader()

  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += value
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const match = line.trim().match(/^(?:CHAPTER|PAGE):\s*(\d{1,2}|[\w-]+)$/i)
      if (!match) continue

      const chapter = /^\d$/.test(match[1]) ? `0${match[1]}` : match[1]
      window.BorgesArchivePath?.goToChapter(chapter)
    }
  }
}

connectBookController()
```

## 8. 最小演示方案

下周三概念汇报如果来不及做完整 9 页，可以先做 3 页：

- 第一页：进入档案 `00`
- 第二页：小径分岔 `03`
- 第三页：阿莱夫 `06`

实体书翻到不同页，网页同步移动到对应章节。这个演示已经足够说明“实体文本入口控制数字文本空间”的概念。

## 9. 后续升级方向

- 每页除章节跳转外，再触发对应音效或粒子强度。
- 用 RFID / NFC 替代多霍尔传感器，减少布线。
- 加一颗状态 LED，翻页识别成功时短亮。
- 做书脊内藏线，避免传感器线裸露影响外观。
