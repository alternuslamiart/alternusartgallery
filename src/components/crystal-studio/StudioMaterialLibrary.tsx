"use client";
import {useEffect,useRef,useState} from "react";
import {Boxes,Droplet,Layers3,PaintBucket,Plus,X} from "lucide-react";
import Link from "next/link";
import {createMaterialAssets,type MaterialAsset} from "./material-textures";
import type {SceneObject} from "@/lib/scene/document.mjs";

export type MaterialLibraryOptions={canApply:boolean;activeMap?:string;onApply:(material:SceneObject["material"])=>void};
export function StudioMaterialLibrary({options,onClose,width,uploadedAssets,onUploadAsset}:{options?:MaterialLibraryOptions;onClose:()=>void;width:number;uploadedAssets:MaterialAsset[];onUploadAsset:(asset:MaterialAsset)=>void}) {
  const [assets,setAssets]=useState<MaterialAsset[]>([]),[filter,setFilter]=useState("all"),[error,setError]=useState<string|null>(null);
  const input=useRef<HTMLInputElement>(null),panel=useRef<HTMLElement>(null),alive=useRef(true);
  useEffect(()=>{alive.current=true;try{setAssets(createMaterialAssets());}catch{setError("Could not load texture assets.");}return()=>{alive.current=false;};},[]);
  useEffect(()=>{const key=(event:KeyboardEvent)=>{if(event.key==="Escape"&&!document.querySelector('dialog[open]')){event.preventDefault();event.stopImmediatePropagation();onClose();}};window.addEventListener("keydown",key,true);return()=>window.removeEventListener("keydown",key,true);},[onClose]);
  const upload=(file:File)=>{
    if(!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>1_500_000){setError("Choose a PNG, JPEG or WebP texture up to 1.5 MB.");return;}
    const reader=new FileReader();reader.onerror=()=>{if(alive.current)setError("Texture could not be read.");};
    reader.onload=()=>{
      const data=String(reader.result),image=new Image();
      if(data.length>2_000_000){if(alive.current)setError("Choose a smaller texture (under 1.5 MB).");return;}
      image.onerror=()=>{if(alive.current)setError("This image cannot be decoded.");};
      image.onload=()=>{
        if(!alive.current)return;if(image.width>8192||image.height>8192){setError("Texture dimensions must be at most 8192 pixels.");return;}
        onUploadAsset({id:crypto.randomUUID(),name:file.name.slice(0,80),category:"finish",thumbnail:data,material:{color:"#ffffff",roughness:.65,metalness:0,opacity:1,transmission:0,map:data,uvScale:[1,1]}});setFilter("all");setError(null);
      };image.src=data;
    };reader.readAsDataURL(file);
  };
  return <section ref={panel} className="casynus-material-library" aria-label="Texture material asset library" style={{width:width||undefined}}>
    <div className="cs-material-meta"><div><strong>Texture material</strong><button type="button" aria-label="Close texture library" title="Close texture library (Esc)" onClick={onClose}><X size={12}/></button></div>
      <small>{options?(options.canApply?"Apply to selection":"Select a 3D object"):"Browse textures · 3D"}</small>
      <div className="cs-material-filters">{[{id:"all",label:"All textures",icon:Layers3},{id:"natural",label:"Natural textures",icon:Boxes},{id:"finish",label:"Surface finishes",icon:PaintBucket},{id:"special",label:"Glass and metal",icon:Droplet}].map(({id,label,icon:Icon})=><button type="button" key={id} aria-label={label} title={label} aria-pressed={filter===id} onClick={()=>setFilter(id)}><Icon size={13}/></button>)}</div>
    </div>
    <div className="cs-material-assets">{[...assets,...uploadedAssets].filter(asset=>filter==="all"||asset.category===filter).map(asset=><button type="button" key={asset.id} className="cs-material-tile" aria-label={`Apply ${asset.name}`} title={options?`${asset.name} · ${options.canApply?"Apply to selected objects":"select a 3D object first"}`:`${asset.name} · available in 3D`}
      disabled={!options?.canApply} aria-pressed={options?.activeMap===asset.material.map} style={{backgroundImage:`url("${asset.thumbnail}")`}} onClick={()=>options?.onApply(asset.material)}><span>{asset.name}</span></button>)}</div>
    <button type="button" className="cs-material-upload" aria-label="Upload texture asset" title="Upload PNG / JPEG / WebP texture" onClick={()=>input.current?.click()}><Plus size={26}/></button>
    <input ref={input} type="file" className="sr-only" aria-label="Texture asset file" accept="image/png,image/jpeg,image/webp" onChange={event=>{const file=event.target.files?.[0];if(file)upload(file);event.currentTarget.value="";}}/>
    {!options&&<Link href="/interior?workspace=3d" className="cs-material-notice">Apply textures in Interior 3D ↗</Link>}
    {error&&<p role="alert" className="cs-material-notice">{error}</p>}
  </section>;
}
