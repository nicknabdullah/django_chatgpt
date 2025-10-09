from django.shortcuts import render
from django.http import JsonResponse
import os
from openai import OpenAI
from dotenv import load_dotenv

# load .env file (in case it hasn't been loaded yet)
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Create your views here.

def chat_view(request):
    if request.method == 'POST':
        user_message = request.POST.get("message")
        model = request.POST.get("model", "gpt-4o-mini")  # default to gpt-4o-mini if not provided

        # chat history stored in session
        if "chat_history" not in request.session:
            request.session["chat_history"] = []

        # Add user message to chat history
        request.session["chat_history"].append(
            {
                "role": "user",
                "content": user_message
            }
        )

        # call openai api
        response = client.chat.completions.create(
            model=model,       
            messages=[
                {
                    "role": "system", 
                    "content": "You are a helpful assistant."
                    },
                *request.session["chat_history"] # <-- unpack all previous messages
            ]
        )

        bot_reply = response.choices[0].message.content.strip()

        # add bot reply to chat history
        request.session["chat_history"].append(
            {
                "role": "assistant",
                "content": bot_reply
            }
        )

        # mark session as modified to ensure it gets saved
        request.session.modified = True  
        return JsonResponse({"reply": bot_reply})

    return render(request, "chat_app/chat.html")

