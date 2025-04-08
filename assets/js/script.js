'use strict';

// === Modal State ===
let modalImageList = [];
let currentImageIndex = -1;
// === Touch Events for Mobile ===
let touchStartX = 0;
let touchEndX = 0;

let scrollPosition = 0;
const pageWrap = document.getElementById('page-wrap');

// === Utility Functions ===
const elementToggleFunc = (elem) => elem.classList.toggle("active");

// === Sidebar Toggle ===
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");
if (sidebar && sidebarBtn) {
  sidebarBtn.addEventListener("click", () => elementToggleFunc(sidebar));
}

// === Modal Elements ===
const modalContainer = document.querySelector(".modal-container");
const modalContent = document.querySelector(".modal-content");

// === Filter Buttons & Dropdown ===
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

// === Filter Project Items ===
const filterFunc = (selectedValue) => {
  const dividers = document.querySelectorAll(".divider");
  dividers.forEach((divider) => (divider.style.display = "none"));

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

  adjustProjectImageHeights();
};

filterFunc("all");

// === Navigation (About / Resume / Projects etc.) ===
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

const showPage = (pageName) => {
  pages.forEach((page, i) => {
    const isActive = page.dataset.page === pageName;
    page.classList.toggle("active", isActive);
    navigationLinks[i].classList.toggle("active", isActive);
  });

  window.scrollTo(0, 0);

  if (pageName === "projects") {
    waitForProjectImagesToLoad(() => {
      adjustProjectImageHeights();
    });
  }
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

// === Modal Functions ===
function openModal(src, alt) {
  const isFirstOpen = !modalContainer.classList.contains("active");

  if (isFirstOpen) {
    scrollPosition = window.scrollY;
    pageWrap.style.top = `-${scrollPosition}px`;
    document.body.classList.add("modal-open");
  }

  modalContent.innerHTML = `
    <span class="modal-arrow modal-prev" onclick="showPreviousImage()">&#10094;</span>
    <img src="${src}" alt="${alt || ""}" style="max-width: 90vw; max-height: 90vh; object-fit: contain; border-radius: 8px;">
    <span class="modal-arrow modal-next" onclick="showNextImage()">&#10095;</span>
  `;
  
  const prevArrow = modalContent.querySelector('.modal-prev');
  const nextArrow = modalContent.querySelector('.modal-next');

  // Disable arrows at edges
  if (currentImageIndex === 0) {
    prevArrow.classList.add("disabled");
  }
  if (currentImageIndex === modalImageList.length - 1) {
    nextArrow.classList.add("disabled");
  }

  // Prevent arrow click from bubbling
  modalContent.querySelectorAll('.modal-arrow').forEach(arrow => {
    arrow.addEventListener('click', (e) => e.stopPropagation());
  });


  modalContainer.classList.add("active");

  // Prevent arrow click from closing modal
  modalContent.querySelectorAll('.modal-arrow').forEach(arrow => {
  arrow.addEventListener('click', (e) => e.stopPropagation());
});
}


function closeModal() {
  modalContainer.classList.add("closing");

  setTimeout(() => {
    modalContainer.classList.remove("active", "closing");
    modalContent.innerHTML = "";

    // Restore scroll position
    document.body.classList.remove("modal-open");
    pageWrap.style.top = "";
    window.scrollTo(0, scrollPosition);

  }, 300);
}
function isMobile() {
  return window.innerWidth <= 768;
}

function showNextImage() {
  if (isMobile()) return; // disable on mobile
  if (currentImageIndex < modalImageList.length - 1) {
    currentImageIndex++;
    const img = modalImageList[currentImageIndex];
    openModal(img.src, img.alt);
  }
}

function showPreviousImage() {
  if (isMobile()) return; // disable on mobile
  if (currentImageIndex > 0) {
    currentImageIndex--;
    const img = modalImageList[currentImageIndex];
    openModal(img.src, img.alt);
  }
}


// === Image Click → Open Modal ===
const projectImages = document.querySelectorAll(".project-images img");

projectImages.forEach((img) => {
  img.addEventListener("click", () => {
    const projectItem = img.closest(".project-item");
    modalImageList = Array.from(projectItem.querySelectorAll(".project-images img"));
    currentImageIndex = modalImageList.indexOf(img);
    openModal(img.src, img.alt);
  });
});

// === Arrow Key Navigation in Modal ===
document.addEventListener("keydown", (event) => {
  const isModalOpen = modalContainer.classList.contains("active");
  if (!isModalOpen) return;

  if (event.key === "Escape") {
    closeModal();
  } else if (event.key === "ArrowLeft") {
    showPreviousImage();
  } else if (event.key === "ArrowRight") {
    showNextImage();
  }
});

function showNextImage() {
  if (currentImageIndex < modalImageList.length - 1) {
    currentImageIndex++;
    const img = modalImageList[currentImageIndex];
    openModal(img.src, img.alt);
  }
}

function showPreviousImage() {
  if (currentImageIndex > 0) {
    currentImageIndex--;
    const img = modalImageList[currentImageIndex];
    openModal(img.src, img.alt);
  }
}

// === Close Modal on Overlay Click ===
modalContainer.addEventListener("click", closeModal);

// === Video Playback Speed ===
const setPlaybackSpeed = () => {
  const projectVideos = document.querySelectorAll(".project-images video");
  projectVideos.forEach((video) => {
    const speed = video.getAttribute("data-playback-speed");
    if (speed) video.playbackRate = parseFloat(speed);
  });
};

modalContainer.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, false);

