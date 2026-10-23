import { defineConfig } from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react';
export default defineConfig({
 server:{host:"0.0.0.0",proxy:{'/api':{target:'http://127.0.0.1:8000',ws:true,changeOrigin:true,rewrite:(url)=>url.replace(/^\/api/,'')}}},
 plugins:[react(),{name:'figma-assets',resolveId(id){if(id.startsWith('figma:asset/'))return path.resolve('src/assets',id.slice(12))}}],
 resolve:{alias:{'motion/react':path.resolve('src/website/motion-bridge.tsx'),'@':path.resolve('src/app'),'@/styles':path.resolve('src/styles')}},
 build:{rolldownOptions:{input:{main:path.resolve('index.html'),original:path.resolve('original.html')}}}
});
