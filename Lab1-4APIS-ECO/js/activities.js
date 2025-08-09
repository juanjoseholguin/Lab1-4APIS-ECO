import './actions_anime.js';
import './actions_futbol.js';
import './actions_pokemon.js';
import './actions_jugadores.js';

function updateGradientOnScroll() {
  const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
  const ratio = Math.min(1, window.scrollY / max);
  document.documentElement.style.setProperty('--bg-pos', `${Math.round(ratio * 100)}%`);
}
updateGradientOnScroll();
window.addEventListener('scroll', updateGradientOnScroll, { passive: true });
window.addEventListener('resize', updateGradientOnScroll);
