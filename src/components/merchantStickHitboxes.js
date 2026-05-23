import { WANDERING_MERCHANT_ART } from './ascii/WanderingMerchantArt'

const STICK_LINE_START = 23
const STICK_LINE_END = 30

function getMerchantStickHitboxes(art) {
  const lines = art.split('\n')
  const lineCount = lines.length
  const maxLen = Math.max(...lines.map((line) => line.length))
  const hitboxes = []

  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1
    if (lineNumber < STICK_LINE_START || lineNumber > STICK_LINE_END) {
      return
    }

    for (let col = line.length - 1; col >= 0; col -= 1) {
      if (line[col] === '\\') {
        hitboxes.push({
          top: `${(lineIndex / lineCount) * 100}%`,
          left: `${(col / maxLen) * 100}%`,
          width: `${(1 / maxLen) * 100}%`,
          height: `${(1.2 / lineCount) * 100}%`,
        })
        break
      }
    }
  })

  return hitboxes
}

export const MERCHANT_STICK_HITBOXES = getMerchantStickHitboxes(
  WANDERING_MERCHANT_ART
)
