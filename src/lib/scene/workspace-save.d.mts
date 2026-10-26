export function readWorkspaceSave(response:Response,id:string,expectedRevision:number):Promise<{revision:number}>;
export function loadWorkspaceDocument(fetcher:typeof fetch,id:string,options?:{signal?:AbortSignal;wait?:(milliseconds:number)=>Promise<void>}):Promise<{document:unknown;revision:number}>;
export function saveWorkspaceDocument(fetcher:typeof fetch,document:unknown,revision:number,options?:{wait?:(milliseconds:number)=>Promise<void>}):Promise<{revision:number}>;
