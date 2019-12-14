from PIL import Image
import glob, os

for infile in glob.glob("**", recursive=True):
    file, ext = os.path.splitext(infile)
    if(ext == '.jpg' or ext=='.png'):
        print(file)
        im = Image.open(infile)
        im.save(file + ".webp.webp", "webp")