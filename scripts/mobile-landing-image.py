from PIL import Image
import glob, os

placeholderSize = 48, 64

for infile in glob.glob("**", recursive=True):
    file, ext = os.path.splitext(infile)
    if(ext == '.jpg' or ext=='.png' or ext=='.webp'):
        print(file)        
        if('placeholder' not in file):
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
            im.thumbnail(placeholderSize)
            im.save(file + ".placeholder"+ext, format)
    