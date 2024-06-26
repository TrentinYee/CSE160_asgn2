// HelloPoint1.js (c) 2012 matsuda

// Vertex shader program
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' + // attribute variable
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_GlobalRotateMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  '}\n'; 

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' + // Set the point color
  '}\n';

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//Global Variables
let canvas;
let gl;
let a_Position;
let u_PointSize;
let u_FragColor;

// Global UI element related variables
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedType=POINT;
let g_globalAngle = [0, 0, 0];
let g_larmAngle = [[0,0,0],[0,0,0],[60, 0, 0]]; // every matrix is a dimension XYZ and the elements in the matrix are for each individual shape
let g_rarmAngle = [[0,0,0],[0,0,0],[60, 0, 0]];
let g_tailAngle = [[25,25,25],[0,0,0],[0, 0, 0]];
let g_llegAngle = [[0,0,0],[0,0,0],[0, 0, 0]];
let g_rlegAngle = [[0,0,0],[0,0,0],[0, 0, 0]];
let g_idle = 0;
let g_jutsu = 0;
let g_globalScale = 1;
let g_shrine;

// all the UI interaction
function addActionsForHtmlUI() {
   // Camera Sliders
  document.getElementById('YangleSlide').addEventListener('mousemove', function() { g_globalAngle[1] = this.value; renderAllShapes(); });
  document.getElementById('XangleSlide').addEventListener('mousemove', function() { g_globalAngle[0] = this.value; renderAllShapes(); });
  document.getElementById('ZangleSlide').addEventListener('mousemove', function() { g_globalAngle[2] = this.value; renderAllShapes(); });
  document.getElementById('ZoomSlide').addEventListener('mousemove', function() { g_globalScale = this.value/10; renderAllShapes(); });

  // Left Arm Sliders ----------------------------------
  // Left upper arm
  document.getElementById('luarmXSlide').addEventListener('mousemove', function() { g_larmAngle[0][0] = this.value; renderAllShapes(); });
  document.getElementById('luarmYSlide').addEventListener('mousemove', function() { g_larmAngle[1][0] = this.value; renderAllShapes(); });
  document.getElementById('luarmZSlide').addEventListener('mousemove', function() { g_larmAngle[2][0] = this.value; renderAllShapes(); });

  // Left forearm
  document.getElementById('lfarmXSlide').addEventListener('mousemove', function() { g_larmAngle[0][1] = this.value; renderAllShapes(); });
  document.getElementById('lfarmYSlide').addEventListener('mousemove', function() { g_larmAngle[1][1] = this.value; renderAllShapes(); });

  // Left hand
  document.getElementById('lhandXSlide').addEventListener('mousemove', function() { g_larmAngle[0][2] = this.value; renderAllShapes(); });
  document.getElementById('lhandZSlide').addEventListener('mousemove', function() { g_larmAngle[2][2] = this.value; renderAllShapes(); });

  // Right Arm Sliders -------------------------
  // Right upper arm
  document.getElementById('ruarmXSlide').addEventListener('mousemove', function() { g_rarmAngle[0][0] = this.value; renderAllShapes(); });
  document.getElementById('ruarmYSlide').addEventListener('mousemove', function() { g_rarmAngle[1][0] = this.value; renderAllShapes(); });
  document.getElementById('ruarmZSlide').addEventListener('mousemove', function() { g_rarmAngle[2][0] = this.value; renderAllShapes(); });

  // Right forearm
  document.getElementById('rfarmXSlide').addEventListener('mousemove', function() { g_rarmAngle[0][1] = this.value; renderAllShapes(); });
  document.getElementById('rfarmYSlide').addEventListener('mousemove', function() { g_rarmAngle[1][1] = this.value; renderAllShapes(); });

  // Right hand
  document.getElementById('rhandXSlide').addEventListener('mousemove', function() { g_rarmAngle[0][2] = this.value; renderAllShapes(); });
  document.getElementById('rhandZSlide').addEventListener('mousemove', function() { g_rarmAngle[2][2] = this.value; renderAllShapes(); });

  // Tail Sliders --------------------------
  // Tail 1
  document.getElementById('tail1XSlide').addEventListener('mousemove', function() { g_tailAngle[0][0] = this.value; renderAllShapes(); });
  document.getElementById('tail1YSlide').addEventListener('mousemove', function() { g_tailAngle[1][0] = this.value; renderAllShapes(); });
  document.getElementById('tail1ZSlide').addEventListener('mousemove', function() { g_tailAngle[2][0] = this.value; renderAllShapes(); });

  // Tail 2
  document.getElementById('tail2XSlide').addEventListener('mousemove', function() { g_tailAngle[0][1] = this.value; renderAllShapes(); });
  document.getElementById('tail2YSlide').addEventListener('mousemove', function() { g_tailAngle[1][1] = this.value; renderAllShapes(); });
  document.getElementById('tail2ZSlide').addEventListener('mousemove', function() { g_tailAngle[2][1] = this.value; renderAllShapes(); });

  // Tail 3
  document.getElementById('tail3XSlide').addEventListener('mousemove', function() { g_tailAngle[0][2] = this.value; renderAllShapes(); });
  document.getElementById('tail3YSlide').addEventListener('mousemove', function() { g_tailAngle[1][2] = this.value; renderAllShapes(); });
  document.getElementById('tail3ZSlide').addEventListener('mousemove', function() { g_tailAngle[2][2] = this.value; renderAllShapes(); });

  // Right Leg Sliders ---------------------------------------------------------
  // Thigh
  document.getElementById('rthighXSlide').addEventListener('mousemove', function() { g_rlegAngle[0][0] = this.value; renderAllShapes(); });
  document.getElementById('rthighYSlide').addEventListener('mousemove', function() { g_rlegAngle[1][0] = this.value; renderAllShapes(); });
  document.getElementById('rthighZSlide').addEventListener('mousemove', function() { g_rlegAngle[2][0] = this.value; renderAllShapes(); });

  // Shin
  document.getElementById('rshinXSlide').addEventListener('mousemove', function() { g_rlegAngle[0][1] = this.value; renderAllShapes(); });

  // Foot
  document.getElementById('rfootXSlide').addEventListener('mousemove', function() { g_rlegAngle[0][2] = this.value; renderAllShapes(); });
  document.getElementById('rfootYSlide').addEventListener('mousemove', function() { g_rlegAngle[1][2] = this.value; renderAllShapes(); });

  // Left Leg Sliders ---------------------------------------------------------
  // Thigh
  document.getElementById('lthighXSlide').addEventListener('mousemove', function() { g_llegAngle[0][0] = this.value; renderAllShapes(); });
  document.getElementById('lthighYSlide').addEventListener('mousemove', function() { g_llegAngle[1][0] = this.value; renderAllShapes(); });
  document.getElementById('lthighZSlide').addEventListener('mousemove', function() { g_llegAngle[2][0] = this.value; renderAllShapes(); });

  // Shin
  document.getElementById('lshinXSlide').addEventListener('mousemove', function() { g_llegAngle[0][1] = this.value; renderAllShapes(); });

  // Foot
  document.getElementById('lfootXSlide').addEventListener('mousemove', function() { g_llegAngle[0][2] = this.value; renderAllShapes(); });
  document.getElementById('lfootYSlide').addEventListener('mousemove', function() { g_llegAngle[1][2] = this.value; renderAllShapes(); });

  // Animation Buttons -------------------------
  document.getElementById('Idle').onclick = function() { g_idle = 1;};
  document.getElementById('Off').onclick = function() { g_idle = 0; g_jutsu = 0;};
  document.getElementById('Reset').onclick = resetmodel;

  // Audio ------------------
  g_shrine = document.getElementById('shrine');
}

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of uniform variables
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (u_FragColor < 0) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of attribute variables
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Set initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

