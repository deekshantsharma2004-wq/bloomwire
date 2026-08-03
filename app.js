const productCatalog = [
  {
    id: 'jaipur-rose-keepsake',
    name: 'Jaipur Rose Keepsake',
    tagline: 'Soft terracotta bloom for romance.',
    category: 'Single Flower',
    price: 1899,
    compareAt: 2499,
    petals: 40,
    imageClass: 'peach',
    description: 'Crafted with premium chenille wire, finished in soft terracotta tones, and designed to feel like an heirloom art piece.',
    features: ['Stem length: 18 cm', 'Wire gauge: medium', 'Care: dust lightly, keep away from direct water']
  },
  {
    id: 'mist-garden-bouquet',
    name: 'Mist Garden Bouquet',
    tagline: 'A sage-toned heirloom sculpture.',
    category: 'Bouquet',
    price: 2399,
    compareAt: 2999,
    petals: 48,
    imageClass: 'sage',
    description: 'Layered sage greens and sculptural floral form create a refined keepsake for anniversaries and gratitude moments.',
    features: ['Stem length: 22 cm', 'Hand-finished layers', 'Gift-ready premium wrap']
  },
  {
    id: 'lavender-memory-stem',
    name: 'Lavender Memory Stem',
    tagline: 'A delicate keepsake piece.',
    category: 'Single Flower',
    price: 1399,
    compareAt: 1799,
    petals: 28,
    imageClass: 'lavender',
    description: 'A soft lavender statement bloom designed for intimate gifting and elegant keepsake styling.',
    features: ['Stem length: 16 cm', 'Palette: muted violet', 'Pairs beautifully with premium note cards']
  }
];

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const STORAGE_KEY = 'bloomwire.cart';

const readCart = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

const writeCart = (items) => localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

let cart = readCart();

const cartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

const refreshCartBadges = () => {
  document.querySelectorAll('[data-cart-count]').forEach((node) => {
    node.textContent = String(typeof window.getCartCount === 'function' ? window.getCartCount() : cartCount());
  });
};

const getProductById = (productId) => productCatalog.find((product) => product.id === productId) || productCatalog[0];

const setStatus = (selector, message, isError = false) => {
  const statusNode = document.querySelector(selector);
  if (statusNode) {
    statusNode.textContent = message;
    statusNode.classList.toggle('error', isError);
  }
};

const bindNewsletter = () => {
  const form = document.querySelector('[data-newsletter-form]');
  const input = form?.querySelector('input');

  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = input.value.trim();

    if (!email || !email.includes('@')) {
      setStatus('[data-newsletter-status]', 'Please add a valid email to join the list.', true);
      return;
    }

    setStatus('[data-newsletter-status]', 'You’re on the BloomWire list — welcome to the atelier.', false);
    form.reset();
  });
};

const bindCreatorForm = () => {
  const form = document.querySelector('[data-creator-form]');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();

    if (!name || !email.includes('@')) {
      setStatus('[data-status]', 'Please share your name and a valid email so we can review your application.', true);
      return;
    }

    setStatus('[data-status]', `Thanks ${name} — your creator application is now in review.`, false);
    form.reset();
  });
};

const bindContactForm = () => {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!name || !email.includes('@') || !message) {
      setStatus('[data-contact-status]', 'Please complete all fields to send your message.', true);
      return;
    }

    setStatus('[data-contact-status]', `Message sent. Our atelier team will reply soon, ${name}.`, false);
    form.reset();
  });
};

const bindUpload = () => {
  const input = document.querySelector('[data-upload-input]');
  if (!input) return;

  input.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus('[data-upload-status]', `${file.name} is ready to be reviewed by our gallery team.`, false);
  });
};

const renderShopPage = () => {
  const searchInput = document.querySelector('[data-search-input]');
  const productCards = document.querySelectorAll('[data-product-card]');
  if (!searchInput || !productCards.length) return;

  const applySearch = () => {
    const term = searchInput.value.trim().toLowerCase();

    productCards.forEach((card) => {
      const matches = card.textContent.toLowerCase().includes(term);
      card.style.display = matches ? '' : 'none';
    });
  };

  searchInput.addEventListener('input', applySearch);
};

