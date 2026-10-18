"use strict";


const images = Array.from(
  { length: 50 },
  (_, index) => `images/${index + 1}.webp`
);

// Fisher-Yates Shuffle
function shuffleImages(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

let selectedImages = [];
let attempts = 0;
let isLoggingIn = false;

let isAccountLocked = false;
let countdownInterval = null;

const MAX_ATTEMPTS = 3;
const LOGIN_API = "http://127.0.0.1:8001/login";
const ACCOUNT_STATUS_API = "http://127.0.0.1:8001/account-status";
const DASHBOARD_URL = "dashboard.html";

const imageGrid = document.getElementById("image-grid");
const passwordPreview = document.getElementById("password-preview");
const selectedCount = document.getElementById("selected-count");
const message = document.getElementById("message");
const loginButton = document.getElementById("login-btn");
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");

emailInput.addEventListener("blur", checkAccountStatus);

// Display a message to the user.
function showMessage(text, type = "error") {
  message.textContent = text;
  message.style.color =
    type === "success" ? "#287a4b" : "#b5364d";
}



// Create an optimized image gallery.
function displayImages() {
  imageGrid.innerHTML = "";

  const fragment = document.createDocumentFragment();

  images.forEach((imagePath, index) => {
    const image = document.createElement("img");

    image.src = imagePath;
    image.alt = `Secret image option ${index + 1}`;
    image.className = "image-box";
    image.dataset.image = imagePath;
    image.tabIndex = 0;

    image.loading = "lazy";
    image.decoding = "async";

    image.setAttribute("role", "button");
    image.setAttribute("aria-pressed", "false");
    image.setAttribute(
      "aria-label",
      `Select secret image ${index + 1}`
    );

    image.addEventListener("click", () => {
      selectImage(imagePath);
    });

    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectImage(imagePath);
      }
    });

    image.addEventListener("error", () => {
      image.alt = `Image ${index + 1} could not be loaded`;
      image.classList.add("image-error");
    });

    fragment.appendChild(image);
  });

  imageGrid.appendChild(fragment);
}



// Select or deselect an image.
function selectImage(imagePath) {
   if (isLoggingIn || isAccountLocked || attempts >= MAX_ATTEMPTS) {
    return; 
  }

  const clickedImage = Array.from(
    document.querySelectorAll(".image-box")
  ).find((img) => img.dataset.image === imagePath);

  // Clicking an already-selected image removes it.
  if (selectedImages.includes(imagePath)) {
    selectedImages = selectedImages.filter(
      (path) => path !== imagePath
    );

    if (clickedImage) {
      clickedImage.classList.remove("selected");
      clickedImage.setAttribute("aria-pressed", "false");
    }

    showMessage("");
    updatePreview();
    return;
  }

  // Only three images can be selected.
  if (selectedImages.length >= 3) {
    showMessage(
      "Three images are already selected. Remove one before choosing another."
    );
    return;
  }

  selectedImages.push(imagePath);

  if (clickedImage) {
    clickedImage.classList.add("selected");
    clickedImage.setAttribute("aria-pressed", "true");
  }

  showMessage("");
  updatePreview();
}

// Update the three large preview slots.
function updatePreview() {
  selectedCount.textContent =
    `Selected: ${selectedImages.length} / 3`;

  passwordPreview.innerHTML = "";

  for (let index = 0; index < 3; index++) {
    const slot = document.createElement("div");
    slot.className = "preview-slot";

    if (selectedImages[index]) {
      const preview = document.createElement("img");

      preview.src = selectedImages[index];
      preview.alt = `Selected image ${index + 1}`;

      const number = document.createElement("span");
      number.className = "slot-number";
      number.textContent = `0${index + 1}`;

      slot.append(preview, number);
    } else {
      const empty = document.createElement("span");

      empty.className = "empty-slot";
      empty.textContent = `Image ${index + 1}`;

      slot.appendChild(empty);
    }

    passwordPreview.appendChild(slot);
  }
}

// Clear the selected sequence.
function resetSelection() {
  selectedImages = [];

  document.querySelectorAll(".image-box").forEach((img) => {
    img.classList.remove("selected");
    img.setAttribute("aria-pressed", "false");
  });

  updatePreview();
}