modalContainer.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipeGesture();
}, false);

function handleSwipeGesture() {
  if (Math.abs(touchStartX - touchEndX) < 50) return;

  const direction = touchEndX < touchStartX ? 'left' : 'right';

  const canGoNext = direction === 'left' && currentImageIndex < modalImageList.length - 1;
  const canGoPrev = direction === 'right' && currentImageIndex > 0;

  if (!canGoNext && !canGoPrev) return;

  const newIndex = currentImageIndex + (direction === 'left' ? 1 : -1);
  const img = modalImageList[newIndex];

  // Add animation class
  modalContent.classList.add(`swipe-${direction}`);

  // Wait for transition then update image
  setTimeout(() => {
    currentImageIndex = newIndex;
    openModal(img.src, img.alt);

    // Remove swipe class after new modal opens
    setTimeout(() => {
      modalContent.classList.remove(`swipe-${direction}`);
    }, 300);
  }, 50);
}

// === DOM Ready Logic ===
document.addEventListener("DOMContentLoaded", () => {
  setPlaybackSpeed();
  fixVideoAspectRatio();
});

// === Theme Toggle ===
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

// === Adjust Project Image Heights ===
function adjustProjectImageHeights() {
  const items = document.querySelectorAll(".project-item");
  items.forEach(item => {
    const image = item.querySelector(".project-images");
    const details = item.querySelector(".project-details");

    if (image && details) {
      const height = details.getBoundingClientRect().height;
      image.style.height = `${height}px`;
    }
  });
}

// === Wait for Images to Load ===
function waitForProjectImagesToLoad(callback) {
  const images = document.querySelectorAll(".project-images img");
  let loadedCount = 0;
  const total = images.length;

  if (total === 0) {
    requestAnimationFrame(callback);
    return;
  }

  images.forEach((img) => {
    const checkDone = () => {
      loadedCount++;
      if (loadedCount === total) {
        requestAnimationFrame(() => {
          setTimeout(callback, 20);
        });
      }
    };

    if (img.complete) {
      checkDone();
    } else {
      img.addEventListener("load", checkDone);
      img.addEventListener("error", checkDone);
    }
  });
}

// === Initial Image Height Adjustment ===
window.addEventListener("load", () => {
  waitForProjectImagesToLoad(() => {
    adjustProjectImageHeights();
  });
});

// === Resize Debounce for Image Heights ===
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(adjustProjectImageHeights, 150);
});

// === Video Aspect Ratio Fix ===
const fixVideoAspectRatio = () => {
  const projectVideos = document.querySelectorAll(".project-images video");
  projectVideos.forEach((video) => {
    video.style.objectFit = "contain";
  });
};
