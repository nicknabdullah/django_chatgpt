// Grab DOM elements
const form = document.getElementById("chat-form");
const chatBox = document.getElementById("chat-box");
const resetBtn = document.getElementById("reset-chat");

// Helper: get CSRF token
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Scroll chat to bottom
function scrollChatToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Send message handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = document.getElementById("message").value.trim();
  const model = document.getElementById("model").value;

  if (!message) return;

  // Display user message
  chatBox.innerHTML += `<p class="user"><b>You:</b> ${message}</p>`;
  scrollChatToBottom();
  document.getElementById("message").value = "";

  try {
    // Send message to Django
    const response = await fetch("", {
      method: "POST",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `message=${encodeURIComponent(message)}&model=${encodeURIComponent(
        model
      )}`,
    });

    const data = await response.json();

    // Display bot reply
    chatBox.innerHTML += `<p class="bot"><b>${model}:</b> ${data.reply}</p>`;
    scrollChatToBottom();
  } catch (err) {
    console.error("Error sending message:", err);
    chatBox.innerHTML += `<p class="bot" style="color:red;"><b>Error:</b> Failed to get response</p>`;
    scrollChatToBottom();
  }
});

// Reset chat handler
resetBtn.addEventListener("click", async () => {
  try {
    await fetch("/reset_chat/", {
      method: "POST",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    });
    chatBox.innerHTML = "";
  } catch (err) {
    console.error("Error resetting chat:", err);
  }
});
