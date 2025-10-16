from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from openai import OpenAI
import os

# Initialize OpenAI client using your API key (set in environment)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ---------------------------
# Chat View
# ---------------------------
def chat_view(request):
    """
    Handles both GET (page load) and POST (message send) requests for the ChatGPT simulator.
    - GET: Render the chat page and load existing chat history from session.
    - POST: Receive user message, call the OpenAI API, save response, and return it as JSON.
    """

    # Initialize chat history in session if not present
    if "chat_history" not in request.session:
        request.session["chat_history"] = []

    # ---- GET request ----
    if request.method == "GET":
        # Pass chat history to template for rendering previous messages
        context = {"chat_history": request.session["chat_history"]}
        return render(request, "chat_app/chat.html", context)

    # ---- POST request ----
    if request.method == "POST":
        # Get message and model name from the form
        user_message = request.POST.get("message")
        model = request.POST.get("model", "gpt-4o-mini")  # default model

        # Append user message to chat history
        request.session["chat_history"].append({"role": "user", "content": user_message})

        # Build message list (system prompt + full history) for OpenAI API
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            *request.session["chat_history"]
        ]

        # Call the OpenAI API
        response = client.chat.completions.create(
            model=model,
            messages=messages
        )

        # Extract assistant's reply
        bot_reply = response.choices[0].message.content.strip()

        # Append bot reply to session chat history
        request.session["chat_history"].append({"role": "assistant", "content": bot_reply})
        request.session.modified = True

        # Send reply back to browser as JSON
        return JsonResponse({"reply": bot_reply})


# ---------------------------
# Reset Chat View
# ---------------------------
@csrf_exempt
def reset_chat(request):
    """
    Clears the chat history stored in the user session.
    Called when the user clicks the "Reset Chat" button.
    """
    if request.method == "POST":
        request.session["chat_history"] = []
        return JsonResponse({"status": "ok"})
