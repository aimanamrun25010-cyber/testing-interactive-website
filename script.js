
/* =========================================
   OUR DATE TONIGHT ❤️
   STORY MODE — SCRIPT.JS
========================================= */


/* =========================================
   1. SETTINGS
========================================= */

const FINAL_MESSAGE =
    "great choices!, see you tonight, love!.";

const HEART_TARGET = 5;

const STORAGE_KEY = "our-date-tonight-answers";

const GOOGLE_SHEETS_URL =
    "https://script.google.com/macros/s/AKfycbyAGcAe8RysGRVRVK0qmioaUl9LE5erg1krst_DUf6fIfAPqYzyaSBqVEgAzTlRwugezQ/exec";

const TYPING_SPEED = 32;


/* =========================================
   2. VISITOR ANSWERS
========================================= */

function createSessionId() {
    if (window.crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return Date.now() + "-" +
        Math.random().toString(36).slice(2);
}

function createEmptyAnswers() {
    return {
        sessionId: createSessionId(),
        restaurant: "",
        outfitColor: "",
        chillPlace: "",
        heartsCollected: 0,
        letterOpened: false,
        startedAt: new Date().toISOString(),
        completedAt: ""
    };
}

let visitorAnswers = createEmptyAnswers();

function saveAnswers() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(visitorAnswers)
        );
    } catch (error) {
        console.warn("Local save failed:", error);
    }

    // Google Sheets connection will be added later.
}

function updateAnswer(field, value) {
    visitorAnswers[field] = value;
    saveAnswers();

    console.log("Date-night answers:", visitorAnswers);
}


/* =========================================
   SEND COMPLETED STORY TO GOOGLE SHEETS
========================================= */

async function sendAnswersToGoogleSheets() {
    const status = $("save-status");

    if (
        !GOOGLE_SHEETS_URL ||
        GOOGLE_SHEETS_URL.includes("PASTE_YOUR")
    ) {
        console.warn("Google Sheets URL has not been set.");
        return;
    }

    status.textContent = "Sending your choices... 💌";
    status.classList.add("visible");

    const formData = new URLSearchParams();

    Object.entries(visitorAnswers).forEach(
        ([key, value]) => {
            formData.append(key, String(value));
        }
    );

    try {
        await fetch(GOOGLE_SHEETS_URL, {
            method: "POST",
            mode: "no-cors",
            body: formData
        });

        /*
           no-cors prevents the browser from reading
           Google's response. The request was issued,
           but successful storage cannot be confirmed
           from this response alone.
        */

        status.textContent =
            "Choices sent! 💕";

        console.log(
            "Google Sheets submission attempted:",
            visitorAnswers
        );

    } catch (error) {
        console.error(
            "Could not send answers:",
            error
        );

        status.textContent =
            "Couldn't send choices. Please try again.";

    }

    setTimeout(() => {
        status.classList.remove("visible");
    }, 4000);
}


/* =========================================
   3. GLOBAL STATE
========================================= */

let currentScene = "invitation-scene";

let isTransitioning = false;

let dialogueVersion = 0;

let heartCount = 0;
let heartTimer = null;

let floatingHeartsTimer = null;

let letterOpened = false;

let musicEnabled = true;


/* =========================================
   4. HTML ELEMENTS
========================================= */

const $ = id => document.getElementById(id);

const scenes = document.querySelectorAll(".scene");

const transitionOverlay = $("transition-overlay");

const backgroundMusic = $("background-music");
const musicToggle = $("music-toggle");

const sounds = {
    click: $("click-audio"),
    heart: $("heart-audio"),
    letter: $("letter-audio")
};

const gameArea = $("game-area");

const envelopeContainer = $("envelope-container");
const letterContainer = $("letter-container");

const floatingHeartsContainer = $("floating-hearts");


/* =========================================
   5. HELPER FUNCTIONS
========================================= */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function show(element, display = "block") {
    element.style.display = display;
}

function hide(element) {
    element.style.display = "none";
}

function playSound(audio) {
    if (!musicEnabled || !audio) return;

    try {
        audio.currentTime = 0;

        audio.play().catch(() => {
            // Audio might be blocked by the browser.
        });
    } catch (error) {
        console.warn("Audio unavailable:", error);
    }
}