// THE MAIN FUNCTION
function main() {

  // sets up canvas and gl
  setupWebGL();

  // set up shader programs and glsl variables
  connectVariablesToGLSL();
  
  // set up the actions for all the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev) {
    if(ev.shiftKey) { 
      resetmodel();
      g_shrine.play();
      g_jutsu = 1;
    } else {
      click(ev) 
    } 
  };
  canvas.onmousemove = function(ev) {if(ev.buttons == 1) { drag(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.15, 0.14, 0.32, 1.0);

  renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/1000.0-g_startTime;

function tick() {
  // save current time
  g_seconds=performance.now()/1000.0-g_startTime;
  //console.log(g_seconds);

  updateAnimationAngles();

  // Draw everything
  renderAllShapes();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

function clearCanvas() {
  g_shapesList[g_selectedLayer] = [];
  renderAllShapes();
}

var g_lastclick = [0, 0];

function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);

  //console.log(g_lastclick);

  //g_globalAngle[0] += (y - g_lastclick[0]) * 90;
  //g_globalAngle[1] += (x - g_lastclick[1]) * 90;

  g_lastclick[0] = y;
  g_lastclick[1] = x;
  renderAllShapes();
}

function drag(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);

  //console.log(g_lastclick);
  //console.log(x);
  //console.log(y);
  g_globalAngle[0] -= (y - g_lastclick[0]) * 2;
  g_globalAngle[1] -= (x - g_lastclick[1]) * 2;
  
  renderAllShapes();
}

