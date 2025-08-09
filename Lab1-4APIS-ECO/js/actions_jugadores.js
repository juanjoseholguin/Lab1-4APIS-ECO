// Jugadores — por nombre con fallback por equipo y aleatorios si está vacío
import { showLoading, showError, showEmpty, renderCards } from './index.js';

const btn = document.getElementById('search-players');
const nameInput = document.getElementById('playerName');
const limitInput = document.getElementById('playersLimit');
const outId = 'players-results';

const placeholder = 'https://via.placeholder.com/300x200?text=Jugador';

async function searchPlayersByName(q){
  const url = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(q)}`;
  const r = await fetch(url);
  if(!r.ok) throw new Error('Fallo jugadores');
  const j = await r.json();
  return Array.isArray(j?.player) ? j.player : [];
}
async function searchTeamsExact(q){
  const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(q)}`;
  const r = await fetch(url);
  if(!r.ok) return [];
  const j = await r.json();
  return Array.isArray(j?.teams) ? j.teams : [];
}
async function playersByTeamId(teamId){
  const r = await fetch(`https://www.thesportsdb.com/api/v1/json/3/lookup_all_players.php?id=${teamId}`);
  if(!r.ok) return [];
  const j = await r.json();
  return Array.isArray(j?.player) ? j.player : [];
}

function pickRandom(arr, n){
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

async function randomPlayers(limit){
  // Estrategia simple: buscar por letra "a" (muchos resultados) y escoger al azar
  const many = await searchPlayersByName('a');
  if (many.length) return pickRandom(many, limit);
  // Fallback por equipos conocidos
  const popularTeams = ['Barcelona','Real Madrid','Manchester City','Inter','Bayern Munich'];
  for (const t of popularTeams){
    const teams = await searchTeamsExact(t);
    if (teams.length){
      const players = await playersByTeamId(teams[0].idTeam);
      if (players.length) return pickRandom(players, limit);
    }
  }
  return [];
}

async function onSearchPlayers(){
  const q = (nameInput?.value || '').trim();
  const limit = Math.min(Math.max(parseInt(limitInput?.value,10) || 10,1),24);

  showLoading(outId);
  try{
    let list = [];
    if (q) {
      list = await searchPlayersByName(q);
      if (!list.length && q.length >= 2){
        const teams = await searchTeamsExact(q);
        if (teams.length) list = await playersByTeamId(teams[0].idTeam);
      }
    } else {
      list = await randomPlayers(limit);
    }

    if(!list.length) return showEmpty(outId, 'No se encontraron jugadores.');

    const items = list.slice(0,limit).map(p => ({
      image: p.strCutout || p.strThumb || placeholder,
      title: p.strPlayer,
      subtitle: `${p.strTeam ?? 'Equipo N/D'} · ${p.strPosition ?? 'Posición N/D'}`
    }));
    renderCards(outId, items);
  }catch(e){ console.error(e); showError(outId, 'Error al cargar jugadores.'); }
}

if(btn) btn.addEventListener('click', onSearchPlayers);
