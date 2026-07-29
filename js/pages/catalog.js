const products = [
    {
      name: "Nanda Jogadora",
      price: 149.90,
      category: "Copa",
      image: "./assets/images/boneco/nanda-copa-boneca.png"
    },
    {
      name: "Nanda Astronauta",
      price: 149.90,
      category: "Astronauta",
      image: "./assets/images/boneco/nanda-astro-boneca.png"
    },
    {
      name: "Nanda Esportes",
      price: 149.90,
      category: "Esportes",
      image: "./assets/images/boneco/nanda-esporte-boneca.png"
    },
    {
      name: "Nanda Tech",
      price: 149.90,
      category: "Tech",
      image: "./assets/images/boneco/nanda-tech-boneca.png"
    },
    {
        name: "Nanda Empresas",
        price: 149.90,
        category: "Empresas",
        image: "./assets/images/boneco/nanda-picpay-boneca.png"
      }
  ];
   
const grid = document.getElementById("catalog-grid");
const count = document.getElementById("products-count");
const tagButtons = document.querySelectorAll(".tag-btn");
const clearFiltersBtn = document.getElementById("clear-filters-btn");
 
let activeCategory = ""; 
 
function renderProducts(list) {
  grid.innerHTML = "";
 
  if (list.length === 0) {
    grid.innerHTML = `<p class="catalog-empty">Nenhum produto encontrado nessa categoria.</p>`;
    count.textContent = "0 produtos encontrados";
    return;
  }
 
  list.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("figure-card");
 
    card.innerHTML = `
      <div class="card-image-wrapper">
      <button class="card-fav-btn" title="Favoritar">
        <img src="./assets/icons/favorito.svg" alt="favoritos">
      </button>
      <img class="card-img" src="${product.image}" alt="${product.name}">
    </div>

    <div class="card-info">
      <span class="card-category">${product.category}</span>
      <h3 class="card-title">${product.name}</h3>

      <div class="card-footer">
        <span class="card-price">
          R$ ${product.price.toFixed(2).replace('.', ',')}
        </span>

        <button class="btn-buy">
          <img src="./assets/icons/comprar.svg" alt="comprar">
          Comprar
        </button>
      </div>
    </div>
    `;
 
    grid.appendChild(card);
  });
 
  count.textContent = `${list.length} produtos encontrados`;
}
 
function applyFilter() {
  const filtered = activeCategory
    ? products.filter(product => product.category === activeCategory)
    : products;
 
  renderProducts(filtered);
}
 
function setActiveButton(clickedBtn) {
  tagButtons.forEach(btn => btn.classList.remove("active"));
  clickedBtn.classList.add("active");
}
 
tagButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    activeCategory = btn.dataset.category || "";
    setActiveButton(btn);
    applyFilter();
  });
});
 
if (clearFiltersBtn) {
  clearFiltersBtn.addEventListener("click", () => {
    activeCategory = "";
    const todosBtn = document.querySelector('.tag-btn[data-category=""]');
    if (todosBtn) setActiveButton(todosBtn);
    applyFilter();
  });
}
 
renderProducts(products);