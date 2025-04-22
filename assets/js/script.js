'use strict';

/* === Global Modal State === */
let modalImageList = [];
let currentImageIndex = -1;

/* === Scroll Lock & Touch Coordinates === */
let scrollPosition = 0;
const pageWrap = document.getElementById('page-wrap');
let touchStartX = 0, touchEndX = 0;
let touchStartY = 0, touchEndY = 0;

/* === Element Toggle Utility === */
const elementToggleFunc = (elem) => elem.classList.toggle("active");

/* === Sidebar === */
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");
if (sidebar && sidebarBtn) {
  sidebarBtn.addEventListener("click", () => elementToggleFunc(sidebar));
}

/* === Modal Elements === */
const modalContainer = document.querySelector(".modal-container");
const modalContent = document.querySelector(".modal-content");

/* === Filter and Dropdown === */
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

/* === Filter Function === */
const filterFunc = (selectedValue) => {
  const dividers = document.querySelectorAll(".divider");
  dividers.forEach((divider) => (divider.style.display = "none"));

  filterItems.forEach((item) => {
    const itemCategories = item.dataset.category.split(" "); // Split categories into an array
    if (selectedValue === "all" || itemCategories.includes(selectedValue)) {
      item.classList.add("active");
      item.style.display = "block";
    } else {
      item.classList.remove("active");
      item.style.display = "none";
    }
  });

  const visibleItems = Array.from(filterItems).filter(
    (item) => item.style.display === "block"
  );

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

/* === Navigation === */
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

/* === Modal Helpers === */
function getMediaSrc(media) {
  if (media.tagName.toLowerCase() === 'video') {
    const source = media.querySelector('source');
    return source?.src || media.getAttribute('src');
  }
  return media.src;
}

function isMobile() {
  return window.innerWidth <= 768;
}

/* === Modal Navigation Dots === */
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

/* === Modal Open/Close === */
function updateArrowVisibility() {
  const prevArrow = document.querySelector(".modal-prev");
  const nextArrow = document.querySelector(".modal-next");

  if (currentImageIndex === 0) {
    prevArrow.classList.add("disabled");
  } else {
    prevArrow.classList.remove("disabled");
  }

  if (currentImageIndex === modalImageList.length - 1) {
    nextArrow.classList.add("disabled");
  } else {
    nextArrow.classList.remove("disabled");
  }
}

function openModal(src, alt, type) {
  const isFirstOpen = !modalContainer.classList.contains("active");
  if (isFirstOpen) {
    scrollPosition = window.scrollY;
    pageWrap.style.top = `-${scrollPosition}px`;
    document.body.classList.add("modal-open");
  }

  const mediaElement = type === 'video'
    ? `<video controls muted style="max-width: 80vw; max-height: 70vh; object-fit: contain; border-radius: 8px;">
         <source src="${src}" type="video/mp4">
       </video>`
    : `<img src="${src}" alt="${alt || ""}" style="max-width: 80vw; max-height: 70vh; object-fit: contain; border-radius: 8px;">`;

  const caption = alt || "No description available"; // Default caption if none is provided

  modalContent.innerHTML = `
    <button class="modal-close-btn" aria-label="Close modal">&times;</button>
    ${mediaElement}
    <div class="modal-caption">${caption}</div>
    <span class="modal-arrow modal-prev" onclick="showPreviousMedia(event)">&#10094;</span>
    <span class="modal-arrow modal-next" onclick="showNextMedia(event)">&#10095;</span>
  `;

  modalContainer.classList.add("active");
  modalContent.querySelector(".modal-close-btn").addEventListener("click", closeModal);
  modalContent.querySelectorAll('.modal-arrow').forEach(arrow => arrow.addEventListener('click', e => e.stopPropagation()));

  addDotsNavigation();
  updateArrowVisibility();
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

/* === Modal Navigation === */
function showNextMedia(event, isSwipe = false) {
  if (event) event.stopPropagation();
  if (currentImageIndex < modalImageList.length - 1) {
    currentImageIndex++;
    const media = modalImageList[currentImageIndex];
    const mediaType = media.tagName.toLowerCase() === 'video' ? 'video' : 'image';

    // If triggered by swipe, add the slide-in animation
    if (isSwipe) {
      modalContent.querySelector(mediaType).classList.add("slide-in-right");
    }

    openModal(getMediaSrc(media), media.getAttribute('alt'), mediaType);

    // Remove the animation class after it finishes
    if (isSwipe) {
      const newMedia = modalContent.querySelector(mediaType);
      newMedia.addEventListener(
        "animationend",
        () => {
          newMedia.classList.remove("slide-in-right");
        },
        { once: true }
      );
    }

    updateArrowVisibility();
  }
}

function showPreviousMedia(event, isSwipe = false) {
  if (event) event.stopPropagation();
  if (currentImageIndex > 0) {
    currentImageIndex--;
    const media = modalImageList[currentImageIndex];
    const mediaType = media.tagName.toLowerCase() === 'video' ? 'video' : 'image';

    // If triggered by swipe, add the slide-in animation
    if (isSwipe) {
      modalContent.querySelector(mediaType).classList.add("slide-in-left");
    }

    openModal(getMediaSrc(media), media.getAttribute('alt'), mediaType);

    // Remove the animation class after it finishes
    if (isSwipe) {
      const newMedia = modalContent.querySelector(mediaType);
      newMedia.addEventListener(
        "animationend",
        () => {
          newMedia.classList.remove("slide-in-left");
        },
        { once: true }
      );
    }

    updateArrowVisibility();
  }
}

/* === Project Media Click === */
const projectMedia = document.querySelectorAll(".project-images img, .project-images video");
modalImageList = Array.from(projectMedia);

projectMedia.forEach((media) => {
  const isVideo = media.tagName.toLowerCase() === 'video';
  media.addEventListener("click", (e) => {
    if (isVideo) {
      const rect = media.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      if (clickY > rect.height - 40) return; // Allow native controls

      e.preventDefault();
      e.stopPropagation();
    }

    const projectItem = media.closest(".project-item");
    modalImageList = Array.from(projectItem.querySelectorAll(".project-images img, .project-images video"));
    currentImageIndex = modalImageList.indexOf(media);
    openModal(getMediaSrc(media), media.getAttribute('alt'), media.tagName.toLowerCase());
  });
});

/* === Key & Click Modal Close Events === */
document.addEventListener("keydown", (event) => {
  if (!modalContainer.classList.contains("active")) return;
  if (event.key === "Escape") closeModal();
  else if (event.key === "ArrowLeft") showPreviousMedia();
  else if (event.key === "ArrowRight") showNextMedia();
});

modalContainer.addEventListener("click", (event) => {
  if (!event.target.closest(".modal-content")) closeModal();
});

/* === Swipe Support === */
// Handle swipe gestures
function handleSwipeGesture() {
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  // Horizontal swipe detection
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
    if (deltaX > 0) {
      // Swipe right
      showPreviousMedia(null, true); // Pass `true` to indicate swipe
    } else {
      // Swipe left
      showNextMedia(null, true); // Pass `true` to indicate swipe
    }
  }

  // Vertical swipe detection
  if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50 && deltaY > 0) {
    // Swipe down
    modalContainer.classList.add("swipe-down");
    setTimeout(closeModal, 300); // Match the timeout with the CSS transition duration
  }
}

