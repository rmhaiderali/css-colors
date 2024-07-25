import colorjsio from "https://colorjs.io/dist/color.js";
import color from "https://cdn.jsdelivr.net/npm/color@4.2.3/+esm";
import colorparse from "https://cdn.jsdelivr.net/npm/color-parse@2.0.2/+esm";

function fmt(string, ...args) {
  return string.replace(/{(\d+)}/g, function (match, number) {
    return typeof args[number] != "undefined" ? args[number] : match;
  });
}

const tbody = document.querySelector("tbody");
const firstTR = tbody.children[0];

[
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
  .forEach((tr) => tbody.appendChild(tr));

function createNewColorRow(color) {
  const tr = document.createElement("tr");

  const td1 = document.createElement("td");
  td1.textContent = color;
  td1.style.backgroundColor = color;

  const td2 = document.createElement("td");
  const td3 = document.createElement("td");

  tr.append(td1, td2, td3);

  return tr;
}

function getRBGA(color) {
  if (computedToRGB.value === "colorjs.io") {
    try {
      const c = new colorjsio(color);
      return c.srgb.map((v) => v * 255).concat(c.alpha);
    } catch (e) {
      return null;
    }
  }
  //
  else if (computedToRGB.value === "css color-mix") {
    hidden.style.backgroundColor = fmt(
      "color-mix(in srgb, transparent 0%, {0})",
      color
    );
    if (!hidden.style.backgroundColor) return null;
    const computed = window.getComputedStyle(hidden).backgroundColor;
    const c = new colorparse(computed);
    return c.values.map((v) => v * 255).concat(c.alpha);
  }
}

function updateText() {
  [...tbody.children].slice(1).forEach((tr) => {
    const [td1, td2, td3] = tr.children;

    if (!td1.style.backgroundColor) {
      td2.style.removeProperty("background-color");
      td3.style.removeProperty("background-color");
      td2.textContent = "Unsupported Color";
      td3.textContent = "Unsupported Color";
      tr.style.color = "black";
      return;
    }

    const computed = window.getComputedStyle(td1).backgroundColor;

    td2.textContent = td2.style.backgroundColor = computed;

    const rgba = getRBGA(computed);

    if (!rgba) {
      td3.style.removeProperty("background-color");
      td3.textContent = "Unsupported Color";
      tr.style.color = "black";
      return;
    }

    const c = color(rgba);

    td3.textContent = td3.style.backgroundColor = c.string();

    tr.style.color = c.isDark() ? "white" : "black";
  });
}

updateText();

addButton.onclick = function (e) {
  const color = colorInput.value.trim().toLowerCase();

  if (!color || color === tbody.children[1].children[0].innerText) return;

  firstTR.insertAdjacentElement("afterend", createNewColorRow(color));
  updateText();
};

colorInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") addButton.click();
});

tbody.style.colorScheme = "light";

schemeButton.onclick = function (e) {
  tbody.style.colorScheme =
    tbody.style.colorScheme == "light" ? "dark" : "light";
  schemeButton.innerHTML =
    schemeButton.innerHTML == "Set color scheme light"
      ? "Set color scheme dark"
      : "Set color scheme light";
  updateText();
};

computedToRGB.onchange = updateText;
