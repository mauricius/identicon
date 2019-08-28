import canvasRenderer from 'canvas-renderer'
import { shapes, middleShapesIndices } from './shapes'

export default class Identicon {
  /**
   * Class Constructor.
   *
   * @param  {String} input - The input string
   * @param  {Number} size  - The size of the identicon
   * @return {Canvas}
   */
  constructor(input, size) {
    const code = this.extractCode(input)

    this.canvas = this.render(code, size)
  }

  /**
   * Since SHA-1 produces a 160-bit hash value,
   * we need to retrieve only the first 4 bytes
   *
   * @param  {String} input
   * @return {Number}
   */
  extractCode(input) {
    const BYTES = 4
    const BITS_PER_BYTE = 8

    return Number(parseInt(input.substr(0, BYTES * (BITS_PER_BYTE / 4)), 16))
  }

  /**
   * Render the identicon on a canvas.
   *
   * @param  {Number} code - The hashed input
   * @param  {Number} size - The size of the identicon
   * @return {Canvas}
   */
  render(code, size) {
    const canvas = canvasRenderer.createCanvas(size, size)

    const ctx = canvas.getContext('2d')

    const patchSize = getPatchSize(size)
    const backgroundColor = getRgbBackgroundColor(code)
    const foregroundColor = getRgbForegroundColor(code)

    /**
     * Render Middle Patch
     */

    let index = getMiddleShapeIndex(code)
    let invert = getMiddleInverted(code)
    let rotation = 0

    if (index === 15) {
      invert = !invert
    }

    renderPatch(ctx, patchSize, patchSize, patchSize, shapes[index], rotation, invert, foregroundColor, backgroundColor)

    /**
     * Render Corner Patches
     * starting from top left and moving clock wise
     */

    index = getCornerShapeIndex(code)
    invert = getCornerInverted(code)
    rotation = getCornerRotation(code)

    if (index === 15) {
      invert = !invert
    }

    renderPatch(ctx, 0            , 0            , patchSize, shapes[index], rotation++, invert, foregroundColor, backgroundColor)
    renderPatch(ctx, patchSize * 2, 0            , patchSize, shapes[index], rotation++, invert, foregroundColor, backgroundColor)
    renderPatch(ctx, patchSize * 2, patchSize * 2, patchSize, shapes[index], rotation++, invert, foregroundColor, backgroundColor)
    renderPatch(ctx, 0            , patchSize * 2, patchSize, shapes[index], rotation++, invert, foregroundColor, backgroundColor)

    /**
     * Render Side Patches
     * starting from top and moving clock wise
     */

    index = getSideShapeIndex(code)
    invert = getSideInverted(code)
    rotation = getSideRotation(code)

    if (index === 15) {
      invert = !invert
    }

    renderPatch(ctx, patchSize    , 0            , patchSize, shapes[index], rotation++, invert, foregroundColor, backgroundColor)
    renderPatch(ctx, patchSize * 2, patchSize    , patchSize, shapes[index], rotation++, invert, foregroundColor, backgroundColor)
    renderPatch(ctx, patchSize    , patchSize * 2, patchSize, shapes[index], rotation++, invert, foregroundColor, backgroundColor)
    renderPatch(ctx, 0            , patchSize    , patchSize, shapes[index], rotation++, invert, foregroundColor, backgroundColor)

    return canvas
  }

  /**
   * Return canvas to PNG
   */
  toPng() {
    return this.canvas.toPng()
  }

  /**
   * Return canvas to Data URL
   */
  toDataURL() {
    return this.canvas.toDataURL()
  }
}

/**
 * Render a shape.
 *
 * @param  {Context} ctx
 * @param  {Number} x
 * @param  {Number} y
 * @param  {Number} size
 * @param  {Array} vertices
 * @param  {Number} turn
 * @param  {Boolean} invert
 * @param  {String} foreground
 * @param  {String} background
 */
