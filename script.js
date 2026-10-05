"use strict";

const WHATSAPP_NUMBER = "213562143229";

let cart = [];
let selectedProduct = null;


/* =========================
   ELEMENTS
========================= */

const cartPanel = document.getElementById("cart-panel");
const cartOverlay = document.getElementById("cart-overlay");
const orderOverlay = document.getElementById("order-overlay");

const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");

const headerCartButton = document.getElementById("header-cart-button");
const floatingCartButton = document.getElementById("floating-cart");

const closeCartButton = document.getElementById("close-cart");
const closeOrderButton = document.getElementById("close-order");

const whatsappCartButton = document.getElementById("whatsapp-cart-button");

const orderForm = document.getElementById("order-form");
const selectedProductBox = document.getElementById("selected-product");


/* =========================
   SAFE WHATSAPP
========================= */

function openWhatsApp(message) {
    const url =
        "https://wa.me/" +
        WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(message);

    window.location.href = url;
}


/* =========================
   CART
========================= */

function addToCart(name, price) {

    const existing = cart.find(item => item.name === name);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }

    updateCart();

    openCart();

    showToast("Added to cart ✓");
}


function removeFromCart(index) {

    if (index < 0 || index >= cart.length) {
        return;
    }

    cart.splice(index, 1);

    updateCart();
}


function changeQuantity(index, amount) {

    if (!cart[index]) {
        return;
    }

    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    updateCart();
}


function getPriceNumber(price) {

    const number = parseInt(
        String(price).replace(/[^\d]/g, ""),
        10
    );

    return Number.isFinite(number) ? number : 0;
}


function formatPrice(number) {

    return number.toLocaleString("fr-FR") + " DA";
}


