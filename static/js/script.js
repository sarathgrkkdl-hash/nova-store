/* =====================================================
   NOVASTORE — ECOMMERCE JAVASCRIPT
   ===================================================== */


/* =====================================================
   PRODUCT DATABASE (Loaded dynamically from Django database)
   ===================================================== */

const productsDataElement = document.getElementById("products-data");
let dynamicProducts = [];

if (productsDataElement && productsDataElement.textContent.trim()) {
    try {
        dynamicProducts = JSON.parse(productsDataElement.textContent);
    } catch (err) {
        console.error("Failed to parse database products JSON:", err);
    }
}

const products = dynamicProducts.length > 0 ? dynamicProducts : [
    {
        id: 1,
        name: "Aero Wireless Headphones",
        category: "Electronics",
        price: 129,
        oldPrice: 159,
        rating: 4.9,
        reviews: 328,
        emoji: "🎧",
        color: "linear-gradient(135deg,#d9d8ff,#8e89ff)",
        badge: "BESTSELLER"
    }
];



/* =====================================================
   STATE
   ===================================================== */

let cart = JSON.parse(
    localStorage.getItem("novaCart")
) || [];

let wishlist = JSON.parse(
    localStorage.getItem("novaWishlist")
) || [];

let currentFilter = "All";

let promoApplied = false;


/* =====================================================
   DOM
   ===================================================== */

const productsGrid =
    document.getElementById("productsGrid");

const emptyProducts =
    document.getElementById("emptyProducts");

const cartDrawer =
    document.getElementById("cartDrawer");

const cartOverlay =
    document.getElementById("cartOverlay");

const cartItems =
    document.getElementById("cartItems");

const cartEmpty =
    document.getElementById("cartEmpty");

const cartFooter =
    document.getElementById("cartFooter");

const cartCount =
    document.getElementById("cartCount");

const subtotalElement =
    document.getElementById("subtotal");

const shippingElement =
    document.getElementById("shipping");

const discountElement =
    document.getElementById("discount");

const totalElement =
    document.getElementById("cartTotal");

const toast =
    document.getElementById("toast");

const checkoutModal =
    document.getElementById("checkoutModal");

const successModal =
    document.getElementById("successModal");


/* =====================================================
   SAVE STATE
   ===================================================== */

function saveCart() {

    localStorage.setItem(
        "novaCart",
        JSON.stringify(cart)
    );

}

function saveWishlist() {

    localStorage.setItem(
        "novaWishlist",
        JSON.stringify(wishlist)
    );

}


/* =====================================================
   RENDER PRODUCTS
   ===================================================== */

function renderProducts() {

    const searchTerm =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase()
            .trim();

    const filteredProducts =
        products.filter(product => {

            const matchesCategory =
                currentFilter === "All" ||
                product.category === currentFilter;

            const matchesSearch =
                product.name
                    .toLowerCase()
                    .includes(searchTerm) ||

                product.category
                    .toLowerCase()
                    .includes(searchTerm);

            return matchesCategory && matchesSearch;

        });


    productsGrid.innerHTML = "";


    if (filteredProducts.length === 0) {

        emptyProducts.classList.add("show");

        return;

    }


    emptyProducts.classList.remove("show");


    filteredProducts.forEach(product => {

        const isWishlisted =
            wishlist.includes(product.id);

        const oldPriceHtml = product.oldPrice
            ? `<span class="old-price">$${Number(product.oldPrice).toFixed(2)}</span>`
            : "";

        const visualHtml = product.image
            ? `<img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:18px;">`
            : `<span class="product-emoji">${product.emoji || "🛍️"}</span>`;

        const card =
            document.createElement("article");

        card.className = "product-card";


        card.innerHTML = `

            <div
                class="product-image"
                style="background:${product.color || "var(--bg-soft)"}"
            >

                <span class="product-badge">
                    ${product.badge || "POPULAR"}
                </span>

                <button
                    class="wishlist ${isWishlisted ? "active" : ""}"
                    data-wishlist="${product.id}"
                    aria-label="Add to wishlist"
                >
                    ${isWishlisted ? "♥" : "♡"}
                </button>

                ${visualHtml}

            </div>


            <div class="product-info">

                <div class="product-category">
                    ${product.category}
                </div>

                <h3 class="product-name">
                    ${product.name}
                </h3>

                <div class="product-rating">

                    ★★★★★

                    <span>
                        ${product.rating} (${product.reviews})
                    </span>

                </div>

                <div class="product-bottom">

                    <div class="price">

                        $${Number(product.price).toFixed(2)}

                        ${oldPriceHtml}

                    </div>

                    <button
                        class="add-cart"
                        data-id="${product.id}"
                        aria-label="Add to cart"
                    >
                        +
                    </button>

                </div>

            </div>
        `;


        productsGrid.appendChild(card);

    });


    attachProductEvents();

}


