interface AIResponse {
 content: string;
 suggestedQuestions?: string[];
}

const STUDIO_TOPICS = {
 en: {
 studio: `**Crystal AI Design Studio**

I can help you with:
- Architecture and floor plans
- Interior design and room styling
- Furniture and space planning
- 3D architectural visualization
- Home robotics
- Design documentation and workflow automation

Describe the space or design you want to create, and I will help you shape it.`,
 tools: `**Design Areas**

- **Architecture** - house plans, building layouts, walls, doors, windows, stairs, roofs, and dimensions
- **Interior Design** - room layouts, kitchens, bathrooms, lighting, materials, finishes, and styling
- **Furniture Planner** - furniture placement, room furnishing, circulation, and space optimization
- **3D Visualization** - architectural models, interior views, cameras, renders, and presentation assets
- **Home Robotics** - household robot design, components, residential environments, and human-robot interaction
- **AI Design Assistant** - design briefs, documentation, workflows, and integrations`,
 workflow: `**Typical Workflow**

1. Describe the home, apartment, room, furniture layout, or home robot
2. Choose the output: floor plan, interior layout, 3D design model, visualization, or architectural drawing
3. Define dimensions, rooms, materials, lighting, furniture, and practical requirements
4. Generate the first design direction
5. Refine the layout, visuals, documentation, and exports`,
 help: `I can draft:
- a modern 3-bedroom house plan
- a minimalist living room concept
- a floor plan for a 120 m² house
- a furniture arrangement for an apartment
- a household robot concept for home assistance`,
 },
 sq: {
 studio: `**Crystal AI Design Studio**

Mund t'ju ndihmoj me arkitekture, dizajn interieri, planifikim mobiliesh, vizualizim 3D, robotike per shtepi dhe dokumentacion dizajni.

Pershkruani hapesiren ose dizajnin qe deshironi te krijoni dhe do t'ju ndihmoj ta strukturoni.`,
 tools: `**Fushat e Dizajnit**

- **Arkitekture** - plane shtepish, layout ndertesash, mure, dyer, dritare, shkalle, çati dhe dimensione
- **Dizajn Interieri** - layout dhomash, kuzhina, banjo, ndriçim, materiale, perfundime dhe stilim
- **Furniture Planner** - vendosje mobiliesh, mobilim dhomash dhe optimizim hapesire
- **Vizualizim 3D** - modele arkitekturore, pamje interieri, kamera dhe rendera
- **Robotike per Shtepi** - robot shtepie, komponente dhe ambiente rezidenciale`,
 workflow: `**Workflow Tipik**

1. Pershkruani shtepine, apartamentin, dhomen, layout-in e mobilieve ose robotin e shtepise
2. Zgjidhni output-in: plan kati, layout interieri, model 3D, vizualizim ose vizatim arkitekturor
3. Percaktoni dimensionet, dhomat, materialet, ndriçimin, mobiliet dhe kerkesat praktike
4. Gjeneroni drejtimin e pare te dizajnit
5. Rafinojeni layout-in, pamjet, dokumentacionin dhe eksportet`,
 help: `Mund te pergatis:
- plan per nje shtepi moderne me 3 dhoma gjumi
- koncept per sallon minimalist
- plan kati per nje shtepi 120 m²
- vendosje mobiliesh per nje apartament
- koncept per robot shtepie qe ndihmon familjen`,
 },
} as const;

function detectLanguage(message: string): "en" | "sq" {
 return /\b(mund|do|treg|ndihm|shkruaj|dizajn|faqe|aplikacion|shtepi|dhom|mobilie)\b/i.test(message) ? "sq" : "en";
}

function randomChoice<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

