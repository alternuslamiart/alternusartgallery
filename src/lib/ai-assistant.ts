interface AIResponse {
 content: string;
 suggestedQuestions?: string[];
}

const STUDIO_TOPICS = {
 en: {
 studio: `**Coreforge AI Studio**

I can help you with:
- 3D Machinery Engines & Industrial Machinery
- Automotive & Motorcycles
- Aerospace & Drones
- CNC & Machining
- 3D Studio Integration
- AI Code Assistant for FEA/CFD, CAD scripting, automation, and APIs

Tell me what machine, vehicle, part, or workflow you want to build and I will help you structure it.`,
 tools: `**Available Tools**

- **3D Machinery Engines & Industrial Machinery** - engines, transmissions, hydraulic and pneumatic systems
- **Automotive & Motorcycles** - body, chassis, suspension, braking systems, cars, trucks, motorcycles, and EVs
- **Aerospace & Drones** - aerodynamics, wing structures, fuselage modeling, and avionics layout
- **CNC & Machining** - G-code, toolpath optimization, milling, and turning workflows
- **3D Studio Integration** - SolidWorks, Fusion 360, CATIA, Rhino 3D, Onshape, NX, FreeCAD, and more
- **AI Code Assistant** - FEA/CFD simulations, CAD scripts, parametric automation, and API integrations`,
 workflow: `**Typical Workflow**

1. Describe the machine, vehicle system, aerospace part, or CNC task
2. Pick the target output: CAD model, assembly plan, CAM workflow, simulation code, or API automation
3. Define constraints, materials, dimensions, tolerances, and target CAD studio
4. Generate the first engineering plan
5. Refine parts, scripts, exports, and production notes`,
 help: `I can draft:
- an engine assembly plan
- an automotive chassis brief
- a drone fuselage workflow
- a CNC toolpath prompt
- a CAD automation script`,
 },
 sq: {
 studio: `**Coreforge AI Studio**

Mund t'ju ndihmoj me:
- 3D Machinery Engines & Industrial Machinery
- Automotive & Motorcycles
- Aerospace & Drones
- CNC & Machining
- 3D Studio Integration
- AI Code Assistant per FEA/CFD, CAD scripting, automation dhe API

Me thuaj cfare makinerie, automjeti, pjese ose workflow do te ndertosh dhe do ta strukturoj.`,
 tools: `**Mjetet e Disponueshme**

- **3D Machinery Engines & Industrial Machinery** - motorre, transmisione, sisteme hidraulike dhe pneumatike
- **Automotive & Motorcycles** - body, chassis, suspension, braking systems, makina, kamione, motore dhe EV
- **Aerospace & Drones** - aerodinamike, krahe, fuselage modeling dhe avionics layout
- **CNC & Machining** - G-code, toolpath optimization, milling dhe turning
- **3D Studio Integration** - SolidWorks, Fusion 360, CATIA, Rhino 3D, Onshape, NX, FreeCAD dhe me shume
- **AI Code Assistant** - FEA/CFD simulations, CAD scripts, parametric automation dhe API integrations`,
 workflow: `**Workflow Tipik**

1. Pershkruaj makinerine, sistemin e automjetit, pjesen aerospace ose detyren CNC
2. Zgjidh output-in: CAD model, assembly plan, CAM workflow, simulation code ose API automation
3. Percakto constraints, materiale, dimensione, toleranca dhe CAD studio
4. Gjenero planin e pare engineering
5. Rafino pjeset, scripts, exports dhe production notes`,
 help: `Mund te pergatis:
- engine assembly plan
- automotive chassis brief
- drone fuselage workflow
- CNC toolpath prompt
- CAD automation script`,
 },
} as const;

