import {MATERIALS,type SceneObject} from "@/lib/scene/document.mjs";

export type MaterialAsset={id:string;name:string;category:"natural"|"finish"|"special";material:SceneObject["material"];thumbnail:string};
const CATALOG=[
  ["concrete","Concrete","natural"],["wood","Oak wood","natural"],["marble","Marble","natural"],
  ["ceramic","Ceramic tile","finish"],["fabric","Woven fabric","finish"],["brick","Brick","finish"],
  ["metal","Brushed metal","special"],["glass","Glass","special"],
] as const;

export function createMaterialAssets():MaterialAsset[] {
  return CATALOG.map(([id,name,category])=>{
    const canvas=document.createElement("canvas");canvas.width=canvas.height=128;
    const context=canvas.getContext("2d");if(!context)throw new Error("Texture canvas is unavailable.");
    const image=context.createImageData(128,128);
    const base=id==="brick"?{...MATERIALS.concrete,color:"#a45d42"}:MATERIALS[id];
    const rgb=[1,3,5].map(start=>parseInt(base.color.slice(start,start+2),16));
    for(let y=0;y<128;y++)for(let x=0;x<128;x++){
      const noise=((x*73+y*151+x*y*31)%97)/97-.5;
      let shade=noise*12;
      if(id==="wood")shade=Math.sin(y*.28+Math.sin(x*.06)*2)*18+noise*9;
      if(id==="marble")shade=Math.abs(Math.sin((x+y)*.09+Math.sin(x*.055)*2))<.12?-65:noise*5;
      if(id==="ceramic")shade=x%32<2||y%32<2?-65:noise*5;
      if(id==="fabric")shade=((x%4<2)!==(y%4<2)?12:-12)+noise*5;
      if(id==="brick")shade=y%16<2||(x+(Math.floor(y/16)%2)*16)%32<2?55:noise*20;
      if(id==="metal")shade=Math.sin(y*2.4)*14+noise*4;
      if(id==="glass")shade=Math.sin((x+y)*.025)*8;
      const index=(y*128+x)*4;
      for(let c=0;c<3;c++)image.data[index+c]=Math.max(0,Math.min(255,rgb[c]+shade));
      image.data[index+3]=255;
    }
    context.putImageData(image,0,0);const thumbnail=canvas.toDataURL("image/png");
    return {id,name,category,thumbnail,material:{...base,color:"#ffffff",map:thumbnail,uvScale:[2,2]}};
  });
}
