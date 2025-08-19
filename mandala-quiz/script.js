
// Mandala Quiz v3 - final
const screen = document.getElementById('screen');

const GAME = {
  username: '',
  difficulty: 'easy',
  questions: [],
  current: 0,
  score: 0,
  perQuestionTime: { easy: 25, medium: 20, hard: 15 },
  timer: null,
  timeLeft: 0,
  totalQuestions: 20
};

function start(){
  renderWelcome();
  registerSW();
}

function renderWelcome(){
  screen.innerHTML = `
    <div class="main-wrap">
      <section class="card center">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
          <h2>Welcome, Seeker 🎮</h2>
          <p class="small">Enter a username, pick a difficulty and race the clock through 20 Mandala-focused questions.</p>
        </div>
        <div class="controls" style="margin-top:12px">
          <input id="nameInput" type="text" placeholder="Your username (tap to change)" maxlength="20" />
          <div style="display:flex;gap:8px" id="diffRow">
            <button class="diff-btn active" data-diff="easy">🎯 Easy</button>
            <button class="diff-btn" data-diff="medium">⚡ Medium</button>
            <button class="diff-btn" data-diff="hard">👑 Hard</button>
          </div>
          <button id="startBtn" class="btn">Start Quiz</button>
        </div>
      </section>
    </div>
  `;
  document.querySelectorAll('.diff-btn').forEach(b=> b.onclick = ()=>{
    document.querySelectorAll('.diff-btn').forEach(x=> x.classList.remove('active'));
    b.classList.add('active');
    GAME.difficulty = b.dataset.diff;
  });
  document.getElementById('startBtn').onclick = onStart;
}

function onStart(){
  const name = (document.getElementById('nameInput').value || '').trim();
  GAME.username = name || 'Seeker';
  document.getElementById('playerLink').textContent = GAME.username;
  // pick 20 random questions from pool
  const pool = QUESTION_BANK[GAME.difficulty].slice();
  shuffle(pool);
  GAME.questions = pool.slice(0, GAME.totalQuestions).map(q => {
    // shuffle choices and keep index of correct
    const choices = q.choices.slice();
    const correctText = choices[q.answer];
    const order = choices.map((c,i)=>({c,i}));
    shuffle(order);
    const newChoices = order.map(o=>o.c);
    const newAnswer = newChoices.indexOf(correctText);
    return { text: q.text, choices: newChoices, answer: newAnswer };
  });
  GAME.current = 0;
  GAME.score = 0;
  renderQuestion();
}

function renderQuestion(){
  const q = GAME.questions[GAME.current];
  if(!q) return renderResults();
  const num = GAME.current + 1;
  const total = GAME.totalQuestions;
  const percent = Math.round((GAME.current/total)*100);
  screen.innerHTML = `
    <div class="main-wrap">
      <section class="card">
        <div class="hud">
          <div class="small">📖 Question ${num} of ${total} · ${GAME.difficulty.toUpperCase()}</div>
          <div class="timer">⏳ <span id="time">${GAME.perQuestionTime[GAME.difficulty]}</span>s</div>
        </div>
        <div class="progress"><span style="width:${percent}%"></span></div>
        <div class="qcard" style="margin-top:12px">
          <div class="question">🧩 ${q.text}</div>
          <div class="choices">
            ${q.choices.map((c,i)=>`<div class="choice" data-idx="${i}">${c}</div>`).join('')}
          </div>
        </div>
      </section>
    </div>
  `;
  document.querySelectorAll('.choice').forEach(el=> el.onclick = ()=> handleAnswer(parseInt(el.dataset.idx,10)));
  // start timer
  clearInterval(GAME.timer);
  GAME.timeLeft = GAME.perQuestionTime[GAME.difficulty];
  const timeEl = document.getElementById('time');
  timeEl.textContent = GAME.timeLeft;
  GAME.timer = setInterval(()=>{
    GAME.timeLeft -= 1;
    timeEl.textContent = GAME.timeLeft;
    if(GAME.timeLeft <= 0){
      clearInterval(GAME.timer);
      toast("Time's up ⏳");
      revealAnswer(null);
    }
  }, 1000);
}

function handleAnswer(idx){
  clearInterval(GAME.timer);
  revealAnswer(idx);
}

function revealAnswer(idx){
  const q = GAME.questions[GAME.current];
  const correct = q.answer;
  // update score if correct
  if(idx === correct){
    let pts = GAME.difficulty === 'easy' ? 5 : GAME.difficulty === 'medium' ? 10 : 15;
    GAME.score += pts;
  }
  // visually mark choices
  document.querySelectorAll('.choice').forEach(el=>{
    const i = parseInt(el.dataset.idx,10);
    if(i === correct) el.classList.add('correct');
    else if(i === idx) el.classList.add('wrong');
    el.style.pointerEvents = 'none';
  });
  // small delay then next
  setTimeout(()=>{
    GAME.current += 1;
    if(GAME.current >= GAME.totalQuestions) renderResults();
    else renderQuestion();
  }, 900);
}

function renderResults(){
  const total = GAME.totalQuestions;
  const maxPerQ = GAME.difficulty === 'easy' ? 5 : GAME.difficulty === 'medium' ? 10 : 15;
  const maxScore = total * maxPerQ;
  const pct = Math.round((GAME.score / maxScore) * 100);
  const title = GAME.score >= (maxScore*0.8) ? '👑 Mandala Master' : GAME.score >= (maxScore*0.55) ? '🛡️ Mandala Guardian' : '⭐ Mandala Explorer';
  screen.innerHTML = `
    <div class="main-wrap">
      <section class="card center results">
        <h2>Results 🎉</h2>
        <div class="badge-title">${title}</div>
        <p class="small"><strong>${GAME.username}</strong>, you scored <strong>${GAME.score}</strong> points</p>
        <p class="small">Accuracy: ${pct}% · ${GAME.totalQuestions} questions</p>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button id="replay" class="btn">Play Again</button>
          <button id="share" class="share-btn">Share on X</button>
        </div>
        <p class="small" style="margin-top:10px">— built by <a href="https://x.com/0xdeola" target="_blank">@0xdeola</a> ✨</p>
      </section>
    </div>
  `;
  document.getElementById('replay').onclick = ()=> renderWelcome();
  document.getElementById('share').onclick = ()=> shareOnX(GAME.username, GAME.score);
}

function shareOnX(username, score){
  const text = `I just scored ${score}/${GAME.totalQuestions * (GAME.difficulty==='easy'?5:GAME.difficulty==='medium'?10:15)} on the Mandala Quiz Challenge 🏆%0A@MandalaChain is Built on @Polkadot%0A— game by @0xdeola ✨%0A👉 Play here: [https://mandala-game.vercel.app/]%0A#MandalaChain #Web3`;
  const url = `https://twitter.com/intent/tweet?text=${text}`;
  window.open(url, '_blank');
}

function toast(msg){
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), 1600);
}

function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }

// Register service worker for offline caching
function registerSW(){
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
}

start();
