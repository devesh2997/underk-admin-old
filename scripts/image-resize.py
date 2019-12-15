from PIL import Image
import glob, os

previewSize = 960, 1280
thumbnailSize = 540, 720
placeholderSize = 48, 64

for infile in glob.glob("**", recursive=True):
    file, ext = os.path.splitext(infile)
    if(ext == '.jpg' or ext=='.png' or ext=='.webp'):
        print(file)        
        if('thumbnail' not in file and 'preview' not in file):
            format = ''
            if(ext == '.jpg'):
                format = 'jpeg'
            elif(ext == '.png'):
                format = 'png'
            elif(ext == '.webp'):
                format = 'webp'
            else: 
                print('Invalid file type for file'+file)
            im = Image.open(infile)
            im.thumbnail(thumbnailSize)
            im.save(file + ".thumbnail"+ext, format)
            im = Image.open(infile)
            im.thumbnail(previewSize)
            im.save(file + ".preview"+ext, format)
            im = Image.open(infile)
            im.thumbnail(placeholderSize)
            im.save(file + ".placeholder"+ext, format)
    