import { prisma } from "@/lib/prisma";

const helpArticles = [
  {
    slug: "getting-started",
    title: "Getting started",
    category: "Basics",
    order: 1,
    content: "Use the studio sidebar to move between assistant conversations, projects, assets, prompts, and exports. Your workspace data is scoped to your signed-in account.",
  },
  {
    slug: "uploading-assets",
    title: "Uploading assets",
    category: "Assets",
    order: 2,
    content: "Upload safe image, vector, model, document, texture, export, and audio files from Asset Library. Executable and server-side files are rejected.",
  },
  {
    slug: "creating-prototypes",
    title: "Creating prototypes",
    category: "Design",
    order: 3,
    content: "Create a prototype record from Cedium Design by adding a name, type, quality, brief, tags, and design system settings.",
  },
  {
    slug: "using-prompt-lab",
    title: "Using Prompt Lab",
    category: "Prompts",
    order: 4,
    content: "Save reusable prompts, organize them by category, and run them through the local stub provider until a real AI provider is configured.",
  },
  {
    slug: "exporting-files",
    title: "Exporting files",
    category: "Exports",
    order: 5,
    content: "Exports are persisted as records. Generated exports stay queued or stubbed until a rendering provider is configured.",
  },
  {
    slug: "managing-projects",
    title: "Managing projects",
    category: "Projects",
    order: 6,
    content: "Projects group prototypes, assets, prompts, code work, CAD designs, Blender projects, and exports.",
  },
  {
    slug: "trial-and-upgrade",
    title: "Trial and upgrade",
    category: "Billing",
    order: 7,
    content: "Trial and plan state is persisted in the workspace. Upgrade intent returns a safe placeholder unless billing is configured.",
  },
];

export async function ensureHelpArticles() {
  const count = await prisma.helpArticle.count();
  if (count > 0) return;

  await prisma.helpArticle.createMany({
    data: helpArticles,
    skipDuplicates: true,
  });
}
