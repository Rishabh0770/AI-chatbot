const promptInput = document.querySelector("#prompt");
const submitBtn = document.querySelector("#submit");
const chatContainer = document.querySelector(".chat-container");
const imageBtn = document.querySelector("#image");
const imageInput = imageBtn.querySelector("input");
const imagePreview = imageBtn.querySelector("img");
const startVoiceBtn = document.querySelector("#start-voice");
const stopVoiceBtn = document.querySelector("#stop-voice");

const API_KEY = "AIzaSyBK0FelMHtqS7Iml9GImoMgWrD8GuTS0SA";
const GEMINI_API = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let userFile = null;

// ========= Chat Message Creation =========
function appendMessage(message, type, imgSrc = null) {
    const wrapper = document.createElement("div");
    wrapper.classList.add(`${type}-chat-box`);

    const image = `<img src="${imgSrc}" id="${type === 'user' ? 'userImage' : 'aiImage'}" alt="${type}" width="10%">`;
    const chatArea = `<div class="${type}-chat-area">${message}</div>`;

    wrapper.innerHTML = image + chatArea;
    chatContainer.appendChild(wrapper);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
}

// ========= Loading Animation =========
function showLoading() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("ai-chat-box");
    wrapper.innerHTML = `
        <img src="img/ai.png" id="aiImage" width="10%">
        <div class="ai-chat-area"><img src="img/loading1.gif" width="40px" /></div>
    `;
    chatContainer.appendChild(wrapper);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
    return wrapper;
}

// ========= Send Message to Gemini API =========
async function sendToGemini(userMessage) {
    const loadingBox = showLoading();

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: userMessage },
                    ...(userFile ? [{ inline_data: userFile }] : [])
                ]
            }
        ]
    };

    try {
        const res = await fetch(GEMINI_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const data = await res.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        loadingBox.querySelector(".ai-chat-area").innerHTML = reply || "Sorry, I didn't get that.";
    } catch (err) {
        console.error(err);
        loadingBox.querySelector(".ai-chat-area").innerHTML = "Something went wrong. Try again.";
    }

    userFile = null;
    imagePreview.src = "img/img.svg";
    imagePreview.classList.remove("choose");
}

// ========= Handle User Submission =========
function handleUserMessage() {
    const message = promptInput.value.trim();
    if (!message) return;

    // Show user message
    let media = "";
    if (userFile) {
        media = `<br><img src="data:${userFile.mime_type};base64,${userFile.data}" class="chat-image">`;
    }

    appendMessage(message + media, "user", "img/human2.png");

    promptInput.value = "";
    sendToGemini(message);
}

// ========= Event Listeners =========
submitBtn.addEventListener("click", handleUserMessage);
promptInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleUserMessage();
});

// ========= Image Upload =========
imageBtn.addEventListener("click", () => imageInput.click());

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64 = e.target.result.split(",")[1];
        userFile = {
            mime_type: file.type,
            data: base64
        };
        imagePreview.src = `data:${file.type};base64,${base64}`;
        imagePreview.classList.add("choose");
    };
    reader.readAsDataURL(file);
});

// ========= Voice Input =========
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => promptInput.placeholder = "Listening...";
    recognition.onresult = (e) => {
        promptInput.value = e.results[0][0].transcript;
        promptInput.placeholder = "Type a message...";
    };
    recognition.onerror = (e) => {
        console.error(e);
        promptInput.placeholder = "Error. Try again.";
    };
    recognition.onend = () => promptInput.placeholder = "Type a message...";

    startVoiceBtn.addEventListener("click", () => recognition.start());
    stopVoiceBtn.addEventListener("click", () => recognition.stop());
} else {
    alert("Your browser doesn't support voice input. Try Chrome or Edge.");
}
