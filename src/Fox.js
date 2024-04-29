function drawFox() {
    gl.uniform4f(u_FragColor, 1, 0.5, 0, 1.0);
    // Pass the size of a point to u_PointSize
    gl.uniform1f(u_PointSize, 1);

    // -------------------- drawing -----------------------------

    // head ---------------------------
    var [x, y] = [50, 0]; // head location

    drawIsoceles(2, x, y, 30.0, 70.0); // head shape

    

    drawRight(1, x-10, y+70, 20, 47); // left ear
    drawRight(0, x+10, y+70, 20, 47); // right ear

    gl.uniform4f(u_FragColor, 0.2, 0.2, 0.2, 1.0); //setting color to almost black
    drawRight(1, x-10, y+93.5, 10, 23.5); // left ear tuft
    drawRight(0, x+10, y+93.5, 10, 23.5); // right ear tuft

    

    // front half ----------------
    gl.uniform4f(u_FragColor, 1, 0.5, 0, 1.0); // back to orange
    [x, y] = [35, -20];
    
    drawRight(0, x, y, 40, 70); // chest 1
    drawIsoceles(2, x+20, y-80, 20, 80); // front leg

    gl.uniform4f(u_FragColor, 0.2, 0.2, 0.2, 1.0); //setting color to almost black
    drawIsoceles(2, x+20, y-80, 5, 20); // front foot
    gl.uniform4f(u_FragColor, 1, 0.5, 0, 1.0); // back to orange

    drawRight(2, x, y+82.5, 10, 82.5); // chest 2

    // body ------------
    [x, y] = [40, -35];

    drawRight(1, x, y, 80, 50); // body 1

    [x, y] = [-30, 5];
    drawRight(3, x, y, 80, 60); // body 2
    drawRight(0, x, y, 80, 10); // body 3

    drawRight(1, x, y-10, 40, 20); // body 4
    drawIsoceles(2, x-10, y-105, 30, 95); // back leg 1

    gl.uniform4f(u_FragColor, 0.2, 0.2, 0.2, 1.0); //setting color to almost black
    drawIsoceles(2, x-10, y-105, 7, 20); // front foot
    gl.uniform4f(u_FragColor, 1, 0.5, 0, 1.0); // back to orange

    // tail -----------
    [x, y] = [-55, -3];
    drawIsoceles(1, x, y, 25, 55); // tail 1

    gl.uniform4f(u_FragColor, 0.95, 0.95, 0.95, 1.0); //setting color to almost white
    drawIsoceles(3, x-110, y, 25, 55); // tail 2

    
    // face ---------------
    // has to be drawn after body due to over lap
    [x, y] = [50, 0]; // face location

    gl.uniform4f(u_FragColor, 1, 1, 1, 1.0);
    drawIsoceles(1, x-5, y+52.5, 5, 10); // left eye
    drawIsoceles(3, x+5, y+52.5, 5, 10); // right eye

    gl.uniform4f(u_FragColor, 0.2, 0.2, 0.2, 1.0); //setting color to almost black
    drawIsoceles(2, x, y, 6.0, 14.0); // nose
    gl.uniform4f(u_FragColor, 1, 0.5, 0, 1.0); // back to orange

    // heart ------------
    [x, y] = [-30, 60];
    gl.uniform4f(u_FragColor, 0.95, 0, 0, 1.0); // red
    drawIsoceles(2, x, y, 25, 30); // heart base
    drawIsoceles(0, x-12.5, y+45, 12.5, 15); // heart top 1
    drawIsoceles(0, x+12.5, y+45, 12.5, 15); // heart top 2
    

}

// remember for the height to be equal to the base, double the base
// centered on the main tip of the triangle (the one with the longest sides)
// flip is 0 for up, 1 for right, 2 for down, 3 for left
function drawIsoceles(flip, x, y, b, h) {
    x = x/200.0;
    y = y/200.0;
    b = b/200.0;
    h = h/200.0;

    switch(flip){
        case 0: // up
            drawTriangle([x, y, x+b, y-h, x-b, y-h]);
            break;
        case 1: // right
            drawTriangle([x, y, x-h, y+b, x-h, y-b]);
            break;
        case 2: // down
            drawTriangle([x, y, x+b, y+h, x-b, y+h]);
            break;
        default: //left is default
            drawTriangle([x, y, x+h, y+b, x+h, y-b]);
    }
}

// drawn on the 90 degree corner, its just more useful that way
// visualize them based on the quadrants of a graph with the
// x and y axis as the base and height
function drawRight(flip, x, y, b, h) {
    x = x/200.0;
    y = y/200.0;
    b = b/200.0;
    h = h/200.0;

    switch(flip){
        case 0: // right up
            drawTriangle([x, y, x+b, y, x, y+h]);
            break;
        case 1: // left up
            drawTriangle([x, y, x-b, y, x, y+h]);
            break;
        case 2: // left down
            drawTriangle([x, y, x-b, y, x, y-h]);
            break;
        default: // right down
            drawTriangle([x, y, x+b, y, x, y-h]);
    }
}