export function parseFloorPlanRecovery(raw){
  if(typeof raw!=='string'||raw.length>1_000_000)throw new Error('Floor-plan recovery is invalid or too large.');
  const value=JSON.parse(raw),validNumber=n=>typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<=10000;
  if(value?.version!==1||typeof value.name!=='string'||value.name.length>120||!Array.isArray(value.objects)||value.objects.length>1000)throw new Error('Invalid floor-plan recovery.');
  const ids=new Set();
  for(const o of value.objects){
    if(!o||typeof o.id!=='string'||!o.id||o.id.length>100||ids.has(o.id)||!['wall','door','window','room','dimension','text','furniture','column','stairs'].includes(o.type))throw new Error('Invalid floor-plan object.');ids.add(o.id);
    const fields=['wall','dimension'].includes(o.type)?[o.start?.x,o.start?.y,o.end?.x,o.end?.y]:[o.x,o.y];
    if(!fields.every(validNumber)||Object.values(o).some(v=>typeof v==='number'&&!validNumber(v)))throw new Error('Invalid floor-plan coordinates.');
    if(['door','window','room','furniture','column','stairs'].includes(o.type)&&(!validNumber(o.width)||!validNumber(o.height)||o.width<=0||o.height<=0))throw new Error('Invalid floor-plan dimensions.');
    if(o.type==='wall'&&(!validNumber(o.thickness)||o.thickness<=0))throw new Error('Invalid wall thickness.');
  }
  const s=value.settings;
  if(!s||!['mm','cm','m'].includes(s.unit)||![s.scale,s.precision,s.gridStepMm].every(n=>validNumber(n)&&n>0)||!['snapToGrid','snapToPoints','orthogonal'].every(k=>typeof s[k]==='boolean'))throw new Error('Invalid floor-plan settings.');
  return value;
}
