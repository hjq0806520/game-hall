/* script.js — 單機遊戲合集（五子棋 / 井字棋 / 貪吃蛇 / 2048）
 * 已配合你嘅 HTML：
 *  - section#view-home / view-gomoku / view-ttt / view-snake / view-tw48
 *  - <canvas id="gomoku-canvas" width="300" height="300">
 *  - <div id="ttt-grid"  style="width:300px;height:300px">
 *  - <canvas id="snake-canvas"  width="300" height="300">
 *  - <div id="tw-grid"   style="width:300px;height:300px">
 *  - 所有切頁按鈕有 data-view="home|gomoku|ttt|snake|tw48"
 */

document.addEventListener('DOMContentLoaded', () => {
  // ====== 視圖切換 ======
  const views = {
    home:   document.getElementById('view-home'),
    gomoku: document.getElementById('view-gomoku'),
    ttt:    document.getElementById('view-ttt'),
    snake:  document.getElementById('view-snake'),
    tw48:   document.getElementById('view-tw48'),
  };
  let currentView = 'home';

  function show(viewName) {
    currentView = viewName;
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    const target = views[viewName];
    if (target) target.style.display = '';

    // 進入對應遊戲即重置/開始
    if (viewName === 'gomoku') initGomoku();
    if (viewName === 'ttt')    initTTT();
    if (viewName === 'snake')  initSnake();
    if (viewName === 'tw48')   init2048();
    if (viewName === 'home')   stopSnake(); // 返首頁時停番計時器
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => show(btn.getAttribute('data-view')));
  });

  // ====== 五子棋（15x15） ======
  const gCanvas = document.getElementById('gomoku-canvas');
  const gCtx = gCanvas?.getContext('2d');
  const G_N = 15, G_CELL = 20; // 15*20=300
  let gBoard, gTurn, gOver;

  function drawGBoard() {
    gCtx.clearRect(0,0,300,300);
    gCtx.fillStyle = '#111'; gCtx.fillRect(0,0,300,300);
    gCtx.strokeStyle = '#444';
    for (let i = 0; i < G_N; i++){
      gCtx.beginPath();
      gCtx.moveTo(G_CELL/2, G_CELL/2 + i*G_CELL);
      gCtx.lineTo(300-G_CELL/2, G_CELL/2 + i*G_CELL);
      gCtx.stroke();
      gCtx.beginPath();
      gCtx.moveTo(G_CELL/2 + i*G_CELL, G_CELL/2);
      gCtx.lineTo(G_CELL/2 + i*G_CELL, 300-G_CELL/2);
      gCtx.stroke();
    }
  }
  function drawPiece(x,y,player){
    gCtx.beginPath();
    gCtx.arc(G_CELL/2 + x*G_CELL, G_CELL/2 + y*G_CELL, 8, 0, Math.PI*2);
    gCtx.fillStyle = player===1 ? '#000' : '#fff';
    gCtx.shadowColor = '#000'; gCtx.shadowBlur = 4;
    gCtx.fill(); gCtx.shadowBlur = 0;
  }
  function checkWin(x,y,p){
    const dirs = [[1,0],[0,1],[1,1],[1,-1]];
    for (const [dx,dy] of dirs){
      let cnt=1, i=x+dx, j=y+dy;
      while(i>=0&&i<G_N&&j>=0&&j<G_N&&gBoard[j][i]===p){cnt++;i+=dx;j+=dy}
      i=x-dx; j=y-dy;
      while(i>=0&&i<G_N&&j>=0&&j<G_N&&gBoard[j][i]===p){cnt++;i-=dx;j-=dy}
      if (cnt>=5) return true;
    }
    return false;
  }
  function initGomoku(){
    if (!gCanvas) return;
    gBoard = Array.from({length:G_N},()=>Array(G_N).fill(0));
    gTurn = 1; gOver = false; drawGBoard();
  }
  gCanvas?.addEventListener('click', e=>{
    if (currentView!=='gomoku' || gOver) return;
    const rect = gCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX-rect.left)/G_CELL);
    const y = Math.floor((e.clientY-rect.top)/G_CELL);
    if (x<0||y<0||x>=G_N||y>=G_N||gBoard[y][x]) return;
    gBoard[y][x]=gTurn; drawPiece(x,y,gTurn);
    if (checkWin(x,y,gTurn)){ gOver=true; setTimeout(()=>alert((gTurn===1?'⚫黑子':'⚪白子')+'勝出！'),10); return;}
    gTurn = gTurn===1?2:1;
  });

  // ====== 井字棋（3x3） ======
  const tGrid = document.getElementById('ttt-grid');
  let tBoard, tTurn;
  function initTTT(){
    if (!tGrid) return;
    tGrid.innerHTML = '';
    tGrid.style.display='grid';
    tGrid.style.gridTemplateColumns='repeat(3,1fr)';
    tGrid.style.gridTemplateRows='repeat(3,1fr)';
    tGrid.style.gap='6px';
    tBoard = Array(9).fill('');
    tTurn = 'X';
    for(let i=0;i<9;i++){
      const c=document.createElement('div');
      c.style.display='flex'; c.style.alignItems='center'; c.style.justifyContent='center';
      c.style.fontSize='48px'; c.style.border='1px solid #444'; c.style.borderRadius='8px';
      c.style.userSelect='none'; c.style.background='#111'; c.style.boxShadow='0 0 8px rgba(0,0,0,.3) inset';
      c.addEventListener('click',()=>{
        if (currentView!=='ttt') return;
        if (tBoard[i]) return;
        tBoard[i]=tTurn; c.textContent=tTurn;
        if (tWin(tTurn)){ setTimeout(()=>{alert(tTurn+' 勝！'); initTTT();},10); return;}
        if (tBoard.every(v=>v)){ setTimeout(()=>{alert('平手'); initTTT();},10); return;}
        tTurn = tTurn==='X'?'O':'X';
      });
      tGrid.appendChild(c);
    }
  }
  function tWin(p){
    const L = tBoard;
    const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return lines.some(([a,b,c])=>L[a]===p&&L[b]===p&&L[c]===p);
  }

  // ====== 貪吃蛇（15x15） ======
  const sCanvas = document.getElementById('snake-canvas');
  const sCtx = sCanvas?.getContext('2d');
  const S_N=15, S_CELL=20;
  let sSnake, sDir, sFood, sTimer, sAlive;

  function stopSnake(){ if (sTimer){ clearInterval(sTimer); sTimer=null; } }
  function initSnake(){
    if (!sCanvas) return;
    stopSnake();
    sSnake=[{x:7,y:7},{x:6,y:7},{x:5,y:7}];
    sDir={x:1,y:0}; sAlive=true;
    spawnFood(); drawSnake();
    sTimer=setInterval(stepSnake,150);
  }
  function spawnFood(){
    while(true){
      sFood={x:Math.floor(Math.random()*S_N),y:Math.floor(Math.random()*S_N)};
      if (!sSnake.some(p=>p.x===sFood.x&&p.y===sFood.y)) break;
    }
  }
  function drawSnake(){
    sCtx.fillStyle='#111'; sCtx.fillRect(0,0,300,300);
    // grid faint
    sCtx.strokeStyle='#222';
    for(let i=0;i<=S_N;i++){
      sCtx.beginPath(); sCtx.moveTo(i*S_CELL,0); sCtx.lineTo(i*S_CELL,300); sCtx.stroke();
      sCtx.beginPath(); sCtx.moveTo(0,i*S_CELL); sCtx.lineTo(300,i*S_CELL); sCtx.stroke();
    }
    // food
    sCtx.fillStyle='#e6c200';
    sCtx.fillRect(sFood.x*S_CELL+4, sFood.y*S_CELL+4, S_CELL-8, S_CELL-8);
    // snake
    sCtx.fillStyle='#00d37f';
    sSnake.forEach((p,i)=>{
      sCtx.fillRect(p.x*S_CELL+2, p.y*S_CELL+2, S_CELL-4, S_CELL-4);
    });
  }
  function stepSnake(){
    if (currentView!=='snake' || !sAlive) return;
    const head={x:sSnake[0].x+sDir.x, y:sSnake[0].y+sDir.y};
    // wrap or die? — 用撞牆死
    if (head.x<0||head.x>=S_N||head.y<0||head.y>=S_N || sSnake.some(p=>p.x===head.x&&p.y===head.y)){
      sAlive=false; drawSnake(); setTimeout(()=>alert('Game Over'),10); return;
    }
    sSnake.unshift(head);
    if (head.x===sFood.x && head.y===sFood.y){ spawnFood(); }
    else { sSnake.pop(); }
    drawSnake();
  }
  // 鍵盤 + 觸控（上下左右）
  function setDir(nx,ny){
    if (nx===-sDir.x && ny===-sDir.y) return; // 禁止反向
    sDir={x:nx,y:ny};
  }
  document.addEventListener('keydown',e=>{
    if (currentView!=='snake') return;
    if (e.key==='ArrowUp') setDir(0,-1);
    if (e.key==='ArrowDown') setDir(0,1);
    if (e.key==='ArrowLeft') setDir(-1,0);
    if (e.key==='ArrowRight') setDir(1,0);
  });
  // swipe
  let touchStart=null;
  sCanvas?.addEventListener('touchstart',e=>{touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
  sCanvas?.addEventListener('touchmove',e=>{
    if (!touchStart) return;
    const dx=e.touches[0].clientX-touchStart.x;
    const dy=e.touches[0].clientY-touchStart.y;
    if (Math.abs(dx)+Math.abs(dy)<20) return;
    if (Math.abs(dx)>Math.abs(dy)) setDir(dx>0?1:-1,0); else setDir(0,dy>0?1:-1);
    touchStart=null;
  },{passive:true});

  // ====== 2048（4x4） ======
  const wGrid = document.getElementById('tw-grid');
  let wCells, wBoard;

  function init2048(){
    if (!wGrid) return;
    // 生成 16 個格
    wGrid.innerHTML='';
    wGrid.style.display='grid';
    wGrid.style.gridTemplateColumns='repeat(4,1fr)';
    wGrid.style.gridTemplateRows='repeat(4,1fr)';
    wGrid.style.gap='6px';
    wCells=[];
    for(let i=0;i<16;i++){
      const d=document.createElement('div');
      d.style.display='flex'; d.style.alignItems='center'; d.style.justifyContent='center';
      d.style.fontWeight='700'; d.style.fontSize='28px';
      d.style.borderRadius='8px'; d.style.height='calc((300px - 18px)/4)';
      d.style.background='#151515'; d.style.color='#ddd';
      wGrid.appendChild(d); wCells.push(d);
    }
    wBoard=Array.from({length:4},()=>Array(4).fill(0));
    addTile(); addTile(); render2048();
  }
  function addTile(){
    const empty=[];
    for(let r=0;r<4;r++)for(let c=0;c<4;c++) if(!wBoard[r][c]) empty.push([r,c]);
    if (!empty.length) return;
    const [r,c]=empty[Math.floor(Math.random()*empty.length)];
    wBoard[r][c] = Math.random()<0.9 ? 2 : 4;
  }
  function render2048(){
    const col=(v)=>{
      if(!v) return {bg:'#151515',fg:'#777'};
      const colors={
        2:'#eee4da',4:'#ede0c8',8:'#f2b179',16:'#f59563',32:'#f67c5f',64:'#f65e3b',
        128:'#edcf72',256:'#edcc61',512:'#edc850',1024:'#edc53f',2048:'#edc22e'
      };
      return {bg:colors[v]||'#3c3a32', fg: v<=4?'#776e65':'#f9f6f2'};
    };
    let k=0;
    for(let r=0;r<4;r++)for(let c=0;c<4;c++){
      const v=wBoard[r][c], el=wCells[k++];
      const {bg,fg}=col(v);
      el.style.background=bg; el.style.color=fg;
      el.textContent=v||'';
    }
  }
  function slide(row){
    // 合併一行：去零 → 合併相鄰相同 → 補零
    const arr=row.filter(v=>v);
    for(let i=0;i<arr.length-1;i++){
      if(arr[i]===arr[i+1]){ arr[i]*=2; arr.splice(i+1,1); }
    }
    while(arr.length<4) arr.push(0);
    return arr;
  }
  function rotate(board){ // 轉置
    const b=Array.from({length:4},()=>Array(4).fill(0));
    for(let r=0;r<4;r++)for(let c=0;c<4;c++) b[r][c]=board[c][r];
    return b;
  }
  function reverseRows(board){
    return board.map(row=>row.slice().reverse());
  }
  function move2048(dir){
    if (currentView!=='tw48') return;
    let old=JSON.stringify(wBoard);
    if (dir==='left'){
      for(let r=0;r<4;r++) wBoard[r]=slide(wBoard[r]);
    } else if (dir==='right'){
      for(let r=0;r<4;r++) wBoard[r]=reverseRows([slide(reverseRows([wBoard[r]])[0])])[0];
    } else if (dir==='up'){
      wBoard=rotate(wBoard);
      for(let r=0;r<4;r++) wBoard[r]=slide(wBoard[r]);
      wBoard=rotate(wBoard);
    } else if (dir==='down'){
      wBoard=rotate(wBoard);
      for(let r=0;r<4;r++) wBoard[r]=reverseRows([slide(reverseRows([wBoard[r]])[0])])[0];
      wBoard=rotate(wBoard);
    }
    if (JSON.stringify(wBoard)!==old){ addTile(); render2048(); checkOver(); }
  }
  function checkOver(){
    // 有空位就未完；否則試吓四方向是否都無變化
    for(let r=0;r<4;r++)for(let c=0;c<4;c++) if(!wBoard[r][c]) return;
    const can = (()=>{
      const tryMove=(dir)=>{
        let copy = wBoard.map(r=>r.slice());
        let before=JSON.stringify(copy);
        if (dir==='left'){
          for(let r=0;r<4;r++) copy[r]=slide(copy[r]);
        } else if (dir==='right'){
          for(let r=0;r<4;r++) copy[r]=reverseRows([slide(reverseRows([copy[r]])[0])])[0];
        } else if (dir==='up'){
          copy=rotate(copy);
          for(let r=0;r<4;r++) copy[r]=slide(copy[r]);
          copy=rotate(copy);
        } else if (dir==='down'){
          copy=rotate(copy);
          for(let r=0;r<4;r++) copy[r]=reverseRows([slide(reverseRows([copy[r]])[0])])[0];
          copy=rotate(copy);
        }
        return JSON.stringify(copy)!==before;
      };
      return ['left','right','up','down'].some(tryMove);
    })();
    if (!can){ setTimeout(()=>alert('2048 結束'),10); init2048(); }
  }
  // 鍵盤 + 觸控
  document.addEventListener('keydown',e=>{
    if (currentView!=='tw48') return;
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) e.preventDefault();
    if (e.key==='ArrowLeft') move2048('left');
    if (e.key==='ArrowRight') move2048('right');
    if (e.key==='ArrowUp') move2048('up');
    if (e.key==='ArrowDown') move2048('down');
  });
  let wStart=null;
  wGrid?.addEventListener('touchstart',e=>{wStart={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
  wGrid?.addEventListener('touchmove',e=>{
    if (!wStart) return;
    const dx=e.touches[0].clientX-wStart.x;
    const dy=e.touches[0].clientY-wStart.y;
    if (Math.abs(dx)+Math.abs(dy)<20) return;
    if (Math.abs(dx)>Math.abs(dy)) move2048(dx>0?'right':'left'); else move2048(dy>0?'down':'up');
    wStart=null;
  },{passive:true});

  // ====== 初始進入首頁 ======
  show('home');
});
