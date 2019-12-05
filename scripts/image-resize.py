from PIL import Image
import glob, os

previewSize = 540, 720
thumbnailSize = 270, 360

for infile in glob.glob("./scripts/*.jpg"):
    file, ext = os.path.splitext(infile)
    im = Image.open(infile)
    im.thumbnail(thumbnailSize)
    im.save(file + ".thumbnail.jpg", "JPEG")
    im = Image.open(infile)
    im.thumbnail(previewSize)
    im.save(file + ".preview.jpg", "JPEG")
    