function startMusic() {
    if (!musicEnabled || !backgroundMusic) return;

    backgroundMusic.volume = 0.4;

    backgroundMusic.play().catch(() => {
        // Music will start after an allowed user interaction.
    });
}


/* =========================================
   6. MUSIC BUTTON
========================================= */

musicToggle.addEventListener("click", () => {
    musicEnabled = !musicEnabled;

    musicToggle.textContent =
        musicEnabled ? "🔊" : "🔇";

    if (musicEnabled) {
        startMusic();
    } else {
        backgroundMusic.pause();
    }
});


/* =========================================
   7. TYPING EFFECT
========================================= */

async function typeText(element, message) {
    const version = ++dialogueVersion;

    element.textContent = "";

    for (const character of message) {
        if (version !== dialogueVersion) {
            return;
        }

        element.textContent += character;

        await sleep(TYPING_SPEED);
    }
}


/* =========================================
   8. MULTI-LINE STORY DIALOGUE
========================================= */

/*
   Each conversation contains several lines.

   Clicking Continue:
   - completes the current typing animation, or
   - moves to the next line.

   When the final line is finished, the
   supplied onComplete function runs.
*/

function playDialogue({
    panelId,
    textId,
    buttonId,
    lines,
    onComplete
}) {
    const panel = $(panelId);
    const textElement = $(textId);
    const button = $(buttonId);

    let lineIndex = 0;
    let displayedCharacters = 0;
    let typing = false;
    let conversationFinished = false;

    let lineVersion = ++dialogueVersion;

    show(panel);

    button.textContent = "Continue →";

    function renderLine() {
        const message = lines[lineIndex];

        const thisVersion = ++dialogueVersion;

        lineVersion = thisVersion;

        displayedCharacters = 0;
        typing = true;

        textElement.textContent = "";

        button.textContent =
            lineIndex === lines.length - 1
                ? "Continue ❤️"
                : "Continue →";

        async function animate() {
            for (const character of message) {
                if (thisVersion !== dialogueVersion) {
                    return;
                }

                textElement.textContent += character;

                displayedCharacters++;

                await sleep(TYPING_SPEED);
            }

            if (thisVersion === dialogueVersion) {
                typing = false;
            }
        }

        animate();
    }

    button.onclick = () => {
        if (conversationFinished) return;

        playSound(sounds.click);

        if (typing) {
            /*
               First tap while typing:
               reveal the entire sentence.
            */

            dialogueVersion++;

            textElement.textContent = lines[lineIndex];

            displayedCharacters = lines[lineIndex].length;

            typing = false;

            return;
        }

        if (lineIndex < lines.length - 1) {
            lineIndex++;
            renderLine();

            return;
        }

        conversationFinished = true;

        dialogueVersion++;

        hide(panel);

        button.onclick = null;

        if (typeof onComplete === "function") {
            onComplete();
        }
    };

    renderLine();
}


/* =========================================
   9. SCENE TRANSITIONS
========================================= */

function activateScene(sceneId) {
    dialogueVersion++;

    scenes.forEach(scene => {
        scene.classList.remove("active");
    });

    $(sceneId).classList.add("active");

    currentScene = sceneId;
}

async function changeScene(sceneId) {
    if (isTransitioning) return false;

    isTransitioning = true;

    transitionOverlay.classList.add("fade-in");

    await sleep(450);

    activateScene(sceneId);

    await sleep(100);

    transitionOverlay.classList.remove("fade-in");

    await sleep(450);

    isTransitioning = false;

    return true;
}


/* =========================================
   10. INITIALIZE WEBSITE
========================================= */

function initializeWebsite() {
    activateScene("invitation-scene");

    document.querySelectorAll(
        ".story-dialogue, .story-choice-panel"
    ).forEach(hide);

    hide($("game-container"));

    hide(letterContainer);

    show(envelopeContainer, "flex");

    $("final-letter-text").textContent =
        FINAL_MESSAGE;

    saveAnswers();
}

initializeWebsite();


/* =========================================
   11. SCENE 1 — INVITATION
========================================= */

$("start-btn").addEventListener("click", async () => {
    if (isTransitioning) return;

    playSound(sounds.click);
    startMusic();

    const changed = await changeScene("dinner-scene");

    if (changed) {
        startDinnerStory();
    }
});


