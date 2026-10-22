const tools = [
  { name: "Blender", icon: "blender" },
  { name: "Unreal Engine", icon: "unrealengine" },
  { name: "Unity", icon: "unity" },
  { name: "Autodesk", icon: "autodesk" },
];

export function HomeToolMarquee() {
  return (
    <section className="home-tools" aria-label="Design tools">
      <div className="home-tools-window">
        <div className="home-tools-track">
          {[0, 1].map((copy) => (
            <ul className="home-tools-list" key={copy} aria-hidden={copy === 1 ? true : undefined}>
              {tools.map((tool) => (
                <li key={tool.icon}>
                  <span className="home-tools-icon" aria-hidden="true" style={{ maskImage: `url(/home-tools/${tool.icon}.svg)`, WebkitMaskImage: `url(/home-tools/${tool.icon}.svg)` }} />
                  <span>{tool.name}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
