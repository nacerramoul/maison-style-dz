```javascript
var selectedProduct = "";
var selectedPrice = "";
var cart = [];

var CART_KEY = "maisonStyleDZCart";
var WHATSAPP_NUMBER = "213562143229";


/* =========================
   HELPERS
========================= */

function priceToNumber(price) {
    return parseInt(String(price).replace(/[^\d]/g, ""), 10) || 0;
}

function saveCart() {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {}
}

function loadCart() {
    try {
        var saved = localStorage.getItem(CART_KEY);

        if (!saved) {
            cart = [];
            return;
        }

        var data = JSON.parse(saved);

        if (!Array.isArray(data)) {
            cart = [];
            return;
        }

        cart = data.filter(function(item) {
            return item &&
                   item.product &&
                   Number(item.price) > 0 &&
                   Number(item.quantity) > 0;
        });

    } catch (error) {
        cart = [];
    }
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   ORDER NOW
========================= */

function showOrderForm(product, price) {

    selectedProduct = product;
    selectedPrice = price;

    var form = document.getElementById("order-form");
    var name = document.getElementById("selected-product-name");
    var productPrice = document.getElementById("selected-product-price");

    if (!form) {
        return;
    }

    if (name) {
        name.textContent = product;
    }

    if (productPrice) {
        productPrice.textContent = price;
    }

    form.style.display = "block";

    setTimeout(function() {
        try {
            form.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        } catch (error) {
            form.scrollIntoView();
        }
    }, 100);
}


function submitOrder() {

    var nameElement = document.getElementById("customer-name");
    var phoneElement = document.getElementById("customer-phone");
    var cityElement = document.getElementById("customer-city");

    var name = nameElement ? nameElement.value.trim() : "";
    var phone = phoneElement ? phoneElement.value.trim() : "";
    var city = cityElement ? cityElement.value.trim() : "";

    if (!selectedProduct) {
        alert("Please select a product first.");
        return;
    }

    if (!name) {
        alert("Please enter your name.");
        return;
    }

    if (!phone) {
        alert("Please enter your phone number.");
        return;
    }

    if (!city) {
        alert("Please enter your city.");
        return;
    }

    var message =
        "Hello Maison Style DZ!\n\n" +
        "I would like to order:\n" +
        "Product: " + selectedProduct + "\n" +
        "Price: " + selectedPrice + "\n\n" +
        "Customer Information:\n" +
        "Name: " + name + "\n" +
        "Phone: " + phone + "\n" +
        "City: " + city;

    var url =
        "https://wa.me/" +
        WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(message);

    window.location.href = url;
}


/* =========================
   CART
========================= */

function addToCart(product, price) {

    var numericPrice = priceToNumber(price);

    if (!product || numericPrice <= 0) {
        return;
    }

    var existingItem = null;

    for (var i = 0; i < cart.length; i++) {
        if (
            cart[i].product === product &&
            Number(cart[i].price) === numericPrice
        ) {
            existingItem = cart[i];
            break;
        }
    }

    if (existingItem) {

        existingItem.quantity =
            Number(existingItem.quantity) + 1;

    } else {

        cart.push({
            product: product,
            price: numericPrice,
            quantity: 1
        });
    }

    saveCart();
    updateCart();

    alert("Added to cart ✓");
}


function updateCart() {

    var cartItems = document.getElementById("cart-items");
    var cartCount = document.getElementById("cart-count");
    var cartTotal = document.getElementById("cart-total");

    if (!cartItems) {
        return;
    }

    var total = 0;
    var count = 0;

    for (var i = 0; i < cart.length; i++) {

        var price = Number(cart[i].price);
        var quantity = Number(cart[i].quantity);

        total += price * quantity;
        count += quantity;
    }

    if (cartCount) {
        cartCount.textContent = count;
    }

    if (cartTotal) {
        cartTotal.textContent =
            total.toLocaleString("fr-DZ") + " DA";
    }

    if (cart.length === 0) {

        cartItems.innerHTML =
            '<p class="empty-cart">Your cart is empty.</p>';

        return;
    }

    var html = "";

    for (var j = 0; j < cart.length; j++) {

        var item = cart[j];

        var subtotal =
            Number(item.price) *
            Number(item.quantity);

        html +=
            '<div class="cart-item">' +

                '<div class="cart-item-title">' +
                    escapeHTML(item.product) +
                '</div>' +

                '<div class="cart-item-price">' +
                    Number(item.price).toLocaleString("fr-DZ") +
                    ' DA' +
                '</div>' +

                '<div class="cart-item-controls">' +

                    '<button type="button" ' +
                        'class="quantity-button" ' +
                        'data-cart-action="minus" ' +
                        'data-cart-index="' + j + '">' +
                        '−' +
                    '</button>' +

                    '<span>' +
                        item.quantity +
                    '</span>' +

                    '<button type="button" ' +
                        'class="quantity-button" ' +
                        'data-cart-action="plus" ' +
                        'data-cart-index="' + j + '">' +
                        '+' +
                    '</button>' +

                    '<button type="button" ' +
                        'class="remove-cart-item" ' +
                        'data-cart-action="remove" ' +
                        'data-cart-index="' + j + '">' +
                        'Remove' +
                    '</button>' +

                '</div>' +

                '<div class="cart-subtotal">' +
                    'Subtotal: ' +
                    subtotal.toLocaleString("fr-DZ") +
                    ' DA' +
                '</div>' +

            '</div>';
    }

    cartItems.innerHTML = html;
}


function removeFromCart(index) {

    if (index < 0 || index >= cart.length) {
        return;
    }

    cart.splice(index, 1);

    saveCart();
    updateCart();
}


function changeQuantity(index, change) {

    if (index < 0 || index >= cart.length) {
        return;
    }

    cart[index].quantity =
        Number(cart[index].quantity) + change;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveCart();
    updateCart();
}


/* =========================
   OPEN / CLOSE CART
========================= */

function openCart() {

    var panel = document.getElementById("cart-panel");

    if (!panel) {
        return;
    }

    loadCart();
    updateCart();

    panel.classList.add("cart-open");

    document.body.classList.add("cart-is-open");
}


function closeCart() {

    var panel = document.getElementById("cart-panel");

    if (!panel) {
        return;
    }

    panel.classList.remove("cart-open");

    document.body.classList.remove("cart-is-open");
}


/* =========================
   CART WHATSAPP
========================= */

function sendCartToWhatsApp() {

    loadCart();

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    var nameElement =
        document.getElementById("cart-customer-name");

    var phoneElement =
        document.getElementById("cart-customer-phone");

    var cityElement =
        document.getElementById("cart-customer-city");

    var name =
        nameElement ? nameElement.value.trim() : "";

    var phone =
        phoneElement ? phoneElement.value.trim() : "";

    var city =
        cityElement ? cityElement.value.trim() : "";

    if (!name) {
        alert("Please enter your name.");
        return;
    }

    if (!phone) {
        alert("Please enter your phone number.");
        return;
    }

    if (!city) {
        alert("Please enter your city.");
        return;
    }

    var total = 0;
    var lines = "";

    for (var i = 0; i < cart.length; i++) {

        var item = cart[i];

        var subtotal =
            Number(item.price) *
            Number(item.quantity);

        total += subtotal;

        lines +=
            (i + 1) +
            ". " +
            item.product +
            " x" +
            item.quantity +
            " - " +
            subtotal.toLocaleString("fr-DZ") +
            " DA\n";
    }

    var message =
        "Hello Maison Style DZ!\n\n" +
        "I would like to order:\n\n" +
        lines +
        "\nTotal: " +
        total.toLocaleString("fr-DZ") +
        " DA\n\n" +
        "Customer Information:\n" +
        "Name: " + name + "\n" +
        "Phone: " + phone + "\n" +
        "City: " + city;

    var url =
        "https://wa.me/" +
        WHATSAPP_NUMBER +
        "?text=" +
        encodeURIComponent(message);

    window.location.href = url;
}


/* =========================
   SEARCH
========================= */

function setupProductSearch() {

    var input =
        document.getElementById("product-search");

    if (!input) {
        return;
    }

    var products =
        document.querySelectorAll(".product-card");

    var noProducts =
        document.getElementById("no-products");

    input.addEventListener("input", function() {

        var term =
            input.value.toLowerCase().trim();

        var visible = 0;

        for (var i = 0; i < products.length; i++) {

            var card = products[i];

            var name =
                (card.getAttribute("data-name") || "")
                    .toLowerCase();

            var category =
                (card.getAttribute("data-category") || "")
                    .toLowerCase();

            var show =
                name.indexOf(term) !== -1 ||
                category.indexOf(term) !== -1;

            card.style.display =
                show ? "" : "none";

            if (show) {
                visible++;
            }
        }

        if (noProducts) {
            noProducts.style.display =
                visible === 0 ? "block" : "none";
        }
    });
}


/* =========================
   CATEGORY FILTER
========================= */

function setupCategoryFilters() {

    var filters =
        document.querySelectorAll(".category-filter");

    var products =
        document.querySelectorAll(".product-card");

    for (var i = 0; i < filters.length; i++) {

        (function(filter) {

            filter.addEventListener("click", function() {

                for (var x = 0; x < filters.length; x++) {
                    filters[x].classList.remove("active");
                }

                filter.classList.add("active");

                var category =
                    filter.getAttribute("data-category");

                for (var y = 0; y < products.length; y++) {

                    var productCategory =
                        products[y].getAttribute("data-category");

                    if (
                        category === "all" ||
                        productCategory === category
                    ) {
                        products[y].style.display = "";
                    } else {
                        products[y].style.display = "none";
                    }
                }
            });

        })(filters[i]);
    }
}


/* =========================
   CART BUTTONS
========================= */

function setupCartButtons() {

    var cartItems =
        document.getElementById("cart-items");

    if (!cartItems) {
        return;
    }

    cartItems.addEventListener("click", function(event) {

        var target = event.target;
        var button = null;

        while (
            target &&
            target !== cartItems
        ) {
            if (
                target.tagName &&
                target.tagName.toLowerCase() === "button" &&
                target.getAttribute("data-cart-action")
            ) {
                button = target;
                break;
            }

            target = target.parentNode;
        }

        if (!button) {
            return;
        }

        var index =
            Number(button.getAttribute("data-cart-index"));

        var action =
            button.getAttribute("data-cart-action");

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
   PRODUCT BUTTONS
========================= */

function setupProductButtons() {

    var products =
        document.querySelectorAll(".product-card");

    for (var i = 0; i < products.length; i++) {

        (function(card) {

            var buttons =
                card.querySelectorAll("button");

            if (buttons.length < 2) {
                return;
            }

            var product =
                card.getAttribute("data-name") || "";

            var priceElement =
                card.querySelector(".price");

            var price =
                priceElement
                    ? priceElement.textContent.trim()
                    : "";

            var orderButton = buttons[0];
            var cartButton = buttons[1];

            orderButton.addEventListener("click", function(event) {

                event.preventDefault();

                showOrderForm(product, price);
            });

            cartButton.addEventListener("click", function(event) {

                event.preventDefault();

                addToCart(product, price);
            });

            orderButton.addEventListener("touchend", function(event) {

                event.preventDefault();

                showOrderForm(product, price);
            });

            cartButton.addEventListener("touchend", function(event) {

                event.preventDefault();

                addToCart(product, price);
            });

        })(products[i]);
    }
}


/* =========================
   BACK TO TOP
========================= */

function setupBackToTop() {

    var button =
        document.getElementById("back-to-top");

    if (!button) {
        return;
    }

    window.addEventListener("scroll", function() {

        if (window.scrollY > 500) {
            button.classList.add("show");
        } else {
            button.classList.remove("show");
        }
    });

    button.addEventListener("click", function() {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}


/* =========================
   START
========================= */

document.addEventListener("DOMContentLoaded", function() {

    loadCart();

    updateCart();

    setupProductButtons();

    setupCartButtons();

    setupProductSearch();

    setupCategoryFilters();

    setupBackToTop();

});
```
