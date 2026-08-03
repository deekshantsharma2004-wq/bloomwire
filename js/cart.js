const CART_KEY = 'bloomwire_cart_items';
const ORDER_KEY = 'bloomwire_orders';
const FREE_SHIPPING_THRESHOLD = 499;
const GIFT_WRAP_PRICE = 49;
const SHIPPING_FEE = 149;

const currency = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

function getCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartBadge();
  renderFreeShippingBar();
  renderCartPage();
}

function addToCart(productId, name, price, image, qty = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.productId === productId);

  if (existing) {
    existing.qty += Number(qty);
  } else {
    cart.push({ productId, name, price: Number(price), image, qty: Number(qty) });
  }

  saveCart(cart);
  showToast(`${name} added to cart`);
}

function removeFromCart(productId) {
  const next = getCart().filter((item) => item.productId !== productId);
  saveCart(next);
}

function updateQuantity(productId, qty) {
  const next = getCart().map((item) => {
    if (item.productId === productId) {
      return { ...item, qty: Math.max(1, Number(qty)) };
    }
    return item;
  });

  saveCart(next);
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
  renderCartPage();
  renderFreeShippingBar();
}

function updateCartBadge() {
  const nodes = document.querySelectorAll('[data-cart-count]');
  nodes.forEach((node) => {
    node.textContent = String(getCartCount());
  });
}

function showToast(message) {
  let toast = document.querySelector('.bloom-toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'bloom-toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(window.__bloomToastTimer);
  window.__bloomToastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

function renderFreeShippingBar() {
  const nodes = document.querySelectorAll('[data-free-shipping-bar]');
  const subtotal = getCartTotal();
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const left = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  nodes.forEach((node) => {
    node.innerHTML = `
      <div class="shipping-progress-label">
        <span>${left === 0 ? 'Free shipping unlocked' : `${currency(left)} away from free shipping`}</span>
      </div>
      <div class="shipping-progress-track">
        <div class="shipping-progress-fill" style="width:${progress}%"></div>
      </div>
    `;
  });
}

function renderCartPage() {
  const cartRoot = document.querySelector('[data-cart-items]');
  const subtotalNode = document.querySelector('[data-subtotal]');
  const totalNode = document.querySelector('[data-total]');

  if (!cartRoot) return;

  const items = getCart();

  if (!items.length) {
    cartRoot.innerHTML = '<div class="empty-card">Your cart is ready for its first bloom.</div>';
    if (subtotalNode) subtotalNode.textContent = currency(0);
    if (totalNode) totalNode.textContent = currency(GIFT_WRAP_PRICE);
    return;
  }

  const subtotal = getCartTotal();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + GIFT_WRAP_PRICE + shipping;

  cartRoot.innerHTML = items
    .map(
      (item) => `
        <div class="cart-item">
          <div class="cart-thumb ${item.image || 'peach'}"></div>
          <div>
            <h3>${item.name}</h3>
            <div class="cart-qty-row">
              <button type="button" data-qty-change="${item.productId}" data-qty-value="-1">−</button>
              <span>${item.qty}</span>
              <button type="button" data-qty-change="${item.productId}" data-qty-value="1">+</button>
              <button type="button" class="text-btn" data-remove="${item.productId}">Remove</button>
            </div>
          </div>
          <strong>${currency(item.price * item.qty)}</strong>
        </div>
      `
    )
    .join('');

  if (subtotalNode) subtotalNode.textContent = currency(subtotal);
  if (totalNode) totalNode.textContent = currency(total);

  cartRoot.querySelectorAll('[data-qty-change]').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.getAttribute('data-qty-change');
      const delta = Number(button.getAttribute('data-qty-value'));
      const current = getCart().find((item) => item.productId === productId);

      if (!current) return;
      updateQuantity(productId, current.qty + delta);
    });
  });

  cartRoot.querySelectorAll('[data-remove]').forEach((button) => {
    button.addEventListener('click', () => removeFromCart(button.getAttribute('data-remove')));
  });
}

