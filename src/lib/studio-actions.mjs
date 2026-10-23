// Finite commands only. Neither provider output nor transcripts can execute code.
export const STUDIO_ROUTES = { architecture: '/casynus', interior: '/interior', infrastructure: '/infrastructure', 'floor-plan': '/casynus?mode=floor-plan' };
const oneOf = values => value => values.includes(value);
const text = max => value => typeof value === 'string' && value.length <= max;
const number = (min, max) => value => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const empty = {};
export const ACTION_SCHEMA = {
  'studio.navigate': { studio: oneOf(Object.keys(STUDIO_ROUTES)) },
  'toolbar.activate': { tool: oneOf(['select','translate','rotate','scale','measure','wall','door','window','room','dimension','text','furniture','delete']) },
  'panel.open': { panel: oneOf(['properties','sidebar','lighting']) },
  'viewport.zoom': { direction: oneOf(['in','out']), amount: number(1,5) },
  'viewport.view': { view: oneOf(['Perspective','Orthographic','Front','Back','Left','Right','Top','2D','3D']) },
  'viewport.pan': { direction: oneOf(['left','right','up','down','north','south','east','west']) },
  'viewport.rotate': { degrees: number(-360,360) },
  'viewport.focus': { scope: oneOf(['selected','all']) },
  'viewport.reset': empty,
  'map.open': empty, 'map.close': empty, 'map.search': { query: text(160) },
  'scene.create': { kind: oneOf(['Box','Sphere','Cylinder','Wall','Floor slab','Ceiling','Roof','Column','Beam','Door','Window','Sofa','Coffee table','Cabinet','Stairs','Road','Sidewalk','Bridge','Streetlight','Tree','Point light','Spot light','building','room','intersection']) },
  'selection.select': { name: text(120) }, 'selection.all': empty, 'selection.clear': empty,
  'scene.delete': { scope: oneOf(['selected','all']) }, 'scene.duplicate': empty,
  'scene.transform': { property: oneOf(['position','rotation','dimensions','scale']), axis: oneOf(['x','y','z']), value: number(-10000,10000), relative: value => typeof value === 'boolean' },
  'scene.material': { material: oneOf(['wood','metal','concrete','glass','marble','ceramic','fabric']) },
  'history.undo': empty, 'history.redo': empty, 'project.save': empty, 'project.new': empty, 'project.open': empty,
  'project.export': { format: oneOf(['open','glb','gltf','obj','stl','json','png','jpeg','pdf','svg','csv']) },
  'ui.library': empty, 'ui.grid': { mode: oneOf(['on','off','toggle']) }, 'ui.snap': { mode: oneOf(['on','off','toggle']) }, 'ui.fullscreen': empty,
  'command.confirm': empty, 'command.cancel': empty,
};
export function validateStudioAction(value) {
  if (!value || Object.keys(value).some(key => !['intent','parameters'].includes(key)) || !Object.hasOwn(ACTION_SCHEMA,value.intent)) throw new Error('Unsupported studio action.');
  const schema = ACTION_SCHEMA[value.intent], p = value.parameters;
  if (!p || typeof p !== 'object' || Array.isArray(p) || Object.keys(p).length !== Object.keys(schema).length || Object.keys(p).some(key => !Object.hasOwn(schema,key)) || !Object.entries(schema).every(([key,check]) => check(p[key]))) throw new Error('Invalid or ambiguous command parameters.');
  return { intent: value.intent, parameters: { ...p } };
}
export const normalizeCommand = text => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[“”"']/g,'').replace(/[.!?]+$/,'').replace(/\s+/g,' ').trim();
const action = (intent,parameters={}) => validateStudioAction({intent,parameters});
export function parseStudioCommand(input) {
  if (typeof input !== 'string' || input.length > 12000) throw new Error('Command is too long.');
  const s = normalizeCommand(input).replace(/^(?:please|te lutem)[, ]+/, '');
  if (/^(?:confirm|yes confirm|konfirmo|po konfirmoj)$/.test(s)) return action('command.confirm');
  if (/^(?:cancel|anulo|ndalo)$/.test(s)) return action('command.cancel');
  const opening = s.match(/^(?:open|switch to|go to|hape?|kalo (?:ne|te)) (.+)$/);
  if (opening) {
    const target=opening[1].replace(/^(?:the|studion? e|studion?) /,'').replace(/ studio(?:n)?$/,'');
    const studios={architecture:'architecture',arkitektures:'architecture',arkitekture:'architecture',interior:'interior',interiorit:'interior',infrastructure:'infrastructure',infrastruktures:'infrastructure','floor plan':'floor-plan','floor-plan':'floor-plan','planimetrine':'floor-plan','planimetria':'floor-plan'};
    if (studios[target]) return action('studio.navigate',{studio:studios[target]});
  }
  if (/^(?:(?:open|activate|show|hape?|aktivizo) )?(?:the )?(?:world map|harten boterore|harta boterore)$/.test(s)) return action('map.open');
  if (/^(?:close|hide|mbyll) (?:the )?(?:world map|harten boterore)$/.test(s)) return action('map.close');
  if (/^(?:zoom in|zmadho(?: pamjen)?)$/.test(s)) return action('viewport.zoom',{direction:'in',amount:1});
  if (/^(?:zoom out|zvogelo(?: pamjen)?)$/.test(s)) return action('viewport.zoom',{direction:'out',amount:1});
  if (/^(?:reset (?:map view|camera|view)|rivendos (?:pamjen|kameren))$/.test(s)) return action('viewport.reset');
  if (/^(?:focus on (?:the )?selected (?:object|building)|focus on object|fokuso objektin)$/.test(s)) return action('viewport.focus',{scope:'selected'});
  if (/^(?:fit (?:entire )?scene|fit all|shfaq skenen)$/.test(s)) return action('viewport.focus',{scope:'all'});
  const search = input.trim().match(/^(?:go to|search for|find|kerko|kërko|shko ne|shko në) (.+?)[.!?]*$/i);
  if (search && !opening?.[1]?.includes('studio')) return action('map.search',{query:search[1].trim()});
  const views={front:'Front',back:'Back',left:'Left',right:'Right',top:'Top',perspective:'Perspective',orthographic:'Orthographic','3d':'3D','2d':'2D'};
  const view=s.match(/^(?:show|switch to|activate|shfaq|kalo ne) (?:the )?([a-z0-9]+)(?: (?:view|mode|pamjen))?$/);
  if(view&&views[view[1]])return action('viewport.view',{view:views[view[1]]});
  const pan=s.match(/^(?:move (?:the )?(?:camera|map)|move|pan|leviz(?: kameren| harten)?) (?:to (?:the )?)?(left|right|up|down|north|south|east|west|majtas|djathtas|veri|jug|lindje|perendim)$/);
  const directions={majtas:'left',djathtas:'right',veri:'north',jug:'south',lindje:'east',perendim:'west'};
  if(pan)return action('viewport.pan',{direction:directions[pan[1]]??pan[1]});
  const orbit=s.match(/^(?:rotate (?:the )?(?:camera|map)|rrotullo (?:kameren|harten))(?: (-?\d+(?:\.\d+)?) (?:degrees|grade))?$/);
  if(orbit)return action('viewport.rotate',{degrees:orbit[1]?Number(orbit[1]):30});
  const tool=s.match(/^(?:(?:activate|use|aktivizo) (?:the )?)?(select|selection|move|rotate|scale|measure|wall|door|window|room|dimension|text|furniture|delete|zgjedhje|levizje|rrotullim|shkallezim)(?: (?:tool|mjetin))?$/);
  if(tool){const tools={selection:'select',move:'translate',zgjedhje:'select',levizje:'translate',rrotullim:'rotate',shkallezim:'scale'};return action('toolbar.activate',{tool:tools[tool[1]]??tool[1]});}
  const panels=s.match(/^(?:open|show|hape?|shfaq) (?:the )?(properties|inspector|sidebar|lighting|properti(?:es|te)|vetite)$/);
  if(panels)return action('panel.open',{panel:['properties','inspector','propertite','vetite'].includes(panels[1])?'properties':panels[1]});
  if(/^(?:undo|zhbej)$/.test(s))return action('history.undo');
  if(/^(?:redo|ribeje)$/.test(s))return action('history.redo');
  if(/^(?:save (?:my |the )?(?:project|scene)|save|ruaj(?: projektin)?)$/.test(s))return action('project.save');
  if(/^(?:new project|create (?:a )?new project|projekt i ri)$/.test(s))return action('project.new');
  if(/^(?:open project|open projects|hape projektin)$/.test(s))return action('project.open');
  const exp=s.match(/^(?:export|eksporto)(?: (?:as |ne )?(glb|gltf|obj|stl|json|png|jpeg|pdf|svg|csv))?$/);
  if(exp)return action('project.export',{format:exp[1]??'open'});
  if(/^(?:open (?:texture |material )?library|texture library|biblioteka e materialeve)$/.test(s))return action('ui.library');
  if(/^(?:fullscreen|full screen|ekran i plote)$/.test(s))return action('ui.fullscreen');
  const toggle=s.match(/^(toggle|enable|disable|show|hide|aktivizo|caktivizo) (grid|snapping|snap)$/);
  if(s==='toggle grid snapping')return action('ui.grid',{mode:'toggle'});
  if(toggle)return action(toggle[2]==='grid'?'ui.grid':'ui.snap',{mode:toggle[1]==='toggle'?'toggle':['disable','hide','caktivizo'].includes(toggle[1])?'off':'on'});
  const objects={cube:'Box',box:'Box',kub:'Box',kubi:'Box',sphere:'Sphere',cylinder:'Cylinder',wall:'Wall',mur:'Wall',door:'Door',dere:'Door',window:'Window',dritare:'Window',building:'building',ndertese:'building',room:'room',dhome:'room',tree:'Tree',peme:'Tree',road:'Road',rruge:'Road',light:'Point light','point light':'Point light','spot light':'Spot light',intersection:'intersection',sidewalk:'Sidewalk',bridge:'Bridge',sofa:'Sofa',stairs:'Stairs',column:'Column',beam:'Beam',roof:'Roof',ceiling:'Ceiling','floor slab':'Floor slab',cabinet:'Cabinet','coffee table':'Coffee table',streetlight:'Streetlight'};
  const create=s.match(/^(?:add|create|shto|krijo) (?:(?:a|an|the|nje) )?(.+)$/);
  if(create&&objects[create[1]])return action('scene.create',{kind:objects[create[1]]});
  if(/^(?:add|create|shto) (?:an? |nje )?object$/.test(s))throw new Error('Which object should I add? For example, say “Add a cube” or “Add a wall”.');
  if(/^(?:select all|zgjidh te gjitha)$/.test(s))return action('selection.all');
  if(/^(?:deselect|clear selection|hiq perzgjedhjen)$/.test(s))return action('selection.clear');
  const select=s.match(/^(?:select|zgjidh) (?:the |objektin )?(.+)$/);
  if(select)return action('selection.select',{name:['object','objektin','selected object'].includes(select[1])?'':select[1]});
  if(/^(?:delete|remove|fshi) (?:the )?(?:all objects|all|te gjitha)$/.test(s))return action('scene.delete',{scope:'all'});
  if(/^(?:delete|remove|fshi) (?:the )?(?:selected objects?|object|objektin|objektin e zgjedhur)$/.test(s))return action('scene.delete',{scope:'selected'});
  if(/^(?:duplicate(?: (?:the )?(?:selected )?object)?|dupliko(?: objektin)?)$/.test(s))return action('scene.duplicate');
  const material=s.match(/^(?:change|set) (?:the )?material to (wood|metal|concrete|glass|marble|ceramic|fabric)$/)??s.match(/^ndrysho materialin (?:ne )?(dru|metal|beton|xham)$/);
  if(material)return action('scene.material',{material:({dru:'wood',beton:'concrete',xham:'glass'})[material[1]]??material[1]});
  const move=s.match(/^(?:move|leviz) (?:the )?(?:selected object|object|objektin(?: e zgjedhur)?) (-?\d+(?:[.,]\d+)?) (meters?|metra|m|cm|mm|feet|ft|inches|in) (?:to (?:the )?)?(left|right|up|down|forward|back|majtas|djathtas|lart|poshte)$/);
  if(move){const d=move[3],axis=['left','right','majtas','djathtas'].includes(d)?'x':['up','down','lart','poshte'].includes(d)?'y':'z',sign=['left','down','forward','majtas','poshte'].includes(d)?-1:1;const units={cm:.01,mm:.001,feet:.3048,ft:.3048,inches:.0254,in:.0254};return action('scene.transform',{property:'position',axis,value:Number(move[1].replace(',','.'))*(units[move[2]]??1)*sign,relative:true});}
  const rotation=s.match(/^(?:rotate|rrotullo) (?:the )?(?:selected object|object|objektin(?: e zgjedhur)?) (-?\d+(?:[.,]\d+)?)(?: degrees?| grade)(?: (?:around |on )?([xyz]))?$/);
  if(rotation)return action('scene.transform',{property:'rotation',axis:rotation[2]??'y',value:Number(rotation[1].replace(',','.')),relative:true});
  const height=s.match(/^(?:increase|set|change) (?:the )?height to (\d+(?:[.,]\d+)?) (m|meters?|cm|mm)$/);
  if(height)return action('scene.transform',{property:'dimensions',axis:'y',value:Number(height[1].replace(',','.'))*({cm:.01,mm:.001}[height[2]]??1),relative:false});
  if(/^(?:rotate|move|scale|rrotullo|leviz) (?:the )?(?:selected object|object|objektin)/.test(s))throw new Error('Specify the amount and units, for example “Rotate selected object 90 degrees” or “Move selected object 2 meters left”.');
  return null;
}