/* =====================================================
   PRODUCT EVENTS
   ===================================================== */

function attachProductEvents() {

    document
        .querySelectorAll(".add-cart")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(button.dataset.id);

                    addToCart(id);

                }
            );

        });


    document
        .querySelectorAll("[data-wishlist]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset.wishlist
                        );

                    toggleWishlist(id);

                }
            );

        });

}


/* =====================================================
   ADD TO CART
   ===================================================== */

function addToCart(productId) {

    const existing =
        cart.find(item => item.id === productId);


    if (existing) {

        existing.quantity++;

    } else {

        cart.push({
            id: productId,
            quantity: 1
        });

    }


    saveCart();

    renderCart();

    showToast(
        "Added to cart",
        "Your product was added successfully."
    );

}


/* =====================================================
   REMOVE FROM CART
   ===================================================== */

function removeFromCart(productId) {

    cart =
        cart.filter(
            item => item.id !== productId
        );

    saveCart();

    renderCart();

}


/* =====================================================
   CHANGE QUANTITY
   ===================================================== */

function changeQuantity(
    productId,
    amount
) {

    const item =
        cart.find(
            item => item.id === productId
        );


    if (!item) return;


    item.quantity += amount;


    if (item.quantity <= 0) {

        removeFromCart(productId);

        return;

    }


    saveCart();

    renderCart();

}


/* =====================================================
   CART TOTAL
   ===================================================== */

function calculateSubtotal() {

    return cart.reduce(
        (total, item) => {

            const product =
                products.find(
                    p => p.id === item.id
                );

            return total +
                product.price * item.quantity;

        },
        0
    );

}


/* =====================================================
   RENDER CART
   ===================================================== */

function renderCart() {

    cartItems.innerHTML = "";


    const totalQuantity =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    cartCount.textContent =
        totalQuantity;


    if (cart.length === 0) {

        cartEmpty.classList.remove("hidden");

        cartFooter.style.display = "none";

        return;

    }


    cartEmpty.classList.add("hidden");

    cartFooter.style.display = "block";


    cart.forEach(item => {

        const product =
            products.find(
                p => p.id === item.id
            );


        if (!product) return;


        const cartItem =
            document.createElement("div");

        cartItem.className = "cart-item";


        const cartVisual = product.image
            ? `<img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`
            : `${product.emoji || "🛍️"}`;

        cartItem.innerHTML = `

            <div
                class="cart-item-image"
                style="background:${product.color || 'var(--bg-soft)'}"
            >
                ${cartVisual}
            </div>


            <div class="cart-item-info">

                <h4>
                    ${product.name}
                </h4>

                <p>
                    ${product.category}
                </p>

                <strong class="cart-item-price">
                    $${(
                        product.price *
                        item.quantity
                    ).toFixed(2)}
                </strong>

                <div class="quantity">

                    <button
                        data-action="minus"
                        data-id="${product.id}"
                    >
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        data-action="plus"
                        data-id="${product.id}"
                    >
                        +
                    </button>

                </div>

            </div>


            <button
                class="remove-item"
                data-remove="${product.id}"
            >
                Remove
            </button>
        `;


        cartItems.appendChild(cartItem);

    });


    attachCartEvents();

    updateCartSummary();

}


