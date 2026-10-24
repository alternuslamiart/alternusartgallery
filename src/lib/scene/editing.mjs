import {Box3,Vector3} from 'three';
import {buildScene,disposeScene} from './geometry.mjs';
import {applyCommands} from './document.mjs';

export function selectionContext(doc,selected){
 const objects=selected.map(id=>doc.objects.find(o=>o.id===id)).filter(Boolean);
 const path=o=>{const names=[o.name];let parent=o.parentId;for(let i=0;parent&&i<32;i++){const p=doc.objects.find(o=>o.id===parent);if(!p)break;names.unshift(p.name);parent=p.parentId;}return names.join(' / ');};
 return{label:objects.map(path).join(', '),objects:objects.map(o=>({...o,material:{...o.material,map:undefined,normalMap:undefined,roughnessMap:undefined,metalnessMap:undefined,aoMap:undefined},textures:['map','normalMap','roughnessMap','metalnessMap','aoMap'].filter(key=>o.material[key]),path:path(o),geometry:o.geometry?{vertices:o.geometry.positions.length/3,triangles:(o.geometry.indices?.length??o.geometry.positions.length/3)/3}:null,operations:['move','transform','material','delete',...(o.kind==='box'&&/wall/i.test(o.name)?['windows']:[]),...(o.kind==='box'&&/roof/i.test(o.name)?['roof']:[])]}))};
}
export function editTargets(doc,selected){
 const ids=new Set(selected);for(let i=0;i<32;i++)for(const o of doc.objects)if(ids.has(o.parentId))ids.add(o.id);return [...ids];
}
export function validateEditScope(doc,selected,commands){
 if(!Array.isArray(commands))throw new Error('Invalid scene commands.');
 const allowed=new Set(editTargets(doc,selected));
 if(selected.length&&commands.some(c=>c.id&&!allowed.has(c.id)))throw new Error('AI targeted an object outside the selected context. Select the intended target and retry.');
 return applyCommands(doc,commands);
}
export function planContextEdit(doc,selected,prompt){
 const s=prompt.toLowerCase().replace(/[.!?]+$/,'').trim();
 const contextual=/\b(this|selected|the building|the roof|the wall)\b/.test(s);
 const known=/^(make|change|add|increase|decrease)\b/.test(s)&&(/\b(flat|marble|windows?|height)\b/.test(s));
 if(!known)return null;
 if(!selected.length&&contextual)throw new Error('Select the object or component to edit first.');
 if(selected.length>1&&contextual)throw new Error('Select one object or component for this instruction.');
 if(selected.length!==1)return null;
 const target=doc.objects.find(o=>o.id===selected[0]);if(!target)throw new Error('The selected object no longer exists.');
 if(/\broof\b/.test(s)&&/\bflat\b/.test(s)){
   if(!/roof/i.test(target.name))throw new Error('Select a roof component first.');
   // Only handle this finite grammar locally; other instructions use the provider.
   if(!/^(?:make|change) (?:this|the|selected) roof (?:to (?:a )?|)(?:(?:modern|flat|black|glass|and|roof)[ ,]*)+$/.test(s))return null;
   const commands=[{type:'roof',id:target.id,style:'flat'}];
   if(/black|glass/.test(s))commands.push({type:'material',id:target.id,material:/glass/.test(s)?'glass':'metal',...(/black/.test(s)?{color:'#111111'}:{})});return commands;
 }
 const windows=s.match(/^add (one|two|three|four|five|six|seven|eight|[1-8]) (?:large )?(?:glass )?windows? to (?:this|the|selected) wall$/);
 if(windows)return[{type:'windows',id:target.id,count:Number(windows[1])||(['one','two','three','four','five','six','seven','eight'].indexOf(windows[1])+1)}];
 if(/^(?:change|make) (?:this|the|selected) (?:wall|object) (?:to )?white marble$/.test(s))return[{type:'material',id:target.id,material:'marble',color:'#ffffff'}];
 const height=s.match(/^(increase|decrease) (?:this |the |selected )?(?:building|object)(?:'s)? height by (\d+(?:\.\d+)?) (?:meters?|m)$/);
 if(height){
   const delta=Number(height[2])*(height[1]==='decrease'?-1:1);
   if(target.kind==='group'){
     const root=buildScene(doc,{textures:false});try{let node;root.traverse(o=>{if(o.userData.sceneId===target.id)node=o;});const size=new Box3().setFromObject(node).getSize(new Vector3());
     // World height is unambiguous only for upright, axis-aligned ancestors.
     let object=target;while(object){if(object.rotation.some(v=>Math.abs(v)>1e-8))throw new Error('Height edits of rotated groups require an explicit local-axis scale.');object=doc.objects.find(o=>o.id===object.parentId);}
     if(size.y<=0||size.y+delta<=0)throw new Error('The requested building height must be positive.');return[{type:'transform',id:target.id,scale:[target.scale[0],target.scale[1]*(size.y+delta)/size.y,target.scale[2]]}];}finally{disposeScene(root);}
   }
   return[{type:'transform',id:target.id,dimensions:[target.dimensions[0],target.dimensions[1]+delta/target.scale[1],target.dimensions[2]]}];
 }
 return null;
}
