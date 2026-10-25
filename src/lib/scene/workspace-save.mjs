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
