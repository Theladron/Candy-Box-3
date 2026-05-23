import { WANDERING_MERCHANT_ART } from './ascii/WanderingMerchantArt'

const HAT_LINE_START = 1
const HAT_LINE_END = 4
const HAT_INSET_COLS = 1
const STICK_LINE_START = 23
const STICK_LINE_END = 30

function getMerchantHatHitbox(art) {
  const lines = art.split('\n')
  const lineCount = lines.length
  const maxLen = Math.max(...lines.map((line) => line.length))
  let minCol = maxLen
  let maxCol = 0

  for (let lineIndex = HAT_LINE_START - 1; lineIndex < HAT_LINE_END; lineIndex += 1) {
    const line = lines[lineIndex]
    for (let col = 0; col < line.length; col += 1) {
      if (line[col] !== ' ') {
        minCol = Math.min(minCol, col)
        maxCol = Math.max(maxCol, col)
      }
    }
  }

  minCol += HAT_INSET_COLS
  maxCol -= HAT_INSET_COLS

  return {
    top: `${((HAT_LINE_START - 1) / lineCount) * 100}%`,
    left: `${(minCol / maxLen) * 100}%`,
    width: `${((maxCol - minCol + 1) / maxLen) * 100}%`,
    height: `${((HAT_LINE_END - HAT_LINE_START + 1) / lineCount) * 100}%`,
  }
}

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

export const MERCHANT_HAT_HITBOX = getMerchantHatHitbox(WANDERING_MERCHANT_ART)

export const MERCHANT_STICK_HITBOXES = getMerchantStickHitboxes(
  WANDERING_MERCHANT_ART
)
