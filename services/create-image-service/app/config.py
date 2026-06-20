import os

PORT = int(os.getenv('PORT', 3000))
MAX_IMAGE_MB = int(os.getenv('MAX_IMAGE_MB', 10))
DEFAULT_PROMPT = os.getenv('DEFAULT_PROMPT', 'cartoon style, vibrant colors, anime art')

# FLUX.1-schnell shared settings
FLUX_MODEL_ID = os.getenv('FLUX_MODEL_ID', 'black-forest-labs/FLUX.1-schnell')
FLUX_GUIDANCE = float(os.getenv('FLUX_GUIDANCE', 0.0))   # schnell is CFG-free

# /cartoonize (img2img)
FLUX_STEPS = int(os.getenv('FLUX_STEPS', 4))
FLUX_STRENGTH = float(os.getenv('FLUX_STRENGTH', 0.75))  # 0=keep original, 1=ignore it

# /createImage (text-to-image)
CREATE_IMAGE_STEPS = int(os.getenv('CREATE_IMAGE_STEPS', 4))
CREATE_IMAGE_SIZE = int(os.getenv('CREATE_IMAGE_SIZE', 592))  # 592 = 37×16, closest valid size to 600