const renderProductPage = () => {
  const productId = new URLSearchParams(window.location.search).get('product');
  const product = getProductById(productId);

  const nameNode = document.querySelector('[data-product-name]');
  const taglineNode = document.querySelector('[data-product-tagline]');
  const priceNode = document.querySelector('[data-product-price]');
  const compareNode = document.querySelector('[data-product-compare]');
  const descriptionNode = document.querySelector('[data-product-description]');
  const petalNode = document.querySelector('[data-product-petals]');
  const detailListNode = document.querySelector('[data-product-features]');
  const galleryMainNode = document.querySelector('[data-gallery-main]');
  const subscribeButton = document.querySelector('[data-add-cart]');
  const buyNowButton = document.querySelector('[data-buy-now]');

  if (!nameNode) return;

  nameNode.textContent = product.name;
  taglineNode.textContent = product.tagline;
  priceNode.textContent = currencyFormatter.format(product.price);
  compareNode.textContent = currencyFormatter.format(product.compareAt);
  descriptionNode.textContent = product.description;
  petalNode.textContent = `🌸 Earn ${product.petals} Petals`;
  galleryMainNode.className = `gallery-main ${product.imageClass}`;
  detailListNode.innerHTML = product.features.map((feature) => `<li>${feature}</li>`).join('');

  subscribeButton?.addEventListener('click', () => {
    const itemId = subscribeButton.dataset.productId || product.id;
    const itemName = subscribeButton.dataset.productName || product.name;
    const itemPrice = Number(subscribeButton.dataset.productPrice || product.price);
    const itemImage = subscribeButton.dataset.productImage || product.imageClass;

    if (typeof window.addToCart === 'function') {
      window.addToCart(itemId, itemName, itemPrice, itemImage, 1);
    } else {
      const existing = cart.find((item) => item.id === itemId);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ id: itemId, quantity: 1, name: itemName, price: itemPrice, image: itemImage });
      }
      writeCart(cart);
    }

    subscribeButton.textContent = 'Added to cart';
    setTimeout(() => {
      subscribeButton.textContent = 'Add to Cart';
    }, 1200);
  });

  buyNowButton?.addEventListener('click', () => {
    if (typeof window.addToCart === 'function') {
      window.addToCart(product.id, product.name, product.price, product.imageClass, 1);
    }
    window.location.href = 'checkout.html';
  });
};

const updateCartPage = () => {
  if (typeof window.renderCartPage === 'function') {
    window.renderCartPage();
    return;
  }

  const cartList = document.querySelector('[data-cart-items]');
  const subtotalNode = document.querySelector('[data-subtotal]');
  const totalNode = document.querySelector('[data-total]');
  if (!cartList) return;

  const items = cart.map((entry) => {
    const product = getProductById(entry.id);
    return { ...entry, product };
  });

  if (!items.length) {
    cartList.innerHTML = '<div class="empty-card">Your cart is ready for its first bloom.</div>';
    if (subtotalNode) subtotalNode.textContent = currencyFormatter.format(0);
    if (totalNode) totalNode.textContent = currencyFormatter.format(0);
    return;
  }

  cartList.innerHTML = items
    .map(
      (item) => `
        <div class="cart-item">
          <div class="cart-thumb ${item.product.imageClass}"></div>
          <div>
            <h3>${item.product.name}</h3>
            <div class="cart-qty-row">
              <button type="button" data-qty-change="${item.id}" data-qty-value="-1">−</button>
              <span>${item.quantity}</span>
              <button type="button" data-qty-change="${item.id}" data-qty-value="1">+</button>
              <button type="button" class="text-btn" data-remove="${item.id}">Remove</button>
            </div>
          </div>
          <strong>${currencyFormatter.format(item.product.price * item.quantity)}</strong>
        </div>
      `
    )
    .join('');

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = subtotal + 49;

  if (subtotalNode) subtotalNode.textContent = currencyFormatter.format(subtotal);
  if (totalNode) totalNode.textContent = currencyFormatter.format(total);
};

const bindCheckoutForm = () => {
  const form = document.querySelector('[data-checkout-form]');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const address = String(formData.get('address') || '').trim();

    if (!name || !email.includes('@') || !address) {
      setStatus('[data-checkout-status]', 'Please complete your name, email, and shipping address to place the order.', true);
      return;
    }

    cart = [];
    writeCart(cart);
    refreshCartBadges();
    setStatus('[data-checkout-status]', `Order placed — thank you ${name}. A confirmation note is on its way.`, false);
    form.reset();
    updateCartPage();
  });
};

const bindHeroButton = () => {
  const heroButton = document.querySelector('.btn-cta[data-hero-action]');
  if (!heroButton) return;

  heroButton.addEventListener('click', () => {
    heroButton.textContent = 'Opening the collection';
    setTimeout(() => {
      heroButton.textContent = 'Shop the collection';
    }, 1200);
  });
};

const init = () => {
  refreshCartBadges();
  bindNewsletter();
  bindCreatorForm();
  bindContactForm();
  bindUpload();
  renderShopPage();
  renderProductPage();
  updateCartPage();
  bindCheckoutForm();
  bindHeroButton();
};

window.addEventListener('DOMContentLoaded', init);
