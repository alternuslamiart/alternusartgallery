interface AIResponse {
  content: string;
  suggestedQuestions?: string[];
}

const STUDIO_TOPICS = {
  en: {
    studio: `**Cedium AI Studio**

I can help you with:
- AutoCAD design prompts
- Website and app UI planning
- React and Tailwind code generation
- Blender 3D scene briefs
- Design system setup
- Workspace and file organization

Tell me what you want to build and I will help you structure it.`,
    tools: `**Available Tools**

- **AutoCAD Design** - plan layouts, components, and responsive screens
- **Code Builder** - turn a design direction into React and UI code
- **Blender 3D** - define scenes, lighting, materials, and renders
- **Asset Library** - organize images, files, and references
- **Prompt Lab** - iterate on prompts and variants`,
    workflow: `**Typical Workflow**

1. Describe the product or screen
2. Pick the target output: web, app, mobile, or 3D
3. Define layout, tone, and key components
4. Generate the first draft
5. Refine spacing, states, and responsive behavior`,
    help: `If you want, I can draft:
- a homepage layout
- a dashboard screen
- a mobile app flow
- a component system
- a 3D hero brief`,
  },
  sq: {
    studio: `**Cedium AI Studio**

Mund t'ju ndihmoj me:
- Prompte per AutoCAD Design
- Planifikim UI per website dhe app
- Gjenerim kodi React dhe Tailwind
- Brief per skena 3D ne Blender
- Konfigurim te design system
- Organizim te workspace dhe file-ve

Më thuaj çfarë do të ndërtosh dhe do ta strukturoj.`,
    tools: `**Mjetet e Disponueshme**

- **AutoCAD Design** - layout, komponentë dhe screen-e responsive
- **Code Builder** - kthen drejtimin e dizajnit në kod UI
- **Blender 3D** - skena, drita, materiale dhe render
- **Asset Library** - organizim i file-ve dhe referencave
- **Prompt Lab** - iterim prompts dhe variante`,
    workflow: `**Workflow Tipik**

1. Përshkruaj produktin ose ekranin
2. Zgjidh output-in: web, app, mobile ose 3D
3. Përcakto layout, tonin dhe komponentët kryesorë
4. Gjenero draftin e parë
5. Rafino spacing, states dhe responsive behavior`,
    help: `Nëse dëshiron, mund të përgatis:
- homepage
- dashboard
- mobile app flow
- component system
- 3D hero brief`,
  },
} as const;

function detectLanguage(message: string): "en" | "sq" {
  return /[ëç]/i.test(message) || /\b(mund|do|treg|ndihm|shkruaj|dizajn|faqe|aplikacion)\b/i.test(message)
    ? "sq"
    : "en";
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getAIResponse(message: string): AIResponse {
  const lower = message.toLowerCase().trim();
  const lang = detectLanguage(message);

  if (/^(hi|hello|hey|pershendetje|miredita|tung|miresevini)/i.test(lower)) {
    return {
      content:
        lang === "sq"
          ? "Përshëndetje. Jam Cedium AI Studio. Më thuaj çfarë po ndërton dhe do të të ndihmoj ta kthesh në strukturë, layout ose kod."
          : "Hello. I am Cedium AI Studio. Tell me what you are building and I will help turn it into structure, layout, or code.",
      suggestedQuestions:
        lang === "sq"
          ? ["Nderto nje homepage", "Propozo nje dashboard", "Bëj një mobile flow"]
          : ["Build a homepage", "Propose a dashboard", "Make a mobile flow"],
    };
  }

  if (/\b(thanks|thank you|faleminderit)\b/i.test(lower)) {
    return {
      content:
        lang === "sq"
          ? "Në rregull. Nëse do, mund të vazhdojmë me layout, komponentë ose prompt tjetër."
          : "Understood. If you want, we can continue with layout, components, or another prompt.",
    };
  }

  if (/\b(help|ndihm|assist|what can you do|cfare mundesh)\b/i.test(lower)) {
    return {
      content: `${STUDIO_TOPICS[lang].studio}\n\n${STUDIO_TOPICS[lang].tools}\n\n${STUDIO_TOPICS[lang].workflow}`,
      suggestedQuestions:
        lang === "sq"
          ? ["Si ndërtoj një dashboard?", "Si e organizoj një design system?", "Më bëj një brief për Blender"]
          : ["How do I build a dashboard?", "How do I organize a design system?", "Make a Blender brief"],
    };
  }

  if (/\b(acad|autocad|layout|wireframe|design system|component|responsive|screen|faqe|website|app|mobile)\b/i.test(lower)) {
    return {
      content: `${STUDIO_TOPICS[lang].workflow}\n\n${STUDIO_TOPICS[lang].help}`,
    };
  }

  if (/\b(blender|3d|scene|render|lighting|material|model)\b/i.test(lower)) {
    return {
      content:
        lang === "sq"
          ? "Për Blender 3D mund të përgatis brief për scene, lighting, camera, materials dhe render states. Përshkruaj objektin, stilin dhe ambientin."
          : "For Blender 3D I can prepare a brief for scene setup, lighting, camera, materials, and render states. Describe the object, style, and environment.",
    };
  }

  if (/\b(code|react|tailwind|component|ui|frontend)\b/i.test(lower)) {
    return {
      content:
        lang === "sq"
          ? "Mund ta kthej drejtimin në strukturë komponentësh, layout responsive dhe kod UI. Më jep ekranin ose flow-n që do të ndërtojmë."
          : "I can turn the direction into component structure, responsive layout, and UI code. Give me the screen or flow you want to build.",
    };
  }

  return {
    content:
      lang === "sq"
        ? randomChoice([
            "Më jep një ekran, flow, ose objektiv dhe do ta kthej në strukturë të qartë për Studio.",
            "Mund të ndihmoj me AutoCAD, code, Blender, ose organizim workspace.",
          ])
        : randomChoice([
            "Give me a screen, flow, or target and I will turn it into a clear Studio structure.",
            "I can help with AutoCAD, code, Blender, or workspace organization.",
          ]),
    suggestedQuestions:
      lang === "sq"
        ? ["Krijo një landing page", "Bëj një dashboard layout", "Përgatit një brief 3D"]
        : ["Create a landing page", "Build a dashboard layout", "Prepare a 3D brief"],
  };
}

export const WELCOME_MESSAGE = {
  en: `Welcome to Cedium AI Studio.

I can help you design website and app screens, plan AutoCAD layouts, generate React and Tailwind code, and prepare Blender 3D briefs.

Ask me for a homepage, dashboard, mobile flow, component system, or 3D scene.`,
  sq: `Mirësevini në Cedium AI Studio.

Mund t'ju ndihmoj të dizajnoni ekranet e website dhe app, të planifikoni layout AutoCAD, të gjeneroni kod React dhe Tailwind, dhe të përgatisni brief për Blender 3D.

Kërkoni një homepage, dashboard, mobile flow, component system, ose skenë 3D.`,
};

export const SUGGESTED_QUESTIONS = {
  en: [
    "Build a dashboard layout",
    "Create a homepage wireframe",
    "Prepare a Blender 3D brief",
    "Generate a component system",
  ],
  sq: [
    "Bëj një dashboard layout",
    "Krijo një wireframe për homepage",
    "Përgatit një brief Blender 3D",
    "Gjenero një component system",
  ],
};
