import numpy as np
from PIL import Image

filename = 'nature'
with Image.open(f'{filename}.jpeg') as im:
    im.crop((0, 0, 100, 100)).save(f'{filename}.ppm')

