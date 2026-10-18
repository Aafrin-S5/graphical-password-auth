const API_URL = "http://127.0.0.1:8001";

const IMAGE_FILES = Array.from(
    { length: 50 },
    (_, index) => `${index + 1}.webp`
);

const selectedImages = [];

const imageGrid = document.getElementById("image-grid");
const preview = document.getElementById("password-preview");
const count = document.getElementById("selected-count");
const message = document.getElementById("message");
const resetButton = document.getElementById("reset-btn");
const form = document.getElementById("forgot-password-form");
const emailInput = document.getElementById("email");
const galleryCount = document.getElementById("gallery-count");
const progressFill = document.getElementById("progress-fill");
const countBadge = document.getElementById("count-badge");

let isSubmitting = false;
let resetCompleted = false;


// Display messages
function showMessage(text, type = "") {
    message.textContent = text;
    message.className = type ? `message ${type}` : "message";
}


// Get image path
function getImagePath(filename) {
    return `images/${filename}`;
}


// Fisher–Yates Shuffle
function shuffleImages(array) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [
            shuffled[j],
            shuffled[i]
        ];
    }

    return shuffled;
}


// Display 50 images in random order
function displayImages() {
    imageGrid.innerHTML = "";

    galleryCount.textContent = `${IMAGE_FILES.length} images`;

    const shuffledImages = shuffleImages(IMAGE_FILES);

    shuffledImages.forEach((filename) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "image-option";
        button.dataset.filename = filename;

        button.setAttribute(
            "aria-label",
            `Select image ${filename}`
        );

        button.setAttribute("aria-pressed", "false");

        const img = document.createElement("img");

        img.src = getImagePath(filename);
        img.alt = `Image ${filename}`;
        img.loading = "lazy";

        img.addEventListener("error", () => {
            button.hidden = true;

            console.error(
                `Image not found: ${getImagePath(filename)}`
            );
        });

        const number = document.createElement("span");

        number.className = "selection-number";

        button.appendChild(img);
        button.appendChild(number);

        button.addEventListener("click", () => {
            selectImage(filename);
        });

        imageGrid.appendChild(button);
    });

    updateUI();
}


// Select or deselect images
function selectImage(filename) {
    if (isSubmitting || resetCompleted) {
        return;
    }

    showMessage("");

    const existingIndex = selectedImages.indexOf(filename);

    // Clicking an already-selected image removes it
    if (existingIndex !== -1) {
        selectedImages.splice(existingIndex, 1);
        updateUI();
        return;
    }

    // Maximum selection is three
    if (selectedImages.length >= 3) {
        showMessage(
            "You have already selected all 3 images. Remove an image to choose another.",
            "error"
        );

        return;
    }

    // Preserve selection order
    selectedImages.push(filename);

    updateUI();
}


// Update gallery and selection indicators
function updateUI() {
    const buttons = imageGrid.querySelectorAll(".image-option");

    buttons.forEach((button) => {
        const filename = button.dataset.filename;
        const index = selectedImages.indexOf(filename);

        const number = button.querySelector(".selection-number");

        if (index !== -1) {
            button.classList.add("selected");
            number.textContent = index + 1;
            button.setAttribute("aria-pressed", "true");
        } else {
            button.classList.remove("selected");
            number.textContent = "";
            button.setAttribute("aria-pressed", "false");
        }
    });

    count.textContent =
        `Selected: ${selectedImages.length} / 3`;

    progressFill.style.width =
        `${(selectedImages.length / 3) * 100}%`;

    countBadge.textContent =
        selectedImages.length === 3
            ? "READY TO RESET"
            : "INCOMPLETE";

    updatePreview();

    const complete = selectedImages.length === 3;

    resetButton.style.display =
        complete ? "block" : "none";

    resetButton.disabled =
        !complete || isSubmitting || resetCompleted;
}


// Preview selected images in their exact order
function updatePreview() {
    preview.innerHTML = "";

    for (let index = 0; index < 3; index++) {
        const slot = document.createElement("div");

        slot.className = "preview-slot";

        if (selectedImages[index]) {
            const img = document.createElement("img");

            img.className = "preview-image";
            img.src = getImagePath(selectedImages[index]);
            img.alt = `Selected image ${index + 1}`;

            const label = document.createElement("span");

            label.className = "slot-number";
            label.textContent = `IMAGE ${index + 1}`;

            slot.appendChild(img);
            slot.appendChild(label);
        } else {
            const empty = document.createElement("div");

            empty.className = "empty-slot";
            empty.textContent = "+";

            const label = document.createElement("span");

            label.className = "slot-number";
            label.textContent = `IMAGE ${index + 1}`;

            slot.appendChild(empty);
            slot.appendChild(label);
        }

        preview.appendChild(slot);
    }
}


// Reset the graphical password
async function resetPassword(event) {
    event.preventDefault();

    if (isSubmitting || resetCompleted) {
        return;
    }

    showMessage("");

    const email = emailInput.value.trim();

    if (!email || !emailInput.checkValidity()) {
        showMessage(
            "Please enter a valid registered email address.",
            "error"
        );

        emailInput.focus();
        return;
    }

    if (selectedImages.length !== 3) {
        showMessage(
            "Please select exactly 3 different images.",
            "error"
        );

        return;
    }

    // Convert image paths into filenames
    const imageNames = selectedImages.map((path) =>
        path.split("/").pop()
    );

    // Prevent duplicate requests
    isSubmitting = true;

    resetButton.disabled = true;
    resetButton.textContent = "Updating Password...";

    countBadge.textContent = "PROCESSING";

    try {
        const response = await fetch(
            `${API_URL}/forgot-password`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    image1: imageNames[0],
                    image2: imageNames[1],
                    image3: imageNames[2]
                })
            }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                result.detail ||
                result.message ||
                "Unable to reset the password. Please try again."
            );
        }

        // Your original backend uses result.success
        if (result.success === true) {
            resetCompleted = true;

            showMessage(
                result.message || "Graphical password updated successfully.",
                "success"
            );

            selectedImages.length = 0;

            updateUI();

            // Lock the button until the page is reloaded
            resetButton.style.display = "none";
            resetButton.disabled = true;

            countBadge.textContent = "COMPLETED";

            // Do not change email or selected images before the request
            // succeeds. Clear the password selection after success.
        } else {
            throw new Error(
                result.message ||
                "The password could not be updated. Please verify your details."
            );
        }

    } catch (error) {
        console.error("Forgot password error:", error);

        showMessage(
            error.message ||
            "Cannot connect to the backend. Please try again.",
            "error"
        );

        countBadge.textContent =
            selectedImages.length === 3
                ? "READY TO RESET"
                : "INCOMPLETE";

    } finally {
        isSubmitting = false;

        if (!resetCompleted) {
            updateUI();
            resetButton.textContent = "Reset Password →";
        }
    }
}


// Form submit event
form.addEventListener("submit", resetPassword);

displayImages();