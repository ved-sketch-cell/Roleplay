import { createRoot } from 'react-dom/client';
import App from './app/OriginalApp';
import './styles/index.css';
import './brand/theme.css';
import './styles/roleplay-app-theme.css';
import './styles/roleplay-mobile.css';
import './styles/roleplay-chat.css';
import './styles/roleplay-live.css';
import './app/mobile/app-refinement.css';
const params = new URLSearchParams(window.location.search);
const embedded = params.get('embed') === '1';
createRoot(document.getElementById('root')!).render(
  <div className={`attached-app-shell ${embedded ? 'embedded-feature-shell' : ''}`}>
    <main className="attached-app-viewport"><App/></main>
  </div>
);
