
import { showLoading, showError, showEmpty, renderCards } from './index.js';

const btn = document.getElementById('search-teams');
const qInput = document.getElementById('teamQuery');
const limitInput = document.getElementById('teamsLimit');
const outId = 'teams-results';

const pickImg = (...urls) =>
  urls.find(u => typeof u === 'string' && u.trim().length) ||
  'https://via.placeholder.com/600x400?text=Equipo';

async function searchTeamsExact(q){
  const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(q)}`;
  const r = await fetch(url);
  if(!r.ok) throw new Error('Fallo equipos exact');
  const j = await r.json();
  return Array.isArray(j?.teams) ? j.teams : [];
}


let TEAMS_CACHE = null;
const LEAGUES = [
  'Spanish La Liga','English Premier League','Italian Serie A',
  'German Bundesliga','French Ligue 1','Major League Soccer',
  'Campeonato Brasileiro Série A','Argentinian Primera División','FIFA World Cup'
];

async function buildTeamsCatalog(){
  if (TEAMS_CACHE) return TEAMS_CACHE;
  const calls = LEAGUES.map(l =>
    fetch(`https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=${encodeURIComponent(l)}`)
      .then(r => r.ok ? r.json() : {teams:[]})
      .then(j => Array.isArray(j?.teams) ? j.teams : [])
  );
  const groups = await Promise.all(calls);
  const all = groups.flat();
  // dedupe por idTeam
  const seen = new Set();
  TEAMS_CACHE = all.filter(t => {
    if (!t?.idTeam || seen.has(t.idTeam)) return false;
    seen.add(t.idTeam); return true;
  });
  return TEAMS_CACHE;
}

async function onSearchTeams(){
  const q = (qInput?.value || '').trim();
  const limit = Math.min(Math.max(parseInt(limitInput?.value,10) || 12,1),24);

  showLoading(outId);
  try{
    let list = [];
    if (q) list = await searchTeamsExact(q);

    if (!list.length){ 
      const cat = await buildTeamsCatalog();
      const ql = q.toLowerCase();
      list = cat.filter(t => String(t.strTeam||'').toLowerCase().includes(ql));
    }

    if(!list.length) return showEmpty(outId, 'No se encontraron equipos.');

    const items = list.slice(0,limit).map(t => ({
      image: pickImg(t.strTeamBadge, t.strBadge, t.strTeamLogo, t.strTeamFanart1, t.strTeamBanner),
      title: t.strTeam,
      subtitle: t.strCountry ? `${t.strCountry} · ${t.strLeague ?? ''}` : (t.strLeague ?? '')
    }));
    renderCards(outId, items);
  }catch(e){ console.error(e); showError(outId, 'Error al cargar equipos.'); }
}

if(btn) btn.addEventListener('click', onSearchTeams);
