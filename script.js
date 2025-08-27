const views=document.querySelectorAll('.view');
document.querySelectorAll('[data-view]').forEach(btn=>btn.onclick=()=>{
  views.forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+btn.dataset.view).classList.add('active');
});
// 井字棋
const ttt=document.getElementById('ttt-grid');
if(ttt){let board=Array(9).fill(null),turn='X';
for(let i=0;i<9;i++){let d=document.createElement('div');d.onclick=()=>{
  if(!board[i]){board[i]=turn;d.textContent=turn;turn=turn==='X'?'O':'X';}};ttt.appendChild(d);}}
// 贪吃蛇（极简版）
const sc=document.getElementById('snake-canvas');if(sc){
const ctx=sc.getContext('2d');let snake=[[5,5]],dir=[1,0],food=[8,8];
function draw(){ctx.fillStyle='black';ctx.fillRect(0,0,sc.width,sc.height);
ctx.fillStyle='lime';snake.forEach(([x,y])=>ctx.fillRect(x*20,y*20,18,18));
ctx.fillStyle='red';ctx.fillRect(food[0]*20,food[1]*20,18,18);}
function step(){let head=[snake[0][0]+dir[0],snake[0][1]+dir[1]];
if(head[0]<0||head[1]<0||head[0]>=24||head[1]>=24){snake=[[5,5]];}
snake.unshift(head);if(head[0]==food[0]&&head[1]==food[1])food=[Math.floor(Math.random()*24),Math.floor(Math.random()*24)];
else snake.pop();draw();}
setInterval(step,200);window.onkeydown=e=>{if(e.key==='ArrowUp')dir=[0,-1];if(e.key==='ArrowDown')dir=[0,1];
if(e.key==='ArrowLeft')dir=[-1,0];if(e.key==='ArrowRight')dir=[1,0];};}}
