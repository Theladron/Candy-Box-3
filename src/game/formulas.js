export const MAX_CANDY_DISPLAY = Number.MAX_SAFE_INTEGER

export const MAX_CANDY_DISPLAY_DIGITS = String(MAX_CANDY_DISPLAY).length

export function getMaxHealth(candiesEaten) {
  const eaten = Math.max(0, candiesEaten)
  return 100 + Math.floor(2.1 * eaten ** 0.4)
}
