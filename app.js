'use strict';
(function(){
  const $ = (id) => document.getElementById(id);
  const sex = $("sex"), age = $("age"), weight = $("weight"), height = $("height"), activity = $("activity"), goalType = $("goalType"), rate = $("rate"), meals = $("meals");
  const proteinMode = $("proteinMode"), proteinGPerKg = $("proteinGPerKg"), proteinGPerKgVal = $("proteinGPerKgVal"), proteinRow = $("proteinRow");
  const k_bmr = $("k_bmr"), k_tdee = $("k_tdee"), k_goal = $("k_goal"), k_p = $("k_p");
  const o_p_g = $("o_p_g"), o_p_k = $("o_p_k"), o_f_g = $("o_f_g"), o_f_k = $("o_f_k"), o_c_g = $("o_c_g"), o_c_k = $("o_c_k");
  const m_p = $("m_p"), m_f = $("m_f"), m_c = $("m_c");
  const calcBtn = $("calcBtn"), resetBtn = $("resetBtn"), saveBtn = $("saveBtn"), copyBtn = $("copyBtn"), saveNote = $("saveNote");
  const unitToggle = $("unitToggle"), wUnitLbl = $("wUnitLbl"), hUnitLbl = $("hUnitLbl");

  let unit = 'metric';

  function round(n, d=0){ const f = Math.pow(10,d); return Math.round((n + Number.EPSILON)*f)/f }

  function toMetric(){
    if(unit === 'metric') return;
    const w = parseFloat(weight.value); if(!isNaN(w)) weight.value = round(w/2.20462,2);
    const h = parseFloat(height.value); if(!isNaN(h)) height.value = round(h*2.54,1);
    unit = 'metric';
    wUnitLbl.textContent = '(kg)'; hUnitLbl.textContent = '(cm)';
  }
  function toImperial(){
    if(unit === 'imperial') return;
    const w = parseFloat(weight.value); if(!isNaN(w)) weight.value = round(w*2.20462,2);
    const h = parseFloat(height.value); if(!isNaN(h)) height.value = round(h/2.54,1);
    unit = 'imperial';
    wUnitLbl.textContent = '(lb)'; hUnitLbl.textContent = '(in)';
  }

  unitToggle.addEventListener('click', (e)=>{
    const btn = e.target.closest('button'); if(!btn) return;
    [...unitToggle.querySelectorAll('button')].forEach(b=>b.setAttribute('aria-pressed','false'));
    btn.setAttribute('aria-pressed','true');
    const u = btn.dataset.unit; if(u==='metric') toMetric(); else toImperial();
  });

  proteinMode.addEventListener('change', ()=>{
    const isCustom = proteinMode.value === 'custom';
    proteinRow.style.display = isCustom ? 'grid' : 'none';
    compute();
  });
  proteinGPerKg.addEventListener('input', ()=>{
    proteinGPerKgVal.textContent = parseFloat(proteinGPerKg.value).toFixed(1);
    compute();
  });

  function validNum(v){ return !isNaN(v) && isFinite(v); }

  function getInputs(){
    let w = parseFloat(weight.value), h = parseFloat(height.value);
    if(unit==='imperial'){ w = w/2.20462; h = h*2.54; }
    return {
      sex: sex.value,
      age: parseFloat(age.value),
      weightKg: w,
      heightCm: h,
      activity: parseFloat(activity.value),
      goalType: goalType.value,
      rateLbs: parseFloat(rate.value),
      proteinMode: proteinMode.value,
      proteinGPerKg: parseFloat(proteinGPerKg.value),
      meals: parseInt(meals.value,10)
    }
  }

  function proteinPerKg(x){
    if(x.proteinMode === 'custom') return x.proteinGPerKg;
    // AUTO defaults: slightly higher on cuts, moderate on gains
    return x.goalType === 'lose' ? 2.2 : 1.8; // g/kg
  }

  function compute(){
    const x = getInputs();
    if(!validNum(x.age) || !validNum(x.weightKg) || !validNum(x.heightCm)){
      alert('Please enter age, weight, and height.');
      return; }
    // BMR: Mifflin–St Jeor
    let bmr = 10*x.weightKg + 6.25*x.heightCm - 5*x.age + (x.sex==='male' ? 5 : -161);
    // TDEE
    let tdee = bmr * x.activity;
    // Goal calories from weekly rate (lbs → kcal). 1 lb ≈ 3500 kcal
    const dailyKcalChange = (x.rateLbs * 3500) / 7;
    let goalCal = x.goalType==='lose' ? (tdee - dailyKcalChange) : (tdee + dailyKcalChange);
    // Macros (protein configurable)
    const P_PER_KG = proteinPerKg(x);
    const F_PER_KG = 0.9; // fat g/kg (fixed default)
    let p_g = P_PER_KG * x.weightKg;
    let f_g = F_PER_KG * x.weightKg;
    let p_k = p_g * 4;
    let f_k = f_g * 9;
    let c_k = goalCal - (p_k + f_k);
    let c_g = c_k / 4;
    if(c_g < 0){ c_g = 0; c_k = 0; }

    // Update UI
    k_bmr.textContent = round(bmr,0);
    k_tdee.textContent = round(tdee,0);
    k_goal.textContent = round(goalCal,0);
    k_p.textContent = `${round(p_g,0)} g (${round(P_PER_KG,1)} g/kg)`;

    o_p_g.textContent = round(p_g,0); o_p_k.textContent = round(p_k,0);
    o_f_g.textContent = round(f_g,0); o_f_k.textContent = round(f_k,0);
    o_c_g.textContent = round(c_g,0); o_c_k.textContent = round(c_k,0);

    const m = x.meals || 4;
    m_p.textContent = round(p_g/m,0);
    m_f.textContent = round(f_g/m,0);
    m_c.textContent = round(c_g/m,0);
  }

  function reset(){
    sex.value='male'; age.value='25';
    unit='metric';
    [...unitToggle.querySelectorAll('button')].forEach(b=>b.setAttribute('aria-pressed', b.dataset.unit==='metric' ? 'true':'false'));
    wUnitLbl.textContent='(kg)'; hUnitLbl.textContent='(cm)';
    weight.value='75'; height.value='178';
    activity.value='1.55'; goalType.value='lose'; rate.value='0.5'; meals.value='4';
    proteinMode.value='auto'; proteinRow.style.display='none'; proteinGPerKg.value='2.0'; proteinGPerKgVal.textContent='2.0';
    compute();
  }

  function save(){
    const x = {
      sex: sex.value, age: age.value, weight: weight.value, height: height.value,
      activity: activity.value, goalType: goalType.value, rate: rate.value,
      proteinMode: proteinMode.value, proteinGPerKg: proteinGPerKg.value,
      meals: meals.value, unit
    };
    localStorage.setItem('macroCalc.v3', JSON.stringify(x));
    saveNote.textContent = 'Saved ✔'; setTimeout(()=> saveNote.textContent='', 1500);
  }

  function load(){
    const raw = localStorage.getItem('macroCalc.v3');
    if(!raw) { reset(); return; }
    try{
      const x = JSON.parse(raw);
      sex.value=x.sex||'male'; age.value=x.age||'25'; weight.value=x.weight||'75'; height.value=x.height||'178';
      activity.value=x.activity||'1.55'; goalType.value=x.goalType||'lose'; rate.value=x.rate||'0.5';
      meals.value=x.meals||'4'; unit = x.unit||'metric';
      proteinMode.value=x.proteinMode||'auto';
      proteinGPerKg.value = x.proteinGPerKg || '2.0'; proteinGPerKgVal.textContent = parseFloat(proteinGPerKg.value).toFixed(1);
      proteinRow.style.display = proteinMode.value==='custom' ? 'grid' : 'none';

      [...unitToggle.querySelectorAll('button')].forEach(b=>b.setAttribute('aria-pressed', b.dataset.unit===unit ? 'true':'false'));
      wUnitLbl.textContent = unit==='metric' ? '(kg)' : '(lb)';
      hUnitLbl.textContent = unit==='metric' ? '(cm)' : '(in)';
      compute();
    }catch(e){ reset(); }
  }

  function copy(){
    const text = `BMR: ${k_bmr.textContent} kcal\nTDEE: ${k_tdee.textContent} kcal\nTarget: ${k_goal.textContent} kcal\nProtein: ${o_p_g.textContent} g (${o_p_k.textContent} kcal)\nFat: ${o_f_g.textContent} g (${o_f_k.textContent} kcal)\nCarbs: ${o_c_g.textContent} g (${o_c_k.textContent} kcal)\nSplit (${meals.value} meals): P ${m_p.textContent} g • F ${m_f.textContent} g • C ${m_c.textContent} g`;
    navigator.clipboard.writeText(text).then(()=>{
      copyBtn.textContent='Copied!'; setTimeout(()=> copyBtn.textContent='Copy results', 1000);
    }).catch(()=> alert('Copy failed.'));
  }

  calcBtn.addEventListener('click', compute);
  resetBtn.addEventListener('click', reset);
  saveBtn.addEventListener('click', save);
  copyBtn.addEventListener('click', copy);
  [sex, age, weight, height, activity, goalType, rate, proteinMode, proteinGPerKg, meals].forEach(el=> el.addEventListener('change', compute));

  load();
})();

