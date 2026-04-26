// ========================================
// 🍧 NYENDOLYUK! - MAIN JAVASCRIPT
// ========================================
// ✨ Fitur: Modal Order, Quantity Selector, WhatsApp Integration, Auto Price Update
// ========================================

'use strict';

// ──────────────────────────────────────
// 🔹 GLOBAL VARIABLES
// ──────────────────────────────────────

let selectedMenuItem = null;

// ──────────────────────────────────────
// 🔹 DOM ELEMENTS - MODAL & FORM
// ──────────────────────────────────────

const orderModal = document.getElementById('orderModal');
const modalClose = document.getElementById('modalClose');
const modalCancel = document.getElementById('modalCancel');
const orderForm = document.getElementById('orderForm');
const deliveryRadios = document.querySelectorAll('input[name="deliveryMethod"]');
const addressGroup = document.getElementById('addressGroup');

// Quantity Selector Elements
const qtyInput = document.getElementById('itemQuantity');
const qtyMinus = document.getElementById('qtyMinus');
const qtyPlus = document.getElementById('qtyPlus');
const selectedItemTotal = document.getElementById('selectedItemTotal');
const quantityIndicator = document.getElementById('quantityIndicator');
const qtyValue = document.getElementById('qtyValue');

// ──────────────────────────────────────
// 🔹 HELPER FUNCTIONS - PRICE PARSING
// ──────────────────────────────────────

/**
 * Parse harga dari string format Indonesia (8.000) ke number (8000)
 * @param {string} priceString - Harga dalam format "8.000"
 * @returns {number} - Harga sebagai angka
 */
function parsePrice(priceString) {
  if (!priceString) return 0;
  // Hapus titik pemisah ribuan, lalu parse ke integer
  const cleanPrice = priceString.toString().replace(/\./g, '');
  return parseInt(cleanPrice, 10) || 0;
}

/**
 * Format angka ke format Rupiah Indonesia
 * @param {number} amount - Angka harga
 * @returns {string} - Format "Rp 8.000"
 */
function formatRupiah(amount) {
  return `Rp ${parseInt(amount).toLocaleString('id-ID')}`;
}

// ──────────────────────────────────────
// 🔹 MODAL FUNCTIONS
// ──────────────────────────────────────

/**
 * Buka modal order dengan data produk
 * @param {Object} itemData - Data produk {name, price, image}
 */
function openModal(itemData) {
  if (!itemData) return;
  
  selectedMenuItem = itemData;
  
  // Parse harga dengan benar
  const unitPrice = parsePrice(itemData.price);
  
  // Populate modal dengan data produk
  const modalItemName = document.getElementById('modalItemName');
  const modalItemPrice = document.getElementById('modalItemPrice');
  const modalItemImage = document.getElementById('modalItemImage');
  
  if (modalItemName) modalItemName.textContent = itemData.name;
  if (modalItemPrice) modalItemPrice.textContent = formatRupiah(unitPrice);
  if (modalItemImage) modalItemImage.src = itemData.image;
  
  // Reset quantity ke 1
  if (qtyInput) {
    qtyInput.value = 1;
    if (qtyMinus) qtyMinus.disabled = true;
  }
  
  // Reset quantity indicator (hide when qty = 1)
  if (quantityIndicator && qtyValue) {
    quantityIndicator.classList.remove('visible');
    quantityIndicator.style.display = 'none';
    qtyValue.textContent = '1';
  }
  
  // Update total harga display
  updateItemTotal();
  
  // Reset form fields lainnya
  if (orderForm) orderForm.reset();
  if (addressGroup) addressGroup.style.display = 'none';
  
  // Show modal dengan animasi
  if (orderModal) {
    orderModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }
  
  // Auto-focus quantity input untuk UX lebih baik
  setTimeout(() => {
    if (qtyInput) {
      qtyInput.focus();
      qtyInput.select();
    }
  }, 300);
}

/**
 * Tutup modal order
 */
function closeModal() {
  if (orderModal) {
    orderModal.classList.remove('active');
    document.body.style.overflow = '';
  }
  selectedMenuItem = null;
}

// ──────────────────────────────────────
// 🔹 QUANTITY SELECTOR FUNCTIONS
// ──────────────────────────────────────

/**
 * Update quantity dengan validasi min/max
 * @param {number} change - Perubahan quantity (+1 atau -1)
 */
