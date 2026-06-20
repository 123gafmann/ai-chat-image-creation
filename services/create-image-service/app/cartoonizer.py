import io
import os
import torch
from diffusers import FluxImg2ImgPipeline, FluxPipeline
from PIL import Image

from .config import (
    CREATE_IMAGE_SIZE,
    CREATE_IMAGE_STEPS,
    FLUX_GUIDANCE,
    FLUX_MODEL_ID,
    FLUX_STEPS,
    FLUX_STRENGTH,
)

_txt2img: FluxPipeline | None = None
_img2img: FluxImg2ImgPipeline | None = None

TARGET_OUTPUT_SIZE = 600


def load_pipeline() -> None:
    global _txt2img, _img2img
    _txt2img = FluxPipeline.from_pretrained(
        FLUX_MODEL_ID,
        torch_dtype=torch.bfloat16,
        token=os.getenv('HF_TOKEN'),
    )
    # Block-level offload keeps peak VRAM ~3-5 GB; T5-XXL alone is ~22 GB bfloat16
    # so enable_model_cpu_offload() (module-level) still OOMs on 16 GB cards.
    _txt2img.enable_sequential_cpu_offload()
    _txt2img.vae.enable_slicing()
    _txt2img.vae.enable_tiling()
    # Share all model weights with the img2img pipeline — no extra VRAM.
    _img2img = FluxImg2ImgPipeline(**_txt2img.components)


def create_image(prompt: str) -> bytes:
    if _txt2img is None:
        raise RuntimeError('Pipeline not loaded')
    result = _txt2img(
        prompt=prompt,
        height=CREATE_IMAGE_SIZE,
        width=CREATE_IMAGE_SIZE,
        num_inference_steps=CREATE_IMAGE_STEPS,
        guidance_scale=FLUX_GUIDANCE,
    ).images[0]
    # Resize from generation size (multiples of 16) to exact requested size.
    result = result.resize((TARGET_OUTPUT_SIZE, TARGET_OUTPUT_SIZE), Image.LANCZOS)
    buf = io.BytesIO()
    result.save(buf, format='PNG')
    return buf.getvalue()


def cartoonize(image_bytes: bytes, prompt: str) -> bytes:
    if _img2img is None:
        raise RuntimeError('Pipeline not loaded')
    init_image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    result = _img2img(
        prompt=prompt,
        image=init_image,
        strength=FLUX_STRENGTH,
        num_inference_steps=FLUX_STEPS,
        guidance_scale=FLUX_GUIDANCE,
    ).images[0]
    buf = io.BytesIO()
    result.save(buf, format='PNG')
    return buf.getvalue()
