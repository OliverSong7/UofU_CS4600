// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite( bgImg, fgImg, fgOpac, fgPos )
{
    if(!bgImg || !fgImg || fgOpac <= 0) return; 

    // getting the info for the background and forground images - basic width and height in a variable;
    // these are the imageData objects from the HTML canvas
    const bgW = bgImg.width;
    const bgH = bgImg.height;
    const fgW = fgImg.width;
    const fgH = fgImg.height;


    // satart at (0,0) where the origin at, image coordinates the origin is the top-left corner, x -> right, y -> downward
    // where the overlap part of the foreground image on top of the background image starts
    const xStart = Math.max(0, fgPos.x);  
    const yStart = Math.max(0, fgPos.y);
    // where the overlap part of the background image on top of the background image ends
    const xEnd = Math.min(bgW, fgPos.x + fgW);
    const yEnd = Math.min(bgH, fgPos.y + fgH);

    // if theres no overlapping part 
    if(xStart >= xEnd || yStart >= yEnd) return;

    // canvas -- imageData(return type)
    // for each pixel in an imageData obj there are four pieces of information -- RGBA 
    // red: img.data[0], green: img.data[1], blue: img.data[2], alpha: img.data[3]
    // Unit8ClampedArray: unsighed integers clmaped to 0-255
    const fgData = fgImg.data;
    const bgData = bgImg.data;

    // passing along the image data with the given parameter
    // access image by for loops
    // nested for loop, along of the horizontal pixels of each vertical pixel 
    for(let y = yStart; y < yEnd; ++y){ // where the current location at canvas of y-axis 
        // y in foreground space 
        const fy = y - fgPos.y;  
        for(let x = xStart; x < xEnd; ++x){ //  where the current location at canvas of x-axis
            // x in foreground space
            const fx = x - fgPos.x;
            
            const bgIndex = (y * bgW + x) * 4;  
            const fgIndex = (fy * fgW + fx) * 4;

            const foreground = readPixel(fgData, fgIndex, fgOpac);
            const background = readPixel(bgData, bgIndex, 1.0);

            // core of the alpha compositing, additive blending is being used in here
            const outAlpha = foreground.alpha + background.alpha * (1 - foreground.alpha);
            if(outAlpha <= 0){
                writePixel(bgData, bgIndex, {r:0, g:0, b:0, a:0});
                continue;
            }
            
            // formula from the lecture video, calculating c[RGB] here
            const outRed = (foreground.red * foreground.alpha + background.red * background.alpha *(1 - foreground.alpha)) / outAlpha;
            const outGreen = (foreground.green * foreground.alpha + background.green * background.alpha *(1 - foreground.alpha)) / outAlpha;
            const outBlue = (foreground.blue * foreground.alpha + background.blue * background.alpha *(1 - foreground.alpha)) / outAlpha;

            writePixel(bgData, bgIndex ,{r:outRed, g:outGreen, b:outBlue, a:outAlpha});
        }
    }
}

// helper method -- read one pixel and return to normalized arr
function readPixel(data, index, opacity = 1.0){
    const red = data[index] / 255;
    const green = data[index + 1] / 255;
    const blue = data[index + 2] / 255;
    let alpha = data[index + 3] / 255;

    alpha *= opacity;
    return {red, green, blue, alpha};
}

// helper method -- write normalized RGB back into a data arr
function writePixel(data, index, {r,g,b,a}){
    data[index] = Math.round(r * 255);
    data[index + 1] = Math.round(g *255);
    data[index + 2] = Math.round(b * 255);
    data[index + 3] = Math.round(a * 255);
 }