function updateQuantity(change) {
  if (!qtyInput || !selectedMenuItem) return;
  
  let currentQty = parseInt(qtyInput.value) || 1;
  let newQty = currentQty + change;
  
  // Validasi min/max dari atribut HTML
  const min = parseInt(qtyInput.min) || 1;
  const max = parseInt(qtyInput.max) || 20;
  
  // Clamp value ke range yang valid
  if (newQty >= min && newQty <= max) {
    qtyInput.value = newQty;
    
    // Update quantity indicator display
    if (quantityIndicator && qtyValue) {
      if (newQty > 1) {
        qtyValue.textContent = newQty;
        quantityIndicator.classList.add('visible');
        quantityIndicator.style.display = 'inline-flex';
      } else {
        quantityIndicator.classList.remove('visible');
        quantityIndicator.style.display = 'none';
      }
    }
    
    // Update total harga dengan animasi
    updateItemTotal();
    
    // Animasi kecil saat quantity berubah
    qtyInput.classList.add('updated');
    setTimeout(() => qtyInput.classList.remove('updated'), 200);
  }
  
  // Update state button minus (disable jika qty = 1)
  if (qtyMinus) {
    qtyMinus.disabled = (newQty <= min);
  }
}

/**
 * Update display total harga di modal berdasarkan quantity
 * Dengan animasi pulse saat harga berubah
 */
function updateItemTotal() {
  if (!selectedMenuItem || !qtyInput || !selectedItemTotal) return;
  
  const unitPrice = parsePrice(selectedMenuItem.price);
  const quantity = parseInt(qtyInput.value) || 1;
  const totalPrice = unitPrice * quantity;
  
  // Update unit price display (tetap sama)
  const modalItemPrice = document.getElementById('modalItemPrice');
  if (modalItemPrice) {
    modalItemPrice.textContent = formatRupiah(unitPrice);
  }
  
  // Update total price dengan animasi pulse
  if (selectedItemTotal) {
    // Tambahkan class animasi
    selectedItemTotal.classList.add('updated');
    
    // Update text harga total
    selectedItemTotal.textContent = formatRupiah(totalPrice);
    
    // Hapus class animasi setelah selesai (300ms)
    setTimeout(() => {
      selectedItemTotal.classList.remove('updated');
    }, 300);
  }
}

// ──────────────────────────────────────
// 🔹 WHATSAPP MESSAGE GENERATOR
// ──────────────────────────────────────

/**
 * Generate pesan WhatsApp yang terformat rapi
 * @param {Object} item - Data produk
 * @param {Object} customer - Data customer dari form
 * @param {number} quantity - Jumlah porsi
 * @returns {string} - Pesan WhatsApp terformat
 */
function generateWhatsAppMessage(item, customer, quantity = 1) {
  const unitPrice = parsePrice(item.price);
  const totalPrice = unitPrice * quantity;
  
  const deliveryText = customer.deliveryMethod === 'ambil' 
    ? 'Ambil di Toko' 
    : `Diantar ke:\n   ${customer.address}`;
  
  const paymentText = customer.paymentMethod === 'cash'
    ? 'Cash (Bayar saat ambil)'
    : 'Transfer via QRIS';
  
  const notesText = customer.notes ? `\n Catatan: ${customer.notes}` : '';
  const quantityText = quantity > 1 ? `${quantity} porsi` : '1 porsi';
  
  return `
*PESANAN BARU*
═══════════════════════════════════

*Detail Pesanan:*
• Produk: ${item.name}
• Harga Satuan: ${formatRupiah(unitPrice)}
• Jumlah: ${quantityText}
• Subtotal: ${formatRupiah(totalPrice)}

═══════════════════════════════════
*Data Pemesan:*
• Nama: ${customer.name}
• WhatsApp: ${customer.phone}

═══════════════════════════════════
*Pengiriman:* ${deliveryText}
*Pembayaran:* ${paymentText}
${notesText}
═══════════════════════════════════

*TOTAL BAYAR: ${formatRupiah(totalPrice)}*

Terima kasih telah memesan!
Pesanan akan segera kami proses.
  `.trim();
}

// ──────────────────────────────────────
// 🔹 SUCCESS TOAST NOTIFICATION
// ──────────────────────────────────────

/**
 * Tampilkan toast notification setelah order sukses
 * @param {string} itemName - Nama produk yang dipesan
 * @param {number} quantity - Jumlah porsi
 */