// Detect touch start
modalContainer.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, false);

// Detect touch end
modalContainer.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;
  handleSwipeGesture();
}, false);

// Prevent touchmove event from scrolling the page when modal is open
modalContainer.addEventListener("touchmove", (e) => {
  e.preventDefault();
}, false);

/* === Theme Toggle === */
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

/* === Responsive Project Image Heights === */
function adjustProjectImageHeights() {
  const items = document.querySelectorAll(".project-item");
  items.forEach(item => {
    const image = item.querySelector(".project-images");
    const details = item.querySelector(".project-details");
    if (image && details) {
      image.style.height = `${details.getBoundingClientRect().height}px`;
    }
  });
}

/* === Wait for Project Images to Load === */
function waitForProjectImagesToLoad(callback) {
  const images = document.querySelectorAll(".project-images img");
  let loadedCount = 0, total = images.length;

  if (total === 0) return requestAnimationFrame(callback);

  images.forEach(img => {
    const checkDone = () => {
      loadedCount++;
      if (loadedCount === total) {
        requestAnimationFrame(() => setTimeout(callback, 20));
      }
    };
    img.complete ? checkDone() : img.addEventListener("load", checkDone);
    img.addEventListener("error", checkDone);
  });
}

window.addEventListener("load", () => {
  waitForProjectImagesToLoad(adjustProjectImageHeights);
});

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(adjustProjectImageHeights, 150);
});

/* === Video Aspect Ratio === */
function fixVideoAspectRatio() {
  document.querySelectorAll(".project-images video").forEach(video => {
    video.style.objectFit = "contain";
  });
}

/* === Playback Speed === */
function setPlaybackSpeed() {
  document.querySelectorAll(".project-images video").forEach(video => {
    const speed = video.getAttribute("data-playback-speed");
    if (speed) video.playbackRate = parseFloat(speed);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setPlaybackSpeed();
  fixVideoAspectRatio();
});
