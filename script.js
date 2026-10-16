'use strict';
// Motor de Lagrange: n bases, cada una con n-1 factores -> O(n²).
function lagrange(nodes, x) {
  let value = 0;
  const bases = [];
  for (let k = 0; k < nodes.length; k++) {
    let basis = 1;
    for (let i = 0; i < nodes.length; i++) {
      if (i !== k) basis *= (x - nodes[i].x) / (nodes[k].x - nodes[i].x);
    }
    bases.push(basis);
    value += nodes[k].y * basis;
  }
  return { value, bases };
}
// Coeficientes en orden ascendente. Multiplicar por (x - raíz)
// permite desarrollar cada base y formar la suma ponderada P(x).
function polynomialBases(nodes) {
  return nodes.map((node, k) => {
    let coefficients = [1];
    for (let i = 0; i < nodes.length; i++) {
      if (i === k) continue;
      const next = Array(coefficients.length + 1).fill(0);
      const denominator = node.x - nodes[i].x;
      coefficients.forEach((c, j) => {
        next[j] -= c * nodes[i].x / denominator;
        next[j + 1] += c / denominator;
      });
      coefficients = next;
    }
    return coefficients;
  });
}
// Tabla triangular: table[i][j] = f[x_i, ..., x_(i+j)].
function diferencias_divididas(X, Y) {
  if (X.length !== Y.length || X.length < 2 || new Set(X).size !== X.length || ![...X,...Y].every(Number.isFinite)) throw Error('Usa al menos dos nodos finitos con abscisas distintas.');
  const table = Y.map(y => [y]);
  for (let j=1;j<X.length;j++) for(let i=0;i<X.length-j;i++)
    table[i][j]=(table[i+1][j-1]-table[i][j-1])/(X[i+j]-X[i]);
  return table;
}
function newton(nodes, x) {
  const table = diferencias_divididas(nodes.map(n=>n.x),nodes.map(n=>n.y));
  const coefficients=table[0];
  let value=coefficients[coefficients.length-1];
  for(let i=coefficients.length-2;i>=0;i--) value=coefficients[i]+(x-nodes[i].x)*value;
  return {value, table, coefficients};
}
function newtonPolynomial(nodes, coefficients) {
  let result=[coefficients.at(-1)];
  for(let i=coefficients.length-2;i>=0;i--) {
    const next=Array(result.length+1).fill(0);
    result.forEach((c,j)=>{next[j]-=nodes[i].x*c;next[j+1]+=c;});
    next[0]+=coefficients[i];result=next;
  }
  return result;
}
function fmt(x) { return Object.is(x, -0) || x === 0 ? '0' : Number(x.toPrecision(10)).toString(); }
function polynomialText(coefficients) {
  const terms = [];
  for (let i = coefficients.length - 1; i >= 0; i--) {
    const c = coefficients[i];
    if (c === 0) continue;
    const power = i > 1 ? `x^${i}` : i === 1 ? 'x' : '';
    const magnitude = Math.abs(c) === 1 && i > 0 ? '' : fmt(Math.abs(c));
    terms.push(`${terms.length ? (c < 0 ? ' − ' : ' + ') : (c < 0 ? '−' : '')}${magnitude}${power}`);
  }
  return terms.join('') || '0';
}
if (typeof module !== 'undefined') module.exports = { lagrange, polynomialBases, polynomialText, diferencias_divididas, newton, newtonPolynomial };
if (typeof document !== 'undefined') {
  const $ = id => document.getElementById(id);
  const example = [{x:2,y:150},{x:4,y:85},{x:8,y:50},{x:12,y:70}];
  let latest = null;
  let method = 'lagrange';
  const saved = {};
  const originalTheory = document.querySelector('.theory-grid').innerHTML;
  const originalDescription = $('heroDescription').textContent;
  const originalHint = $('exampleHint').textContent;
  const newtonExample = [{x:1,y:45},{x:2,y:65},{x:4,y:110},{x:7,y:220}];
  const evaluate = (nodes,x) => method==='newton' ? newton(nodes,x) : lagrange(nodes,x);
  function addRow(x = '', y = '') {
    const row = document.createElement('div'); row.className = 'node-row';
    row.innerHTML = '<span class="node-index"></span><input type="number" step="any" required class="node-x"><input type="number" step="any" required class="node-y"><button class="remove" type="button">×</button>';
    row.querySelector('.node-x').value = x; row.querySelector('.node-y').value = y;
    row.querySelector('button').onclick = () => { row.remove(); refreshRows(); stale(); };
    $('nodes').append(row); refreshRows();
  }
  function refreshRows() {
    const rows = [...$('nodes').children];
    rows.forEach((row,i) => {
      row.querySelector('span').textContent = `(${i})`;
      row.querySelector('.node-x').setAttribute('aria-label',`x del nodo ${i}`);
      row.querySelector('.node-y').setAttribute('aria-label',`y del nodo ${i}`);
      row.querySelector('button').setAttribute('aria-label',`Eliminar nodo ${i}`);
      row.querySelector('button').disabled = rows.length <= 2;
    });
    $('degreeBadge').textContent = `Grado ≤ ${rows.length - 1}`;
    $('addNode').disabled = rows.length >= 10;
  }
  function stale() { $('status').textContent = 'Datos editados · recalcula'; $('export').disabled = true; }
  function calculate() {
    $('error').hidden = true;
    try {
      const nodes = [...$('nodes').children].map(row => ({ x: Number(row.querySelector('.node-x').value), y: Number(row.querySelector('.node-y').value) }));
      const x = Number($('evalX').value), min = Number($('minX').value), max = Number($('maxX').value);
      if (![x,min,max,...nodes.flatMap(n => [n.x,n.y])].every(Number.isFinite)) throw Error('Introduce únicamente números finitos.');
      if (new Set(nodes.map(n => n.x)).size !== nodes.length) throw Error('Los valores de x deben ser distintos. Dos nodos con la misma x provocan una división por cero.');
      if (min >= max) throw Error('El límite inicial de la gráfica debe ser menor que el final.');
      const result = evaluate(nodes,x), bases = polynomialBases(nodes);
      if(method==='newton') result.bases = lagrange(nodes,x).bases;
      let coefficients = Array(nodes.length).fill(0);
      bases.forEach((b,k) => b.forEach((c,j) => {coefficients[j] += c * nodes[k].y;}));
      if(method==='newton') coefficients=newtonPolynomial(nodes,result.coefficients);
      if (![result.value,...result.bases,...coefficients,...bases.flat()].every(Number.isFinite)) throw Error('Los datos exceden la capacidad numérica. Usa valores de menor magnitud o nodos más separados.');
      const outside = x < Math.min(...nodes.map(n=>n.x)) || x > Math.max(...nodes.map(n=>n.x));
      $('result').textContent = fmt(result.value);
      $('resultCaption').textContent = `P(${fmt(x)}) · ${nodes.length} nodos · ${outside ? 'fuera' : 'dentro'} del rango de datos`;
      $('status').textContent = outside ? 'Extrapolación' : 'Interpolación';
      $('polynomial').textContent = `P(x) = ${polynomialText(coefficients)}`;
      $('bases').replaceChildren();
      bases.forEach((b,k) => {
        const factors = nodes.map((n,i) => i === k ? '' : `(x − (${fmt(n.x)})) / (${fmt(nodes[k].x)} − (${fmt(n.x)}))`).filter(Boolean).join(' × ');
        const numeric = nodes.map((n,i) => i === k ? '' : `(${fmt(x)} − (${fmt(n.x)})) / (${fmt(nodes[k].x)} − (${fmt(n.x)}))`).filter(Boolean).join(' × ');
        const item = document.createElement('article'); item.className='base-item';
        const title=document.createElement('strong'); title.textContent=`Base L${k}(x)`;item.append(title);
        [factors,`L${k}(x) = ${polynomialText(b)}`,`L${k}(${fmt(x)}) = ${numeric} = ${fmt(result.bases[k])}`,`Contribución: ${fmt(nodes[k].y)} × (${fmt(result.bases[k])}) = ${fmt(nodes[k].y * result.bases[k])}`].forEach(text=>{const p=document.createElement('p');p.textContent=text;p.className='math';item.append(p);});
        $('bases').append(item);
      });
      $('sum').textContent=`P(${fmt(x)}) = ${nodes.map((n,k)=>`(${fmt(n.y * result.bases[k])})`).join(' + ')} = ${fmt(result.value)}`;
      if(method==='newton') renderNewton(nodes,x,coefficients);
      draw(nodes,x,result.value,min,max);
      latest = `INTERPOLACIÓN DE ${method.toUpperCase()}\nNodos: ${nodes.map(n=>`(${n.x}, ${n.y})`).join(', ')}\nP(x) = ${polynomialText(coefficients)}\n${method==='newton' ? $('newtonTableSection').innerText : ''}\n${$('bases').innerText}\n${$('sum').textContent}\nTipo: ${outside?'Extrapolación':'Interpolación'}\nValores redondeados a 10 cifras significativas.\n`;
      $('export').disabled = false;
    } catch(e) { $('error').textContent=e.message; $('error').hidden=false; stale(); }
  }
  // SVG sin bibliotecas: muestrea el polinomio para dibujar su curva continua.
  function draw(nodes,x,y,min,max) {
    const samples=Array.from({length:401},(_,i)=>{const sx=min+(max-min)*i/400;return {x:sx,y:evaluate(nodes,sx).value};});
    if (!samples.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y))) throw Error('El intervalo genera desbordamiento. Reduce los límites de la gráfica.');
    const visible=nodes.filter(n=>n.x>=min&&n.x<=max), evalVisible=x>=min&&x<=max;
    const ys=[...samples.map(p=>p.y),...visible.map(p=>p.y),...(evalVisible?[y]:[])];
    let low=Math.min(...ys),high=Math.max(...ys); const pad=(high-low)*.14 || Math.max(1,Math.abs(high)*.1); low-=pad; high+=pad;
    if (!Number.isFinite(high-low) || !Number.isFinite(max-min)) throw Error('El rango es demasiado grande para graficar.');
    const W=700,H=340,L=65,R=24,T=20,B=48,px=v=>L+(v-min)/(max-min)*(W-L-R),py=v=>H-B-(v-low)/(high-low)*(H-T-B);
    let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfica del polinomio interpolador, sus nodos y el punto evaluado"><title>Interpolación de ${method}</title>`;
    for(let i=0;i<=5;i++){const vx=min+(max-min)*i/5,vy=low+(high-low)*i/5;svg+=`<path d="M${L} ${py(vy)}H${W-R}" stroke="#efdee5"/><text x="${L-10}" y="${py(vy)+4}" text-anchor="end" fill="#8a7380" font-size="10">${Number(vy.toPrecision(4))}</text><text x="${px(vx)}" y="${H-B+22}" text-anchor="middle" fill="#8a7380" font-size="10">${Number(vx.toPrecision(4))}</text>`;}
    svg+=`<path d="M${L} ${T}V${H-B}H${W-R}" fill="none" stroke="#cbb6c0"/><text x="${W-R}" y="${H-7}" fill="#8a7380" font-size="12">x</text><text x="20" y="20" fill="#8a7380" font-size="12">y</text><path d="${samples.map((p,i)=>`${i?'L':'M'}${px(p.x).toFixed(2)},${py(p.y).toFixed(2)}`).join(' ')}" fill="none" stroke="#b54f7c" stroke-width="2.7"/>`;
    visible.forEach(n=>{svg+=`<circle cx="${px(n.x)}" cy="${py(n.y)}" r="5" fill="#fff" stroke="#b54f7c" stroke-width="2.5"><title>Nodo (${fmt(n.x)}, ${fmt(n.y)})</title></circle>`;});
    if(evalVisible){const a=px(x),b=py(y);svg+=`<path d="M${a} ${b}V${H-B}" stroke="#a882b4" stroke-dasharray="4 5"/><path d="M${a} ${b-7}L${a+7} ${b}L${a} ${b+7}L${a-7} ${b}Z" fill="#846096" stroke="white" stroke-width="2"><title>Evaluación (${fmt(x)}, ${fmt(y)})</title></path>`;}
    $('chart').innerHTML=svg+'</svg>';
    $('chartNote').textContent=`Intervalo [${fmt(min)}, ${fmt(max)}]. ${visible.length} de ${nodes.length} nodos visibles. ${evalVisible ? `◆ P(${fmt(x)}) = ${fmt(y)}.` : 'El punto evaluado queda fuera de la gráfica; amplía el intervalo para verlo.'} Valores mostrados con hasta 10 cifras significativas.`;
  }
  function renderNewton(nodes,x) {
    const result=newton(nodes,x), standard=newtonPolynomial(nodes,result.coefficients);
    if (![result.value,...result.table.flat(),...standard].every(Number.isFinite)) throw Error('Los datos exceden la capacidad numérica.');
    $('result').textContent=fmt(result.value);
    $('polynomial').textContent=`P(x) = ${polynomialText(standard)}`;
    $('newtonTableSection').innerHTML=`<h3>Tabla de diferencias divididas</h3><div class="table-scroll"><table class="difference-table"><thead><tr><th>i</th><th>xᵢ</th>${nodes.map((_,j)=>`<th>${j===0?'f[xᵢ]':`Orden ${j}`}</th>`).join('')}</tr></thead><tbody>${nodes.map((n,i)=>`<tr><td>${i}</td><td>${fmt(n.x)}</td>${nodes.map((_,j)=>`<td>${result.table[i][j]===undefined?'—':fmt(result.table[i][j])}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="hint">f[xᵢ,…,xᵢ₊ⱼ] = (f[xᵢ₊₁,…,xᵢ₊ⱼ] − f[xᵢ,…,xᵢ₊ⱼ₋₁]) / (xᵢ₊ⱼ − xᵢ). La primera fila contiene los coeficientes de Newton.</p>`;
    $('bases').replaceChildren();
    let product=1;const contributions=[];
    result.coefficients.forEach((c,k)=>{
      if(k)product*=x-nodes[k-1].x;
      contributions.push(c*product);
      const item=document.createElement('article');item.className='base-item';
      const factors=nodes.slice(0,k).map(n=>`(x − (${fmt(n.x)}))`).join(' × ') || '1';
      item.innerHTML=`<strong>Término ${k} · a${k} = ${fmt(c)}</strong><p class="math">${fmt(c)} × ${factors}</p><p class="math">En x = ${fmt(x)}: ${fmt(c)} × (${fmt(product)}) = ${fmt(c*product)}</p>`;
      $('bases').append(item);
    });
    const verification=document.createElement('article');verification.className='base-item';
    verification.innerHTML='<strong>Verificación en los nodos</strong>'+nodes.map(n=>{const actual=newton(nodes,n.x).value;return `<p class="math">P(${fmt(n.x)}) = ${fmt(actual)} · y = ${fmt(n.y)} · residuo = ${fmt(actual-n.y)}</p>`;}).join('');
    $('bases').append(verification);
    $('sum').textContent=`P(${fmt(x)}) = ${contributions.map(c=>`(${fmt(c)})`).join(' + ')} = ${fmt(result.value)}`;
  }
  function reset(){ $('nodes').replaceChildren(); (method==='newton'?newtonExample:example).forEach(n=>addRow(n.x,n.y));$('evalX').value=method==='newton'?5:6;$('minX').value=method==='newton'?1:2;$('maxX').value=method==='newton'?7:12;calculate(); }
  function switchMethod(next) {
    if(next===method)return;
    saved[method]={nodes:[...$('nodes').children].map(row=>[row.querySelector('.node-x').value,row.querySelector('.node-y').value]),values:['evalX','minX','maxX'].map(id=>$(id).value)};
    method=next;
    document.querySelectorAll('[data-method]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.method===method)));
    const isNewton=method==='newton';
    $('sessionLabel').textContent=`ANÁLISIS NUMÉRICO / SESIÓN ${isNewton?'09':'08'} · ${method.toUpperCase()}`;
    $('heroTitle').innerHTML=isNewton?'Paso a paso,<br><em>construye la curva.</em>':'Entre puntos,<br><em>encuentra respuestas.</em>';
    $('heroDescription').textContent=isNewton?'Explora la latencia de una API con el método de Newton. Construye diferencias divididas, evalúa y verifica cada resultado.':originalDescription;
    $('exampleHint').textContent=isNewton?'Ejercicio: carga concurrente x en centenas de req/s y latencia y en ms. x = 5 representa 500 req/s.':originalHint;
    $('processCaption').textContent=isNewton?'De las diferencias divididas al polinomio final':'Del producto de factores al polinomio final';
    $('processTitle').textContent=isNewton?'Polinomio de Newton y sustitución numérica':'Bases de Lagrange y sustitución numérica';
    $('processDescription').textContent=isNewton?'Los coeficientes son las diferencias divididas de la primera fila. Cada término incorpora un nuevo factor; la evaluación usa multiplicación anidada.':'Cada base vale 1 en su propio nodo y 0 en los demás. Multiplicamos cada base por su valor yᵢ y sumamos sus contribuciones.';
    $('newtonTableSection').hidden=!isNewton;
    document.querySelector('.theory-grid').innerHTML=isNewton?[
      ['Δ','01 / Diferencias divididas','Se calculan por órdenes a partir de los valores conocidos. Los nodos deben tener abscisas distintas; no necesitan estar igualmente espaciados.','f[xᵢ,xⱼ] = (yⱼ − yᵢ)/(xⱼ − xᵢ)'],
      ['∑','02 / Construir y evaluar','La primera fila de la tabla aporta los coeficientes. Construir la tabla cuesta O(n²) y evaluar con multiplicación anidada cuesta O(n).','P(x) = a₀ + a₁(x − x₀) + a₂(x − x₀)(x − x₁) + …'],
      ['≈','03 / Verificar el modelo','Comprueba P(xᵢ) = yᵢ en cada nodo. Newton y Lagrange generan el mismo polinomio para los mismos datos. Extrapolar puede ser poco fiable.','Residuo en el nodo i = P(xᵢ) − yᵢ']
    ].map(([icon,title,text,formula])=>`<article class="card"><span class="theory-icon">${icon}</span><h3>${title}</h3><p>${text}</p><div class="formula">${formula}</div></article>`).join(''):originalTheory;
    if(saved[method]) { $('nodes').replaceChildren();saved[method].nodes.forEach(n=>addRow(...n));['evalX','minX','maxX'].forEach((id,i)=>$(id).value=saved[method].values[i]);calculate(); } else reset();
  }
  document.querySelectorAll('[data-method]').forEach(b=>b.onclick=()=>switchMethod(b.dataset.method));
  $('calculator').onsubmit=e=>{e.preventDefault();calculate();};
  $('calculator').addEventListener('input',stale);
  $('addNode').onclick=()=>{addRow();stale();}; $('example').onclick=reset;
  $('export').onclick=()=>{if(!latest)return;const url=URL.createObjectURL(new Blob([latest],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`resultado-${method}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  reset();
}
