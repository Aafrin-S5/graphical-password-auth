const API_URL = "http://127.0.0.1:8001";

const IMAGE_FILES = Array.from(
    { length: 50 },
    (_, index) => `${index + 1}.webp`
);


const selectedImages = [];

const imageGrid = document.getElementById("image-grid");
const selectedCount = document.getElementById("selected-count");
const passwordPreview = document.getElementById("password-preview");
const message = document.getElementById("message");
const saveButton = document.getElementById("save-btn");
const galleryCount = document.getElementById("gallery-count");
const progressFill = document.getElementById("progress-fill");
const countBadge = document.getElementById("count-badge");

let isSaving = false;

/* Fisher-Yates shuffle */
function shuffleArray(array) {
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

function showMessage(text) {
    message.textContent = text;
}

function showAlert(text) {
    alert(text);
}

function getImagePath(filename) {
    return `images/${filename}`;
}

/* Display the 50 images in a shuffled order */
function displayImages() {
    imageGrid.innerHTML = "";

    galleryCount.textContent = `${IMAGE_FILES.length} images`;

    const shuffledImages = shuffleArray(IMAGE_FILES);

    shuffledImages.forEach((filename) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "image-option";
        button.dataset.filename = filename;
        button.setAttribute("aria-pressed", "false");
        button.setAttribute("aria-label", `Select image ${filename}`);

        const img = document.createElement("img");

        img.src = getImagePath(filename);
        img.alt = `Image ${filename}`;
        img.loading = "lazy";

        img.addEventListener("error", () => {
            button.hidden = true;
            console.error(`Image not found: ${getImagePath(filename)}`);
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

/* Select or deselect images */
function selectImage(filename) {
    if (isSaving) {
        return;
    }

    const existingIndex = selectedImages.indexOf(filename);

    // Clicking a selected image removes it.
    if (existingIndex !== -1) {
        selectedImages.splice(existingIndex, 1);

        showMessage("");
        updateUI();
        return;
    }

    // Do not allow more than three selected images.
    if (selectedImages.length >= 3) {
        showAlert("You have already selected all 3 images!");
        return;
    }


    selectedImages.push(filename);

    showMessage("");
    updateUI();
}

function updateUI() {
    const allImageButtons =
        imageGrid.querySelectorAll(".image-option");

    allImageButtons.forEach((button) => {
        const filename = button.dataset.filename;
        const index = selectedImages.indexOf(filename);
        const number = button.querySelector(".selection-number");

        if (index !== -1) {
            button.classList.add("selected");
            number.textContent = index + 1;
            button.setAttribute("aria-pressed", "true");
            button.setAttribute(
                "aria-label",
                `Image ${filename}, selected as number ${index + 1}. Click to deselect.`
            );
        } else {
            button.classList.remove("selected");
            number.textContent = "";
            button.setAttribute("aria-pressed", "false");
            button.setAttribute(
                "aria-label",
                `Select image ${filename}`
            );
        }
    });

    selectedCount.textContent =
        `Selected: ${selectedImages.length} / 3`;

    progressFill.style.width =
        `${(selectedImages.length / 3) * 100}%`;

    const complete = selectedImages.length === 3;

    countBadge.textContent = complete
        ? "READY TO SAVE"
        : "INCOMPLETE";

    countBadge.classList.toggle("ready", complete);

    updatePreview();

    // Button appears and is enabled only when exactly 3 are selected.
    saveButton.style.display = complete ? "block" : "none";
    saveButton.disabled = !complete || isSaving;

    saveButton.textContent = isSaving
        ? "Saving..."
        : "Save Password →";
}

function updatePreview() {
    passwordPreview.innerHTML = "";

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

        passwordPreview.appendChild(slot);
    }
}

/* Send the registration details to FastAPI */
async function savePassword() {
    if (isSaving) {
        return;
    }

    if (selectedImages.length !== 3) {
        showAlert("Please select exactly 3 images before saving.");
        return;
    }

    const name = sessionStorage.getItem("username");
    const email = sessionStorage.getItem("email");

    if (!name || !email) {
        showAlert(
            "Registration details are missing. Please register again."
        );

        window.location.href = "register.html";
        return;
    }

    const registerData = {
        name: name,
        email: email,
        image1: selectedImages[0],
        image2: selectedImages[1],
        image3: selectedImages[2]
    };

    isSaving = true;
    updateUI();
    showMessage("");

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(registerData)
        });

        // Read the response safely, even if the server returns non-JSON.
        const responseText = await response.text();

        let result = {};

        try {
            result = responseText ? JSON.parse(responseText) : {};
        } catch {
            result = {};
        }

        if (!response.ok) {
            throw new Error(
                result.detail ||
                result.message ||
                `Registration failed (${response.status}).`
            );
        }

        showAlert("Password saved successfully!");

        window.location.href = "login.html";

    } catch (error) {
        console.error("Save password error:", error);

        if (error instanceof TypeError) {
            showMessage(
                "Could not connect to the backend. Check that FastAPI is running on port 8001."
            );
        } else {
            showMessage(
                error.message || "Unable to save your password. Please try again."
            );
        }

        isSaving = false;
        updateUI();
    }
}

saveButton.addEventListener("click", savePassword);

/* Start the page */
displayImages();