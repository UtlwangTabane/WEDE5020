/* ==============================================
   DOUGHZAAR – Full Interactive Features (Cleaned)
   ============================================== */
(function() {
  'use strict';

  // ---------- MOBILE MENU TOGGLE ----------
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });
  }

  // ---------- CART MANAGEMENT (localStorage) ----------
  function getCart() {
    try { return JSON.parse(localStorage.getItem('doughzaar_cart')) || []; } catch { return []; }
  }
  function saveCart(cart) { localStorage.setItem('doughzaar_cart', JSON.stringify(cart)); }
  function updateCartCount() {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-count').forEach(badge => {
      badge.textContent = total;
      badge.style.display = total > 0 ? 'inline-block' : 'none';
    });
  }

  function addToCart(name, price) {
    const cart = getCart();
    const existing = cart.find(item => item.name === name);
    if (existing) existing.qty++; else cart.push({ name, price, qty: 1 });
    saveCart(cart);
    updateCartCount();
    showToast(`"${name}" added to cart`);
  }

  // ---------- INVENTORY MANAGEMENT (Sold Out) ----------
  const soldOutFlavours = ['Salted Honeycomb', 'Rose & Pistachio'];

  function applyInventory() {
    document.querySelectorAll('.add-to-order').forEach(btn => {
      const name = btn.getAttribute('data-name');
      if (soldOutFlavours.includes(name)) {
        btn.textContent = 'Sold Out';
        btn.disabled = true;
        btn.classList.add('sold-out');
        btn.style.opacity = '0.6';
        btn.style.cursor = 'not-allowed';
      }
    });
  }

  // ---------- TOAST NOTIFICATIONS ----------
  function showToast(message, duration = 2500) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position:fixed;bottom:30px;left:50%;transform:translateX(-50%);
      background:#0F1A2F;color:white;padding:14px 28px;border-radius:40px;
      font-family:'Helvetica Neue',Arial,sans-serif;font-weight:600;z-index:9999;
      box-shadow:0 8px 20px rgba(0,0,0,0.2);opacity:0;transition:opacity 0.3s;
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.style.opacity = '1');
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ---------- CONFIRMATION DIALOG (for clear cart) ----------
  function showClearConfirmation() {
    const existing = document.getElementById('clear-confirm-dialog');
    if (existing) existing.remove(); // Remove any old one

    const overlay = document.createElement('div');
    overlay.id = 'clear-confirm-dialog';
    overlay.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:rgba(15,26,47,0.75);z-index:1001;
      display:flex;align-items:center;justify-content:center;
    `;
    overlay.innerHTML = `
      <div style="background:white;padding:30px;border-radius:20px;max-width:400px;text-align:center;
           box-shadow:0 20px 40px rgba(0,0,0,0.2);">
        <h3 style="color:#0F1A2F;margin-bottom:10px;">Clear your cart?</h3>
        <p style="color:#5A4E45;margin-bottom:25px;">All items will be removed.</p>
        <div style="display:flex;gap:12px;justify-content:center;">
          <button id="confirm-clear-yes" style="background:#FF7B6B;color:white;border:none;padding:12px 24px;
                  border-radius:30px;font-weight:600;cursor:pointer;">Yes, Clear</button>
          <button id="confirm-clear-no" style="background:none;border:2px solid #0F1A2F;color:#0F1A2F;
                  padding:12px 24px;border-radius:30px;font-weight:600;cursor:pointer;">Keep Items</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Event listeners for the dialog
    document.getElementById('confirm-clear-yes').addEventListener('click', function() {
      clearCart();
      overlay.remove();
    });
    document.getElementById('confirm-clear-no').addEventListener('click', function() {
      overlay.remove();
    });
  }

  // ---------- CART CLEARING ----------
  function clearCart() {
    localStorage.removeItem('doughzaar_cart');
    updateCartCount();
    showToast('Cart cleared successfully');
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.remove();   // Close checkout modal if open
  }
  window.clearCart = clearCart; // Expose globally if needed for inline onclick

  // ---------- ONLINE ORDERING SYSTEM (Mock Secure Checkout) ----------
  function createCheckoutModal() {
    if (document.getElementById('checkout-modal')) return; // Prevent duplicates

    const modal = document.createElement('div');
    modal.id = 'checkout-modal';
    modal.innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);
           z-index:1000;display:flex;align-items:center;justify-content:center;">
        <div style="background:white;border-radius:20px;padding:40px;max-width:500px;width:90%;
             box-shadow:0 20px 40px rgba(0,0,0,0.3);">
          <h2 style="color:#0F1A2F;margin-bottom:20px;"><i class="fas fa-lock"></i> Secure Checkout</h2>
          <div id="checkout-items" style="margin-bottom:20px;"></div>
          <div style="margin-bottom:20px;">
            <input type="text" placeholder="Card Number" id="card-number"
                   style="width:100%;padding:12px;border:1px solid #ddd;border-radius:30px;margin-bottom:10px;">
            <div style="display:flex;gap:10px;">
              <input type="text" placeholder="MM/YY" id="card-expiry"
                     style="flex:1;padding:12px;border:1px solid #ddd;border-radius:30px;">
              <input type="text" placeholder="CVV" id="card-cvv"
                     style="flex:1;padding:12px;border:1px solid #ddd;border-radius:30px;">
            </div>
          </div>
          <button id="pay-now" style="background:#FF7B6B;color:white;border:none;padding:14px 32px;
                  border-radius:40px;font-weight:600;width:100%;cursor:pointer;">Pay Now (Simulated)</button>
          <button id="close-checkout" style="background:none;border:none;margin-top:10px;color:#0F1A2F;
                  cursor:pointer;width:100%;">Cancel</button>
          <p style="font-size:0.8rem;color:#888;margin-top:15px;text-align:center;">
            <i class="fas fa-shield-alt"></i> This is a demonstration — no real payment processed.
          </p>
        </div>
      </div>`;
    document.body.appendChild(modal);

    // Populate cart items
    const cart = getCart();
    const itemsDiv = document.getElementById('checkout-items');
    itemsDiv.innerHTML = cart.length ? cart.map(item => 
      `<p><strong>${item.name}</strong> x${item.qty} — R${(parseInt(item.price.replace('R','')) * item.qty).toFixed(2)}</p>`
    ).join('') : '<p>Your cart is empty.</p>';

    // Add Clear Cart button (centered) if cart has items
    if (cart.length > 0) {
      const clearWrapper = document.createElement('div');
      clearWrapper.style.textAlign = 'center';
      clearWrapper.style.marginTop = '15px';
      const clearBtn = document.createElement('button');
      clearBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Clear Cart';
      clearBtn.className = 'clear-cart-btn'; // uses your CSS class if defined
      clearBtn.style.cssText = `
        background:none;border:1px solid #FF7B6B;color:#FF7B6B;padding:10px 24px;
        border-radius:40px;font-weight:600;cursor:pointer;font-size:0.95rem;
      `;
      clearBtn.addEventListener('click', showClearConfirmation);
      clearWrapper.appendChild(clearBtn);
      itemsDiv.appendChild(clearWrapper);
    }

    // Event listeners for checkout modal
    document.getElementById('close-checkout').addEventListener('click', () => modal.remove());
    document.getElementById('pay-now').addEventListener('click', () => {
      const cardNum = document.getElementById('card-number').value.trim();
      if (!cardNum || cardNum.length < 13) {
        showToast('Please enter a valid card number.');
        return;
      }
      // Simulate payment
      showToast('Payment successful! Order confirmed. (Demo)', 3000);
      localStorage.removeItem('doughzaar_cart');
      updateCartCount();
      modal.remove();
    });
  }

  // Add checkout trigger to "Order Now" button in nav
  function initCheckoutButton() {
    const orderBtn = document.querySelector('.nav-links .btn:last-child');
    if (orderBtn && orderBtn.textContent.trim() === 'Order Now') {
      orderBtn.addEventListener('click', function(e) {
        e.preventDefault();
        createCheckoutModal();
      });
    }
  }

  // ---------- FORM HANDLING (catering/contact) ----------
  function validateForm(form) {
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) { valid = false; field.style.borderColor = '#FF7B6B'; }
      else field.style.borderColor = '#ddd';
    });
    const email = form.querySelector('input[type="email"]');
    if (email && !email.checkValidity()) { valid = false; email.style.borderColor = '#FF7B6B'; }
    return valid;
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    if (!validateForm(e.target)) { showToast('Please fill in all required fields.'); return; }
    showToast('Thank you! We will be in touch within 24 hours.');
    e.target.reset();
  }

  // ---------- INSTAGRAM FEED (Mock/Placeholder) ----------
  function loadInstagramFeed() {
    const feedContainer = document.getElementById('instagram-feed');
    if (!feedContainer) return;

    const posts = [
      { img: 'https://via.placeholder.com/300x300/FF7B6B/FFFFFF?text=Glazed+Donut', caption: 'Morning glaze ✨' },
      { img: 'https://via.placeholder.com/300x300/0F1A2F/FFFFFF?text=Chocolate+Dream', caption: 'Double chocolate fudge 🤎' },
      { img: 'https://via.placeholder.com/300x300/FFDDB7/0F1A2F?text=Rose+Pistachio', caption: 'Spring special 🌸' },
      { img: 'https://via.placeholder.com/300x300/FFFFFF/FF7B6B?text=Donut+Box', caption: 'Weekend boxes ready!' }
    ];

    feedContainer.innerHTML = posts.map(post => `
      <div style="text-align:center;">
        <img src="${post.img}" alt="${post.caption}" style="width:100%;border-radius:20px;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        <p style="margin-top:8px;color:#5A4E45;">${post.caption}</p>
      </div>
    `).join('');
  }

  // ---------- INITIALIZE ALL ----------
  document.addEventListener('DOMContentLoaded', function() {
    // Add to cart buttons
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('add-to-order') && !e.target.disabled) {
        e.preventDefault();
        addToCart(e.target.getAttribute('data-name'), e.target.getAttribute('data-price'));
      }
    });

    // Forms
    document.addEventListener('submit', function(e) {
      if (!e.target.classList.contains('no-js-submit')) handleFormSubmit(e);
    });

    // Inventory
    applyInventory();

    // Checkout
    initCheckoutButton();

    // Cart count
    updateCartCount();

    // Instagram feed
    loadInstagramFeed();

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
      });
    });
  });

})();