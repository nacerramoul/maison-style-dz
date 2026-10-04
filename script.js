```javascript
/* =========================================
   MAISON STYLE DZ
   MAIN JAVASCRIPT
========================================= */

let selectedProduct = "";
let selectedPrice = "";
let cart = [];

const CART_KEY = "maisonStyleDZCart";


/* =========================================
   CART STORAGE
========================================= */

function saveCart() {
    try {
        localStorage.setItem(
            CART_KEY,
            JSON.stringify(cart)
        );
    } catch (error) {
        console.log("Could not save cart.");
    }
}


function loadCart() {
    try {
        const savedCart = localStorage.getItem(CART_KEY);

        if (!savedCart) {
            cart = [];
            return;
        }

        const data = JSON.parse(savedCart);

        if (!Array.isArray(data)) {
            cart = [];
            return;
        }

        cart = data
            .map(function (item) {
                return {
                    product: String(item.product || ""),
                    price: Number(item.price) || 0,
                    quantity: Number(item.quantity) || 0
                };
            })
            .filter(function (item) {
                return (
                    item.product !== "" &&
                    item.price > 0 &&
                    item.quantity > 0
                );
            });

    } catch (error) {
        cart = [];
    }
}


/* =========================================
   PRICE
========================================= */

function priceToNumber(price) {
    return parseInt(
        String(price).replace(/[^\d]/g, ""),
        10
    ) || 0;
}


/* =========================================
   ORDER FORM
========================================= */

function showOrderForm(product, price) {

    selectedProduct = product;
    selectedPrice = price;

    const form = document.getElementById("order-form");
    const productName =
        document.getElementById("selected-product-name");
    const productPrice =
        document.getElementById("selected-product-price");

    if (!form) {
        return;
    }

    if (productName) {
        productName.textContent = product;
    }

    if (productPrice) {
        productPrice.textContent = price;
    }

    form.style.display = "block";

    setTimeout(function () {
        form.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }, 100);
}


/* =========================================
   SINGLE PRODUCT ORDER
========================================= */

function submitOrder() {

    const nameInput =
        document.getElementById("customer-name");

    const phoneInput =
        document.getElementById("customer-phone");

    const cityInput =
        document.getElementById("customer-city");

    const name = nameInput
        ? nameInput.value.trim()
        : "";

    const phone = phoneInput
        ? phoneInput.value.trim()
        : "";

    const city = cityInput
        ? cityInput.value.trim()
        : "";


    if (!selectedProduct) {
        alert("Please select a product first.");
        return;
    }

    if (!name) {
        alert("Please enter your name.");

        if (nameInput) {
            nameInput.focus();
        }

        return;
    }

    if (!phone) {
        alert("Please enter your phone number.");

        if (phoneInput) {
            phoneInput.focus();
        }

        return;
    }

    if (!city) {
        alert("Please enter your city.");

        if (cityInput) {
            cityInput.focus();
        }

        return;
    }


    const message =
        "Hello Maison Style DZ!\n\n" +
        "I would like to order:\n" +
        "Product: " + selectedProduct + "\n" +
        "Price: " + selectedPrice + "\n\n" +
        "Customer Information:\n" +
        "Name: " + name + "\n" +
        "Phone: " + phone + "\n" +
        "City: " + city;


    const whatsappURL =
        "https://wa.me/213562143229?text=" +
        encodeURIComponent(message);


    window.open(whatsappURL, "_blank");
}


/* =========================================
   ADD TO CART
========================================= */

function addToCart(product, price) {

    const numericPrice = priceToNumber(price);

    if (!product || numericPrice <= 0) {
        return;
    }


    const existingItem = cart.find(function (item) {
        return (
            item.product === product &&
            item.price === numericPrice
        );
    });


    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            product: product,
            price: numericPrice,
            quantity: 1
        });
    }


    saveCart();
    updateCart();
    showCartFeedback();
}


/* =========================================
   CART FEEDBACK
========================================= */

function showCartFeedback() {

    const button =
        document.querySelector(".cart-floating button");

    if (!button) {
        return;
    }

    if (typeof button.animate === "function") {
        button.animate(
            [
                { transform: "scale(1)" },
                { transform: "scale(1.12)" },
                { transform: "scale(1)" }
            ],
            {
                duration: 300
            }
        );
    }
}


/* =========================================
   UPDATE CART
========================================= */

function updateCart() {

    const cartItems =
        document.getElementById("cart-items");

    const cartCount =
        document.getElementById("cart-count");

    const cartTotal =
        document.getElementById("cart-total");


    if (!cartItems) {
        return;
    }


    let total = 0;
    let quantityCount = 0;


    cart.forEach(function (item) {

        total += item.price * item.quantity;
        quantityCount += item.quantity;

    });


    if (cartCount) {
        cartCount.textContent = quantityCount;
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


    let html = "";


    cart.forEach(function (item, index) {

        const subtotal =
            item.price * item.quantity;


        html +=
            '<div class="cart-item">' +

                '<div class="cart-item-title">' +
                    escapeHTML(item.product) +
                '</div>' +

                '<div class="cart-item-price">' +
                    item.price.toLocaleString("fr-DZ") +
                    ' DA' +
                '</div>' +

                '<div class="cart-item-controls">' +

                    '<button ' +
                        'type="button" ' +
                        'onclick="changeQuantity(' +
                        index +
                        ', -1)">' +
                        '−' +
                    '</button>' +

                    '<span>' +
                        item.quantity +
                    '</span>' +

                    '<button ' +
                        'type="button" ' +
                        'onclick="changeQuantity(' +
                        index +
                        ', 1)">' +
                        '+' +
                    '</button>' +

                    '<button ' +
                        'type="button" ' +
                        'class="remove-cart-item" ' +
                        'onclick="removeFromCart(' +
                        index +
                        ')">' +
                        'Remove' +
                    '</button>' +

                '</div>' +

                '<div class="cart-subtotal">' +
                    'Subtotal: ' +
                    subtotal.toLocaleString("fr-DZ") +
                    ' DA' +
                '</div>' +

            '</div>';

    });


    cartItems.innerHTML = html;
}


/* =========================================
   REMOVE ITEM
========================================= */

function removeFromCart(index) {

    if (index < 0 || index >= cart.length) {
        return;
    }

    cart.splice(index, 1);

    saveCart();
    updateCart();
}


/* =========================================
   CHANGE QUANTITY
========================================= */

function changeQuantity(index, change) {

    if (index < 0 || index >= cart.length) {
        return;
    }

    cart[index].quantity += change;


    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }


    saveCart();
    updateCart();
}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================
   OPEN CART
========================================= */

function openCart() {

    const panel =
        document.getElementById("cart-panel");

    if (!panel) {
        return;
    }

    loadCart();
    updateCart();

    panel.classList.add("cart-open");
    document.body.classList.add("cart-is-open");
}


/* =========================================
   CLOSE CART
========================================= */

function closeCart() {

    const panel =
        document.getElementById("cart-panel");

    if (!panel) {
        return;
    }

    panel.classList.remove("cart-open");
    document.body.classList.remove("cart-is-open");
}


/* =========================================
   SEND CART TO WHATSAPP
========================================= */

function sendCartToWhatsApp() {

    loadCart();
    updateCart();


    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }


    const nameInput =
        document.getElementById("cart-customer-name");

    const phoneInput =
        document.getElementById("cart-customer-phone");

    const cityInput =
        document.getElementById("cart-customer-city");


    const name = nameInput
        ? nameInput.value.trim()
        : "";

    const phone = phoneInput
        ? phoneInput.value.trim()
        : "";

    const city = cityInput
        ? cityInput.value.trim()
        : "";


    if (!name) {
        alert("Please enter your name.");

        if (nameInput) {
            nameInput.focus();
        }

        return;
    }


    if (!phone) {
        alert("Please enter your phone number.");

        if (phoneInput) {
            phoneInput.focus();
        }

        return;
    }


    if (!city) {
        alert("Please enter your city.");

        if (cityInput) {
            cityInput.focus();
        }

        return;
    }


    let total = 0;
    let orderLines = "";


    cart.forEach(function (item, index) {

        const subtotal =
            item.price * item.quantity;

        total += subtotal;


        orderLines +=
            (index + 1) +
            ". " +
            item.product +
            " x" +
            item.quantity +
            " - " +
            subtotal.toLocaleString("fr-DZ") +
            " DA\n";

    });


    const message =
        "Hello Maison Style DZ!\n\n" +
        "I would like to order:\n\n" +
        orderLines +
        "\nTotal: " +
        total.toLocaleString("fr-DZ") +
        " DA\n\n" +
        "Customer Information:\n" +
        "Name: " +
        name +
        "\nPhone: " +
        phone +
        "\nCity: " +
        city;


    const whatsappURL =
        "https://wa.me/213562143229?text=" +
        encodeURIComponent(message);


    window.open(
        whatsappURL,
        "_blank"
    );
}


/* =========================================
   SEARCH
========================================= */

function setupProductSearch() {

    const searchInput =
        document.getElementById("product-search");

    const products =
        document.querySelectorAll(".product-card");

    const noProducts =
        document.getElementById("no-products");


    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "input",
        function () {

            const term =
                searchInput.value
                    .toLowerCase()
                    .trim();


            let visibleCount = 0;


            products.forEach(function (card) {

                const name =
                    (
                        card.dataset.name ||
                        card.textContent
                    ).toLowerCase();


                const category =
                    (
                        card.dataset.category ||
                        ""
                    ).toLowerCase();


                const match =
                    name.includes(term) ||
                    category.includes(term);


                if (match) {
                    card.style.display = "";
                    visibleCount++;
                } else {
                    card.style.display = "none";
                }

            });


            if (noProducts) {
                noProducts.style.display =
                    visibleCount === 0
                        ? "block"
                        : "none";
            }

        }
    );
}


/* =========================================
   CATEGORY FILTER
========================================= */

function setupCategoryFilters() {

    const filters =
        document.querySelectorAll(".category-filter");

    const products =
        document.querySelectorAll(".product-card");

    const noProducts =
        document.getElementById("no-products");


    filters.forEach(function (filter) {

        filter.addEventListener(
            "click",
            function () {

                filters.forEach(function (item) {
                    item.classList.remove("active");
                });


                filter.classList.add("active");


                const category =
                    filter.dataset.category;


                let visibleCount = 0;


                products.forEach(function (product) {

                    const productCategory =
                        product.dataset.category;


                    const show =
                        category === "all" ||
                        productCategory === category;


                    if (show) {
                        product.style.display = "";
                        visibleCount++;
                    } else {
                        product.style.display = "none";
                    }

                });


                const searchInput =
                    document.getElementById(
                        "product-search"
                    );


                if (searchInput) {
                    searchInput.value = "";
                }


                if (noProducts) {
                    noProducts.style.display =
                        visibleCount === 0
                            ? "block"
                            : "none";
                }

            }
        );

    });
}


/* =========================================
   BACK TO TOP
========================================= */

function setupBackToTop() {

    const button =
        document.getElementById("back-to-top");


    if (!button) {
        return;
    }


    window.addEventListener(
        "scroll",
        function () {

            if (window.scrollY > 500) {
                button.classList.add("show");
            } else {
                button.classList.remove("show");
            }

        }
    );


    button.addEventListener(
        "click",
        function () {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );
}


/* =========================================
   ESC KEY
========================================= */

function setupEscapeKey() {

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {
                closeCart();
            }

        }
    );
}


/* =========================================
   CART BACKDROP
========================================= */

function setupCartBackdrop() {

    const panel =
        document.getElementById("cart-panel");


    if (!panel) {
        return;
    }


    panel.addEventListener(
        "click",
        function (event) {

            if (event.target === panel) {
                closeCart();
            }

        }
    );
}


/* =========================================
   IMAGE FALLBACK
========================================= */

function setupImageFallback() {

    const images =
        document.querySelectorAll(
            ".product-image img"
        );


    images.forEach(function (image) {

        image.addEventListener(
            "error",
            function () {

                image.style.display = "none";

                const parent =
                    image.parentElement;


                if (parent) {
                    parent.style.background =
                        "#eee4d8";
                }

            }
        );

    });
}


/* =========================================
   ORDER FORM
========================================= */

function setupOrderForm() {

    const form =
        document.getElementById("order-form");


    if (!form) {
        return;
    }


    const inputs =
        form.querySelectorAll("input");


    inputs.forEach(function (input) {

        input.addEventListener(
            "input",
            function () {
                input.style.borderColor = "";
            }
        );

    });
}


/* =========================================
   SCROLL ANIMATION
========================================= */

function setupScrollAnimations() {

    if (!("IntersectionObserver" in window)) {
        return;
    }


    const elements =
        document.querySelectorAll(
            ".product-card, .why-card, .trust-card, .offer-box, .help-box, .contact-info > div"
        );


    if (!elements.length) {
        return;
    }


    elements.forEach(function (element) {

        element.style.opacity = "0";

        element.style.transform =
            "translateY(20px)";

        element.style.transition =
            "opacity 0.6s ease, transform 0.6s ease";

    });


    const observer =
        new IntersectionObserver(
            function (entries) {

                entries.forEach(function (entry) {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.style.opacity = "1";

                    entry.target.style.transform =
                        "translateY(0)";

                    observer.unobserve(
                        entry.target
                    );

                });

            },
            {
                threshold: 0.12
            }
        );


    elements.forEach(function (element) {
        observer.observe(element);
    });
}


/* =========================================
   START WEBSITE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCart();
        updateCart();

        setupProductSearch();
        setupCategoryFilters();
        setupBackToTop();
        setupEscapeKey();
        setupCartBackdrop();
        setupImageFallback();
        setupOrderForm();
        setupScrollAnimations();

    }
);
```
