const grid = document.getElementById("bookGrid");
const searchInput = document.getElementById("searchInput");
const count = document.getElementById("bookCount");
const empty = document.getElementById("emptyState");
const title = document.getElementById("sectionTitle");
let selectedCategory = "Todas";
let favoritesOnly = false;
let allBooks = [];
const favorites = new Set(JSON.parse(localStorage.getItem("lippy-favorites") || "[]"));
const palettes = [
  ["#6b4a36","#bd8b5b"],["#3f5267","#8a6c52"],["#754b4a","#c08a65"],
  ["#46534b","#a68a5c"],["#4a466d","#aa7792"],["#755c3e","#c19c67"]
];
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function coverStyle(book){const p=palettes[Math.abs(hash(book.title))%palettes.length];return `background:linear-gradient(145deg,${p[0]},${p[1]})`;}
function hash(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return h;}
async function loadBooks(){
  const q=encodeURIComponent(searchInput.value.trim());
  const c=encodeURIComponent(selectedCategory);
  const res=await fetch(`/api/books?q=${q}&category=${c}`);
  const data=await res.json(); allBooks=data.books;
  render();
}
function render(){
  let books=allBooks;
  if(favoritesOnly) books=books.filter(b=>favorites.has(b.id));
  count.textContent=`${books.length} ${books.length===1?"livro":"livros"}`;
  grid.innerHTML="";
  empty.hidden=books.length!==0;
  if(!books.length)return;
  for(const b of books){
    const card=document.createElement("article");card.className="book-card";
    card.innerHTML=`<div class="cover" style="${coverStyle(b)}"><span>${esc(b.title)}</span></div>
      <div class="book-info"><div class="book-title" title="${esc(b.title)}">${esc(b.title)}</div>
      <div class="book-meta">${esc(b.category)} · ${b.size} MB</div>
      <div class="book-actions"><button class="read-btn">Ler livro</button><button class="fav-btn ${favorites.has(b.id)?"saved":""}" title="Favoritar">${favorites.has(b.id)?"♥":"♡"}</button></div></div>`;
    card.querySelector(".read-btn").addEventListener("click",()=>{localStorage.setItem("lippy-last-read",b.id);window.open(`/book/${b.id.split("/").map(encodeURIComponent).join("/")}`,"_blank");});
    card.querySelector(".fav-btn").addEventListener("click",()=>{if(favorites.has(b.id))favorites.delete(b.id);else favorites.add(b.id);localStorage.setItem("lippy-favorites",JSON.stringify([...favorites]));render();});
    grid.appendChild(card);
  }
}
function chooseCategory(c){
  selectedCategory=c;favoritesOnly=false;title.textContent=c==="Todas"?"Minha estante":c;
  document.querySelectorAll("[data-category]").forEach(el=>el.classList.toggle("selected",el.dataset.category===c));
  document.getElementById("favorites").classList.remove("active");
  loadBooks();
}
document.querySelectorAll("[data-category]").forEach(el=>el.addEventListener("click",()=>chooseCategory(el.dataset.category)));
searchInput.addEventListener("input",loadBooks);
document.getElementById("discover").addEventListener("click",()=>{searchInput.focus();searchInput.scrollIntoView({behavior:"smooth",block:"center"});});
document.getElementById("favorites").addEventListener("click",()=>{favoritesOnly=true;selectedCategory="Todas";title.textContent="Meus favoritos";document.getElementById("favorites").classList.add("active");loadBooks();});
document.getElementById("menuButton").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));
loadBooks().catch(()=>{grid.innerHTML='<p class="loading">Não foi possível carregar a estante. Verifique se o servidor Flask está ativo.</p>';});
