export function getMaxHealth(candiesEaten) {
  const eaten = Math.max(0, candiesEaten)
  return 100 + Math.floor(2.1 * eaten ** 0.4)
}