function saveOrder(order) {
  const orders = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]');
  orders.push(order);
  localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
}

function renderCheckoutPage() {
  const form = document.querySelector('[data-checkout-form]');
  const summaryRoot = document.querySelector('[data-checkout-summary]');

  if (!form || !summaryRoot) return;

  const items = getCart();
  const subtotal = getCartTotal();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + GIFT_WRAP_PRICE + shipping;

  summaryRoot.innerHTML = `
    <div class="summary-row"><span>Subtotal</span><span>${currency(subtotal)}</span></div>
    <div class="summary-row"><span>Gift Wrap</span><span>${currency(GIFT_WRAP_PRICE)}</span></div>
    <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'Free' : currency(shipping)}</span></div>
    <div class="summary-row total"><span>Total</span><span>${currency(total)}</span></div>
    <div class="cart-mini-list">
      ${items
        .map(
          (item) => `
            <div class="cart-line-item">
              <span>${item.name} × ${item.qty}</span>
              <strong>${currency(item.price * item.qty)}</strong>
            </div>
          `
        )
        .join('')}
    </div>
  `;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = {
      id: `BW-${Date.now()}`,
      customer: {
        name: String(formData.get('name') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        address: String(formData.get('address') || '').trim(),
        city: String(formData.get('city') || '').trim(),
        state: String(formData.get('state') || '').trim(),
        pin: String(formData.get('pin') || '').trim(),
        note: String(formData.get('gift_note') || '').trim()
      },
      paymentMethod: String(formData.get('payment') || 'COD').trim(),
      items,
      subtotal,
      shipping,
      giftWrap: GIFT_WRAP_PRICE,
      total,
      createdAt: new Date().toISOString()
    };

    const required = [payload.customer.name, payload.customer.phone, payload.customer.email, payload.customer.address, payload.customer.city, payload.customer.state, payload.customer.pin];

    if (required.some((field) => !field)) {
      showToast('Please fill in all shipping details');
      return;
    }

    saveOrder(payload);

    if (payload.paymentMethod === 'COD') {
      window.location.href = `order-confirmed.html?orderId=${payload.id}`;
    } else {
      const statusNode = document.querySelector('[data-checkout-status]');
      if (statusNode) {
        statusNode.textContent = `Payment is pending. Your order ${payload.id} has been reserved for confirmation.`;
      }
      form.reset();
    }
  });
}

function renderOrderConfirmedPage() {
  const orderId = new URLSearchParams(window.location.search).get('orderId');
  const container = document.querySelector('[data-order-confirmed]');
  if (!container || !orderId) return;

  const orders = JSON.parse(localStorage.getItem(ORDER_KEY) || '[]');
  const order = orders.find((entry) => entry.id === orderId);

  if (!order) {
    container.innerHTML = '<div class="empty-card">Order not found.</div>';
    return;
  }

  container.innerHTML = `
    <div class="confirmation-card premium-shadow">
      <p class="eyebrow">Order Confirmed</p>
      <h1>Thank you for choosing BloomWire.</h1>
      <p class="tagline">Your order ID is <strong>${order.id}</strong>. A handcrafted note is being prepared for dispatch.</p>
      <div class="summary-row"><span>Customer</span><span>${order.customer.name}</span></div>
      <div class="summary-row"><span>Payment</span><span>${order.paymentMethod}</span></div>
      <div class="summary-row"><span>Shipping</span><span>${order.shipping === 0 ? 'Free' : currency(order.shipping)}</span></div>
      <div class="summary-row total"><span>Total</span><span>${currency(order.total)}</span></div>
    </div>
  `;
}

function initBloomCart() {
  updateCartBadge();
  renderFreeShippingBar();
  renderCartPage();
  renderCheckoutPage();
  renderOrderConfirmedPage();
}

document.addEventListener('DOMContentLoaded', initBloomCart);
