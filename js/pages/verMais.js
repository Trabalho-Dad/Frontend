import { isFavorite, setFavoriteButtonState, toggleFavorite } from "../utils/favorites.js";

const CART_STORAGE_KEY = "astra_cart";

function parsePrice(priceText) {
    if (!priceText) return 0;

    const cleaned = priceText
        .replace("R$", "")
        .trim()
        .replace(/\./g, "")
        .replace(",", ".");

    const value = parseFloat(cleaned);
    return Number.isNaN(value) ? 0 : value;
}

function formatPrice(value) {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

function slugify(name) {
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
}

function showToast(message) {
    let toast = document.getElementById("astra-toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "astra-toast";

        Object.assign(toast.style, {
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#1f1f1f",
            color: "#fff",
            padding: "14px 20px",
            borderRadius: "8px",
            fontFamily: "Poppins, sans-serif",
            fontSize: "14px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            zIndex: "9999",
            opacity: "0",
            transform: "translateY(10px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
            pointerEvents: "none",
        });

        document.body.appendChild(toast);
    }

    toast.textContent = message;

    requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    });

    clearTimeout(showToast._timeoutId);
    showToast._timeoutId = setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
    }, 2500);
}

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function addToCart(product, quantity) {
    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }

    saveCart(cart);
    updateCartBadge();
}

function updateCartBadge() {
    const badge = document.querySelector(".cart-btn .badge");
    if (!badge) return;

    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    badge.textContent = totalItems;
}

function toggleProductFavorite(button, product) {
    const active = toggleFavorite(product);
    setFavoriteButtonState(button, active);
    showToast(active
        ? `${product.name} adicionado aos favoritos`
        : `${product.name} removido dos favoritos`);
}

function initGallery() {
    const thumbs = document.querySelectorAll(".gallery-thumbnails .thumb");
    const mainImage = document.querySelector(".main-image .product-image");

    if (!thumbs.length || !mainImage) return;

    thumbs.forEach((thumb) => {
        thumb.addEventListener("click", () => {
            const thumbImg = thumb.querySelector("img");
            if (!thumbImg) return;

            mainImage.src = thumbImg.src;
            mainImage.alt = thumbImg.alt || mainImage.alt;

            thumbs.forEach((t) => t.classList.remove("active"));
            thumb.classList.add("active");
        });
    });

    const prevBtn = document.querySelector(".gallery-prev, .arrow-prev");
    const nextBtn = document.querySelector(".gallery-next, .arrow-next");

    if (prevBtn && nextBtn) {
        const thumbsArray = Array.from(thumbs);

        const goTo = (direction) => {
            const currentIndex = thumbsArray.findIndex((t) =>
                t.classList.contains("active")
            );
            let newIndex = currentIndex + direction;

            if (newIndex < 0) newIndex = thumbsArray.length - 1;
            if (newIndex >= thumbsArray.length) newIndex = 0;

            thumbsArray[newIndex].click();
        };

        prevBtn.addEventListener("click", () => goTo(-1));
        nextBtn.addEventListener("click", () => goTo(1));
    }
}

function initQuantitySelector() {
    const qtyValueEl = document.querySelector(".qty-value");
    const qtyButtons = document.querySelectorAll(".qty-btn");

    if (!qtyValueEl || qtyButtons.length < 2) return null;

    const decreaseBtn = qtyButtons[0];
    const increaseBtn = qtyButtons[1];

    let quantity = parseInt(qtyValueEl.textContent, 10) || 1;

    const render = () => {
        qtyValueEl.textContent = quantity;
    };

    decreaseBtn.addEventListener("click", () => {
        if (quantity > 1) {
            quantity -= 1;
            render();
        }
    });

    increaseBtn.addEventListener("click", () => {
        quantity += 1;
        render();
    });

    return () => quantity;
}

function getMainProductData() {
    const titleEl = document.querySelector(".product-title");
    const priceEl = document.querySelector(".product-price");
    const imageEl = document.querySelector(".main-image .product-image");

    const name = titleEl?.textContent.trim() || "Produto";
    const price = parsePrice(priceEl?.textContent);
    const image = imageEl?.src || "";

    return {
        id: slugify(name),
        name,
        price,
        image,
        category: document.querySelector(".product-category")?.textContent.trim() ?? "Colecionável",
        detailUrl: window.location.href,
    };
}

function initMainProductActions(getQuantity) {
    const addToCartBtn = document.querySelector(".btn-add-cart");
    const buyNowBtn = document.querySelector(".btn-buy-now");

    const readQuantity = () => (typeof getQuantity === "function" ? getQuantity() : 1);

    if (addToCartBtn) {
        addToCartBtn.addEventListener("click", () => {
            const product = getMainProductData();
            const quantity = readQuantity();

            addToCart(product, quantity);

            showToast(
                `${quantity}x ${product.name} adicionado(s) ao carrinho`
            );
        });
    }

    if (buyNowBtn) {
        buyNowBtn.addEventListener("click", () => {
            const product = getMainProductData();
            const quantity = readQuantity();
            const total = product.price * quantity;

            addToCart(product, quantity);

            sessionStorage.setItem(
                "astra_buy_now",
                JSON.stringify({ ...product, quantity, total })
            );

            showToast(
                `Redirecionando para o checkout: ${quantity}x ${product.name} - ${formatPrice(total)}`
            );

            setTimeout(() => {
                window.location.href = "checkout.html";
            }, 1200);
        });
    }
}

function initMainFavoriteButton() {
    const favoriteBtn = document.querySelector(".main-image .favorite-btn");
    if (!favoriteBtn) return;

    const product = getMainProductData();

    setFavoriteButtonState(favoriteBtn, isFavorite(product.id));

    favoriteBtn.addEventListener("click", () => {
        toggleProductFavorite(favoriteBtn, product);
    });
}

function initRelatedProducts() {
    const cards = document.querySelectorAll(".related-products .figure-card");

    cards.forEach((card) => {
        const titleEl = card.querySelector(".card-title");
        const priceEl = card.querySelector(".card-price");
        const imageEl = card.querySelector(".card-img");
        const favBtn = card.querySelector(".card-fav-btn");
        const buyBtn = card.querySelector(".btn-buy");

        const name = titleEl?.textContent.trim() || "Produto";
        const price = parsePrice(priceEl?.textContent);
        const image = imageEl?.src || "";
        const id = `related-${slugify(name)}`;
        const product = {
            id,
            name,
            price,
            image,
            category: card.querySelector(".card-category")?.textContent.trim() ?? "Colecionável",
            detailUrl: `verMais.html?product=${encodeURIComponent(id)}`
        };

        if (favBtn) {
            setFavoriteButtonState(favBtn, isFavorite(id));

            favBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                toggleProductFavorite(favBtn, product);
            });
        }

        if (buyBtn) {
            buyBtn.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();

                window.location.href = product.detailUrl;
            });
        }
    });
}

function init() {
    initGallery();
    const getQuantity = initQuantitySelector();

    initMainProductActions(getQuantity);
    initMainFavoriteButton();
    initRelatedProducts();

    updateCartBadge();
}

document.addEventListener("DOMContentLoaded", init);
