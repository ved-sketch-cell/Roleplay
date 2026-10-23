import {readFile, writeFile} from 'node:fs/promises';
import {createElement} from 'react';
import {renderToString} from 'react-dom/server';
import {createServer} from 'vite';

// Render the real landing page at build time; no HTTP server or browser is needed.
const server = await createServer({
  server: {middlewareMode: true, watch: null},
  appType: 'custom',
  logLevel: 'error',
});
try {
  const {default: App} = await server.ssrLoadModule('/src/website/App.tsx');
  let markup = renderToString(createElement(App));
  const resourceHints = markup.match(/<link\b[^>]*\/>/g) || [];
  markup = markup.replace(/<link\b[^>]*\/>/g, '');
  const file = new URL('../dist/index.html', import.meta.url);
  let html = await readFile(file, 'utf8');
  if (!html.includes('<div id="root"></div>') || !markup.includes('class="rp-landing"')) {
    throw new Error('The landing page could not be pre-rendered.');
  }
  html = html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
  html = html.replace('</head>', `${resourceHints.join('')}\n</head>`);
  await writeFile(file, html);
  console.log('Pre-rendered the ROLEPLAY landing page.');
} finally {
  await server.close();
}
