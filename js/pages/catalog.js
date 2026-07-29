const products = [
    {
      name: "Nanda Jogadora",
      price: 149.90,
      category: "Copa",
      image: "./assets/images/nanda-copa-boneco.png"
    },
    {
      name: "Ana Jogadora",
      price: 149.90,
      category: "Copa",
      image: "https://via.placeholder.com/200"
    },
    {
      name: "Caio Jogador",
      price: 149.90,
      category: "Copa",
      image: "https://via.placeholder.com/200"
    },
    {
      name: "Edu Jogador",
      price: 149.90,
      category: "Copa",
      image: "https://via.placeholder.com/200"
    }
  ];
  
  const grid = document.getElementById("catalog-grid");
  const count = document.getElementById("products-count");
  
  function renderProducts(list) {
    grid.innerHTML = "";
  
    list.forEach(product => {
      const card = document.createElement("div");
      card.classList.add("figure-card");
  
      card.innerHTML = `
        <div class="card-image-wrapper">
          <img class="card-img" src="${product.image}" alt="${product.name}">
        </div>
  
        <div class="card-info">
          <span class="card-category">${product.category}</span>
          <h3 class="card-title">${product.name}</h3>
  
          <div class="card-footer">
            <span class="card-price">R$ ${product.price.toFixed(2)}</span>
          </div>
        </div>
      `;
  
      grid.appendChild(card);
    });
  
    count.textContent = `${list.length} produtos encontrados`;
  }

  renderProducts(products);