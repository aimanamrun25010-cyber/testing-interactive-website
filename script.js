
/* ===================================== */
/* 1. GET HTML ELEMENTS */
/* ===================================== */

const knockContainer = document.getElementById("knock-container");
const knock = document.getElementById("knock");
const knockSound = document.getElementById("knock-sound");

const waiterContainer = document.getElementById("waiter-container");
const waiter = document.getElementById("waiter");

const nameContainer = document.getElementById("name-container");
const userNameInput = document.getElementById("user-name");
const nameSubmit = document.getElementById("name-submit");

const confirmContainer = document.getElementById("confirm-container");
const confirmText = document.getElementById("confirm-text");

const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");

const welcomeContainer = document.getElementById("welcome-container");
const welcomeText = document.getElementById("welcome-text");
const welcomeBtn = document.getElementById("welcome-btn");

const doorContainer = document.getElementById("door-container");

const restaurantContainer = document.getElementById("restaurant-container");
const restaurantDialogue = document.getElementById("restaurant-dialogue");
const readyBtn = document.getElementById("ready-btn");

const finalWaiterContainer = document.getElementById("final-waiter-container");

const fireworkContainer = document.getElementById("firework-container");
const firework = document.getElementById("firework");

const finalMessage = document.getElementById("final-message");
const endingText = document.getElementById("ending-text");


/* ===================================== */
/* 2. VARIABLES */
/* ===================================== */

let userName = "";

let currentScene = 1;

let isKnocking = false;

let isZooming = false;

let isEnding = false;


/* ===================================== */
/* 3. SLEEP FUNCTION */
/* ===================================== */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/* ===================================== */
/* 4. KNOCK THREE TIMES */
/* ===================================== */

knockContainer.addEventListener("click", async function () {

    // Prevent multiple clicks during animation
    if (isKnocking) return;

    isKnocking = true;

    currentScene = 2;

    // Stop hand animation
    knock.style.animation = "none";

    // Show knock sound three times
    for (let i = 0; i < 3; i++) {

        knockSound.style.display = "block";

        await sleep(350);

        knockSound.style.display = "none";

        await sleep(350);

    }

    // Hide knock hand
    knockContainer.style.display = "none";

    // Wait before waiter appears
    await sleep(500);

    showWaiter();

});


/* ===================================== */
/* 5. WAITER APPEARS */
/* ===================================== */

function showWaiter() {

    currentScene = 3;

    waiter.src = "images/waiter1.png";

    waiterContainer.style.display = "block";

    // Show name dialogue
    nameContainer.style.display = "block";

}


/* ===================================== */
/* 6. USER SUBMITS NAME */
/* ===================================== */

nameSubmit.addEventListener("click", submitName);

userNameInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        submitName();
    }

});


function submitName() {

    // Get name and remove extra spaces
    userName = userNameInput.value.trim();

    // Check if input is empty
    if (userName === "") {

        alert("Please enter your name!");

        return;
    }

    currentScene = 4;

    // Hide name dialogue
    nameContainer.style.display = "none";

    // Set confirmation text
    confirmText.textContent = "Is your name " + userName + "?";

    // Show confirmation dialogue
    confirmContainer.style.display = "block";

}


/* ===================================== */
/* 7. NO BUTTON RUNS AWAY */
/* ===================================== */

function moveNoButton() {

    if (currentScene !== 4) return;

    // Change to fixed positioning
    noBtn.style.position = "fixed";

    // Get button dimensions
    const buttonWidth = noBtn.offsetWidth;
    const buttonHeight = noBtn.offsetHeight;

    // Calculate available screen space
    const maxX = Math.max(0, window.innerWidth - buttonWidth - 20);
    const maxY = Math.max(0, window.innerHeight - buttonHeight - 20);

    // Generate random position
    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    // Move button
    noBtn.style.left = randomX + "px";
    noBtn.style.top = randomY + "px";

    document.body.appendChild(noBtn);

}


// Move when mouse approaches
noBtn.addEventListener("mouseenter", moveNoButton);

// Also support touch screens
noBtn.addEventListener("touchstart", function (event) {

    event.preventDefault();

    moveNoButton();

}, { passive: false });

// Prevent accidental No clicks
noBtn.addEventListener("click", function (event) {

    event.preventDefault();

    moveNoButton();

});


/* ===================================== */
/* 8. YES BUTTON */
/* ===================================== */

yesBtn.addEventListener("click", function () {

    if (currentScene !== 4) return;

    currentScene = 5;

    // Hide confirmation
    confirmContainer.style.display = "none";

    // Reset No button
    noBtn.style.position = "";
    noBtn.style.left = "";
    noBtn.style.top = "";

    // Change waiter image
    waiter.src = "images/waiter2.png";

    // Personalized welcome message
    welcomeText.textContent =
        "Welcome, " + userName + "! Please come inside!";

    // Show welcome dialogue
    welcomeContainer.style.display = "block";

    document.querySelector(".buttons").appendChild(noBtn);

});


/* ===================================== */
/* 9. WELCOME BUTTON */
/* ===================================== */

welcomeBtn.addEventListener("click", function () {

    if (currentScene !== 5) return;

    currentScene = 6;

    // Hide waiter and dialogue
    waiterContainer.style.display = "none";

    welcomeContainer.style.display = "none";

    // Show open door
    doorContainer.style.display = "flex";

});


/* ===================================== */
/* 10. CLICK DOOR TO ZOOM */
/* ===================================== */

doorContainer.addEventListener("click", async function () {

    // Prevent multiple zoom animations
    if (isZooming || currentScene !== 6) return;

    isZooming = true;

    // Start CSS zoom animation
    doorContainer.classList.add("zoom");

    // Wait for animation
    await sleep(2000);

    // Hide door screen
    doorContainer.style.display = "none";

    // Change background to restaurant
    document.body.classList.add("restaurant");

    // Show restaurant scene
    showRestaurant();

});


/* ===================================== */
/* 11. RESTAURANT SCENE */
/* ===================================== */

function showRestaurant() {

    currentScene = 7;

    restaurantContainer.style.display = "block";

    // Waiter appears again
    waiter.src = "images/waiter1.png";

    waiterContainer.style.display = "block";

    // Show restaurant question
    restaurantDialogue.style.display = "block";

}


/* ===================================== */
/* 12. READY BUTTON */
/* ===================================== */

readyBtn.addEventListener("click", async function () {

    if (currentScene !== 7 || isEnding) return;

    isEnding = true;

    currentScene = 8;

    // Hide dialogue
    restaurantDialogue.style.display = "none";

    // Waiter disappears
    waiterContainer.style.display = "none";

    await sleep(1000);

    // New waiter appearance
    finalWaiterContainer.style.display = "block";

    await sleep(1500);

    // Start fireworks
    playFireworks();

});


/* ===================================== */
/* 13. FIREWORKS */
/* ===================================== */

async function playFireworks() {

    currentScene = 9;

    // Restart GIF from beginning
    const fireworkSource = firework.getAttribute("src");

    firework.removeAttribute("src");

    firework.setAttribute("src", fireworkSource);

    // Show fireworks
    fireworkContainer.style.display = "flex";

    // Fireworks duration
    await sleep(5000);

    // Hide fireworks
    fireworkContainer.style.display = "none";

    // Show final message
    showFinalMessage();

}


/* ===================================== */
/* 14. FINAL MESSAGE */
/* ===================================== */

function showFinalMessage() {

    currentScene = 10;

    endingText.textContent =
        "Thank you for coming, " + userName +
        "! I hope you enjoyed this special surprise! ❤️";

    finalMessage.style.display = "block";

}