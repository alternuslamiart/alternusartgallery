// PostgreSQL JSONB may reorder object keys; persistence comparisons must not.
export function canonicalSketch(value){
  const stable=input=>Array.isArray(input)?input.map(stable):input&&typeof input==='object'?Object.fromEntries(Object.keys(input).sort().filter(k=>input[k]!==undefined).map(k=>[k,stable(input[k])])):typeof input==='number'?Number(input.toFixed(9)):input;
  const {version,id,name,objects,settings,sketch}=value;
  return JSON.stringify(stable({version,id,name,objects,settings,sketch}));
}
export function reconcileSketch(local,revision,acknowledged,cloud,cloudRevision){
  if(canonicalSketch(local)===canonicalSketch(cloud))return 'same';
  if(canonicalSketch(local)===acknowledged)return 'adopt';
  if(revision===cloudRevision&&acknowledged)return 'keep';
  throw Error('Cloud conflict: your drawing is retained locally. Export JSON, reload the cloud copy, or save a copy.');
}
