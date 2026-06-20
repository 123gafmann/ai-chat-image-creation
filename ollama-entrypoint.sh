#!/bin/sh

MODEL="${MODEL:-gemma3:12b}"

# Start Ollama server in the background
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to be ready
echo "Waiting for Ollama to start..."
until ollama list > /dev/null 2>&1; do
  sleep 2
done
echo "Ollama is ready."

# Pull the model if not already present
if ! ollama list | grep -q "$MODEL"; then
  echo "Pulling model $MODEL..."
  ollama pull "$MODEL"
  echo "Model pulled successfully."
else
  echo "Model $MODEL already present."
fi

# Keep Ollama running
wait $OLLAMA_PID