/* =====================================================
   CART EVENTS
   ===================================================== */

function attachCartEvents() {

    document
        .querySelectorAll("[data-action]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(button.dataset.id);

                    const action =
                        button.dataset.action;

                    changeQuantity(
                        id,
                        action === "plus" ? 1 : -1
                    );

                }
            );

        });


    document
        .querySelectorAll("[data-remove]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    removeFromCart(
                        Number(
                            button.dataset.remove
                        )
                    );

                }
            );

        });

}


/* =====================================================
   CART SUMMARY
   ===================================================== */

function updateCartSummary() {

    const subtotal =
        calculateSubtotal();


    const shipping =
        subtotal === 0
            ? 0
            : subtotal >= 50
                ? 0
                : 8;


    const discount =
        promoApplied
            ? subtotal * 0.25
            : 0;


    const total =
        subtotal +
        shipping -
        discount;


    subtotalElement.textContent =
        `$${subtotal.toFixed(2)}`;

    shippingElement.textContent =
        shipping === 0
            ? "FREE"
            : `$${shipping.toFixed(2)}`;

    discountElement.textContent =
        `-$${discount.toFixed(2)}`;

    totalElement.textContent =
        `$${Math.max(total, 0).toFixed(2)}`;

}


/* =====================================================
   WISHLIST
   ===================================================== */

function toggleWishlist(productId) {

    if (wishlist.includes(productId)) {

        wishlist =
            wishlist.filter(
                id => id !== productId
            );

        showToast(
            "Removed",
            "Product removed from wishlist."
        );

    } else {

        wishlist.push(productId);

        showToast(
            "Wishlist",
            "Product added to your wishlist."
        );

    }


    saveWishlist();

    updateWishlistCount();

    renderProducts();

}


/* =====================================================
   WISHLIST COUNT
   ===================================================== */

function updateWishlistCount() {

    const element =
        document.querySelector(
            ".wishlist-count"
        );


    element.textContent =
        wishlist.length;


    if (wishlist.length > 0) {

        element.classList.add("show");

    } else {

        element.classList.remove("show");

    }

}


/* =====================================================
   CART OPEN / CLOSE
   ===================================================== */

function openCart() {

    cartDrawer.classList.add("active");

    cartOverlay.classList.add("active");

    document.body.style.overflow = "hidden";

}


function closeCart() {

    cartDrawer.classList.remove("active");

    cartOverlay.classList.remove("active");

    document.body.style.overflow = "";

}


document
    .getElementById("openCart")
    .addEventListener(
        "click",
        openCart
    );


document
    .getElementById("closeCart")
    .addEventListener(
        "click",
        closeCart
    );


cartOverlay.addEventListener(
    "click",
    closeCart
);


document
    .getElementById("continueShopping")
    .addEventListener(
        "click",
        closeCart
    );


/* =====================================================
   FILTERS
   ===================================================== */

document
    .querySelectorAll(".filter")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".filter")
                    .forEach(btn =>
                        btn.classList.remove(
                            "active"
                        )
                    );


                button.classList.add("active");


                currentFilter =
                    button.dataset.filter;


                renderProducts();

            }
        );

    });


/* =====================================================
   CATEGORY CARDS
   ===================================================== */

document
    .querySelectorAll(".category-card")
    .forEach(card => {

        card.addEventListener(
            "click",
            () => {

                currentFilter =
                    card.dataset.category;


                document
                    .querySelectorAll(".filter")
                    .forEach(button => {

                        button.classList.toggle(
                            "active",
                            button.dataset.filter ===
                            currentFilter
                        );

                    });


                document
                    .getElementById("shop")
                    .scrollIntoView({
                        behavior: "smooth"
                    });


                renderProducts();

            }
        );

    });


/* =====================================================
   SEARCH
   ===================================================== */