export function getAIResponse(message: string): AIResponse {
 const lower = message.toLowerCase().trim();
 const lang = detectLanguage(message);
 if (/^(hi|hello|hey|pershendetje|miredita|tung|miresevini)/i.test(lower)) return {
 content: lang === "sq" ? "Pershendetje. Jam Crystal AI Design Studio. Me tregoni cfare hapesire, interieri, plan mobiliesh ose robot shtepie deshironi te krijoni." : "Hello. I am Crystal AI Design Studio. Tell me what space, interior, furniture layout, or home robot you want to create.",
 suggestedQuestions: lang === "sq" ? ["Krijo nje shtepi moderne me 3 dhoma gjumi", "Dizajno nje sallon minimalist", "Planifiko mobiliet per kete apartament"] : ["Create a modern 3-bedroom house", "Design a minimalist living room", "Arrange furniture for this apartment"],
 };
 if (/\b(thanks|thank you|faleminderit)\b/i.test(lower)) return { content: lang === "sq" ? "Me kenaqesi. Mund te vazhdojme me arkitekture, dizajn interieri, planifikim mobiliesh, vizualizim 3D ose robotike per shtepi." : "You're welcome. We can continue with architecture, interior design, furniture planning, 3D visualization, or home robotics." };
 if (/\b(help|ndihm|assist|what can you do|cfare mundesh)\b/i.test(lower)) return { content: `${STUDIO_TOPICS[lang].studio}\n\n${STUDIO_TOPICS[lang].tools}\n\n${STUDIO_TOPICS[lang].workflow}`, suggestedQuestions: lang === "sq" ? ["Si krijoj nje plan kati?", "Si planifikoj mobiliet?", "Dizajno nje robot per shtepi"] : ["How do I create a floor plan?", "How do I plan furniture?", "Design a robot for a home"] };
 if (/\b(floor plan|house|apartment|building|room|wall|door|window|stair|roof|architecture|interior|furniture|kitchen|bedroom|bathroom|lighting|material|home robot|robot)\b/i.test(lower)) return { content: `${STUDIO_TOPICS[lang].workflow}\n\n${STUDIO_TOPICS[lang].help}` };
 if (/\b(code|api|script|automation|parametric|workflow)\b/i.test(lower)) return { content: lang === "sq" ? "AI Design Assistant mund te pergatise workflow per plane kati, dokumentacion arkitekturor, rregulla parametrike te hapesires dhe integrime. Me jepni kerkesat e dizajnit, dimensionet dhe output-in qe deshironi." : "AI Design Assistant can prepare workflows for floor plans, architectural documentation, parametric space rules, and integrations. Share the design requirements, dimensions, and output you need." };
 return {
 content: lang === "sq" ? randomChoice(["Me tregoni cfare shtepie, apartamenti, dhome, layout mobiliesh ose roboti per shtepi doni te dizajnoni.", "Mund te ndihmoj me arkitekture, dizajn interieri, furniture planning, vizualizim 3D dhe robotike per shtepi."]) : randomChoice(["Tell me what home, apartment, room, furniture layout, or household robot you want to design.", "I can help with architecture, interior design, furniture planning, 3D visualization, and home robotics."]),
 suggestedQuestions: lang === "sq" ? ["Krijo plan kati per nje shtepi 120 m²", "Dizajno nje kuzhine moderne", "Krijo nje robot shtepie"] : ["Create a floor plan for a 120 m² house", "Design a modern kitchen", "Create a home robot for household assistance"],
 };
}

export const WELCOME_MESSAGE = {
 en: `Welcome to Crystal AI Design Studio.

Design spaces. Visualize ideas. Build intelligent environments.

I can help you create architectural floor plans, interior layouts, furniture arrangements, 3D visualizations, and home robots designed for residential environments.`,
 sq: `Miresevini ne Crystal AI Design Studio.

Dizajnoni hapesira. Vizualizoni ide. Ndertoni ambiente inteligjente.

Mund t'ju ndihmoj te krijoni plane arkitekturore, layout-e interieri, vendosje mobiliesh, vizualizime 3D dhe robote per ambiente rezidenciale.`,
};

export const SUGGESTED_QUESTIONS = {
 en: ["Create a modern 3-bedroom house", "Design a minimalist living room", "Arrange furniture for this apartment", "Create a home robot designed for household assistance"],
 sq: ["Krijo nje shtepi moderne me 3 dhoma gjumi", "Dizajno nje sallon minimalist", "Vendos mobiliet per kete apartament", "Krijo nje robot per ndihme ne shtepi"],
};
