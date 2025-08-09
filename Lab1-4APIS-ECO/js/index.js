export function showLoading(id){
  const el = document.getElementById(id);
  if(el) el.innerHTML = `<p class="state">Cargando…</p>`;
}
export function showError(id, msg='Ocurrió un error'){
  const el = document.getElementById(id);
  if(el) el.innerHTML = `<p class="state error">❌ ${msg}</p>`;
}
export function showEmpty(id, msg='No se encontraron resultados.'){
  const el = document.getElementById(id);
  if(el) el.innerHTML = `<p class="state">🔍 ${msg}</p>`;
}

export function renderCards(id, items=[]){
  const el = document.getElementById(id);
  if(!el) return;
  if(!items.length){ showEmpty(id); return; }

  const safe = s => String(s ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  el.innerHTML = items.map(it => `
    <article class="card">
      ${it.image ? `<img src="${it.image}" alt="${safe(it.title)}">` : ''}
      <div class="card-body">
        <h4>${safe(it.title)}</h4>
        ${it.subtitle ? `<p>${safe(it.subtitle)}</p>` : ''}
      </div>
    </article>
  `).join('');
}
