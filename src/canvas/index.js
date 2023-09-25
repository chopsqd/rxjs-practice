import {fromEvent} from 'rxjs';
import {map, pairwise, switchMap, takeUntil, withLatestFrom, startWith} from 'rxjs/operators';

const canvas = document.querySelector('canvas')
const range = document.getElementById('range')
const color = document.getElementById('color')

const ctx = canvas.getContext('2d') // Контекст
const rect = canvas.getBoundingClientRect() // Размерность
const scale = window.devicePixelRatio

canvas.width = rect.width * scale
canvas.height = rect.height * scale
ctx.scale(scale, scale)


const mouseMove$ = fromEvent(canvas, 'mousemove')
const mouseDown$ = fromEvent(canvas, 'mousedown')
const mouseUp$ = fromEvent(canvas, 'mouseup')
const mouseOut$ = fromEvent(canvas, 'mouseout')

const createInputStream = (node) => {
  return fromEvent(node, 'input')
    .pipe(
      map(event => event.target.value),
      startWith(node.value)
    )
}

const lineWidth$ = createInputStream(range)
const strokeStyle$ = createInputStream(color)

mouseDown$
  .pipe(
    withLatestFrom(lineWidth$, strokeStyle$,(_, lineWidth, strokeStyle) => ({ lineWidth, strokeStyle })),
    switchMap(options => {
      return mouseMove$
        .pipe(
          map(event => ({
            x: event.offsetX,
            y: event.offsetY,
            options
          })),
          pairwise(),
          takeUntil(mouseUp$),
          takeUntil(mouseOut$),
        )
    })
  )
  .subscribe(([from, to]) => {
    const {lineWidth, strokeStyle} = from.options

    ctx.lineWidth = lineWidth
    ctx.strokeStyle = strokeStyle

    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
  })
