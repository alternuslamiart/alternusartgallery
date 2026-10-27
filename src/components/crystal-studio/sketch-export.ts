import type {FloorPlanObject,FloorPlanSettings} from './types';
import {floorPlanSvg,floorPlanPaper} from './floor-plan-export';
import {sketchSvg,type SketchDocument} from '@/lib/sketch.mjs';

export function sketchSheetSvg(objects:FloorPlanObject[],settings:FloorPlanSettings,sketch:SketchDocument){
  const cad=floorPlanSvg(objects,settings),paper=floorPlanPaper(objects,settings),s=sketch.sheet,k=paper.scale/1000;
  // Invert the established CAD sheet transform into the common meter coordinates.
  const content=cad.slice(cad.indexOf('>')+1,cad.lastIndexOf('</svg>')).replace(/<rect width="100%" height="100%"[^>]*\/>/,'').replace(/<text x="[^"]*" y="[^"]*" style="text-anchor:end;font-size:2.5px">Fit to page[^<]*<\/text>/,'');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s.width*1000/settings.scale}mm" height="${s.height*1000/settings.scale}mm" viewBox="${s.x} ${s.y} ${s.width} ${s.height}"><rect x="${s.x}" y="${s.y}" width="${s.width}" height="${s.height}" fill="white"/><g transform="translate(${paper.bounds.minX-paper.offsetX*k} ${paper.bounds.minY-paper.offsetY*k}) scale(${k})">${content}</g><g style="isolation:isolate">${sketchSvg(sketch,'export')}</g></svg>`;
}
export async function rasterSketch(svg:string,width:number,height:number){
  const image=new Image(),url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
  try{
    await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(Error('Sketch rasterization failed.'));image.src=url;});
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const context=canvas.getContext('2d',{willReadFrequently:true});if(!context)throw Error('Canvas rendering is unavailable.');context.drawImage(image,0,0,width,height);return{canvas,context};
  }finally{URL.revokeObjectURL(url);}
}
// Binary-safe PDF with a high-resolution RGB sheet. Same composition as PNG/SVG,
// including alpha, blend modes and chronological erasing; CAD remains editable in JSON.
export function jpegSheetPdf(jpeg:Uint8Array,pixelsWide:number,pixelsHigh:number,widthMm:number,heightMm:number){
  const enc=new TextEncoder(),parts:Uint8Array[]=[],offsets=[0];let length=0;
  const append=(value:string|Uint8Array)=>{const bytes=typeof value==='string'?enc.encode(value):value;parts.push(bytes);length+=bytes.length;};
  append('%PDF-1.4\n');
  const object=(id:number,body:string)=>{offsets[id]=length;append(`${id} 0 obj\n${body}\nendobj\n`);};
  const w=widthMm*72/25.4,h=heightMm*72/25.4,stream=`q ${w} 0 0 ${h} 0 0 cm /Sheet Do Q\n`;
  object(1,'<< /Type /Catalog /Pages 2 0 R >>');object(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');object(3,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Sheet 5 0 R >> >> /Contents 4 0 R >>`);object(4,`<< /Length ${enc.encode(stream).length} >>\nstream\n${stream}endstream`);
  offsets[5]=length;append(`5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pixelsWide} /Height ${pixelsHigh} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);append(jpeg);append('\nendstream\nendobj\n');const xref=length;
  append(`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(o=>`${String(o).padStart(10,'0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  const result=new Uint8Array(length);let at=0;for(const part of parts){result.set(part,at);at+=part.length;}return result;
}
export async function exportSketch(format:string,objects:FloorPlanObject[],settings:FloorPlanSettings,sketch:SketchDocument){
  const svg=sketchSheetSvg(objects,settings,sketch);if(format==='SVG')return new Blob([svg],{type:'image/svg+xml'});
  const w=sketch.sheet.width*1000/settings.scale,h=sketch.sheet.height*1000/settings.scale,ratio=Math.min(300/25.4,8192/Math.max(w,h),Math.sqrt(24_000_000/(w*h)));
  const{canvas}=await rasterSketch(svg,Math.max(1,Math.round(w*ratio)),Math.max(1,Math.round(h*ratio)));
  const jpeg=format==='PDF'||format==='JPEG';const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,jpeg?'image/jpeg':'image/png',.97));if(!blob)throw Error('Sketch export failed.');
  return format==='PDF'?new Blob([jpegSheetPdf(new Uint8Array(await blob.arrayBuffer()),canvas.width,canvas.height,w,h)],{type:'application/pdf'}):blob;
}
