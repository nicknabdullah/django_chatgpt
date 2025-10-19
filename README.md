# Django ChatGPT Simulator

A minimal Django project that demonstrates a simple web chat UI backed by an OpenAI API call.

This repo contains a small Django app (`chat_app`) with templates and static assets, plus project settings in `chatgpt_project`.

## Features

- Server-side session-based chat history stored in `request.session["chat_history"]` (see [`chat_app.views.chat_view`](chat_app/views.py)).
- Simple frontend with a model selector, send/reset buttons, and a typing animation (`script.js`).
- Calls OpenAI via the `openai` client instantiated as [`chat_app.views.client`](chat_app/views.py). The view posts to the same route (POST to `/`) and returns JSON.

## Setup & run (1-2-3)

1. Prepare environment (python, pip, venv)

	 - Ensure Python 3.10+ is installed. On Debian/Ubuntu you can install Python, pip and venv together:

		 ```sh
		 sudo apt update
		 sudo apt install -y python3 python3-pip python3-venv
		 ```

	 - (Optional) Create and activate a virtual environment:

		 ```sh
		 python3 -m venv .venv
		 source .venv/bin/activate
		 ```

2. Install dependencies and set environment variables

	 - Install Python dependencies:

		 ```sh
		 pip install -r requirements.txt
		 ```

	 - Set your OpenAI API key and other env vars. You can copy `.env.example` to `.env` and fill in values, or export directly:

		 ```sh
		 cp .env.example .env
		 # edit .env and set OPENAI_API_KEY and SECRET_KEY
		 ```

		 Or export directly:

		 ```sh
		 export OPENAI_API_KEY="sk-..."
		 export SECRET_KEY="your-secret-key"
		 ```

3. Database migrations and run

	 - Run migrations:

		 ```sh
		 python manage.py migrate
		 ```

	 - Start the development server:

		 ```sh
		 python manage.py runserver
		 ```

	 - Open http://127.0.0.1:8000/ to view the chat UI.

## Usage

- Type a message and press Send (or Enter) to post to the Django backend (handled by [`chat_app.views.chat_view`](chat_app/views.py)).
- Use the model selector to choose between `gpt-4o-mini`, `gpt-4o`, and `gpt-3.5-turbo`.
- Click the trash icon to reset the session chat history — the reset endpoint is [`chat_app.views.reset_chat`](chat_app/views.py) at `/reset_chat/`.

Frontend behavior:
- Sending is implemented in [`chat_app/static/chat_app/script.js`](chat_app/static/chat_app/script.js).
- Typing animation and CSRF handling are in the same file.

## Security & notes

- The project currently contains a hard-coded SECRET_KEY inside [`chatgpt_project/settings.py`](chatgpt_project/settings.py). Replace it for production and keep it secret.
- DEBUG = True by default — turn off in production.
- Ensure your OpenAI API key is kept out of source control (ignored by `.gitignore`).

## Troubleshooting

Quick fixes for common issues when setting up or running the project:

- Virtualenv not activated / wrong Python: ensure your venv is activated (see Setup & run step 1) and that `python --version` shows Python 3.10+.

- Missing OpenAI key or invalid key: set `OPENAI_API_KEY` in your environment or `.env` file. The server will raise API errors if the key is missing or invalid.

- Migrations errors / missing tables: run `python manage.py migrate` to create the SQLite database and tables. If you change models, run `python manage.py makemigrations` then `migrate`.
- Server won't start / port in use: pass a different port to `runserver`, e.g. `python manage.py runserver 0.0.0.0:8001`.

- Static files not loading locally: ensure `STATICFILES_DIRS` includes the `chat_app/static` path (it's configured in `settings.py`) and that `DEBUG=True` during development.

## Technical overview


The table below lists key files and a short description to help you navigate the codebase.

| File | Remark |
|---|---|
| `chat_app/views.py` | Main server logic: initializes OpenAI client, handles GET/POST chat requests, stores per-session chat history, and provides a reset endpoint. |
| `chat_app/templates/chat_app/chat.html` | Chat UI (message list, input, model selector, buttons). |
| `chat_app/static/chat_app/script.js` | Frontend handlers and UI updates; CSRF handling and typing animation. |
| `chat_app/static/chat_app/style.css` | Styles for the chat UI. |
| `chatgpt_project/settings.py` | Django settings (SECRET_KEY, DEBUG, ALLOWED_HOSTS, STATICFILES_DIRS). NOTE: `SECRET_KEY` is hard-coded — consider loading from env for production. |
| `manage.py` | Django management entrypoint (runserver, migrate, etc.). |
| `requirements.txt` | Python dependency list — install with `pip install -r requirements.txt`. |
| `db.sqlite3` | Default SQLite database used for local development (created after migrations). |