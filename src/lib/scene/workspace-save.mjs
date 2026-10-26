// JSONB may reorder object keys. Arrays (geometry, hierarchy and transforms)
// must keep their order when checking whether an uncertain write committed.
function documentJSON(value){
  return JSON.stringify(value,(_key,item)=>item&&typeof item==='object'&&!Array.isArray(item)
    ?Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])):item);
}

export async function loadWorkspaceDocument(fetcher,id,options={}){
  for(let attempt=0;attempt<3;attempt++){
    try{
      const response=await fetcher(`/api/studio-projects?id=${encodeURIComponent(id)}`,{cache:'no-store',signal:options.signal?AbortSignal.any([options.signal,AbortSignal.timeout(10_000)]):AbortSignal.timeout(10_000)});
      const data=await response.json();
      if(!response.ok)throw Object.assign(new Error(typeof data.error==='string'?data.error:data.error?.message||'Could not open cloud project.'),{status:response.status});
      return data;
    }catch(error){
      if(options.signal?.aborted||attempt===2||(error.status>=400&&error.status<500&&error.status!==429))throw error;
      await (options.wait??(ms=>new Promise(resolve=>setTimeout(resolve,ms))))(250*2**attempt);
    }
  }
}

export async function readWorkspaceSave(response,id,expectedRevision){
  const data=await response.json().catch(()=>null);
  if(!response.ok){
    const detail=typeof data?.error==='string'?data.error:data?.error?.message;
    throw Object.assign(new Error(detail||'Workspace save failed. Keep your browser recovery copy or download JSON.'),{status:response.status});
  }
  if(data?.saved!==true||data.id!==id||data.revision!==expectedRevision){
    throw new Error('Workspace save was not confirmed by the server. Keep your browser recovery copy or download JSON.');
  }
  return {revision:expectedRevision};
}

// A PUT can commit even when its response is lost. Read the server before
// retrying so a successful write is not mistaken for a revision conflict.
export async function saveWorkspaceDocument(fetcher,document,revision,options={}){
  const expectedRevision=revision+1;
  const hash=documentJSON(document);
  let lastError;
  for(let attempt=0;attempt<3;attempt++){
    if(attempt) await (options.wait??(ms=>new Promise(resolve=>setTimeout(resolve,ms))))(250*2**(attempt-1));
    let response;
    try{
      response=await fetcher('/api/studio-projects',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({document,revision}),signal:AbortSignal.timeout(20_000)});
      return await readWorkspaceSave(response,document.id,expectedRevision);
    }catch(error){
      lastError=error;
      const status=error?.status??response?.status;
      if(status===401||status===403||status===400||status===413) throw error;
      try{
        const check=await fetcher(`/api/studio-projects?id=${encodeURIComponent(document.id)}`,{cache:'no-store',signal:AbortSignal.timeout(10_000)});
        if(check.ok){
          const cloud=await check.json();
          if(cloud.revision===expectedRevision&&documentJSON(cloud.document)===hash)return {revision:expectedRevision};
          if(cloud.revision!==revision)throw Object.assign(new Error('A newer cloud revision exists. Recovery is preserved. Open the cloud copy or save this recovery as a new project.'),{status:409});
        }
      }catch(checkError){if(checkError?.status===409)throw checkError;}
      if(status===409||attempt===2)throw error;
    }
  }
  throw lastError;
}