function updateCart() {

    const count = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const total = cart.reduce(
        (sum, item) => {
            return sum + getPriceNumber(item.price) * item.quantity;
        },
        0
    );


    document.getElementById("header-cart-count").textContent = count;
    document.getElementById("floating-cart-count").textContent = count;

    cartTotal.textContent = formatPrice(total);


    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">
                <span>🛒</span>
                <p>Your cart is empty.</p>
                <small>Add a product to get started.</small>
            </div>
        `;

        return;
    }


    cartItems.innerHTML = cart.map((item, index) => {

        const itemTotal =
            getPriceNumber(item.price) * item.quantity;

        return `
            <div class="cart-item">

                <div class="cart-item-top">

                    <div>
                        <h3>${escapeHtml(item.name)}</h3>
                        <p class="cart-item-price">
                            ${formatPrice(itemTotal)}
                        </p>
                    </div>

                </div>

                <div class="cart-controls">

                    <button
                        type="button"
                        class="qty-button"
                        data-cart-action="minus"
                        data-index="${index}"
                        aria-label="Decrease quantity">
                        −
                    </button>

                    <span class="qty-number">
                        ${item.quantity}
                    </span>

                    <button
                        type="button"
                        class="qty-button"
                        data-cart-action="plus"
                        data-index="${index}"
                        aria-label="Increase quantity">
                        +
                    </button>

                    <button
                        type="button"
                        class="remove-button"
                        data-cart-action="remove"
                        data-index="${index}">
                        Remove
                    </button>

                </div>

            </div>
        `;

    }).join("");
}


/* =========================
   CART OPEN / CLOSE
========================= */

function openCart() {

    cartPanel.classList.add("open");
    cartOverlay.classList.add("open");

    document.body.classList.add("no-scroll");
}


function closeCart() {

    cartPanel.classList.remove("open");
    cartOverlay.classList.remove("open");

    if (!orderOverlay.classList.contains("open")) {
        document.body.classList.remove("no-scroll");
    }
}


/* =========================
   ORDER
========================= */

function openOrder(name, price) {

    selectedProduct = {
        name: name,
        price: price
    };

    selectedProductBox.innerHTML = `
        <strong>${escapeHtml(name)}</strong>
        <span> — ${escapeHtml(price)}</span>
    `;

    orderOverlay.classList.add("open");

    document.body.classList.add("no-scroll");

    setTimeout(() => {
        const nameInput = document.getElementById("customer-name");

        if (nameInput) {
            nameInput.focus();
        }
    }, 100);
}


function closeOrder() {

    orderOverlay.classList.remove("open");

    if (!cartPanel.classList.contains("open")) {
        document.body.classList.remove("no-scroll");
    }
}


function submitOrder(event) {

    event.preventDefault();

    if (!selectedProduct) {
        return;
    }

    const name =
        document.getElementById("customer-name").value.trim();

    const phone =
        document.getElementById("customer-phone").value.trim();

    const address =
        document.getElementById("customer-address").value.trim();


    if (!name || !phone || !address) {
        showToast("Please complete all fields.");
        return;
    }


    const message =
`Hello Maison Style DZ 👋

I want to order:

Product: ${selectedProduct.name}
Price: ${selectedProduct.price}

Customer name: ${name}
Phone: ${phone}
Address / Wilaya: ${address}

Thank you.`;


    openWhatsApp(message);
}


/* =========================
   CART WHATSAPP
========================= */

function sendCartToWhatsApp() {

    if (cart.length === 0) {
        showToast("Your cart is empty.");
        return;
    }


    let message =
`Hello Maison Style DZ 👋

I would like to order:

`;


    cart.forEach((item, index) => {

        const total =
            getPriceNumber(item.price) * item.quantity;

        message +=
`${index + 1}. ${item.name}
Quantity: ${item.quantity}
Price: ${formatPrice(total)}

`;
    });


    const total =
        cart.reduce(
            (sum, item) => {
                return sum +
                    getPriceNumber(item.price) * item.quantity;
            },
            0
        );


    message +=
`Total: ${formatPrice(total)}

Please contact me to confirm the order. Thank you.`;


    openWhatsApp(message);
}


/* =========================
   PRODUCT BUTTONS
========================= */

function setupProductButtons() {

    const buttons =
        document.querySelectorAll("[data-action]");


    buttons.forEach(button => {

        button.addEventListener("click", function(event) {

            event.preventDefault();

            const action = this.dataset.action;
            const name = this.dataset.name;
            const price = this.dataset.price;


            if (!name || !price) {
                return;
            }


            if (action === "cart") {
                addToCart(name, price);
            }


            if (action === "order") {
                openOrder(name, price);
            }

        });

    });
}


/* =========================
   CART EVENTS
========================= */

function setupCartEvents() {

    cartItems.addEventListener("click", function(event) {

        const button =
            event.target.closest("[data-cart-action]");


        if (!button) {
            return;
        }


        const action =
            button.dataset.cartAction;

        const index =
            Number(button.dataset.index);


        if (!Number.isInteger(index)) {
            return;
        }


        if (action === "minus") {
            changeQuantity(index, -1);
        }

        if (action === "plus") {
            changeQuantity(index, 1);
        }

        if (action === "remove") {
            removeFromCart(index);
        }

    });
}


/* =========================
   FILTERS
========================= */

function setupFilters() {

    const filters =
        document.querySelectorAll(".filter");

    const products =
        document.querySelectorAll(".product-card");


    filters.forEach(filter => {

        filter.addEventListener("click", function() {

            filters.forEach(item => {
                item.classList.remove("active");
            });

            this.classList.add("active");


            const selected =
                this.dataset.filter;


            products.forEach(product => {

                const category =
                    product.dataset.category;


                if (
                    selected === "all" ||
                    selected === category
                ) {
                    product.style.display = "";
                } else {
                    product.style.display = "none";
                }

            });

        });

    });
}


/* =========================
   TOAST
========================= */

let toastTimer = null;


function showToast(message) {

    let toast =
        document.getElementById("site-toast");


    if (!toast) {

        toast = document.createElement("div");

        toast.id = "site-toast";

        toast.style.position = "fixed";
        toast.style.left = "50%";
        toast.style.bottom = "25px";
        toast.style.transform = "translateX(-50%) translateY(20px)";
        toast.style.zIndex = "99999";
        toast.style.background = "#111";
        toast.style.color = "#fff";
        toast.style.padding = "13px 20px";
        toast.style.borderRadius = "999px";
        toast.style.fontFamily = "DM Sans, Arial, sans-serif";
        toast.style.fontSize = "12px";
        toast.style.fontWeight = "700";
        toast.style.opacity = "0";
        toast.style.transition = "all .25s ease";
        toast.style.pointerEvents = "none";

        document.body.appendChild(toast);
    }


    toast.textContent = message;


    clearTimeout(toastTimer);


    requestAnimationFrame(() => {

        toast.style.opacity = "1";
        toast.style.transform =
            "translateX(-50%) translateY(0)";

    });


    toastTimer = setTimeout(() => {

        toast.style.opacity = "0";

        toast.style.transform =
            "translateX(-50%) translateY(20px)";

    }, 1800);
}


/* =========================
   ESCAPE HTML
========================= */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   GLOBAL EVENTS
========================= */

function setupGlobalEvents() {

    headerCartButton.addEventListener(
        "click",
        openCart
    );


    floatingCartButton.addEventListener(
        "click",
        openCart
    );


    closeCartButton.addEventListener(
        "click",
        closeCart
    );


    cartOverlay.addEventListener(
        "click",
        closeCart
    );


    closeOrderButton.addEventListener(
        "click",
        closeOrder
    );


    orderOverlay.addEventListener(
        "click",
        function(event) {

            if (event.target === orderOverlay) {
                closeOrder();
            }

        }
    );


    whatsappCartButton.addEventListener(
        "click",
        sendCartToWhatsApp
    );


    orderForm.addEventListener(
        "submit",
        submitOrder
    );


    document.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Escape") {
                closeCart();
                closeOrder();
            }

        }
    );
}


/* =========================
   START
========================= */

document.addEventListener("DOMContentLoaded", function() {

    setupProductButtons();

    setupCartEvents();

    setupFilters();

    setupGlobalEvents();

    updateCart();

});