/* =========================================
   12. SCENE 2 — OUR FIRST STOP
========================================= */

function startDinnerStory() {
    playDialogue({
        panelId: "dinner-story",
        textId: "dinner-story-text",
        buttonId: "dinner-story-next",

        lines: [
            "First things first, love. We can't start our adventure on an empty stomach! 🍽️",

            "I've been thinking about where we should go tonight...",

            "But I think you should have the final say. Where shall we eat?"
        ],

        onComplete: () => {
            show($("dinner-choice-container"));
        }
    });
}


/* =========================================
   13. DINNER SELECTION
========================================= */

document.querySelectorAll(".dinner-choice")
    .forEach(button => {

        button.addEventListener("click", () => {
            if (visitorAnswers.restaurant) return;

            playSound(sounds.click);

            const restaurant =
                button.dataset.restaurant;

            updateAnswer("restaurant", restaurant);

            button.classList.add("selected");

            hide($("dinner-choice-container"));

            startDinnerReaction(restaurant);
        });

    });


/* =========================================
   14. DINNER REACTION
========================================= */

function startDinnerReaction(restaurant) {
    const reactions = {
        "Japanese Food":
            "Japanese food? Ooo, sushi date with you sounds perfect! 🍣",

        "Western Food":
            "Western food? A cozy dinner with you sounds lovely! 🍝",

        "Mamak":
            "Mamak? A simple little date with you is still my favourite kind of date! 🍛",

        "Cafe":
            "A café date? Coffee, something sweet, and you. Perfect! ☕"
    };

    playDialogue({
        panelId: "dinner-reaction",
        textId: "dinner-reaction-text",
        buttonId: "dinner-reaction-next",

        lines: [
            reactions[restaurant],

            "Okay, let's imagine our little dinner together..."
        ],

        onComplete: async () => {
            const changed =
                await changeScene("dinner-moment-scene");

            if (changed) {
                startDinnerMoment();
            }
        }
    });
}


/* =========================================
   15. SCENE 3 — IMAGINING OUR DINNER
========================================= */

function startDinnerMoment() {
    playDialogue({
        panelId: "dinner-moment-dialogue",
        textId: "dinner-moment-text",
        buttonId: "dinner-moment-next",

        lines: [
            "Just imagine us sitting together, enjoying our food and talking about everything. ❤️",

            "I already know the best part won't be the food...",

            "It'll be having you right there with me."
        ],

        onComplete: async () => {
            const changed =
                await changeScene("outfit-scene");

            if (changed) {
                startOutfitStory();
            }
        }
    });
}


/* =========================================
   16. SCENE 4 — GETTING READY
========================================= */

function startOutfitStory() {
    playDialogue({
        panelId: "outfit-story",
        textId: "outfit-story-text",
        buttonId: "outfit-story-next",

        lines: [
            "Wait a minute, love... I almost forgot something important! 😳",

            "We need to get ready for our date.",

            "What colour are you planning to wear tonight? I might just match with you! ❤️"
        ],

        onComplete: () => {
            show($("outfit-choice-container"));
        }
    });
}


/* =========================================
   17. OUTFIT COLOUR SELECTION
========================================= */

function chooseOutfitColor(color) {
    if (visitorAnswers.outfitColor) return;

    playSound(sounds.click);

    updateAnswer("outfitColor", color);

    hide($("outfit-choice-container"));

    startOutfitReaction(color);
}

document.querySelectorAll(".color-choice")
    .forEach(button => {

        button.addEventListener("click", () => {
            if (visitorAnswers.outfitColor) return;

            button.classList.add("selected");

            chooseOutfitColor(
                button.dataset.color
            );
        });

    });

$("other-color-btn").addEventListener("click", () => {
    const customColor =
        $("other-color").value.trim();

    if (!customColor) {
        $("other-color").focus();

        alert("Tell me your colour first, love! ❤️");

        return;
    }

    chooseOutfitColor(customColor);
});

$("other-color").addEventListener("keydown", event => {
    if (event.key === "Enter") {
        $("other-color-btn").click();
    }
});


/* =========================================
   18. OUTFIT REACTION
========================================= */

