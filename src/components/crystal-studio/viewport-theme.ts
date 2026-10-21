/** Presentation colors only: never write these values into scene objects. */
export function readViewportTheme() {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string) => style.getPropertyValue(`--studio-${name}`).trim();
  return {
    top: read("viewport-top"), center: read("viewport-center"), bottom: read("viewport-bottom"),
    ground: read("ground"), grid: read("grid"), gridMajor: read("grid-major"),
  };
}
