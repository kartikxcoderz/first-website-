const modal=document.getElementById("comingModal");
const title=document.getElementById("comingTitle");
const closeButton=document.getElementById("comingClose");
function closeModal(){modal.hidden=true;}
document.querySelectorAll(".coming-trigger").forEach(card=>{
  card.addEventListener("click",()=>{
    title.textContent=card.dataset.game+" — Coming Soon";
    modal.hidden=false;
  });
});
closeButton.addEventListener("click",closeModal);
modal.addEventListener("click",event=>{if(event.target===modal)closeModal();});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!modal.hidden)closeModal();});
