import colorjsio from "https://cdn.jsdelivr.net/npm/colorjs.io@0.5.2/+esm"
import color from "https://cdn.jsdelivr.net/npm/color@4.2.3/+esm"
import colorparse from "https://cdn.jsdelivr.net/npm/color-parse@2.0.2/+esm"
import "https://cdn.jsdelivr.net/npm/computed-style-observer@1.0.0/+esm"

function f(string, ...args) {
  return string.replace(/{(\d+)}/g, (match, number) =>
    typeof args[number] != "undefined" ? args[number] : match
  )
}

function isDark([r, g, b, a]) {
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  const luminanceWithAlpha = luminance * a + (1 - a)
  return luminanceWithAlpha < 0.5
}

const tbody = document.querySelector("tbody")
const firstTr = tbody.children[0]
const lastTr = tbody.children[1]

const colorTrs = []
const tableScroll = document.querySelector(".table-scroll")

const resizeObserver = new ResizeObserver(() => {
  const scrollbarV = !!(tableScroll.offsetWidth - tableScroll.clientWidth)
  const scrollbarH = !!(tableScroll.offsetHeight - tableScroll.clientHeight)

  tableScroll.classList[scrollbarV ? "add" : "remove"]("scrollbar-v")
  tableScroll.classList[scrollbarH ? "add" : "remove"]("scrollbar-h")
})

resizeObserver.observe(tableScroll)

;[
  "InvalidColor",
  "AccentColor",
  "AccentColorText",
  "ActiveText",
  "ButtonBorder",
  "ButtonFace",
  "ButtonText",
  "Canvas",
  "CanvasText",
  "Field",
  "FieldText",
  "GrayText",
  "Highlight",
  "HighlightText",
  "LinkText",
  "Mark",
  "MarkText",
  "VisitedText",
  "ActiveBorder",
  "ActiveCaption",
  "AppWorkspace",
  "Background",
  "ButtonHighlight",
  "ButtonShadow",
  "CaptionText",
  "InactiveBorder",
  "InactiveCaption",
  "InactiveCaptionText",
  "InfoBackground",
  "InfoText",
  "Menu",
  "MenuText",
  "Scrollbar",
  "ThreeDDarkShadow",
  "ThreeDFace",
  "ThreeDHighlight",
  "ThreeDLightShadow",
  "ThreeDShadow",
  "Window",
  "WindowFrame",
  "WindowText",
]
  .map(createNewColorRow)
  .forEach((tr) => {
    lastTr.insertAdjacentElement("beforebegin", tr)
    colorTrs.push(tr)
  })

function createNewColorRow(color) {
  const tr = document.createElement("tr")

  const td1 = document.createElement("td")
  td1.style.backgroundColor = color

  const span = document.createElement("span")
  span.textContent = color
  span.setAttribute("name", color)

  td1.appendChild(span)

  const td2 = document.createElement("td")
  const td3 = document.createElement("td")
  const td4 = document.createElement("td")

  tr.append(td1, td2, td3, td4)

  return tr
}

function getRBGA(color) {
  if (computedToRGB.value === "colorjs.io") {
    try {
      const c = new colorjsio(color)
      return c.srgb.map((v) => v * 255).concat(+c.alpha)
    } catch (e) {
      return null
    }
  }
  //
  else if (computedToRGB.value === "css color-mix") {
    const colorMix = f("color-mix(in srgb, red 0%, {0})", color)
    setStyle("background-color", colorMix, hidden)
    if (!hidden.style.backgroundColor) return null
    const computed = window.getComputedStyle(hidden).backgroundColor
    removeStyle("background-color", hidden)
    const c = new colorparse(computed)
    return c.values.map((v) => v * 255).concat(c.alpha)
  }
}

function setStyle(style, value, ...elements) {
  elements.forEach((el) => (el.style[style] = value))
}

function removeStyle(style, ...elements) {
  elements.forEach((el) => el.style.removeProperty(style))
}

function setTextContent(value, ...elements) {
  elements.forEach((el) => (el.textContent = value))
}

function getNestedChild(element, ...indexes) {
  return indexes.reduce((el, i) => el.children[i], element)
}

// check if background color changes with color
// (acts like currentcolor if color is present)
function doesBGChangesWithColor(el) {
  el.style.color = "rgb(1, 2, 3)"
  const bg1 = window.getComputedStyle(el).backgroundColor
  el.style.color = "rgb(3, 2, 1)"
  const bg2 = window.getComputedStyle(el).backgroundColor

  el.style.removeProperty("color")

  return bg1 === "rgb(1, 2, 3)" && bg2 === "rgb(3, 2, 1)"
}

function updateText() {
  colorTrs.forEach((tr) => {
    const [td1, td2, td3] = tr.children
    const span = td1.children[0]

    removeStyle("color", span, td2, td3)
    removeStyle("background-color", td2, td3)

    //

    if (doesBGChangesWithColor(td1)) {
      span.textContent = span.getAttribute("name") + " ⓘ"
      span.title = "Acts like currentcolor"
    } else {
      span.textContent = span.getAttribute("name")
      span.removeAttribute("title")
    }

    //

    let colorString = span.getAttribute("name")

    if (td1.style.backgroundColor) {
      colorString = window.getComputedStyle(td1).backgroundColor
      setTextContent(colorString, td2)
      setStyle("background-color", colorString, td2)
    } else {
      setTextContent("Unsupported Color", td2)
    }

    const rgba = getRBGA(colorString)

    if (!rgba) return setTextContent("Unsupported Color", td3)

    const c = color(rgba)
    const textColor = isDark(rgba) ? "white" : "black"
    const rgbaString = c.string()

    setTextContent(rgbaString, td3)
    setStyle("background-color", rgbaString, td3)

    if (td1.style.backgroundColor) setStyle("color", textColor, span, td2)
    setStyle("color", textColor, td3)
  })
}

updateText()

addButton.onclick = function () {
  const color = colorInput.value.trim()

  if (!color || color === getNestedChild(tbody, 1, 0, 0).getAttribute("name"))
    return null

  const tr = createNewColorRow(color)
  firstTr.insertAdjacentElement("afterend", tr)
  colorTrs.unshift(tr)
  updateText()
}

colorInput.onkeydown = function (e) {
  if (e.key === "Enter") addButton.click()
}

tbody.style.colorScheme = "light"

schemeButton.onclick = function () {
  tbody.style.colorScheme =
    tbody.style.colorScheme == "light" ? "dark" : "light"
  schemeButton.innerHTML =
    schemeButton.innerHTML == "Set color scheme light"
      ? "Set color scheme dark"
      : "Set color scheme light"
  updateText()
}

computedToRGB.onchange = updateText

window.addEventListener("DOMContentLoaded", () => {
  window
    .matchMedia("(display-mode: standalone)")
    .addEventListener("change", updateText)
})

const computedStyleObserver = new ComputedStyleObserver(updateText, [
  "border-top-color",
  "border-bottom-color",
])

computedStyleObserver.observe(hidden2)
