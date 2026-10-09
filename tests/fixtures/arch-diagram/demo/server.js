import http from 'node:http';
import {lookup} from './store.js';
const server=http.createServer((req,res)=>{
  const item=lookup(req.url);
  res.end(JSON.stringify(item));
});
server.listen(8080);
