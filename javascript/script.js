
/* ==========================================
   FIELD OPS - MAIN JAVASCRIPT
   ========================================== */

// ELEMENTS
const rifleModal = document.getElementById("rifleModal");
const rifleWindow = document.querySelector(".rifle-window");
const rifleGrid = document.getElementById("rifleGrid");
const rifleSearch = document.getElementById("rifleSearch");
const rifleFilter = document.getElementById("rifleFilter");
const rifleCount = document.getElementById("rifleCount");
const closeRifles = document.getElementById("closeRifles");

const detailsModal = document.getElementById("detailsModal");
const detailsWindow = document.querySelector(".details-window");
const detailsContent = document.getElementById("detailsContent");
const closeDetails = document.getElementById("closeDetails");

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

let previousFocus = null;

// DEMONSTRATION PRODUCT CATALOGUE
const rifles = [
  {
    name: "AK-203",
    type: "Assault Rifle",
    caliber: "7.62mm",
    description: "Kalashnikov-pattern service rifle.",
    image: "images/ak203.jpg"
  },
  {
    name: "M4A1",
    type: "Carbine",
    caliber: "5.56mm",
    description: "A widely recognized carbine platform.",
    image: "images/m4a1.jpg"
  },
  {
    name: "HK416",
    type: "Assault Rifle",
    caliber: "5.56mm",
    description: "A modern rifle platform by Heckler & Koch.",
    image: "images/hk416.jpg"
  },
  {
    name: "FN SCAR-L",
    type: "Assault Rifle",
    caliber: "5.56mm",
    description: "A modular rifle platform by FN Herstal.",
    image: "images/fn-scar-l.jpg"
  },
  {
    name: "Tavor X95",
    type: "Bullpup Rifle",
    caliber: "5.56mm",
    description: "A compact bullpup rifle platform.",
    image: "images/tavor-x95.jpg"
  },
  {
    name: "SIG MCX",
    type: "Modular Rifle",
    caliber: "Other",
    description: "A modular firearm platform by SIG Sauer.",
    image: "images/sig-mcx.jpg"
  },
  {
    name: "AK-74",
    type: "Assault Rifle",
    caliber: "5.45mm",
    description: "A well-known Kalashnikov rifle platform.",
    image: "images/ak74.jpg"
  },
  {
    name: "FAMAS",
    type: "Assault Rifle",
    caliber: "5.56mm",
    description: "A French bullpup rifle platform.",
    image: "images/famas.jpg"
  },
  {
    name: "Steyr AUG",
    type: "Bullpup Rifle",
    caliber: "5.56mm",
    description: "An Austrian bullpup rifle platform.",
    image: "images/steyr-aug.jpg"
  },
  {
    name: "Galil ACE",
    type: "Assault Rifle",
    caliber: "7.62mm",
    description: "A modernized rifle family developed by IWI.",
    image: "images/galil-ace.jpg"
  },
  {
    name: "Beretta ARX160",
    type: "Assault Rifle",
    caliber: "5.56mm",
    description: "An Italian modular rifle platform.",
    image: "images/beretta-arx160.jpg"
  },
  {
    name: "QBZ-95",
    type: "Assault Rifle",
    caliber: "Other",
    description: "A Chinese bullpup rifle platform.",
    image: "images/qbz95.jpg"
  }
];

// OPEN RIFLE CATALOGUE
function openRifleModal() {
  previousFocus = document.activeElement;

  rifleModal.classList.add("active");
  rifleModal.setAttribute("aria-hidden", "false");

  document.body.classList.add("modal-open");

  renderRifles();

  requestAnimationFrame(() => {
    rifleSearch.focus();
  });
}

// CLOSE RIFLE CATALOGUE
function closeRifleModal() {
  rifleModal.classList.remove("active");
  rifleModal.setAttribute("aria-hidden", "true");

  document.body.classList.toggle(
    "modal-open",
    detailsModal.classList.contains("active")
  );

  if (previousFocus && previousFocus.isConnected) {
    previousFocus.focus();
  }
}

// ESCAPE TEXT FOR SAFE HTML OUTPUT
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

