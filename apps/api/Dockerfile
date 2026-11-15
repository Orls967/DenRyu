FROM python:3.12-slim

WORKDIR /app

RUN useradd --create-home --shell /bin/bash denryu
COPY pyproject.toml ./
RUN pip install --no-cache-dir .

COPY app ./app
USER denryu

EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