// converts the coordiantes of the event to the coordinates needed
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x, y]);
}

var g_bottomy = -1.5;
var g_topy = 1.5;
var g_bottomog = -5.0;
var g_topog = 5.0;
var g_flash = 8.0;
var g_flashstart = 0; //used as a tick timer
var g_soundstart = 0;
var g_ending = 0;
var g_slash = -8.0;

// Update the angles of everything if currently animated
function updateAnimationAngles() {
  //console.log(g_idle);
  if (g_idle) {
    // Tail --------------
    g_tailAngle[2][0] = 45*Math.sin(2*g_seconds);
    g_tailAngle[2][1] = 25*Math.sin(2*g_seconds);
    g_tailAngle[2][2] = 60*Math.sin(2*g_seconds);

    // Left arm ------------
    g_larmAngle[1][0] = 15*Math.sin(5*g_seconds);

    // Right arm --------------
    g_rarmAngle[1][0] = 15*Math.sin(5*g_seconds);
    
  } else if(g_jutsu) { // Poke animation ---------------------------
    gl.clearColor(0.5, 0.0, 0.0, 1.0);
    g_bottomog = 0;
    g_topog = 0;

    // timer for this animation specifically -----------------
    g_flashstart += 0.01;

    // Black bars -------------------

    if (g_bottomy <= -0.3) {
      g_bottomy += 0.025;
      //console.log(g_bottomy);
    }
    
    if (g_topy >= 0.3) {
      g_topy -= 0.025;
      //console.log(g_topy);
    }

    // Zoom ------------------------

    if (g_globalScale < 1.65) {
      g_globalScale += 0.025;
    } else if (g_globalScale > 1.75) {
      g_globalScale -= 0.05;
    }

    // Left arm ------------
    if (g_larmAngle[0][0] > -20) {
      g_larmAngle[0][0] = -30*Math.abs(Math.sin(g_flashstart));
    }

    if (g_larmAngle[1][0] > -30) {
      g_larmAngle[1][0] = -40*Math.abs(Math.sin(g_flashstart));
    }

    if (g_larmAngle[0][1] > -110) {
      g_larmAngle[0][1] = -115*Math.abs(Math.sin(g_flashstart));
    }
    

    // Right arm --------------
    if (g_rarmAngle[0][0] > -20) {
      g_rarmAngle[0][0] = -30*Math.abs(Math.sin(g_flashstart));
    }

    if (g_rarmAngle[1][0] > -30) {
      g_rarmAngle[1][0] = -40*Math.abs(Math.sin(g_flashstart));
    }

    if (g_rarmAngle[0][1] > -110) {
      g_rarmAngle[0][1] = -125*Math.abs(Math.sin(g_flashstart));
    }

    if (g_flashstart > 7.75) {
      g_slash = 0.0;
    }

    if (g_flashstart > 8) {
      g_flash = -1.0;
    }

    if (g_flashstart > 11) {
      g_ending = 1;
    }

    // return to normal --------------------
    if (g_ending) {
      resetmodel();
    }

  }
}

