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

// media.src
function getMediaSrc(media) {
  if (media.tagName.toLowerCase() === 'video') {
    const source = media.querySelector('source');
    return source?.src || media.getAttribute('src');
  }
  return media.src;
}

function addDotsNavigation() {
  const dotsHTML = modalImageList.map((_, index) => {
    const isActive = index === currentImageIndex ? "active" : "";
    return `<span class="modal-dot ${isActive}" data-dot-index="${index}"></span>`;
  }).join("");

  const dotsWrapper = document.createElement("div");
  dotsWrapper.classList.add("modal-dots");
  dotsWrapper.innerHTML = dotsHTML;
  modalContent.appendChild(dotsWrapper);

  dotsWrapper.querySelectorAll(".modal-dot").forEach(dot => {
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      const targetIndex = parseInt(dot.dataset.dotIndex);
      if (!isNaN(targetIndex)) {
        currentImageIndex = targetIndex;
        const media = modalImageList[currentImageIndex];
        const mediaType = media.tagName.toLowerCase() === 'video' ? 'video' : 'image';
        openModal(getMediaSrc(media), media.getAttribute('alt'), mediaType);
      }
    });
  });
}


// === Modal Functions ===
function openModal(src, alt, type) {
  const isFirstOpen = !modalContainer.classList.contains("active");

  if (isFirstOpen) {
    scrollPosition = window.scrollY;
    pageWrap.style.top = `-${scrollPosition}px`;
    document.body.classList.add("modal-open");
  }

  let mediaElement;
  if (type === 'video') {
    mediaElement = `
      <video controls muted style="max-width: 90vw; max-height: 90vh; object-fit: contain; border-radius: 8px;">
        <source src="${src}" type="video/mp4">
      </video>`;
  } else {
    mediaElement = `<img src="${src}" alt="${alt || ""}" style="max-width: 90vw; max-height: 90vh; object-fit: contain; border-radius: 8px;">`;
  }

  modalContent.innerHTML = `
    <button class="modal-close-btn" aria-label="Close modal">&times;</button>
    ${mediaElement}
    <span class="modal-arrow modal-prev" onclick="showPreviousMedia(event)">&#10094;</span>
    <span class="modal-arrow modal-next" onclick="showNextMedia(event)">&#10095;</span>
  `;

  const prevArrow = modalContent.querySelector('.modal-prev');
  const nextArrow = modalContent.querySelector('.modal-next');

  if (currentImageIndex === 0) {
    prevArrow.classList.add("disabled");
  }
  if (currentImageIndex === modalImageList.length - 1) {
    nextArrow.classList.add("disabled");
  }

  modalContent.querySelectorAll('.modal-arrow').forEach(arrow => {
    arrow.addEventListener('click', (e) => e.stopPropagation());
  });

  modalContainer.classList.add("active");

  // Add event listener for close button
  modalContent.querySelector(".modal-close-btn").addEventListener("click", closeModal);

  addDotsNavigation();
}


function closeModal() {
  const video = modalContent.querySelector("video");
  if (video) video.pause();

  modalContainer.classList.add("closing");

  setTimeout(() => {
    modalContainer.classList.remove("active", "closing");
    modalContent.innerHTML = "";

    document.body.classList.remove("modal-open");
    pageWrap.style.top = "";
    window.scrollTo(0, scrollPosition);
  }, 300);
}


function isMobile() {
  return window.innerWidth <= 768;
}

function showNextMedia(event) {
  if (event) event.stopPropagation();
  if (currentImageIndex < modalImageList.length - 1) {
    currentImageIndex++;
    const media = modalImageList[currentImageIndex];
    const mediaType = media.tagName.toLowerCase() === 'video' ? 'video' : 'image';
    openModal(getMediaSrc(media), media.getAttribute('alt'), mediaType);
  }
}

function showPreviousMedia(event) {
  if (event) event.stopPropagation();
  if (currentImageIndex > 0) {
    currentImageIndex--;
    const media = modalImageList[currentImageIndex];
    const mediaType = media.tagName.toLowerCase() === 'video' ? 'video' : 'image';
    openModal(getMediaSrc(media), media.getAttribute('alt'), mediaType);
  }
}

// === Image Click → Open Modal ===
const projectMedia = document.querySelectorAll(".project-images img, .project-images video");
modalImageList = Array.from(projectMedia);

projectMedia.forEach((media) => {
  if (media.tagName.toLowerCase() === 'video') {
    // Add special click handler for videos
    media.addEventListener("click", (e) => {
      const rect = media.getBoundingClientRect();
      const clickY = e.clientY - rect.top;

      const isClickInControls = clickY > rect.height - 40; // estimate control height

      if (!isClickInControls) {
        e.preventDefault();
        e.stopPropagation();

        const projectItem = media.closest(".project-item");
        modalImageList = Array.from(projectItem.querySelectorAll(".project-images img, .project-images video"));
        currentImageIndex = modalImageList.indexOf(media);
        const mediaType = 'video';
        openModal(getMediaSrc(media), media.getAttribute('alt'), mediaType);
      }
      // else: allow the video to play normally
    });
  } else {
    // For images
    media.addEventListener("click", () => {
      const projectItem = media.closest(".project-item");
      modalImageList = Array.from(projectItem.querySelectorAll(".project-images img, .project-images video"));
      currentImageIndex = modalImageList.indexOf(media);
      const mediaType = 'image';
      openModal(getMediaSrc(media), media.getAttribute('alt'), mediaType);
    });
  }
});



// === Arrow Key Navigation in Modal ===
document.addEventListener("keydown", (event) => {
  const isModalOpen = modalContainer.classList.contains("active");
  if (!isModalOpen) return;

  if (event.key === "Escape") {
    closeModal();
  } else if (event.key === "ArrowLeft") {
    showPreviousMedia();
  } else if (event.key === "ArrowRight") {
    showNextMedia();
  }
});

// === Close Modal on Overlay Click ===
// modalContainer.addEventListener("click", closeModal);

modalContainer.addEventListener("click", (event) => {
  if (!event.target.closest(".modal-content")) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modalContainer.classList.contains("active")) {
    closeModal();
  }
});


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

  const media = modalImageList[newIndex];
  const mediaType = media.tagName.toLowerCase() === 'video' ? 'video' : 'image';
  openModal(getMediaSrc(media), media.getAttribute('alt'), mediaType);

  const direction = touchEndX < touchStartX ? 'left' : 'right';

  if (direction === 'left') {
    showNextMedia();
  } else {
    showPreviousMedia();
  }

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

let touchStartY = 0;
let touchEndY = 0;

modalContainer.addEventListener("touchstart", (e) => {
  touchStartY = e.changedTouches[0].screenY;
}, false);

modalContainer.addEventListener("touchend", (e) => {
  touchEndY = e.changedTouches[0].screenY;
  handleSwipeDownGesture();
}, false);

function handleSwipeDownGesture() {
  if (touchEndY > touchStartY + 50) { // Detects a downward swipe of more than 50px
    closeModal();
  }
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
