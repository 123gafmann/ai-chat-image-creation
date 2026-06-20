export async function createImage(
  prompt: string,
  signal?: AbortSignal
): Promise<string> {
  const formData = new FormData();
  formData.append("prompt", prompt);

  const response = await fetch("/api/images/createImage", {
    method: "POST",
    body: formData,
    signal,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `HTTP ${response.status}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
