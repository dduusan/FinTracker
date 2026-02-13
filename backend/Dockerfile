FROM python:3.12-slim

WORKDIR /app

# Sistemske zavisnosti
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Instaliraj Python pakete
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopiraj source kod
COPY . .

# Port
EXPOSE 8000

# Pokreni server
CMD ["uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "8000"]
