const KIT_COLORS = {
  green: "#009682",
  white: "#ffffff",
  darkblue: "#002d4c",
  iceblue: "#a8b9c4",
  icegray: "#dae1e6",
  pinegreen: "#005a50",
  cyan: "#23a1e0",
  blue: "#0c537e",
  lightgreen: "#8cb63c",
  forestgreen: "#276738",
  black: "#000000",
  purple: "#a3107c",
  orange: "#df9b1b",
  yellow: "#fce500",
  red: "#d30015",
  brown: "#a7822e",
  green20: "#cceae6",
};

function kitColor(value) {
  return KIT_COLORS[value] || value || KIT_COLORS.darkblue;
}

function kitLogo(mode = "default") {
  const logoMode = mode === "white" || mode === "black" ? mode : "rgb";
  return `<img class="kit-logo-svg kit-logo-${logoMode}" src="template/assets/kitlogo_rgb.svg" alt="KIT logo">`;
}

const PGF_SYMBOL_SIZE_MM = 12.35;
const PGF_SYMBOL_SCALE = 128 / PGF_SYMBOL_SIZE_MM;
const PGF_SYMBOL_NAMES = new Set([
  "arrow-e",
  "arrow-s",
  "arrow-w",
  "arrow-n",
  "arrow-se",
  "arrow-sw",
  "arrow-nw",
  "arrow-ne",
  "check",
  "cross",
  "plus",
  "minus",
  "equal",
]);

function pgfPoint(x, y) {
  return `${(x * PGF_SYMBOL_SCALE).toFixed(2)} ${(128 - y * PGF_SYMBOL_SCALE).toFixed(2)}`;
}

function pgfLine(points) {
  return points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${pgfPoint(x, y)}`).join(" ");
}

function pgfStroke(points, color) {
  return `<path d="${pgfLine(points)}" stroke="${color}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
}

function pgfFill(points, color) {
  return `<path d="${pgfLine(points)} Z" fill="${color}"/>`;
}

function pgfCircleBg(color) {
  return `<path fill="${color}" d="
    M${pgfPoint(0.19, 6.32)}
    C${pgfPoint(0.19, 9.64)} ${pgfPoint(2.89, 12.33)} ${pgfPoint(6.23, 12.33)}
    C${pgfPoint(9.56, 12.33)} ${pgfPoint(12.26, 9.64)} ${pgfPoint(12.26, 6.32)}
    C${pgfPoint(12.26, 3.00)} ${pgfPoint(9.56, 0.31)} ${pgfPoint(6.23, 0.31)}
    C${pgfPoint(2.89, 0.31)} ${pgfPoint(0.19, 3.00)} ${pgfPoint(0.19, 6.32)}
    Z"/>`;
}

function pgfArrowStraight(color) {
  return [
    pgfStroke([[2.92, 6.32], [7.65, 6.32]], color),
    pgfFill([[7.41, 8.08], [9.53, 6.32], [7.41, 4.55]], color),
  ].join("");
}

function pgfArrowDiagonal(color) {
  return [
    pgfStroke([[3.91, 8.64], [7.24, 5.32]], color),
    pgfFill([[8.32, 6.74], [8.58, 3.99], [5.83, 4.24]], color),
  ].join("");
}

function rotateSvg(content, degrees) {
  return `<g transform="rotate(${degrees} 64 64)">${content}</g>`;
}