// RENDER CATALOGUE
function renderRifles() {
  const query = rifleSearch.value.trim().toLowerCase();
  const filter = rifleFilter.value;

  const filteredRifles = rifles.filter((rifle) => {
    const searchableText =
      `${rifle.name} ${rifle.type} ${rifle.caliber}`.toLowerCase();

    const matchesSearch = searchableText.includes(query);

    const matchesFilter =
      filter === "all" || rifle.caliber === filter;

    return matchesSearch && matchesFilter;
  });

  rifleCount.textContent =
    `${filteredRifles.length} MODEL` +
    (filteredRifles.length === 1 ? "" : "S");

  if (filteredRifles.length === 0) {
    rifleGrid.innerHTML = `
      <div class="rifle-empty">
        No matching models found. Try another search or filter.
      </div>
    `;
    return;
  }

  rifleGrid.innerHTML = filteredRifles.map((rifle) => `
    <article class="rifle-card">
      <div class="rifle-image">
        <img
          src="${escapeHTML(rifle.image)}"
          alt="${escapeHTML(rifle.name)}"
          loading="lazy"
        >
      </div>

      <div class="rifle-info">
        <span class="rifle-type">
          ${escapeHTML(rifle.type)}
        </span>

        <h3>${escapeHTML(rifle.name)}</h3>

        <p>${escapeHTML(rifle.description)}</p>

        <div class="rifle-meta">
          <span class="rifle-caliber">
            ${escapeHTML(rifle.caliber)}
          </span>

          <button
            class="rifle-quote"
            type="button"
            data-model="${escapeHTML(rifle.name)}"
          >
            VIEW DETAILS
          </button>
        </div>
      </div>
    </article>
  `).join("");

  // Handle unavailable images without breaking the cards.
  rifleGrid.querySelectorAll(".rifle-image img").forEach((img) => {
    img.addEventListener("error", () => {
      const fallback = document.createElement("div");
      fallback.className = "rifle-image-fallback";
      fallback.textContent = "IMAGE UNAVAILABLE";

      img.replaceWith(fallback);
    }, { once: true });
  });
}

// OPEN MODEL DETAILS
function openDetails(modelName) {
  const rifle = rifles.find((item) => item.name === modelName);

  if (!rifle) return;

  previousFocus = document.activeElement;

  detailsContent.innerHTML = `
    <span class="details-model-label">
      MODEL CATALOGUE / OVERVIEW
    </span>

    <h3 id="detailsTitle">${escapeHTML(rifle.name)}</h3>

    <p>
      ${escapeHTML(rifle.description)}
    </p>

    <p class="details-notice">
      <strong>Platform:</strong>
      ${escapeHTML(rifle.caliber)}
      <br>

      <strong>Category:</strong>
      ${escapeHTML(rifle.type)}
      <br><br>

      This is a demonstration catalogue entry.
      Availability, specifications and pricing have not been verified.
      No purchase or ordering functionality is enabled.
    </p>
  `;

  detailsModal.classList.add("active");
  detailsModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  closeDetails.focus();
}

// CLOSE MODEL DETAILS
function closeDetailsModal() {
  detailsModal.classList.remove("active");
  detailsModal.setAttribute("aria-hidden", "true");

  document.body.classList.toggle(
    "modal-open",
    rifleModal.classList.contains("active")
  );

  if (previousFocus && previousFocus.isConnected) {
    previousFocus.focus();
  }
}

// CATEGORY INTERACTIONS
document.querySelectorAll(".category-card").forEach((card) => {
  card.addEventListener("click", () => {
    const category = card.dataset.category;

    if (category === "Assault Rifles") {
      openRifleModal();
      return;
    }

    // Other categories will be developed separately.
    alert(`${category} catalogue is coming soon.`);
  });
});

// SEARCH AND FILTER
rifleSearch.addEventListener("input", renderRifles);
rifleFilter.addEventListener("change", renderRifles);

// PRODUCT DETAIL BUTTONS
rifleGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-model]");

  if (!button) return;

  openDetails(button.dataset.model);
});

// CLOSE BUTTONS
closeRifles.addEventListener("click", closeRifleModal);
closeDetails.addEventListener("click", closeDetailsModal);

// CLOSE WHEN CLICKING THE BACKDROP
rifleModal.addEventListener("click", (event) => {
  if (event.target === rifleModal) {
    closeRifleModal();
  }
});

detailsModal.addEventListener("click", (event) => {
  if (event.target === detailsModal) {
    closeDetailsModal();
  }
});

// ESCAPE KEY
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (detailsModal.classList.contains("active")) {
    closeDetailsModal();
  } else if (rifleModal.classList.contains("active")) {
    closeRifleModal();
  }
});

// MOBILE NAVIGATION
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");

  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "×" : "☰";
});

// CLOSE MOBILE MENU AFTER NAVIGATION
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});