const searchPanel =
    document.getElementById(
        "searchPanel"
    );


document
    .querySelector(".search-toggle")
    .addEventListener(
        "click",
        () => {

            searchPanel.classList.add("active");

            document
                .getElementById("searchInput")
                .focus();

        }
    );


document
    .getElementById("closeSearch")
    .addEventListener(
        "click",
        () => {

            searchPanel.classList.remove(
                "active"
            );

        }
    );


document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        renderProducts
    );


/* =====================================================
   MOBILE MENU
   ===================================================== */

document
    .getElementById("mobileMenu")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("mobileNav")
                .classList.toggle("active");

        }
    );


document
    .querySelectorAll(".mobile-nav a")
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                document
                    .getElementById("mobileNav")
                    .classList.remove(
                        "active"
                    );

            }
        );

    });


/* =====================================================
   PROMO CODE
   ===================================================== */

document
    .getElementById("applyPromo")
    .addEventListener(
        "click",
        () => {

            const code =
                document
                    .getElementById("promoInput")
                    .value
                    .trim()
                    .toUpperCase();


            if (code === "NOVA25") {

                promoApplied = true;

                updateCartSummary();

                showToast(
                    "Promo applied",
                    "You saved 25% on your order."
                );

            } else {

                showToast(
                    "Invalid code",
                    "Try using NOVA25."
                );

            }

        }
    );


/* =====================================================
   CHECKOUT
   ===================================================== */

document
    .getElementById("checkoutButton")
    .addEventListener(
        "click",
        () => {

            if (cart.length === 0) {

                showToast(
                    "Your cart is empty",
                    "Add a product before checkout."
                );

                return;

            }


            checkoutModal.classList.add(
                "active"
            );

        }
    );


document
    .getElementById("closeCheckout")
    .addEventListener(
        "click",
        () => {

            checkoutModal.classList.remove(
                "active"
            );

        }
    );


/* =====================================================
   CHECKOUT FORM
   ===================================================== */

document
    .getElementById("checkoutForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const orderNumber =
                "NOVA-" +
                Math.floor(
                    100000 +
                    Math.random() * 900000
                );


            document
                .getElementById(
                    "orderNumber"
                )
                .textContent =
                `Order #${orderNumber}`;


            checkoutModal.classList.remove(
                "active"
            );


            cart = [];

            promoApplied = false;

            saveCart();

            renderCart();

            successModal.classList.add(
                "active"
            );

        }
    );


/* =====================================================
   SUCCESS BUTTON
   ===================================================== */

document
    .getElementById("successButton")
    .addEventListener(
        "click",
        () => {

            successModal.classList.remove(
                "active"
            );

            closeCart();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );


/* =====================================================
   DEAL BUTTON
   ===================================================== */

document
    .getElementById("dealButton")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("shop")
                .scrollIntoView({
                    behavior: "smooth"
                });


            showToast(
                "Deal activated",
                "Use NOVA25 at checkout for 25% off."
            );

        }
    );


/* =====================================================
   NEWSLETTER
   ===================================================== */

document
    .getElementById("newsletterForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const email =
                document
                    .getElementById("emailInput")
                    .value;


            if (!email) return;


            showToast(
                "You're subscribed!",
                "Welcome to the NovaStore community."
            );


            event.target.reset();

        }
    );


/* =====================================================
   TOAST
   ===================================================== */

let toastTimer;


function showToast(
    title,
    message
) {

    document
        .getElementById("toastTitle")
        .textContent = title;


    document
        .getElementById("toastMessage")
        .textContent = message;


    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =====================================================
   KEYBOARD SUPPORT
   ===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            closeCart();

            searchPanel.classList.remove(
                "active"
            );

            checkoutModal.classList.remove(
                "active"
            );

            successModal.classList.remove(
                "active"
            );

        }

    }
);


/* =====================================================
   INITIALIZE
   ===================================================== */

renderProducts();

renderCart();

updateWishlistCount();