function generatedPgfIcon(name, color) {
  const paths = window.KIT_PGF_ICONS?.[name];
  if (!paths) return "";

  return paths.map(({ d, use }) => {
    if (use.includes("fill") && use.includes("stroke")) {
      return `<path d="${d}" fill="${color}" stroke="${color}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    if (use.includes("fill")) {
      return `<path d="${d}" fill="${color}"/>`;
    }
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join("");
}

function iconShape(name, fg) {
  const stroke = `stroke="${fg}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const generated = generatedPgfIcon(name, fg);
  if (generated) return generated;

  switch (name) {
    case "arrow-e":
      return pgfArrowStraight(fg);
    case "arrow-s":
      return rotateSvg(pgfArrowStraight(fg), 90);
    case "arrow-w":
      return rotateSvg(pgfArrowStraight(fg), 180);
    case "arrow-n":
      return rotateSvg(pgfArrowStraight(fg), 270);
    case "arrow-se":
      return pgfArrowDiagonal(fg);
    case "arrow-sw":
      return rotateSvg(pgfArrowDiagonal(fg), 90);
    case "arrow-nw":
      return rotateSvg(pgfArrowDiagonal(fg), 180);
    case "arrow-ne":
      return rotateSvg(pgfArrowDiagonal(fg), 270);
    case "check":
      return [
        pgfStroke([[2.96, 5.86], [4.97, 3.86]], fg),
        pgfStroke([[9.5, 8.76], [4.6, 3.89]], fg),
      ].join("");
    case "cross":
      return [
        pgfStroke([[3.79, 8.76], [8.69, 3.89]], fg),
        pgfStroke([[8.69, 8.76], [3.79, 3.89]], fg),
      ].join("");
    case "plus":
      return [
        pgfStroke([[4.08, 6.33], [8.39, 6.33]], fg),
        pgfStroke([[6.21, 8.49], [6.21, 4.2]], fg),
      ].join("");
    case "minus":
      return pgfStroke([[4.07, 6.31], [8.38, 6.31]], fg);
    case "equal":
      return [
        pgfStroke([[4.1, 7.01], [8.41, 7.01]], fg),
        pgfStroke([[4.1, 5.65], [8.41, 5.65]], fg),
      ].join("");
    case "book":
      return `<path fill="${fg}" d="M30 28h34c14 0 22 8 22 22v50H51c-9 0-16-7-16-16V36c0-4-2-8-5-8Zm34 0h34c-3 0-5 4-5 8v48c0 9-7 16-16 16H64V28Z"/>`;
    case "bulb":
      return `<path d="M64 20c-19 0-34 15-34 34 0 13 7 23 18 30v10h32V84c11-7 18-17 18-30 0-19-15-34-34-34Z" ${stroke}/><path d="M50 108h28" ${stroke}/>`;
    case "handshake":
      return `<path d="M24 70 48 46l22 18 12-12 22 22-25 25c-8 8-20 8-28 0L24 70Z" ${stroke}/>`;
    case "meet":
      return `
        <path d="M42 18h45c7 0 11 4 11 11v18c0 7-4 11-11 11H70L52 73V58H42c-7 0-11-4-11-11V29c0-7 4-11 11-11Z" ${stroke}/>
        <circle cx="36" cy="78" r="10" ${stroke}/>
        <circle cx="92" cy="78" r="10" ${stroke}/>
        <path d="M16 108c4-13 12-20 24-20s20 7 24 20H16Z" ${stroke}/>
        <path d="M72 108c4-13 12-20 24-20s20 7 24 20H72Z" ${stroke}/>`;
    case "molecule":
      return `<circle cx="35" cy="76" r="14" fill="${fg}"/><circle cx="72" cy="34" r="14" fill="${fg}"/><circle cx="98" cy="86" r="14" fill="${fg}"/><path d="M46 64 62 46M78 48l14 26" ${stroke}/>`;
    case "teacher":
      return `<path fill="${fg}" d="M22 28h84v50H22V28Zm12 64h60v14H34V92Z"/><circle cx="42" cy="52" r="11" fill="${kitColor("darkblue")}"/><path d="M56 60h36" stroke="${kitColor("darkblue")}" stroke-width="7"/>`;
    default:
      return `<text x="64" y="76" text-anchor="middle" font-size="52" font-weight="700" fill="${fg}">${name}</text>`;
  }
}

function kitIcon(name, options = {}) {
  const fg = kitColor(options.fg || "green");
  const bg = kitColor(options.bg || "darkblue");
  const label = options.label || name;
  const background = PGF_SYMBOL_NAMES.has(name) || /^[0-9]+$/.test(name)
    ? pgfCircleBg(bg)
    : `<rect x="4" y="4" width="120" height="120" rx="0" fill="${bg}"/>`;

  return `
    <svg class="kit-icon-svg" viewBox="0 0 128 128" role="img" aria-label="${label}">
      ${background}
      ${iconShape(name, fg)}
    </svg>`;
}

function panelChevron() {
  return `
    <svg class="kit-panel-chevron" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path d="M5 2 13 9 5 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="square" stroke-linejoin="miter"/>
    </svg>`;
}

window.KIT = { colors: KIT_COLORS, color: kitColor, logo: kitLogo, icon: kitIcon, panelChevron };
