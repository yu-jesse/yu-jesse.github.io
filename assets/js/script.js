'use strict';

// Element toggle function
const elementToggleFunc = (elem) => elem.classList.toggle("active");

// Sidebar toggle
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");
if (sidebar && sidebarBtn) {
  sidebarBtn.addEventListener("click", () => elementToggleFunc(sidebar));
}

// Hobbies modal
const hobbiesItem = document.querySelectorAll("[data-hobbies-item]");
const modalContainer = document.querySelector(".modal-container");
const modalImage = document.querySelector(".modal-image");
const modalContent = document.querySelector(".modal-content");
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

const hobbiesModalFunc = () => {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
};

if (hobbiesItem.length > 0) {
  hobbiesItem.forEach((item) => {
    item.addEventListener("click", () => {
      modalImg.src = item.querySelector("[data-hobbies-avatar]").src;
      modalImg.alt = item.querySelector("[data-hobbies-avatar]").alt;
      modalTitle.innerHTML = item.querySelector("[data-hobbies-title]").innerHTML;
      modalText.innerHTML = item.querySelector("[data-hobbies-text]").innerHTML;
      hobbiesModalFunc();
    });
  });

  modalCloseBtn.addEventListener("click", hobbiesModalFunc);
  overlay.addEventListener("click", hobbiesModalFunc);
}

// Filter dropdown and buttons
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-select-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");
const filterItems = document.querySelectorAll("[data-filter-item]");

if (select && selectItems && selectValue) {
  select.addEventListener("click", () => elementToggleFunc(select));

  selectItems.forEach((item) => {
    item.addEventListener("click", () => {
      const selectedValue = item.innerText.toLowerCase();
      selectValue.innerText = item.innerText;
      elementToggleFunc(select);
      filterFunc(selectedValue);
    });
  });
}

let lastClickedBtn = filterBtn[0];
if (filterBtn.length > 0) {
  filterBtn.forEach((btn) => {
    btn.addEventListener("click", function () {
      const selectedValue = this.innerText.toLowerCase();
      if (selectValue) selectValue.innerText = this.innerText;
      filterFunc(selectedValue);

      if (lastClickedBtn) lastClickedBtn.classList.remove("active");
      this.classList.add("active");
      lastClickedBtn = this;
    });
  });
}

const filterFunc = (selectedValue) => {
  const dividers = document.querySelectorAll(".divider");
  dividers.forEach((divider) => divider.style.display = "none");

  const visibleItems = [];
  filterItems.forEach((item) => {
    const itemCategory = item.dataset.category;
    if (selectedValue === "all" || selectedValue === itemCategory) {
      item.classList.add("active");
      item.style.display = "block";
      visibleItems.push(item);
    } else {
      item.classList.remove("active");
      item.style.display = "none";
    }
  });

  visibleItems.forEach((item, index) => {
    const projectContent = item.querySelector(".project-content");
    if (projectContent) {
      projectContent.classList.toggle("reverse", index % 2 !== 0);
    }

    const nextSibling = item.nextElementSibling;
    if (nextSibling && nextSibling.classList.contains("divider")) {
      nextSibling.style.display = "block";
    }
  });

  adjustProjectImageHeights(); // Fix height after filtering
};

filterFunc("all");

// Contact form
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

if (form && formInputs && formBtn) {
  formInputs.forEach((input) => {
    input.addEventListener("input", () => {
      formBtn.disabled = !form.checkValidity();
    });
  });
}

// Navigation
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

const showPage = (pageName) => {
  pages.forEach((page, i) => {
    const isActive = page.dataset.page === pageName;
    page.classList.toggle("active", isActive);
    navigationLinks[i].classList.toggle("active", isActive);
  });
  window.scrollTo(0, 0);
};

const lastSelectedPage = localStorage.getItem("lastSelectedPage") || "projects";
showPage(lastSelectedPage);

navigationLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const selectedPage = link.innerHTML.toLowerCase();
    showPage(selectedPage);
    localStorage.setItem("lastSelectedPage", selectedPage);
  });
});

// Project modal
const openModal = (src, alt, maxWidth = "90%", maxHeight = "90%") => {
  modalImage.src = src;
  modalImage.alt = alt || "";
  modalContent.style.setProperty("--modal-max-width", maxWidth);
  modalContent.style.setProperty("--modal-max-height", maxHeight);
  modalContainer.classList.add("active");
};

const closeModal = () => {
  modalContainer.classList.remove("active");
  modalImage.src = "";
  modalImage.alt = "";
};

const projectImages = document.querySelectorAll(".project-images img, .project-images video");
if (projectImages.length > 0) {
  projectImages.forEach((media) => {
    media.addEventListener("click", () => {
      openModal(media.src, media.alt, "80%", "80%");
    });
  });
}

modalContainer.addEventListener("click", closeModal);

// Playback speed for videos
const setPlaybackSpeed = () => {
  const projectVideos = document.querySelectorAll(".project-images video");
  projectVideos.forEach((video) => {
    const speed = video.getAttribute("data-playback-speed");
    if (speed) video.playbackRate = parseFloat(speed);
  });
};

document.addEventListener("DOMContentLoaded", setPlaybackSpeed);  

// Theme toggle
const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "light") {
    document.documentElement.classList.add("light-mode");
    themeToggle.textContent = "🌙";
  }

  themeToggle.addEventListener("click", () => {
    const isLight = document.documentElement.classList.toggle("light-mode");
    localStorage.setItem("theme", isLight ? "light" : "dark");
    themeToggle.textContent = isLight ? "🌙" : "☀️";
  });
}

// === Adjust Project Image Heights Per Item ===
function adjustProjectImageHeights() {
  requestAnimationFrame(() => {
    document.querySelectorAll(".project-item").forEach(item => {
      const image = item.querySelector(".project-images");
      const details = item.querySelector(".project-details");

      if (image && details) {
        const height = details.getBoundingClientRect().height;
        image.style.height = `${height}px`;
      }
    });
  });
}

// Call this function after content loads and on window resize
window.addEventListener("load", () => {
  setTimeout(adjustProjectImageHeights, 300);
});

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(adjustProjectImageHeights, 150);
});

