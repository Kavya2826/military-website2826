(() => {
  "use strict";
  const STORAGE_KEY = "valor-cart-v1";
  // Only general-purpose, non-weapon gear categories are eligible for cart actions.
  const ELIGIBLE_CATEGORIES = new Set(["PROTECTION", "FIELD ESSENTIALS", "COMMUNICATION", "OUTDOOR", "SURVIVAL"]);
  const overlay = document.querySelector("#cart-overlay");
  const cartItems = document.querySelector(".cart-items");
  const cartCount = document.querySelector(".cart-count");
  const cartItemCount = document.querySelector(".cart-item-count");
  const cartTotal = document.querySelector(".cart-total-value");
  const toast = document.querySelector(".toast");
  const cartLink = document.querySelector(".cart-link");
  const checkoutButton = document.querySelector("[data-open-checkout]");
  const checkoutOverlay = document.querySelector("#checkout-overlay");
  if (!overlay || !cartItems || !cartCount || !cartTotal || !cartLink || !checkoutButton || !checkoutOverlay) return;

  const formatINR = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  const readCart = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(saved) ? saved.filter((item) => item && typeof item.id === "string" && typeof item.name === "string" && Number.isFinite(item.price) && item.price >= 0 && Number.isInteger(item.quantity) && item.quantity > 0) : [];
    } catch { return []; }
  };
  let cart = readCart();
  let toastTimer;

  const saveCart = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }
    catch { showToast("Could not save cart on this device."); }
  };
  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
  };
  const updateCount = () => {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = String(count);
    cartItemCount.textContent = count + (count === 1 ? " item" : " items");
    checkoutButton.disabled = cart.length === 0;
    checkoutButton.setAttribute("aria-disabled", String(cart.length === 0));
  };
  const makeButton = (label, action, itemId, className = "") => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.dataset.cartAction = action;
    button.dataset.itemId = itemId;
    if (className) button.className = className;
    return button;
  };

  const renderCart = () => {
    cartItems.replaceChildren();
    let subtotal = 0;
    if (cart.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-cart";
      const heading = document.createElement("h3");
      heading.textContent = "YOUR CART IS EMPTY";
      const message = document.createElement("p");
      message.textContent = "Add eligible field and outdoor essentials to see them here.";
      empty.append(heading, message);
      cartItems.append(empty);
    }
    cart.forEach((item) => {
      subtotal += item.price * item.quantity;
      const row = document.createElement("article");
      row.className = "cart-item";
      const image = document.createElement("img");
      image.src = item.image;
      image.alt = item.name;
      image.loading = "lazy";
      const info = document.createElement("div");
      info.className = "cart-item-info";
      const name = document.createElement("h3");
      name.textContent = item.name;
      const price = document.createElement("p");
      price.textContent = formatINR(item.price) + " each";
      const controls = document.createElement("div");
      controls.className = "quantity-controls";
      const quantity = document.createElement("span");
      quantity.textContent = String(item.quantity);
      controls.append(makeButton("−", "decrease", item.id), quantity, makeButton("+", "increase", item.id), makeButton("REMOVE", "remove", item.id, "remove-item"));
      info.append(name, price, controls);
      const lineTotal = document.createElement("strong");
      lineTotal.textContent = formatINR(item.price * item.quantity);
      row.append(image, info, lineTotal);
      cartItems.append(row);
    });
    cartTotal.textContent = formatINR(subtotal);
    updateCount();
  };

  const openCart = () => {
    renderCart();
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    overlay.querySelector("[data-close-cart]").focus();
  };
  const closeCart = () => {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    cartLink.focus();
  };

  cartLink.addEventListener("click", (event) => { event.preventDefault(); openCart(); });
  overlay.querySelectorAll("[data-close-cart]").forEach((button) => button.addEventListener("click", closeCart));
  overlay.addEventListener("click", (event) => { if (event.target === overlay) closeCart(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && overlay.classList.contains("is-open")) closeCart(); });

  document.querySelectorAll(".product-card").forEach((card) => {
    const category = card.querySelector(".product-category")?.textContent.trim().toUpperCase();
    const button = card.querySelector(".quick-view");
    if (!button || !ELIGIBLE_CATEGORIES.has(category)) return;
    button.href = "#cart";
    button.setAttribute("role", "button");
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const name = card.querySelector(".product-details h3")?.textContent.trim();
      const priceText = card.querySelector(".product-bottom strong")?.textContent || "";
      const price = Number(priceText.replace(/[^0-9.]/g, ""));
      const image = card.querySelector(".product-image img")?.src || "";
      if (!name || !Number.isFinite(price) || price < 0) { showToast("This product is missing valid cart details."); return; }
      const id = (category + "-" + name).toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const existing = cart.find((item) => item.id === id);
      if (existing) existing.quantity += 1;
      else cart.push({ id, name, price, image, quantity: 1 });
      saveCart();
      renderCart();
      showToast(name + " added to cart.");
    });
  });

  cartItems.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-cart-action]");
    if (!button) return;
    const item = cart.find((entry) => entry.id === button.dataset.itemId);
    if (!item) return;
    if (button.dataset.cartAction === "increase") item.quantity += 1;
    if (button.dataset.cartAction === "decrease") item.quantity -= 1;
    if (button.dataset.cartAction === "remove" || item.quantity <= 0) cart = cart.filter((entry) => entry.id !== item.id);
    saveCart();
    renderCart();
  });


  const closeCheckout = () => {
    checkoutOverlay.classList.remove("is-open");
    checkoutOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    cartLink.focus();
  };

  checkoutButton.addEventListener("click", () => {
    if (cart.length === 0) return;
    const qrImage = checkoutOverlay.querySelector("#demo-qr-image");
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const demoPayload = "VALOR DEMO ONLY | NO PAYMENT | ITEMS: " + itemCount + " | TOTAL: " + formatINR(total);
    qrImage.src = "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=" + encodeURIComponent(demoPayload);
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    checkoutOverlay.classList.add("is-open");
    checkoutOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    checkoutOverlay.querySelector("[data-finish-order]").focus();
  });

  checkoutOverlay.querySelectorAll("[data-close-checkout]").forEach((button) => button.addEventListener("click", closeCheckout));
  checkoutOverlay.addEventListener("click", (event) => { if (event.target === checkoutOverlay) closeCheckout(); });
  checkoutOverlay.querySelector("[data-finish-order]").addEventListener("click", closeCheckout);


  renderCart();
})();
