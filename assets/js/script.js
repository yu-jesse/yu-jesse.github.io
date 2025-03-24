'use strict';

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });

// hobbies variables
const hobbiesItem = document.querySelectorAll("[data-hobbies-item]");

// modal variables
const modalContainer = document.querySelector("[data-modal-container]");
const modalImage = document.querySelector("[data-modal-image]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const hobbiesModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < hobbiesItem.length; i++) {
  hobbiesItem[i].addEventListener("click", function () {
    modalImg.src = this.querySelector("[data-hobbies-avatar]").src;
    modalImg.alt = this.querySelector("[data-hobbies-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-hobbies-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-hobbies-text]").innerHTML;
    hobbiesModalFunc();
  });
}

// add click event to modal close button
modalCloseBtn.addEventListener("click", hobbiesModalFunc);
overlay.addEventListener("click", hobbiesModalFunc);

// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-select-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

// Dropdown toggle
select.addEventListener("click", function () {
  elementToggleFunc(this);
});

// Add event to all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {
    const selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText; // Update the displayed value
    elementToggleFunc(select); // Close the dropdown
    filterFunc(selectedValue); // Apply the filter
  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

// Filter function
const filterFunc = function (selectedValue) {
  // Hide all dividers initially
  const dividers = document.querySelectorAll(".divider");
  dividers.forEach((divider) => {
    divider.style.display = "none";
  });

  // Filter items based on the selected value
  const visibleItems = [];
  for (let i = 0; i < filterItems.length; i++) {
    const itemCategory = filterItems[i].dataset.category;

    if (selectedValue === "all" || selectedValue === itemCategory) {
      filterItems[i].classList.add("active");
      filterItems[i].style.display = "block";
      visibleItems.push(filterItems[i]);
    } else {
      filterItems[i].classList.remove("active");
      filterItems[i].style.display = "none";
    }
  }

  // Add dividers between visible items
  for (let i = 0; i < visibleItems.length - 1; i++) {
    const nextSibling = visibleItems[i].nextElementSibling;
    if (nextSibling && nextSibling.classList.contains("divider")) {
      nextSibling.style.display = "block"; // Show the divider
    }
  }

  // Apply alternating alignment for visible items
  visibleItems.forEach((item, index) => {
    const projectContent = item.querySelector(".project-content");
    if (projectContent) {
      if (index % 2 === 0) {
        projectContent.classList.remove("reverse");
      } else {
        projectContent.classList.add("reverse");
      }
    }
  });
};

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {
  filterBtn[i].addEventListener("click", function () {
    const selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText; // Sync dropdown value with button
    filterFunc(selectedValue); // Apply the filter

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;
  });
}

// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {
    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }
  });
}

// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// Function to show the selected page
const showPage = function (pageName) {
  for (let i = 0; i < pages.length; i++) {
    if (pageName === pages[i].dataset.page) {
      pages[i].classList.add("active");
      navigationLinks[i].classList.add("active");
      window.scrollTo(0, 0);
    } else {
      pages[i].classList.remove("active");
      navigationLinks[i].classList.remove("active");
    }
  }
}

// Retrieve the last selected page from localStorage
const lastSelectedPage = localStorage.getItem("lastSelectedPage") || "projects";
showPage(lastSelectedPage);

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    const selectedPage = this.innerHTML.toLowerCase();
    showPage(selectedPage);
    localStorage.setItem("lastSelectedPage", selectedPage);
  });
}

// Function to open the modal with the clicked image
const openModal = function (src, alt) {
  modalImage.src = src;
  modalImage.alt = alt || ""; // Use empty alt if not provided
  modalContainer.classList.add("active");
  modalImage.style.cursor = "pointer"; // Change cursor to zoom-out
};

// Function to close the modal
const closeModal = function () {
  modalContainer.classList.remove("active");
  modalImage.src = ""; // Clear the modal content
  modalImage.alt = "";
};

// Add click event to all project images
const projectImages = document.querySelectorAll(".project-images img");
projectImages.forEach((img) => {
  img.addEventListener("click", function () {
    openModal(this.src, this.alt);
  });
});

// Add click event to close button, overlay, and modal image
modalCloseBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);
modalImage.addEventListener("click", closeModal);

// Call filterFunc with the default filter value on initial load
filterFunc("all");

// Function to set the playback speed for all videos based on their data attribute
const setPlaybackSpeed = function () {
  const projectVideos = document.querySelectorAll(".project-images video");
  projectVideos.forEach((video) => {
    const playbackSpeed = video.getAttribute("data-playback-speed");
    if (playbackSpeed) {
      video.playbackRate = parseFloat(playbackSpeed);
    }
  });
};

// Set the default playback speed when the page loads
document.addEventListener("DOMContentLoaded", function () {
  setPlaybackSpeed();
});