function resetmodel() {
  g_bottomog = -3.0;
  g_topog = 3.0;
  g_idle = 0;
  g_flash = 8.0;
  g_soundstart = 0;
  g_jutsu = 0;
  gl.clearColor(0.15, 0.14, 0.32, 1.0);
  g_larmAngle = [[0,0,0],[0,0,0],[60, 0, 0]];
  g_rarmAngle = [[0,0,0],[0,0,0],[60, 0, 0]];
  g_tailAngle = [[25,25,25],[0,0,0],[0, 0, 0]];
  g_llegAngle = [[0,0,0],[0,0,0],[0, 0, 0]];
  g_rlegAngle = [[0,0,0],[0,0,0],[0, 0, 0]];
  g_globalAngle = [0, 0, 0];
  g_globalScale = 1.0;
  g_flashstart = 0;
  g_ending = 0;
  g_slash = -8;
}


// renders all stored shapes
function renderAllShapes() {
  
  // Checking the time at the start of the draw
  var startTime = performance.now();

  // Pass the matrix to the u_ModelMatrix attribute
  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalAngle[0],1,0,0);
  globalRotMat.rotate(g_globalAngle[1],0,1,0);
  globalRotMat.rotate(g_globalAngle[2],0,0,1);
  globalRotMat.scale(g_globalScale, g_globalScale, g_globalScale);
  
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // pos, scale, irot, rot, color is the order

  // black bars ----------------------------------------------

  var bottombar = new Cube();
  bottombar.color = [0.0,0.0,0.0,1.0];
  //bottombar.matrix.translate(-1.0, -2.0, 1.0);
  bottombar.matrix.translate(-1.0, g_bottomy + g_bottomog, 0.5);
  bottombar.matrix.scale(2.0,-0.75,-0.1);
  bottombar.render();

  var topbar = new Cube();
  topbar.color = [0.0,0.0,0.0,1.0];
  topbar.matrix.translate(-1.0, g_topy + g_topog, 0.5);
  topbar.matrix.scale(2.0, 0.75,-0.1);
  topbar.render();

  var flashbang = new Cube();
  flashbang.color = [0.0,0.0,0.0,1.0];
  flashbang.matrix.translate(-1.0, g_flash, -0.5);
  flashbang.matrix.scale(2.0, 2.0,-0.1);
  flashbang.render();

  var cleave = new Cube();
  cleave.color = [1.5,1.5,1.5,1.0];
  //console.log(g_slash);
  cleave.matrix.translate(-1.0, g_slash, -0.52);
  cleave.matrix.scale(2.0, 0.05,-0.1);
  cleave.render();

  // body cube -------------------------------------------
  //var bodycoords = drawCube([-0.125,-0.125,0.0], [0.25,0.30,0.13], [0,0,0], [0,0,0], [0.1,0.1,0.1,1.0]);
  
  var body = new Cube();
  body.color = [0.1,0.1,0.1,1.0];
  body.matrix.translate(-0.125,-0.125,0.0);
  var bodycoords = [new Matrix4(body.matrix)];
  for (let j = 0; j < 3; j++) {
    bodycoords.push(new Matrix4(body.matrix));  
  }
  body.matrix.scale(0.25,0.30,0.13);
  body.render();

  var belt = new Cube();
  belt.color = [1.0,0.0,0.0,1.0];
  belt.matrix = bodycoords[0];
  belt.matrix.translate(0, -0.07, 0);
  belt.matrix.scale(0.25, 0.075, 0.13);
  belt.render();

  var neck = new Cube();
  neck.color = [1.0,0.0,0.0,1.0];
  neck.matrix = bodycoords[1];
  neck.matrix.translate(0, 0.3, 0);
  neck.matrix.scale(0.25, 0.075, 0.13);
  neck.render();

  // tail cubes ---------------------------------

  var tail1 = new Cube();
  tail1.color = [0.9,0.9,0.9,1.0];
  tail1.matrix = bodycoords[2];
  tail1.matrix.translate(0.085, 0, 0.1);
  tail1.matrix.rotate(90, 1, 0, 0);
  tail1.matrix.rotate(g_tailAngle[0][0], 1, 0, 0); //X
  tail1.matrix.rotate(g_tailAngle[1][0], 0, 1, 0); //Y
  tail1.matrix.rotate(g_tailAngle[2][0], 0, 0, 1); //Z
  //tail1.matrix.rotate(45*Math.sin(2*g_seconds), 0, 0, 1);
  var tail1coords = new Matrix4(tail1.matrix);
  tail1.matrix.scale(0.075, 0.25, 0.075);
  tail1.render();

  var tail2 = new Cube();
  tail2.color = [0.9,0.9,0.9,1.0];
  tail2.matrix = tail1coords;
  tail2.matrix.translate(0.0, 0.25, 0.0);
  tail2.matrix.rotate(g_tailAngle[0][1], 1, 0, 0);
  tail2.matrix.rotate(g_tailAngle[1][1], 0, 1, 0);
  tail2.matrix.rotate(g_tailAngle[2][1], 0, 0, 1);
  //tail2.matrix.rotate(25*Math.sin(2*g_seconds), 0, 0, 1);
  var tail2coords = new Matrix4(tail2.matrix);
  tail2.matrix.scale(0.075, 0.15, 0.075);
  tail2.render();

  var tail3 = new Cube();
  tail3.color = [0.9,0.9,0.9,1.0];
  tail3.matrix = tail2coords;
  tail3.matrix.translate(0.0, 0.15, 0.0);
  tail3.matrix.rotate(g_tailAngle[0][2], 1, 0, 0);
  tail3.matrix.rotate(g_tailAngle[1][2], 0, 1, 0);
  tail3.matrix.rotate(g_tailAngle[2][2], 0, 0, 1);
  //tail3.matrix.rotate(60*Math.sin(2*g_seconds), 0, 0, 1);
  tail3.matrix.scale(0.075, 0.15, 0.075);
  tail3.render();
  
  // head cube -----------------------------------------
  var head = new Cube();
  head.color = [0.1,0.1,0.1,1.0];
  head.matrix.translate(-0.125,0.25,-0.0625);
  var headcoords = [new Matrix4(head.matrix)];
  for (let i = 0; i < 5; i++) {
    headcoords.push(new Matrix4(head.matrix));  
  }
  //const headcoords1 = new Matrix4(head.matrix);
  head.matrix.scale(0.25,0.1,0.25);
  head.render();

  var leye = new Cube();
  leye.color = [0.0,0.85,0.95,1.0];
  leye.matrix = headcoords[0];
  leye.matrix.translate(0.05, 0.125, -0.0025);
  leye.matrix.scale(0.05, 0.05, 0.05);
  leye.render();

  var reye = new Cube();
  reye.color = [0.0,0.85,0.95,1.0];
  reye.matrix = headcoords[1];
  reye.matrix.translate(0.15, 0.125, -0.0025);
  reye.matrix.scale(0.05, 0.05, 0.05);
  reye.render();

  var head2 = new Cube();
  head2.color = [0.9,0.9,0.9,1.0];
  head2.matrix = headcoords[2];
  head2.matrix.translate(0, 0.1, 0);
  head2.matrix.scale(0.25,0.15,0.25);
  head2.render();

  var mask = new Cube();
  mask.color = [0.07,0.07,0.07,1.0];
  mask.matrix = headcoords[5];
  mask.matrix.translate(0.05, 0.0, -0.05);
  mask.matrix.scale(0.15,0.1,0.05);
  mask.render();

  var lear = new Triprism();
  lear.color = [0.8, 0.8, 0.8, 1.0];
  lear.matrix = headcoords[3];
  lear.matrix.translate(0, 0.25, 0.05);
  lear.matrix.scale(0.09,0.12,0.09);
  lear.render();

  var rear = new Triprism();
  rear.color = [0.8, 0.8, 0.8, 1.0];
  rear.matrix = headcoords[4];
  rear.matrix.translate(0.1575, 0.25, 0.05);
  rear.matrix.scale(0.09,0.12,0.09);
  rear.render();

  // left arm --------------------------------------------
  var luparm = new Cube();
  luparm.color = [0.9,0.9,0.9,1.0];
  luparm.matrix.translate(-0.125, 0.25, 0.001);
  luparm.matrix.rotate(90, 0, 0, 1); //initial rotation
  //luparm.matrix.rotate(25*Math.sin(5*g_seconds), 0, 1, 0);
  luparm.matrix.rotate(g_larmAngle[0][0], 1, 0, 0);
  luparm.matrix.rotate(g_larmAngle[1][0], 0, 1, 0); //Y
  luparm.matrix.rotate(g_larmAngle[2][0], 0, 0, 1); //Z
  
  var larmCoordinates = new Matrix4(luparm.matrix);
  luparm.matrix.scale(-0.1, 0.2, 0.125);
  luparm.render();

  //var larmCoordinates = drawCube([-0.125,0.125,0.0], [-0.1,0.2,0.125], [90,0,0], [g_larmAngle[2][0], 0, 0], [0.9,0.9,0.9,1.0]);
  
  var lforearm = new Cube();
  lforearm.color = [0.1,0.1,0.1,1.0];
  lforearm.matrix = larmCoordinates;
  lforearm.matrix.translate(-0.00625, 0.2, 0.0125);
  lforearm.matrix.rotate(g_larmAngle[0][1], 1, 0, 0);
  lforearm.matrix.rotate(g_larmAngle[1][1], 0, 1, 0);
  var lforearmCoords = new Matrix4(lforearm.matrix);
  lforearm.matrix.scale(-0.0875, 0.25, 0.1);
  lforearm.render();

  var lhand = new Cube();
  lhand.color = [0.9,0.9,0.9,1.0];
  lhand.matrix = lforearmCoords;
  lhand.matrix.translate(0.00625, 0.2, -0.0125);
  lhand.matrix.rotate(g_larmAngle[0][2], 1, 0, 0);
  lhand.matrix.rotate(g_larmAngle[2][2], 0, 0, 1);
  lhand.matrix.scale(-0.1, 0.1, 0.125);
  lhand.render();

  // right arm --------------------------------------------
  var ruparm = new Cube();
  ruparm.color = [0.9,0.9,0.9,1.0];
  ruparm.matrix.translate(0.125, 0.25, 0.001);
  ruparm.matrix.rotate(270, 0, 0, 1); //initial rotation
  //ruparm.matrix.rotate(-25*Math.sin(5*g_seconds), 0, 1, 0);
  ruparm.matrix.rotate(g_rarmAngle[0][0], 1, 0, 0);
  ruparm.matrix.rotate(-g_rarmAngle[1][0], 0, 1, 0);
  ruparm.matrix.rotate(-g_rarmAngle[2][0], 0, 0, 1);
  var rarmCoordinates = new Matrix4(ruparm.matrix);
  ruparm.matrix.scale(0.1, 0.2, 0.125);
  ruparm.render();

  //var rarmCoordinates = drawCube([0.125,0.125,0.0], [0.1,0.2,0.125], [270,0, 0, 1], [-g_rarmAngle[2][0], 0, 0, 1], [0.9,0.9,0.9,1.0]);
  
  var rforearm = new Cube();
  rforearm.color = [0.1,0.1,0.1,1.0];
  rforearm.matrix = rarmCoordinates;
  rforearm.matrix.translate(0.09375, 0.2, 0.0125);
  rforearm.matrix.rotate(g_rarmAngle[0][1], 1, 0, 0);
  rforearm.matrix.rotate(g_rarmAngle[1][1], 0, 1, 0);
  var rforearmCoords = new Matrix4(rforearm.matrix);
  rforearm.matrix.scale(-0.0875, 0.25, 0.1);
  rforearm.render();

  var rhand = new Cube();
  rhand.color = [0.9,0.9,0.9,1.0];
  rhand.matrix = rforearmCoords;
  rhand.matrix.translate(0.00625, 0.2, -0.0125);
  rhand.matrix.rotate(g_rarmAngle[0][2], 1, 0, 0);
  rhand.matrix.rotate(g_rarmAngle[2][2], 0, 0, 1);
  rhand.matrix.scale(-0.1, 0.1, 0.125);
  rhand.render();


  // left leg ---------------------------------------------------------------------
  
  var lthigh = new Cube();
  lthigh.color = [0.1,0.1,0.1,1.0];
  lthigh.matrix.translate(0,-0.19, 0.0);
  lthigh.matrix.rotate(0, 0, 0, 1); //initial rotation
  lthigh.matrix.rotate(g_llegAngle[0][0], 1, 0, 0);
  lthigh.matrix.rotate(g_llegAngle[1][0], 0, 1, 0);
  lthigh.matrix.rotate(g_llegAngle[2][0], 0, 0, 1);
  var lthighCoordinates = new Matrix4(lthigh.matrix);
  lthigh.matrix.scale(-0.15, -0.3, 0.125);
  lthigh.render();
  
  var lshin = new Cube();
  lshin.color = [0.2,0.2,0.2,1.0];
  lshin.matrix = lthighCoordinates;
  lshin.matrix.translate(-0.01625, -0.3, 0.0125);
  lshin.matrix.rotate(g_llegAngle[0][1], 1, 0, 0);
  var lshinCoords = new Matrix4(lshin.matrix);
  lshin.matrix.scale(-0.125, -0.25, 0.1);
  lshin.render();

  var lfoot = new Cube();
  lfoot.color = [0.137,0.09,0.06,1.0];
  lfoot.matrix = lshinCoords;
  lfoot.matrix.translate(0.01, -0.2, 0.101);
  lfoot.matrix.rotate(g_llegAngle[0][2], 1, 0, 0);
  lfoot.matrix.rotate(g_llegAngle[1][2], 0, 1, 0);
  lfoot.matrix.scale(-0.14, -0.1, -0.17);
  lfoot.render();

  // right leg ---------------------------------------------------------------------
  
  var rthigh = new Cube();
  rthigh.color = [0.1,0.1,0.1,1.0];
  rthigh.matrix.translate(0,-0.19, 0.0);
  rthigh.matrix.rotate(0, 0, 0, 1); //initial rotation
  rthigh.matrix.rotate(g_rlegAngle[0][0], 1, 0, 0);
  rthigh.matrix.rotate(g_rlegAngle[1][0], 0, 1, 0);
  rthigh.matrix.rotate(g_rlegAngle[2][0], 0, 0, 1);
  var rthighCoordinates = new Matrix4(rthigh.matrix);
  rthigh.matrix.scale(0.15, -0.3, 0.125);
  rthigh.render();
  
  var rshin = new Cube();
  rshin.color = [0.2,0.2,0.2,1.0];
  rshin.matrix = rthighCoordinates;
  rshin.matrix.translate(0.01625, -0.3, 0.0125);
  rshin.matrix.rotate(g_rlegAngle[0][1], 1, 0, 0);
  var rshinCoords = new Matrix4(rshin.matrix);
  rshin.matrix.scale(0.125, -0.25, 0.1);
  rshin.render();

  var rfoot = new Cube();
  rfoot.color = [0.137,0.09,0.06,1.0];
  rfoot.matrix = rshinCoords;
  rfoot.matrix.translate(-0.01, -0.2, 0.101);
  rfoot.matrix.rotate(g_rlegAngle[0][2], 1, 0, 0);
  rfoot.matrix.rotate(g_rlegAngle[1][2], 0, 1, 0);
  rfoot.matrix.scale(0.14, -0.1, -0.17);
  rfoot.render();

  // performance stuff
  var duration = performance.now() - startTime;
  //console.log(duration);
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

//Set the text of an HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}
