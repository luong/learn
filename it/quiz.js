'use strict';
(() => {
 const el=id=>document.getElementById(id), grade=el('grade'), link=el('quizToggle');
 const questions=new Map(IT_QUESTIONS.map(q=>[q.id,q]));
 const signature=JSON.stringify(IT_QUESTIONS);
 const viewKey=`it-view-v1:${location.pathname}`;
 function restoreView(){
  try{
   const saved=JSON.parse(localStorage.getItem(viewKey));
   if(!saved||!['10','11','12'].includes(saved.grade))return;
   grade.value=saved.grade;
   if(!location.hash&&saved.mode==='quiz'&&grade.value==='10')history.replaceState(null,'','#lam-bai');
  }catch{}
  if(location.hash==='#lam-bai'&&grade.value!=='10')history.replaceState(null,'','#ly-thuyet');
 }
 function saveView(testing){
  try{localStorage.setItem(viewKey,JSON.stringify({grade:grade.value,mode:testing?'quiz':'theory'}));}catch{}
 }
 let state=null,timer=null,armed=null,pauseAuto=false;
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const ordered=ids=>shuffle([...ids]).sort((a,b)=>questions.get(a).difficulty-questions.get(b).difficulty);
 const key=()=>`it-quiz-v1:${location.pathname}:${grade.value}`;
 const fresh=()=>({order:ordered([...questions.keys()]),pos:0,correct:[],wrong:[],review:false,choice:null,options:[],locked:false});
 function save(){if(grade.value!=='10'||!state)return;try{localStorage.setItem(key(),JSON.stringify({signature,state}));}catch{}}
 function valid(s){
  const unique=a=>Array.isArray(a)&&new Set(a).size===a.length&&a.every(id=>questions.has(id));
  if(!s||!unique(s.order)||!s.order.length||!unique(s.correct)||!unique(s.wrong)||s.correct.some(id=>s.wrong.includes(id)))return false;
  if(!Number.isInteger(s.pos)||s.pos<0||s.pos>s.order.length||typeof s.review!=='boolean'||typeof s.locked!=='boolean')return false;
  if(!s.review&&s.order.length!==questions.size)return false;
  if(s.order.some((id,i)=>i>0&&questions.get(s.order[i-1]).difficulty>questions.get(id).difficulty))return false;
  if(s.correct.length+s.wrong.length>questions.size)return false;
  if(s.pos<s.order.length){if(!Array.isArray(s.options)||s.options.length!==4||new Set(s.options).size!==4||s.options.some(n=>!Number.isInteger(n)||n<0||n>3))return false;
   if(s.choice!==null&&(!Number.isInteger(s.choice)||s.choice<0||s.choice>3))return false;
   if(s.locked&&s.choice===null)return false;
  }return true;
 }
 function load(){state=null;try{const saved=JSON.parse(localStorage.getItem(key()));if(saved?.signature===signature&&valid(saved.state))state=saved.state;}catch{}if(!state)state=fresh();pauseAuto=state.locked;}
 function question(){return questions.get(state.order[state.pos]);}
 function stop(){clearTimeout(timer);timer=null;}
 function autoNext(){stop();if(!pauseAuto&&location.hash==='#lam-bai'&&grade.value==='10'&&state?.locked&&state.pos<state.order.length&&state.options[state.choice]===question().answer)timer=setTimeout(next,850);}
 function render(){
  stop();if(!state)return;
  el('current').textContent=`${Math.min(state.pos+1,state.order.length)} / ${state.order.length}${state.review?' (làm lại)':''}`;
  el('right').textContent=state.correct.length;el('wrong').textContent=state.wrong.length;
  const done=state.pos>=state.order.length;
  el('quizArea').hidden=done;el('quizFinish').hidden=!done;
  if(done){el('finishTitle').textContent=state.wrong.length?'Bạn đã hoàn thành phần này.':'Chúc mừng! Bạn đã trả lời đúng tất cả câu hỏi! 🎉';el('score').textContent=`Đúng ${state.correct.length} / ${questions.size} câu có thể chấm; còn ${state.wrong.length} câu sai.`;el('reviewPrompt').hidden=!state.wrong.length;save();return;}
  const q=question();
  if(!state.options.length)state.options=shuffle([0,1,2,3]);
  el('question').textContent=q.prompt;
  const box=el('options');box.replaceChildren();
  state.options.forEach((original,index)=>{
   const label=document.createElement('label');label.className='q-option';
   if(state.choice===index)label.classList.add('selected');
   const input=document.createElement('input');input.type='radio';input.name='answer';input.value=String(index);input.checked=state.choice===index;input.disabled=state.locked;
   input.addEventListener('change',()=>{if(state.locked)return;state.choice=index;box.querySelectorAll('.q-option').forEach((item,i)=>item.classList.toggle('selected',i===index));el('check').disabled=false;save();});
   const text=document.createElement('span');text.textContent=`${'ABCD'[index]}. ${q.options[original]}`;label.append(input,text);box.append(label);
  });
  el('check').hidden=state.locked;el('check').disabled=state.choice===null;
  el('next').hidden=!state.locked||(state.options[state.choice]===q.answer&&!pauseAuto);
  const feedback=el('feedback');feedback.hidden=!state.locked;feedback.className='q-feedback';
  if(state.locked){const ok=state.options[state.choice]===q.answer;feedback.classList.add(ok?'ok':'no');feedback.textContent=ok?(pauseAuto?'Đúng!':'Đúng! Đang chuyển sang câu tiếp theo…'):'Sai.';}
  save();autoNext();
 }
 function next(){if(!state||!state.locked||state.pos>=state.order.length)return;stop();state.pos++;armed=null;pauseAuto=false;state.choice=null;state.options=[];state.locked=false;render();}
 el('quizForm').addEventListener('submit',event=>{
  event.preventDefault();if(!state||state.locked||state.choice===null||state.pos>=state.order.length)return;
  const q=question(),ok=state.options[state.choice]===q.answer;
  state.correct=state.correct.filter(id=>id!==q.id);state.wrong=state.wrong.filter(id=>id!==q.id);
  state[ok?'correct':'wrong'].push(q.id);state.locked=true;pauseAuto=false;render();if(!ok)el('next').focus();
 });
 el('next').addEventListener('click',next);
 el('reviewWrong').addEventListener('click',()=>{if(!state.wrong.length)return;stop();state.order=ordered(state.wrong);state.pos=0;state.review=true;armed=null;pauseAuto=false;state.choice=null;state.options=[];state.locked=false;render();});
 el('resetTest').addEventListener('click',()=>{if(!confirm('Làm lại bài kiểm tra? Tiến độ và kết quả đã lưu sẽ được đặt lại.'))return;stop();armed=null;pauseAuto=false;state=fresh();render();});
 // Match Math 11's shortcuts on the correct/incorrect counters.
 el('rightStat').addEventListener('click',()=>{
  if(el('quiz').hidden||!state||state.pos>=state.order.length)return;
  stop();const token=state.order[state.pos]+':'+state.pos,advance=armed===token;
  state.locked=false;state.choice=state.options.indexOf(question().answer);pauseAuto=true;render();armed=token;
  if(advance){el('quizForm').dispatchEvent(new Event('submit',{cancelable:true}));next();armed=null;}
 });
 el('wrongStat').addEventListener('click',()=>{
  if(el('quiz').hidden||!state||state.pos<=0)return;
  stop();state.pos--;state.choice=null;state.options=[];state.locked=false;armed=null;pauseAuto=false;render();
 });
 function view(){stop();const testing=location.hash==='#lam-bai'&&grade.value==='10';
  for(const value of ['10','11','12'])el(`grade-${value}`).hidden=value!==grade.value||testing;
  document.body.classList.toggle('quiz-mode',testing);el('quiz').hidden=!testing;link.hidden=grade.value!=='10';link.textContent=testing?'Học lý thuyết':'Bắt đầu làm bài';link.href=testing?'#ly-thuyet':'#lam-bai';
  document.title=`Tin học ${grade.value} · ${testing?'Làm bài':'Tóm tắt kiến thức'}`;saveView(testing);if(testing)render();
 }
 grade.addEventListener('change',()=>{stop();load();if(location.hash==='#lam-bai'&&grade.value!=='10')history.replaceState(null,'','#ly-thuyet');view();});
 window.addEventListener('hashchange',view);
 window.addEventListener('pagehide',()=>{save();stop();});
 window.addEventListener('pageshow',view);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){save();stop();}else autoNext();});
 restoreView();load();view();
})();