function startOutfitReaction(color) {
    playDialogue({
        panelId: "outfit-reaction",
        textId: "outfit-reaction-text",
        buttonId: "outfit-reaction-next",

        lines: [
            color + "? I can already imagine how lovely you'll look! ❤️",

            "Now I need to find something that matches you.",

            "Okay, we're almost ready. There's one more place I want us to visit."
        ],

        onComplete: async () => {
            const changed =
                await changeScene("chill-scene");

            if (changed) {
                startChillStory();
            }
        }
    });
}


/* =========================================
   19. SCENE 5 — ONE MORE STOP
========================================= */

function startChillStory() {
    playDialogue({
        panelId: "chill-story",
        textId: "chill-story-text",
        buttonId: "chill-story-next",

        lines: [
            "Dinner sounds wonderful, but I'm not ready for our night to end just yet. 🌙",

            "Maybe we could find somewhere to relax and spend a little more time together.",

            "Where would you like us to go?"
        ],

        onComplete: () => {
            show($("chill-choice-container"));
        }
    });
}


/* =========================================
   20. CHILL LOCATION SELECTION
========================================= */

document.querySelectorAll(".chill-choice")
    .forEach(button => {

        button.addEventListener("click", () => {
            if (visitorAnswers.chillPlace) return;

            playSound(sounds.click);

            const place = button.dataset.chill;

            updateAnswer("chillPlace", place);

            button.classList.add("selected");

            hide($("chill-choice-container"));

            startChillReaction(place);
        });

    });


/* =========================================
   21. CHILL REACTION
========================================= */

function startChillReaction(place) {
    const reactions = {
        "Beach":
            "The beach? Imagine the sound of the waves while we're sitting together. 🌊",

        "Coffee Shop":
            "A coffee shop? One more drink and a little more time with you. ☕",

        "City Walk":
            "A city walk? Just us, the night lights, and nowhere to rush. 🌃",

        "Movie":
            "A movie? Sitting beside you sounds like the perfect way to end our night. 🎬"
    };

    playDialogue({
        panelId: "chill-reaction",
        textId: "chill-reaction-text",
        buttonId: "chill-reaction-next",

        lines: [
            reactions[place],

            "I think I can picture our whole evening now.",

            "Come on, love. There's one more little moment I want to share with you."
        ],

        onComplete: async () => {
            const changed =
                await changeScene("moment-scene");

            if (changed) {
                startRomanticMoment();
            }
        }
    });
}


/* =========================================
   22. SCENE 6 — OUR LITTLE MOMENT
========================================= */

function startRomanticMoment() {
    startMomentHearts();

    playDialogue({
        panelId: "moment-dialogue",
        textId: "moment-text",
        buttonId: "moment-next",

        lines: [
            "I think this might be my favourite part of our little adventure. ❤️",

            "Not because of where we're going...",

            "But because I'm imagining all of it with you.",

            "And now, before I tell you one last thing, I have a tiny challenge for you!"
        ],

        onComplete: async () => {
            stopMomentHearts();

            const changed =
                await changeScene("game-scene");

            if (changed) {
                startGameIntroduction();
            }
        }
    });
}


/* =========================================
   23. ROMANTIC MOMENT HEARTS
========================================= */

let momentHeartsTimer = null;

function createMomentHeart() {
    if (currentScene !== "moment-scene") return;

    const heart = document.createElement("span");

    heart.className = "floating-heart";

    heart.textContent =
        Math.random() > 0.5 ? "❤️" : "💕";

    heart.style.left =
        Math.random() * 100 + "%";

    heart.style.fontSize =
        18 + Math.random() * 20 + "px";

    heart.addEventListener("animationend", () => {
        heart.remove();
    });

    $("moment-hearts").appendChild(heart);
}

function startMomentHearts() {
    clearInterval(momentHeartsTimer);

    momentHeartsTimer =
        setInterval(createMomentHeart, 700);

    createMomentHeart();
}

function stopMomentHearts() {
    clearInterval(momentHeartsTimer);

    momentHeartsTimer = null;

    $("moment-hearts").innerHTML = "";
}


/* =========================================
   24. SCENE 7 — MINI-GAME INTRODUCTION
========================================= */

function startGameIntroduction() {
    playDialogue({
        panelId: "game-intro",
        textId: "game-intro-text",
        buttonId: "start-game-btn",

        lines: [
            "I've hidden a little surprise for you! 💌",

            "But first, you need to collect five hearts.",

            "Ready, love? Let's see if you can catch them all!"
        ],

        onComplete: () => {
            startHeartGame();
        }
    });
}