function showOrderSuccess(itemName, quantity = 1) {
  const quantityText = quantity > 1 ? `(${quantity} porsi)` : '';
  
  const toast = document.createElement('div');
  toast.className = 'order-success-toast';
  toast.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:20px;">✅</span>
      <span>Pesanan <strong>${itemName}</strong> ${quantityText} terkirim ke WhatsApp!</span>
    </div>
  `;
  toast.style.cssText = `
    position:fixed;top:20px;right:20px;
    background:#16a34a;color:white;
    padding:16px 24px;border-radius:12px;
    box-shadow:0 4px 12px rgba(0,0,0,0.15);
    z-index:3000;font-size:14px;
    animation:slideIn 0.3s ease;
  `;
  document.body.appendChild(toast);
  
  // Auto hide after 4 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Add toast & price animation keyframes to document
(function addAnimations() {
  if (document.getElementById('nyendol-animations')) return;
  
  const style = document.createElement('style');
  style.id = 'nyendol-animations';
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100px); opacity: 0; }
    }
    @keyframes pricePulse {
      0%, 100% { transform: scale(1); color: var(--secondary-color, #16a34a); }
      50% { transform: scale(1.1); color: #059669; }
    }
    @keyframes numberPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }
    .selected-item-total-value.updated {
      animation: pricePulse 0.3s ease;
    }
    .quantity-selector input[type="number"].updated {
      animation: numberPulse 0.2s ease;
    }
    .quantity-indicator.visible {
      display: inline-flex !important;
      align-items: center;
      gap: 4px;
    }
  `;
  document.head.appendChild(style);
})();

// ──────────────────────────────────────
// 🔹 EVENT LISTENERS - MODAL
// ──────────────────────────────────────

// Close button click
if (modalClose) {
  modalClose.addEventListener('click', closeModal);
}

// Cancel button click
if (modalCancel) {
  modalCancel.addEventListener('click', closeModal);
}

// Close modal when clicking outside
if (orderModal) {
  orderModal.addEventListener('click', (e) => {
    if (e.target === orderModal) {
      closeModal();
    }
  });
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && orderModal?.classList.contains('active')) {
    closeModal();
  }
  
  // Keyboard shortcut untuk quantity (arrow up/down) saat modal aktif
  if (orderModal?.classList.contains('active') && qtyInput) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      updateQuantity(1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      updateQuantity(-1);
    }
  }
});

// Show/hide address field based on delivery method
deliveryRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    if (e.target.value === 'diantar') {
      if (addressGroup) addressGroup.style.display = 'flex';
      const addressInput = document.getElementById('customerAddress');
      if (addressInput) addressInput.required = true;
    } else {
      if (addressGroup) addressGroup.style.display = 'none';
      const addressInput = document.getElementById('customerAddress');
      if (addressInput) addressInput.required = false;
    }
  });
});

// ──────────────────────────────────────
// 🔹 EVENT LISTENERS - QUANTITY SELECTOR
// ──────────────────────────────────────

// Minus button
if (qtyMinus) {
  qtyMinus.addEventListener('click', () => updateQuantity(-1));
}

// Plus button
if (qtyPlus) {
  qtyPlus.addEventListener('click', () => updateQuantity(1));
}

// Manual input change
if (qtyInput) {
  qtyInput.addEventListener('change', () => {
    let value = parseInt(qtyInput.value) || 1;
    const min = parseInt(qtyInput.min) || 1;
    const max = parseInt(qtyInput.max) || 20;
    
    // Clamp value ke range valid
    value = Math.max(min, Math.min(max, value));
    qtyInput.value = value;
    
    // Update quantity indicator
    if (quantityIndicator && qtyValue) {
      if (value > 1) {
        qtyValue.textContent = value;
        quantityIndicator.classList.add('visible');
        quantityIndicator.style.display = 'inline-flex';
      } else {
        quantityIndicator.classList.remove('visible');
        quantityIndicator.style.display = 'none';
      }
    }
    
    updateItemTotal();
    
    // Update button states
    if (qtyMinus) qtyMinus.disabled = (value <= min);
  });
  
  // Prevent non-numeric input
  qtyInput.addEventListener('keypress', (e) => {
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  });
}

// ──────────────────────────────────────
// 🔹 FORM SUBMIT HANDLER
// ──────────────────────────────────────