// --- Minimal Test Suite (console) ---
function approxEqual(a,b,eps=2){ return Math.abs(a-b) <= eps; }
function runTests(){
  const g = (id)=>document.getElementById(id);
  // Preserve
  const orig = {
    sex: g('sex').value, age: g('age').value, weight: g('weight').value, height: g('height').value,
    activity: g('activity').value, goalType: g('goalType').value, rate: g('rate').value,
    proteinMode: g('proteinMode').value, proteinGPerKg: g('proteinGPerKg').value, meals: g('meals').value
  };
  // Test 1: Baseline example
  g('sex').value='male'; g('age').value='25'; g('weight').value='75'; g('height').value='178';
  g('activity').value='1.55'; g('goalType').value='lose'; g('rate').value='0.0'; g('proteinMode').value='auto';
  g('proteinGPerKg').value='2.0'; g('proteinGPerKgVal').textContent='2.0';
  document.getElementById('calcBtn').click();
  console.assert(approxEqual(parseFloat(g('k_bmr').textContent),1768,5), 'Test1 BMR ≈ 1768');
  console.assert(approxEqual(parseFloat(g('k_tdee').textContent),2740,12), 'Test1 TDEE ≈ 2740');
  // Test 2: Gain 1 lb/week → ~+500 kcal/day
  g('goalType').value='gain'; g('rate').value='1.0'; document.getElementById('calcBtn').click();
  const tdee = parseFloat(g('k_tdee').textContent);
  console.assert(approxEqual(parseFloat(g('k_goal').textContent), tdee+500, 20), 'Test2 Target ≈ TDEE+500');
  // Test 3: Custom protein increases grams
  g('proteinMode').value='custom'; g('proteinGPerKg').value='2.4'; g('proteinGPerKgVal').textContent='2.4'; document.getElementById('calcBtn').click();
  const p24 = parseFloat(g('o_p_g').textContent); g('proteinGPerKg').value='1.6'; g('proteinGPerKgVal').textContent='1.6'; document.getElementById('calcBtn').click();
  const p16 = parseFloat(g('o_p_g').textContent); console.assert(p24 > p16, 'Test3 slider increases protein grams');
  // Restore
  g('sex').value=orig.sex; g('age').value=orig.age; g('weight').value=orig.weight; g('height').value=orig.height;
  g('activity').value=orig.activity; g('goalType').value=orig.goalType; g('rate').value=orig.rate; g('proteinMode').value=orig.proteinMode; g('proteinGPerKg').value=orig.proteinGPerKg; g('meals').value=orig.meals;
  document.getElementById('calcBtn').click(); console.log('Macro calculator tests completed.');
}
try{ runTests(); }catch(e){ console.warn('Tests failed:', e); }
