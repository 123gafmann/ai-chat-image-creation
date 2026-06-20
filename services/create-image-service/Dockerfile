FROM pytorch/pytorch:2.7.0-cuda12.8-cudnn9-runtime

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

ENV PORT=3000
# HuggingFace model cache lives in a volume (model is ~12 GB — too large to bake in)
ENV HF_HOME=/cache/huggingface

EXPOSE 3000

RUN useradd -m appuser && mkdir -p /cache/huggingface && chown -R appuser /app /cache
USER appuser

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]
