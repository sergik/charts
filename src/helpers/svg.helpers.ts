export function getMousePositionX(evt, svg: SVGSVGElement) {
  var CTM = svg.getScreenCTM()
  if (evt.touches) {
    evt = evt.touches[0]
  }
  return (evt.clientX - CTM.e) / CTM.a
}

