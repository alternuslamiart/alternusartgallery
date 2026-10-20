"use client";

import { useState } from "react";
import { Building2, LayoutGrid, Route, Sofa } from "lucide-react";
import { Badge, Card, Tabs } from "@/components/soft-ui/primitives";
import { ArchitectureArt, InfrastructureArt, InteriorArt } from "@/components/soft-ui/showcase-art";

type Category = "all" | "architecture" | "interior" | "infrastructure";

const PROJECTS: Array<{
  title: string;
  meta: string;
  category: Exclude<Category, "all">;
  art: "arch-dusk" | "arch-dawn" | "int-dawn" | "int-sage" | "inf-sage" | "inf-dusk";
  wide?: boolean;
}> = [
  { title: "Cantilever Lake House", meta: "Residential · 3D Studio", category: "architecture", art: "arch-dusk", wide: true },
  { title: "Warm Minimal Living Room", meta: "Interior · Floor Plan", category: "interior", art: "int-dawn" },
  { title: "Riverside District Masterplan", meta: "Urban · Site Planning", category: "infrastructure", art: "inf-sage" },
  { title: "Courtyard Pavilion", meta: "Cultural · 3D Studio", category: "architecture", art: "arch-dawn" },
  { title: "Sage Reading Lounge", meta: "Interior · Floor Plan", category: "interior", art: "int-sage", wide: true },
  { title: "Interchange & Green Corridor", meta: "Mobility · Infrastructure", category: "infrastructure", art: "inf-dusk" },
];

function Art({ art }: { art: (typeof PROJECTS)[number]["art"] }) {
  switch (art) {
    case "arch-dusk":
      return <ArchitectureArt hue="dusk" />;
    case "arch-dawn":
      return <ArchitectureArt hue="dawn" />;
    case "int-dawn":
      return <InteriorArt hue="dawn" />;
    case "int-sage":
      return <InteriorArt hue="sage" />;
    case "inf-sage":
      return <InfrastructureArt hue="sage" />;
    default:
      return <InfrastructureArt hue="dusk" />;
  }
}

export function Showcase() {
  const [category, setCategory] = useState<Category>("all");
  const visible = PROJECTS.filter((project) => category === "all" || project.category === category);

  return (
    <div>
      <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-xl">
          <div className="sui-overline mb-4">Showcase</div>
          <h2 className="sui-h2">Concepts shaped in a calm, focused flow.</h2>
          <p className="sui-body mt-4">
            Illustrative concept previews across residential architecture, interiors, and urban infrastructure.
          </p>
        </div>
        <div className="max-w-full overflow-x-auto pb-1">
          <Tabs<Category>
            label="Filter showcase"
            value={category}
            onChange={setCategory}
            items={[
              { id: "all", label: "All", icon: LayoutGrid },
              { id: "architecture", label: "Architecture", icon: Building2 },
              { id: "interior", label: "Interior", icon: Sofa },
              { id: "infrastructure", label: "Infrastructure", icon: Route },
            ]}
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {visible.map((project) => (
          <Card
            key={project.title}
            as="article"
            hover
            padded={false}
            className={`p-2.5 ${project.wide && category === "all" ? "md:col-span-2" : ""}`}
          >
            <div className="sui-art aspect-[4/3] md:aspect-auto md:h-[320px]">
              <Art art={project.art} />
              <div className="sui-art-caption flex items-end justify-between gap-3">
                <div>
                  <h3 className="sui-h4 text-[var(--sui-text)]">{project.title}</h3>
                  <p className="sui-small mt-1">{project.meta}</p>
                </div>
                <Badge>Concept</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
