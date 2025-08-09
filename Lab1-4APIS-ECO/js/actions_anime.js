// ANIME — Jikan v4
import { showLoading, showError, showEmpty, renderCards } from './index.js';

const form = document.getElementById('anime-form');
const outId = 'anime-results';

async function fetchAnime({name='', type='', limit=10}={}){
  const qs = new URLSearchParams();
  if(name) qs.set('q', name);
  if(type) qs.set('type', type);
  qs.set('limit', String(limit));
  const res = await fetch(`https://api.jikan.moe/v4/anime?${qs}`);
  if(!res.ok) throw new Error('API Jikan falló');
  const data = await res.json();
  return Array.isArray(data?.data) ? data.data : [];
}

async function initial(){
  showLoading(outId);
  try{
    const list = await fetchAnime({limit:12});
    renderCards(outId, list.map(a => ({
      image: a.images?.jpg?.image_url || a.images?.webp?.image_url || '',
      title: a.title || a.title_english || a.title_japanese || 'Sin título',
      subtitle: `Tipo: ${a.type ?? 'N/A'} · Score: ${a.score ?? '—'}`
    })));
  }catch{ showError(outId); }
}

async function onSearch(e){
  e.preventDefault();
  const name = document.getElementById('animeName').value.trim();
  const type = document.getElementById('animeType').value.trim().toLowerCase();
  const limit = parseInt(document.getElementById('animeLimit').value,10) || 10;

  showLoading(outId);
  try{
    const list = await fetchAnime({name, type, limit});
    if(!list.length) return showEmpty(outId, 'No se encontró nada con esos filtros.');
    renderCards(outId, list.map(a => ({
      image: a.images?.jpg?.image_url || a.images?.webp?.image_url || '',
      title: a.title || a.title_english || a.title_japanese || 'Sin título',
      subtitle: `Tipo: ${a.type ?? 'N/A'} · Episodios: ${a.episodes ?? 'N/A'}`
    })));
  }catch(err){ showError(outId, 'Fallo al buscar anime.'); }
}

if(form){
  form.addEventListener('submit', onSearch);
  initial();
}
