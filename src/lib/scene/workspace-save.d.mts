export function readWorkspaceSave(response:Response,id:string,expectedRevision:number):Promise<{revision:number}>;
export function saveWorkspaceDocument(fetcher:typeof fetch,document:unknown,revision:number,options?:{wait?:(milliseconds:number)=>Promise<void>}):Promise<{revision:number}>;