function renderPatch(ctx, x, y, size, vertices, turn, invert, foreground, background) {
  const offset = size / 2
  const scale = size / 4

  ctx.save()

  // background
  ctx.fillStyle = invert ? foreground : background
  ctx.fillRect(x, y, size, size)

  // build patch path
  ctx.translate(x + offset, y + offset)
  ctx.rotate((turn * Math.PI) / 2)
  ctx.beginPath()
  ctx.moveTo(
    (vertices[0] % 5) * scale - offset,
    Math.floor(vertices[0] / 5) * scale - offset,
  )

  for (let i = 1; i < vertices.length; i++) {
    ctx.lineTo(
      (vertices[i] % 5) * scale - offset,
      Math.floor(vertices[i] / 5) * scale - offset,
    )
  }

  ctx.closePath()

  // foreground
  ctx.fillStyle = invert ? background : foreground
  ctx.fill()

  ctx.restore()
}

/**
 * Get the size of each patch.
 * We are using a 3x3 grid.
 *
 * @param  {Number} size
 * @return {Number}
 */
function getPatchSize(size) {
  return Math.round(size / 3)
}

/**
 * Get the middle shape index.
 * (4 options, 11 bit match)
 *
 * @param  {Number} code
 * @return {Number}
 */
function getMiddleShapeIndex(code) {
  return middleShapesIndices[code & 3]
}

/**
 * Is the color inverted for the middle shape.
 * (2 options, 1 bit match)
 *
 * @param  {Number} code
 * @return {Boolean}
 */
function getMiddleInverted(code) {
  return ((code >> 2) & 1) != 0
}

/**
 * Get the corner shape index.
 * (16 options, 1111 bit match)
 *
 * @param  {Number} code
 * @return {Number}
 */
function getCornerShapeIndex(code) {
  return (code >> 3) & 15
}

/**
 * Is the color inverted for the corner shapes.
 * (2 options, 1 bit match)
 *
 * @param  {Number} code
 * @return {Boolean}
 */
function getCornerInverted(code) {
  return ((code >> 7) & 1) != 0
}

/**
 * Get the rotation for the corner shapes.
 *(4 options, 11 bit match)
 *
 * @param  {Number} code
 * @return {Number}
 */
function getCornerRotation(code) {
  return (code >> 8) & 3
}

/**
 * Get the side shape index.
 * (16 options, 11111 bit match)
 *
 * @param  {Number} code
 * @return {Number}
 */
function getSideShapeIndex(code) {
  return (code >> 10) & 15
}

/**
 * Is the color inverted for the side shapes.
 * (2 options, 1 bit match)
 *
 * @param  {Number} code
 * @return {Boolean}
 */
function getSideInverted(code) {
  return ((code >> 14) & 1) != 0
}

/**
 * Get the rotation for the side shapes.
 *(4 options, 11 bit match)
 *
 * @param  {Number} code
 * @return {Number}
 */
function getSideRotation(code) {
  return (code >> 15) & 3
}

/**
 * Get valule for blue color.
 * (32 options, 11111 bit match)
 *
 * @param  {Number} code
 * @return {Number}
 */
function getBlue(code) {
  return (code >> 17) & 31
}

/**
 * Get valule for green color.
 * (32 options, 11111 bit match)
 *
 * @param  {Number} code
 * @return {Number}
 */
function getGreen(code) {
  return (code >> 22) & 31
}

/**
 * Get valule for red color.
 * (32 options, 11111 bit match)
 *
 * @param  {Number} code
 * @return {Number}
 */
function getRed(code) {
  return (code >> 27) & 31
}

/**
 * Get the foreground color in rgb notation.
 *
 * @param  {Number} code
 * @return {String}
 */
function getRgbForegroundColor(code) {
  const red = getRed(code)
  const green = getGreen(code)
  const blue = getBlue(code)

  return `rgb(${red << 3},${green << 3},${blue << 3})`
}

/**
 * Get the background color in rgb notation.
 *
 * @return {String}
 */
function getRgbBackgroundColor() {
  return 'rgb(255,255,255)'
}