if (orderForm) {
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!selectedMenuItem) {
      alert('⚠️ Error: Data produk tidak ditemukan!');
      return;
    }
    
    // Get form values dengan null check
    const customerName = document.getElementById('customerName');
    const customerPhone = document.getElementById('customerPhone');
    const customerAddress = document.getElementById('customerAddress');
    const orderNotes = document.getElementById('orderNotes');
    
    const formData = {
      name: customerName?.value.trim() || '',
      phone: customerPhone?.value.trim() || '',
      deliveryMethod: document.querySelector('input[name="deliveryMethod"]:checked')?.value || 'ambil',
      address: customerAddress?.value.trim() || '',
      paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cash',
      notes: orderNotes?.value.trim() || '',
    };
    
    // Get quantity
    const quantity = parseInt(qtyInput?.value) || 1;
    
    // Validation
    if (!formData.name) {
      alert('⚠️ Mohon isi nama lengkap!');
      customerName?.focus();
      return;
    }
    
    if (!formData.phone) {
      alert('⚠️ Mohon isi nomor WhatsApp!');
      customerPhone?.focus();
      return;
    }
    
    // Validasi format nomor WhatsApp (minimal 10 digit)
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      alert('⚠️ Nomor WhatsApp tidak valid! Minimal 10 digit.');
      customerPhone?.focus();
      return;
    }
    
    if (formData.deliveryMethod === 'diantar' && !formData.address) {
      alert('⚠️ Mohon isi alamat pengiriman!');
      customerAddress?.focus();
      return;
    }
    
    // Generate WhatsApp Message dengan quantity
    const message = generateWhatsAppMessage(selectedMenuItem, formData, quantity);
    
    // Open WhatsApp
    const phoneNumber = '628984425277';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Open in new tab
    const newTab = window.open(url, '_blank');
    
    if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
      alert('⚠️ Popup diblokir! Silakan izinkan popup untuk WhatsApp.');
      return;
    }
    
    // Close modal & show success
    closeModal();
    showOrderSuccess(selectedMenuItem.name, quantity);
    
    // Optional: Save customer info to localStorage for next order
    try {
      localStorage.setItem('nyendol-last-name', formData.name);
      localStorage.setItem('nyendol-last-phone', formData.phone);
    } catch (e) {
      // Ignore localStorage errors
    }
  });
}

// ──────────────────────────────────────
// 🔹 MENU CARD WHATSAPP BUTTON HANDLER
// ──────────────────────────────────────

// Attach click event to all WhatsApp buttons
document.querySelectorAll('.btn-whatsapp').forEach(button => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Get parent card
    const card = button.closest('.menu-card');
    if (!card) return;
    
    // Extract item data dari data attributes
    const itemData = {
      name: card.getAttribute('data-menu-name') || 'Produk',
      price: card.getAttribute('data-menu-price') || '0',
      image: card.querySelector('.menu-img')?.src || 'assets/cendol.png',
    };
    
    // Auto-fill form dengan data customer terakhir (jika ada)
    try {
      const lastName = localStorage.getItem('nyendol-last-name');
      const lastPhone = localStorage.getItem('nyendol-last-phone');
      
      const nameInput = document.getElementById('customerName');
      const phoneInput = document.getElementById('customerPhone');
      
      if (lastName && nameInput) nameInput.value = lastName;
      if (lastPhone && phoneInput) phoneInput.value = lastPhone;
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Open modal with item data
    openModal(itemData);
  });
});

// ──────────────────────────────────────
// 🔹 NAVIGATION & UI FUNCTIONS
// ──────────────────────────────────────

// Toggle Hamburger Menu
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close menu when clicking a nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Close menu when clicking outside
  window.addEventListener('click', (e) => {
    if (
      navMenu?.classList.contains('active') &&
      !navToggle?.contains(e.target) &&
      !navMenu?.contains(e.target)
    ) {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });
}

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    
    // Skip if href is just "#"
    if (href === '#') return;
    
    e.preventDefault();
    
    const target = document.querySelector(href);
    if (target) {
      // Close mobile menu if open
      if (navMenu?.classList.contains('active')) {
        navToggle?.classList.remove('active');
        navMenu?.classList.remove('active');
      }
      
      // Smooth scroll with offset for fixed navbar
      const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 70;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Navbar Scroll Effect (add shadow on scroll)
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Initialize AOS (Animate On Scroll) - Only if library is loaded
if (typeof AOS !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: 'ease-out-cubic'
    });
  });
}

// ──────────────────────────────────────
// 🔹 UTILITY: Detect Mobile Device
// ──────────────────────────────────────

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Adjust UI for mobile if needed
if (isMobile) {
  // Add mobile class to body for CSS hooks
  document.body.classList.add('is-mobile');
}

// ──────────────────────────────────────
// 🔹 CONSOLE WELCOME
// ──────────────────────────────────────

console.log('%c NyendolYuk! Website Loaded', 'color: #16a34a; font-weight: bold; font-size: 14px;');
console.log('%c Ready to serve fresh cendol!', 'color: #6b7280; font-size: 12px;');
console.log('%c Quantity selector + Auto Price Update + WhatsApp order active!', 'color: #25D366; font-size: 11px;');
