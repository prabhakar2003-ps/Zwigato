const CART_STORAGE_KEY = 'zwigatoCart';

document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.querySelector('.cartItems');
    const subtotalEl = document.getElementById('cartSubtotal');
    const deliveryFeeEl = document.getElementById('cartDeliveryFee');
    const gstEl = document.getElementById('cartGst');
    const totalEl = document.getElementById('cartTotal');

    const cart = loadCart();
    renderCart(cart);
    restoreAddedButtons(cart);

    document.querySelectorAll('.card-body .bttn').forEach(button => {
        button.addEventListener('click', () => addToCart(button, cart));
    });



    function displayCartxShow(subTotal) {
        const cart = document.querySelector('.cart');
        const showSection = document.querySelector('.showSection');
        const cartIcon = document.querySelector('.fa-cart-shopping');
        if (!cart || !showSection) return;

        const currentDisplay = window.getComputedStyle(cartIcon).color;
        if (Number(subTotal) > 0 || currentDisplay === 'orange') {
            cart.style.display = 'block';
            showSection.style.display = 'none';
        } else {
            cart.style.display = 'none';
            showSection.style.display = 'block';
        }
    }

    // window.cartbtn = function() {
    //     const cart = document.querySelector('.cart');
    //     const showSection = document.querySelector('.showSection');
    //     const cartIcon = document.querySelector('.fa-cart-shopping');
    //     if (!cart || !cartIcon || !showSection) return;

    //     const currentDisplay = window.getComputedStyle(cart).display;
    //     if (currentDisplay === 'none') {
    //         cart.style.display = 'block';
    //         showSection.style.display = 'none';
    //         cartIcon.style.color = 'orange';
    //     } else {
    //         cart.style.display = 'none';
    //         showSection.style.display = 'block';
    //         cartIcon.style.color = '';
    //     }
    // }




    function addToCart(button, cartArray) {
        const card = button.closest('.card');
        if (!card) return;

        const imageEl = card.querySelector('.item-image');
        const nameEl = card.querySelector('.item-name');
        const priceEl = card.querySelector('.item-price');
        if (!imageEl || !nameEl || !priceEl) return;

        const name = nameEl.textContent.trim();
        const image = imageEl.src;
        const price = parsePrice(priceEl.textContent);

        const existingItem = cartArray.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cartArray.push({ id: name, name, image, price, quantity: 1 });
        }

        saveCart(cartArray);
        renderCart(cartArray);
        setButtonAdded(button);
    }

    function renderCart(items) {
        cartItemsContainer.innerHTML = '';

        if (items.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-muted ps-4 text-sec">Your cart is empty.</p>';
        } else {
            items.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'items shadow d-flex align-items-center gap-3 mb-1 p-2 justify-content-between';
                itemEl.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="img-fluid" style="width:80px;height:80px;object-fit:cover;border-radius:20px;">
                    <div class="flex-grow-1">
                        <div class="text-sec fw-bold mb-1">${item.name}</div>
                        <div class="d-flex align-items-center gap-2">
                            <button class="decrement btn btn-sm btn-outline-secondary">-</button>
                            <span class="quantity text-first">${item.quantity}</span>
                            <button class="increment btn btn-sm btn-outline-secondary">+</button>
                        </div>
                    </div>
                    <div class="text-sec fw-bold">₹${item.price * item.quantity}</div>
                `;
                cartItemsContainer.appendChild(itemEl);

                itemEl.querySelector('.increment').addEventListener('click', () => {
                    updateQuantity(item.id, item.quantity + 1);
                });

                itemEl.querySelector('.decrement').addEventListener('click', () => {
                    updateQuantity(item.id, item.quantity - 1);
                });
            });
        }

        updateTotals(items);
        updateAddButtons(items);
    }

    function updateQuantity(itemId, newQuantity) {
        const item = cart.find(item => item.id === itemId);
        if (!item) return;

        if (newQuantity <= 0) {
            const index = cart.findIndex(item => item.id === itemId);
            if (index !== -1) {
                cart.splice(index, 1);
            }
        } else {
            item.quantity = newQuantity;
        }

        saveCart(cart);
        renderCart(cart);
    }

    function updateTotals(items) {
        const subTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const deliveryFee = subTotal > 0 ? (subTotal > 400 ? 0 : 45) : 0;
        const gst = Math.round(subTotal * 0.18);
        const total = subTotal + deliveryFee + gst;

        subtotalEl.textContent = `₹${subTotal}`;
        deliveryFeeEl.textContent = `₹${deliveryFee}`;
        gstEl.textContent = `₹${gst}`;
        totalEl.textContent = `₹${total}`;

        displayCartxShow(subTotal);
    }

    function restoreAddedButtons(cartArray) {
        updateAddButtons(cartArray);
    }

    function updateAddButtons(cartArray) {
        const namesInCart = cartArray.map(item => item.name);
        document.querySelectorAll('.card-body .bttn').forEach(button => {
            const card = button.closest('.card');
            if (!card) return;
            const nameEl = card.querySelector('.item-name');
            if (!nameEl) return;
            const isAdded = namesInCart.includes(nameEl.textContent.trim());
            if (isAdded) {
                setButtonAdded(button);
            } else {
                setButtonDefault(button);
            }
        });
    }

    function setButtonAdded(button) {
        button.textContent = 'Added';
        button.disabled = true;
        button.style.opacity = '0.7';
        button.classList.add('added');
    }

    function setButtonDefault(button) {
        button.textContent = 'Add';
        button.disabled = false;
        button.style.opacity = '1';
        button.classList.remove('added');
    }

    function loadCart() {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (!stored) return [];

        try {
            return JSON.parse(stored);
        } catch {
            return [];
        }
    }

    function saveCart(items) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }

    function parsePrice(text) {
        return Number(text.replace(/[^\d]/g, '')) || 0;
    }
});

function showLike(button) {
    const icon = button.querySelector('i');
    if (icon.classList.contains('fa-regular')) {
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        button.style.color = 'red';
    } else {
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
        button.style.color = '';
    }
}


