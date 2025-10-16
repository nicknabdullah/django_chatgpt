// -----------------------------
// ChatGPT Simulator Frontend
// -----------------------------
// Handles sending messages, resetting chat,
// and animating bot responses with a typing effect.

document.addEventListener("DOMContentLoaded", function () {
  // UI Elements
  const chatBox = document.getElementById("chat-box");
  const messageInput = document.getElementById("message");
  const sendBtn = document.getElementById("send-btn");
  const resetBtn = document.getElementById("reset-chat");
  const modelSelect = document.getElementById("model");

  // -----------------------------
  // Helper: Append message to chat
  // -----------------------------
  function appendMessage(sender, text) {
    const div = document.createElement("div");
    div.classList.add(sender);
    div.innerHTML = `<p>${text}</p>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return div; // return div for typing animation
  }

  // -----------------------------
  // Helper: Simulate typing animation
  // -----------------------------
  async function typeText(element, text, speed = 15) {
    element.innerHTML = "<p></p>"; // start empty
    const p = element.querySelector("p");
    for (let i = 0; i < text.length; i++) {
      p.innerHTML += text.charAt(i);
      chatBox.scrollTop = chatBox.scrollHeight;
      await new Promise((resolve) => setTimeout(resolve, speed));
    }
  }

  // -----------------------------
  // Helper: Get CSRF token for POST requests
  // -----------------------------
  function getCSRFToken() {
    const name = "csrftoken=";
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name)) return cookie.substring(name.length);
    }
    return "";
  }

  // -----------------------------
  // Main: Send message to Django backend
  // -----------------------------
  async function sendMessage() {
    const userMessage = messageInput.value.trim();
    if (!userMessage) return;

    // Display user message immediately
    appendMessage("user", userMessage);
    messageInput.value = "";

    // Display placeholder for bot typing
    const botDiv = appendMessage("bot", "⏳ ...typing");

    try {
      // Send POST request to backend
      const response = await fetch("", {
        method: "POST",
        headers: {
          "X-CSRFToken": getCSRFToken(),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `message=${encodeURIComponent(
          userMessage
        )}&model=${encodeURIComponent(modelSelect.value)}`,
      });

      // Parse JSON response
      const data = await response.json();

      // Clear placeholder and animate the bot's actual reply
      await typeText(botDiv, data.reply);
    } catch (err) {
      botDiv.innerHTML = "<p>⚠️ Error: Unable to reach server.</p>";
    }
  }

  // -----------------------------
  // Reset chat history (session + UI)
  // -----------------------------
  resetBtn.addEventListener("click", async () => {
    await fetch("/reset_chat/", {
      method: "POST",
      headers: { "X-CSRFToken": getCSRFToken() },
    });
    chatBox.innerHTML = "";
  });

  // -----------------------------
  // Event Listeners
  // -----------------------------
  sendBtn.addEventListener("click", sendMessage);
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendBtn.click();
    }
  });
});
