import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root=resolve('dist'), types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.pdf':'application/pdf'};
http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end();return;}const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);}catch{res.writeHead(404).end('Not found');}}).listen(4180,'127.0.0.1',()=>console.log('Airport prototype: http://127.0.0.1:4180'));