/* =========================================
   25. START HEART MINI-GAME
========================================= */

function startHeartGame() {
    heartCount = 0;

    $("heart-count").textContent = "0";

    gameArea.innerHTML = "";

    show($("game-container"), "flex");

    clearInterval(heartTimer);

    heartTimer =
        setInterval(createFallingHeart, 650);

    createFallingHeart();
}


/* =========================================
   26. CREATE FALLING HEARTS
========================================= */

function createFallingHeart() {
    if (currentScene !== "game-scene") return;

    if (heartCount >= HEART_TARGET) return;

    const heart = document.createElement("button");

    heart.type = "button";

    heart.className = "falling-heart";

    heart.textContent = "❤️";

    heart.setAttribute(
        "aria-label",
        "Catch heart"
    );

    const maxX = Math.max(
        0,
        gameArea.clientWidth - 55
    );

    heart.style.left =
        Math.random() * maxX + "px";

    heart.addEventListener("click", () => {
        if (heartCount >= HEART_TARGET) return;

        heart.remove();

        heartCount++;

        $("heart-count").textContent = heartCount;

        updateAnswer(
            "heartsCollected",
            heartCount
        );

        playSound(sounds.heart);

        if (heartCount >= HEART_TARGET) {
            completeHeartGame();
        }
    }, { once: true });

    heart.addEventListener("animationend", () => {
        heart.remove();
    });

    gameArea.appendChild(heart);
}


/* =========================================
   27. COMPLETE MINI-GAME
========================================= */

function completeHeartGame() {
    clearInterval(heartTimer);

    heartTimer = null;

    gameArea.innerHTML = "";

    hide($("game-container"));

    playDialogue({
        panelId: "game-complete",
        textId: "game-complete-text",
        buttonId: "game-continue-btn",

        lines: [
            "You caught all five hearts! ❤️",

            "I knew you could do it, love.",

            "Now, there's something I've been wanting to tell you..."
        ],

        onComplete: async () => {
            const changed =
                await changeScene("letter-scene");

            if (changed) {
                show(envelopeContainer, "flex");
            }
        }
    });
}


/* =========================================
   28. SCENE 8 — OPEN FINAL LETTER
========================================= */

function openLetter() {
    if (
        currentScene !== "letter-scene" ||
        letterOpened
    ) {
        return;
    }

    letterOpened = true;

    playSound(sounds.letter);

    $("envelope-image").src =
        "images/envelope-open.png";

    hide(envelopeContainer);

    show(letterContainer, "flex");

    $("final-letter-text").textContent =
        FINAL_MESSAGE;

    visitorAnswers.letterOpened = true;

    visitorAnswers.completedAt =
    new Date().toISOString();

    saveAnswers();

    // Send the completed story to your private sheet.
    sendAnswersToGoogleSheets();
    
    startFloatingHearts();
}

envelopeContainer.addEventListener(
    "click",
    openLetter
);


/* =========================================
   29. FLOATING HEARTS — FINAL LETTER
========================================= */

function createFloatingHeart() {
    if (currentScene !== "letter-scene") return;

    const heart = document.createElement("span");

    heart.className = "floating-heart";

    heart.textContent =
        Math.random() > 0.5 ? "❤️" : "💕";

    heart.style.left =
        Math.random() * 100 + "%";

    heart.style.fontSize =
        18 + Math.random() * 25 + "px";

    heart.style.animationDuration =
        4 + Math.random() * 3 + "s";

    heart.addEventListener("animationend", () => {
        heart.remove();
    });

    floatingHeartsContainer.appendChild(heart);
}

function startFloatingHearts() {
    clearInterval(floatingHeartsTimer);

    floatingHeartsTimer =
        setInterval(createFloatingHeart, 450);

    createFloatingHeart();
}


/* =========================================
   30. REPLAY STORY
========================================= */

$("replay-btn").addEventListener("click", () => {
    clearInterval(heartTimer);
    clearInterval(momentHeartsTimer);
    clearInterval(floatingHeartsTimer);

    visitorAnswers = createEmptyAnswers();

    saveAnswers();

    window.location.reload();
});