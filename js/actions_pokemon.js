
import { showLoading, showError, renderCards, showEmpty } from './index.js';

const btn = document.getElementById('search-pokemon');
const nameInput = document.getElementById('pokemonName');
const limitInput = document.getElementById('pokemonLimit');
const outId = 'pokemon-results';

async function getByName(name){
  const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name.toLowerCase())}`);
  if(!r.ok) return null;
  return r.json();
}

async function getAllNames(){ 
  const r = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
  if(!r.ok) throw new Error('No se pudo listar Pokémon');
  const j = await r.json();
  return Array.isArray(j?.results) ? j.results : [];
}

async function onSearchPokemon(){
  const name = (nameInput?.value || '').trim().toLowerCase();
  const limit = Math.min(Math.max(parseInt(limitInput?.value,10) || 12,1),30);

  showLoading(outId);
  try{
    if(name){ 
      const d = await getByName(name);
      if (d) {
        return renderCards(outId, [{
          image: d.sprites?.other?.['official-artwork']?.front_default || d.sprites?.front_default || 'https://via.placeholder.com/300?text=Pokemon',
          title: d.name,
          subtitle: `Tipo: ${d.types.map(t=>t.type.name).join(', ')}`
        }]);
      }
   
      const all = await getAllNames();
      const hits = all.filter(p => p.name.includes(name)).slice(0, limit);
      if (!hits.length) return showEmpty(outId, 'No hay coincidencias.');
      const details = await Promise.all(hits.map(h => fetch(h.url).then(r=>r.json())));
      return renderCards(outId, details.map(d => ({
        image: d.sprites?.other?.['official-artwork']?.front_default || d.sprites?.front_default || 'https://via.placeholder.com/300?text=Pokemon',
        title: d.name,
        subtitle: `Tipo: ${d.types.map(t=>t.type.name).join(', ')}`
      })));
    }

    const list = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`).then(r=>r.json());
    const details = await Promise.all((list.results||[]).map(p => fetch(p.url).then(r=>r.json())));
    if(!details.length) return showEmpty(outId);
    renderCards(outId, details.map(d => ({
      image: d.sprites?.other?.['official-artwork']?.front_default || d.sprites?.front_default || 'https://via.placeholder.com/300?text=Pokemon',
      title: d.name,
      subtitle: `Tipo: ${d.types.map(t=>t.type.name).join(', ')}`
    })));
  }catch(e){ console.error(e); showError(outId, 'Error al cargar Pokémon.'); }
}

if(btn) btn.addEventListener('click', onSearchPokemon);
