function goToSetupPage() {
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");

    if (!usernameInput || !emailInput) {
        return;
    }

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();

    if (!username || !email) {
        alert("Please enter your full name and email address.");
        return;
    }

    if (!emailInput.checkValidity()) {
        alert("Please enter a valid email address.");
        emailInput.focus();
        return;
    }

    sessionStorage.setItem("username", username);
    sessionStorage.setItem("email", email);

    window.location.href = "setup-password.html";
}


const images = Array.from(
    { length: 50 },
    (_, index) => `images/${index + 1}.webp`
);



let selectedImages = [];

function displayImages() {

    const imageGrid = document.getElementById("image-grid");

    for(let i = 0; i < images.length; i++) {

        imageGrid.innerHTML += `
            <img src="${images[i]}" class="image-box" data-image="${images[i]}" onclick="selectImage('${images[i]}')">`;
        
            

    }

}
displayImages();

function selectImage(imagePath) {

    if(selectedImages.length >= 3) {
        return;
    }
    
    if(selectedImages.includes(imagePath)) {

    document.getElementById("message").innerText =
    "⚠ You have already selected this image.";

    setTimeout(() => {
        document.getElementById("message").innerText = "";
    }, 2000);

    return;
}

    selectedImages.push(imagePath);

    document.getElementById("password-preview").innerHTML += `
    <img src="${imagePath}" class="preview-image">`;

    if(selectedImages.length === 3) {
    document.getElementById("save-btn").style.display = "inline-block";
}

    const clickedImage =
    document.querySelector(`[data-image="${imagePath}"]`);

    clickedImage.classList.add("selected");

    document.getElementById("selected-count").innerText =
        `Selected: ${selectedImages.length} / 3`;

    console.log(selectedImages);

}

async function savePassword() {

    const name = sessionStorage.getItem("username");
    const email = sessionStorage.getItem("email"); 

    console.log(name);
    console.log(email);
    console.log(selectedImages);

    const registerData = {
        name: name,
        email: email,
        image1: selectedImages[0].split("/").pop(),
        image2: selectedImages[1].split("/").pop(),
        image3: selectedImages[2].split("/").pop()
    };

    const response = await fetch("http://127.0.0.1:8001/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(registerData)
    });

    const result = await response.json();

    console.log(result);

    if (response.ok) {
        alert("Password Saved Successfully!");
        window.location.href = "login.html";
    } else {
        alert("Registration failed!");
    }
}