function detectLanguage(message: string): "en" | "sq" {
 return /\b(mund|do|treg|ndihm|shkruaj|dizajn|faqe|aplikacion|makineri|motor)\b/i.test(message)
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
 ? "Pershendetje. Jam Coreforge AI Studio. Me thuaj cfare makinerie, motori, automjeti, pjese CNC, drone ose CAD workflow po nderton dhe do ta kthej ne plan engineering."
 : "Hello. I am Coreforge AI Studio. Tell me what machinery, engine, vehicle, CNC part, drone, or CAD workflow you are building and I will turn it into an engineering plan.",
 suggestedQuestions:
 lang === "sq"
 ? ["Nderto nje engine assembly", "Propozo nje chassis design", "Pergatit nje CNC workflow"]
 : ["Build an engine assembly", "Propose a chassis design", "Prepare a CNC workflow"],
 };
 }

 if (/\b(thanks|thank you|faleminderit)\b/i.test(lower)) {
 return {
 content:
 lang === "sq"
 ? "Ne rregull. Mund te vazhdojme me mechanical design, automotive systems, CNC/CAM, CAD studio integration ose code/API automation."
 : "Understood. We can continue with mechanical design, automotive systems, CNC/CAM, CAD studio integration, or code/API automation.",
 };
 }

 if (/\b(help|ndihm|assist|what can you do|cfare mundesh)\b/i.test(lower)) {
 return {
 content: `${STUDIO_TOPICS[lang].studio}\n\n${STUDIO_TOPICS[lang].tools}\n\n${STUDIO_TOPICS[lang].workflow}`,
 suggestedQuestions:
 lang === "sq"
 ? ["Si ndertoj engine assembly?", "Si planifikoj CNC toolpaths?", "Me bej nje workflow per SolidWorks"]
 : ["How do I build an engine assembly?", "How do I plan CNC toolpaths?", "Make a SolidWorks workflow"],
 };
 }

 if (/\b(cnc|cam|g-code|gcode|milling|turning|toolpath)\b/i.test(lower)) {
 return {
 content: `${STUDIO_TOPICS[lang].workflow}\n\n${STUDIO_TOPICS[lang].help}`,
 };
 }

 if (/\b(3d|engine|transmission|hydraulic|pneumatic|machinery|industrial|model|assembly|motor)\b/i.test(lower)) {
 return {
 content:
 lang === "sq"
 ? "Per 3D Machinery mund te pergatis nje plan per engines, transmissions, hydraulic dhe pneumatic systems, me assemblies, constraints, materiale dhe target CAD studio."
 : "For 3D Machinery I can prepare a plan for engines, transmissions, hydraulic and pneumatic systems, with assemblies, constraints, materials, and target CAD studio.",
 };
 }

 if (/\b(car|truck|motorcycle|automotive|chassis|suspension|brake|braking|ev)\b/i.test(lower)) {
 return {
 content:
 lang === "sq"
 ? "Per Automotive & Motorcycles mund te strukturoj body, chassis, suspension, braking systems, cars, trucks, motorcycles dhe EV components."
 : "For Automotive & Motorcycles I can structure body, chassis, suspension, braking systems, cars, trucks, motorcycles, and EV components.",
 };
 }

 if (/\b(code|api|script|simulation|fea|cfd|automation|parametric)\b/i.test(lower)) {
 return {
 content:
 lang === "sq"
 ? "AI Code Assistant mund te gjeneroje FEA/CFD simulation helpers, CAD scripts, parametric automation dhe API integrations. Me jep CAD studio, input/output dhe constraints."
 : "AI Code Assistant can generate FEA/CFD simulation helpers, CAD scripts, parametric automation, and API integrations. Give me the CAD studio, inputs/outputs, and constraints.",
 };
 }

 return {
 content:
 lang === "sq"
 ? randomChoice([
 "Me jep nje makineri, motor, automjet, drone, CNC task ose CAD studio dhe do ta kthej ne strukture engineering.",
 "Mund te ndihmoj me 3D Machinery, Automotive, Aerospace, CNC/CAM, 3D Studio Integration ose AI Code Assistant.",
 ])
 : randomChoice([
 "Give me a machine, engine, vehicle, drone, CNC task, or CAD studio and I will turn it into an engineering structure.",
 "I can help with 3D Machinery, Automotive, Aerospace, CNC/CAM, 3D Studio Integration, or AI Code Assistant.",
 ]),
 suggestedQuestions:
 lang === "sq"
 ? ["Krijo engine assembly", "Bej automotive chassis", "Pergatit CNC toolpath"]
 : ["Create an engine assembly", "Build an automotive chassis", "Prepare a CNC toolpath"],
 };
}

export const WELCOME_MESSAGE = {
 en: `Welcome to Coreforge AI Studio.

I can help you design 3D machinery, engines, transmissions, hydraulic and pneumatic systems, automotive and motorcycle parts, aerospace and drone structures, CNC/CAM workflows, CAD studio integrations, and engineering code/API automation.

Ask me for an engine assembly, chassis system, drone fuselage, CNC toolpath, CAD studio workflow, or FEA/CFD code helper.`,
 sq: `Miresevini ne Coreforge AI Studio.

Mund t'ju ndihmoj te dizajnoni 3D machinery, engines, transmissions, hydraulic dhe pneumatic systems, automotive dhe motorcycle parts, aerospace dhe drone structures, CNC/CAM workflows, CAD studio integrations dhe engineering code/API automation.

Kerkoni engine assembly, chassis system, drone fuselage, CNC toolpath, CAD studio workflow ose FEA/CFD code helper.`,
};

export const SUGGESTED_QUESTIONS = {
 en: [
 "Create an engine assembly",
 "Build an automotive chassis",
 "Prepare a CNC toolpath",
 "Generate a CAD automation script",
 ],
 sq: [
 "Krijo engine assembly",
 "Bej automotive chassis",
 "Pergatit CNC toolpath",
 "Gjenero CAD automation script",
 ],
};