// Lock the login interface after three failed attempts.

function lockLogin(lockedUntil) {
  isAccountLocked = true;
  loginButton.disabled = true;
  loginButton.textContent = "Login Locked";

  document.querySelectorAll(".image-box").forEach((img) => {
    img.setAttribute("aria-disabled", "true");
    img.style.cursor = "not-allowed";
  });

  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  function updateCountdown() {
    const remaining = new Date(lockedUntil).getTime() - Date.now();

    if (remaining <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      return;
    }

    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    showMessage(
      `Account locked. Try again in ${hours}h ${minutes}m ${seconds}s.`,
      "error"
    );
  }

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}


async function checkAccountStatus() {
  const email = emailInput.value.trim();

  if (!email || !emailInput.checkValidity()) return;

  try {
    const response = await fetch(
      `${ACCOUNT_STATUS_API}?email=${encodeURIComponent(email)}`
    );

    if (!response.ok) return;

    const result = await response.json();

    if (result.locked && result.locked_until) {
      lockLogin(result.locked_until);
    } else {
      isAccountLocked = false;
      attempts = 0;

      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }

      loginButton.disabled = false;
      loginButton.textContent = "Login Securely →";

      document.querySelectorAll(".image-box").forEach((img) => {
        img.setAttribute("aria-disabled", "false");
        img.style.cursor = "pointer";
      });
    }
  } catch (error) {
    console.error("Unable to check account status:", error);
  }
}

// Handle form submission.
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await verifyPassword();
});

// Send the selected sequence to the FastAPI backend.
async function verifyPassword() {

  if (isLoggingIn || isAccountLocked) {
  await checkAccountStatus();

  if (isAccountLocked) return;
}

  if (attempts >= MAX_ATTEMPTS) {
    showMessage("Login is locked after three failed attempts.");
    lockLogin();
    return;
  }

  const email = emailInput.value.trim();

  if (!email) {
    showMessage("Please enter your email address.");
    emailInput.focus();
    return;
  }

  if (!emailInput.checkValidity()) {
    showMessage("Please enter a valid email address.");
    emailInput.focus();
    return;
  }

  if (selectedImages.length !== 3) {
    showMessage(
      "Please select all three images in the correct order."
    );
    return;
  }

  const loginData = {
    email: email,
    image1: selectedImages[0].split("/").pop(),
    image2: selectedImages[1].split("/").pop(),
    image3: selectedImages[2].split("/").pop()
  };

  isLoggingIn = true;
  loginButton.disabled = true;
  loginButton.textContent = "Verifying...";
  showMessage("");

  let loginSucceeded = false;

  try {
    const response = await fetch(LOGIN_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(loginData)
    });

    let result = {};

    try {
      result = await response.json();
    } catch {
      result = {};
    }

    if (result.locked && result.locked_until) {
  resetSelection();
  lockLogin(result.locked_until);
  return;
}

    if (response.ok && result.success) {
      loginSucceeded = true;

      sessionStorage.setItem("isLoggedIn","true");

      showMessage(
        "Login successful. Redirecting...",
        "success"
      );

      window.location.href = "dashboard.html";
      return;
    }

    attempts++;

    if (typeof result.attempts_left === "number") {
  attempts = MAX_ATTEMPTS - result.attempts_left;
}

    if (attempts >= MAX_ATTEMPTS) {
      resetSelection();
      showMessage("Three failed attempts. Login is locked.", "error");
      return;
    }

    const serverMessage =
      typeof result.message === "string"
        ? result.message
        : "Login failed. Check your details and image order.";

    showMessage(
      `${serverMessage} Attempt ${attempts} of ${MAX_ATTEMPTS}.`,
        "error"
    );

    resetSelection();

  } catch (error) {
    showMessage(
      "Unable to connect to the server. Check that the backend is running."
    );

  } finally {
    isLoggingIn = false;

    if (loginSucceeded) {
      return;
    }

    if (isAccountLocked) {
  return;
}

if (attempts >= MAX_ATTEMPTS) {
  checkAccountStatus();
} else {
  loginButton.disabled = false;
  loginButton.textContent = "Login Securely →";
}
  }
}

// Initialize the page.
shuffleImages(images);
displayImages();
updatePreview();