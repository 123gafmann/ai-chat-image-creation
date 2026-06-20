from contextlib import asynccontextmanager

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from .config import DEFAULT_PROMPT, MAX_IMAGE_MB
from .cartoonizer import cartoonize, create_image, load_pipeline

MAX_BYTES = MAX_IMAGE_MB * 1024 * 1024


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_pipeline()
    yield


app = FastAPI(lifespan=lifespan)


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.post('/cartoonize')
async def cartoonize_endpoint(
    image: UploadFile = File(...),
    prompt: str = Form(default=DEFAULT_PROMPT),
):
    data = await image.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail=f'Image exceeds {MAX_IMAGE_MB} MB limit')
    try:
        result = cartoonize(data, prompt)
        return Response(content=result, media_type='image/png')
    except Exception as e:
        raise HTTPException(status_code=502, detail=f'Cartoonization failed: {str(e)}')


@app.post('/createImage')
async def create_image_endpoint(
    prompt: str = Form(...),
):
    try:
        result = create_image(prompt)
        return Response(content=result, media_type='image/png')
    except Exception as e:
        raise HTTPException(status_code=502, detail=f'Image creation failed: {str(e)}')
