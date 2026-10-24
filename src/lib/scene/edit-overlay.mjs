import {Group,Mesh,ShaderMaterial,Color,DoubleSide} from 'three';

// Overlay borrows source geometry. It owns only its shader materials and never
// enters buildScene/exportScene or participates in picking.
export function createEditOverlay(root,ids){
 const group=new Group();group.name='Editing feedback';group.userData.editorOnly=true;
 const targets=new Set(ids);root.updateMatrixWorld(true);
 root.traverse(node=>{
  if(!node.isMesh||node.userData.editorOnly)return;
  let matched=false;for(let p=node;p;p=p.parent){if(!p.visible)return;if(targets.has(p.userData.sceneId))matched=true;}
  if(!matched)return;
  const material=new ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,
   uniforms:{time:{value:0},fade:{value:1},blue:{value:new Color('#2563eb')},lightBlue:{value:new Color('#60a5fa')}},
   vertexShader:`varying vec3 p; varying vec3 n; void main(){vec4 world=modelMatrix*vec4(position,1.);p=world.xyz;n=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*world;}`,
   fragmentShader:`uniform float time;uniform float fade;uniform vec3 blue;uniform vec3 lightBlue;varying vec3 p;varying vec3 n;
    void main(){vec3 a=abs(n);vec2 uv=a.y>a.x&&a.y>a.z?p.xz:(a.x>a.z?p.zy:p.xy);vec2 cell=floor(uv/.4);float chess=mod(cell.x+cell.y,2.);float scan=.5+.5*sin((p.y+p.x*.2)*2.-time*2.5);float glow=pow(scan,8.);gl_FragColor=vec4(mix(blue,lightBlue,chess*.55+glow*.4),(.10+chess*.06+glow*.09)*fade);}`});
  const mesh=new Mesh(node.geometry,material);mesh.matrixAutoUpdate=false;mesh.matrix.copy(node.matrixWorld);mesh.raycast=()=>{};mesh.renderOrder=20;group.add(mesh);
 });return group;
}
export function disposeEditOverlay(group){group.traverse(node=>{if(node.isMesh)node.material.dispose();});group.clear();}
