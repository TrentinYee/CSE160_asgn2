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
let g_larmAngle = [[0,0,0],[0,0,0],[0, 0, 0]];
let g_rarmAngle = [[0,0,0],[0,0,0],[0, 0, 0]];

// all the UI interaction
function addActionsForHtmlUI() {
   // Camera Sliders
  document.getElementById('YangleSlide').addEventListener('mousemove', function() { g_globalAngle[1] = this.value; renderAllShapes(); });
  document.getElementById('XangleSlide').addEventListener('mousemove', function() { g_globalAngle[0] = this.value; renderAllShapes(); });
  document.getElementById('ZangleSlide').addEventListener('mousemove', function() { g_globalAngle[2] = this.value; renderAllShapes(); });

  // Left Arm Sliders
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

  // Right Arm Sliders
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
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.15, 0.14, 0.32, 1.0);

  renderAllShapes();
  //requestAnimationFrame(tick);
}

function tick() {
  console.log(performance.now());

  renderAllShapes();

  requestAnimationFrame(tick);
}

function clearCanvas() {
  g_shapesList[g_selectedLayer] = [];
  renderAllShapes();
}

function click(ev) {

  renderAllShapes();
}

/*// converts the coordiantes of the event to the coordinates needed
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x, y]);
}*/

// renders all stored shapes
function renderAllShapes() {
  
  // Checking the time at the start of the draw
  var startTime = performance.now();

  // Pass the matrix to the u_ModelMatrix attribute
  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalAngle[0],1,0,0);
  globalRotMat.rotate(g_globalAngle[1],0,1,0);
  globalRotMat.rotate(g_globalAngle[2],0,0,1);
  
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // pos, scale, irot, rot, color is the order

  // body cube -------------------------------------------
  //var bodycoords = drawCube([-0.125,-0.125,0.0], [0.25,0.30,0.13], [0,0,0], [0,0,0], [0.1,0.1,0.1,1.0]);
  
  var body = new Cube();
  body.color = [0.1,0.1,0.1,1.0];
  body.matrix.translate(-0.125,-0.125,0.0);
  const bodycoords = new Matrix4(body.matrix);
  const bodycoords1 = new Matrix4(body.matrix);
  body.matrix.scale(0.25,0.30,0.13);
  body.render();

  var belt = new Cube();
  belt.color = [1.0,0.0,0.0,1.0];
  belt.matrix = bodycoords;
  belt.matrix.translate(0, -0.07, 0);
  belt.matrix.scale(0.25, 0.075, 0.13);
  belt.render();

  var neck = new Cube();
  neck.color = [1.0,0.0,0.0,1.0];
  neck.matrix = bodycoords1;
  neck.matrix.translate(0, 0.3, 0);
  neck.matrix.scale(0.25, 0.075, 0.13);
  neck.render();
  
  
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

  // left arm --------------------------------------------
  var luparm = new Cube();
  luparm.color = [0.9,0.9,0.9,1.0];
  luparm.matrix.translate(-0.125, 0.25, 0.0);
  luparm.matrix.rotate(90, 0, 0, 1); //initial rotation
  luparm.matrix.rotate(g_larmAngle[0][0], 1, 0, 0);
  luparm.matrix.rotate(g_larmAngle[1][0], 0, 1, 0);
  luparm.matrix.rotate(g_larmAngle[2][0], 0, 0, 1);
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
  ruparm.matrix.translate(0.125, 0.25, 0.0);
  ruparm.matrix.rotate(270, 0, 0, 1); //initial rotation
  ruparm.matrix.rotate(g_rarmAngle[0][0], 1, 0, 0);
  ruparm.matrix.rotate(g_rarmAngle[1][0], 0, 1, 0);
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
  lthigh.matrix.translate(0,-0.49, 0.0);
  lthigh.matrix.rotate(0, 0, 0, 1); //initial rotation
  //lthigh.matrix.rotate(g_llegAngle[0][0], 1, 0, 0);
  //lthigh.matrix.rotate(g_llegAngle[1][0], 0, 1, 0);
  //lthigh.matrix.rotate(g_llegAngle[2][0], 0, 0, 1);
  var lthighCoordinates = new Matrix4(lthigh.matrix);
  lthigh.matrix.scale(-0.15, 0.3, 0.125);
  lthigh.render();
  
  var lshin = new Cube();
  lshin.color = [0.2,0.2,0.2,1.0];
  lshin.matrix = lthighCoordinates;
  lshin.matrix.translate(-0.01625, -0.2, 0.0125);
  //lshin.matrix.rotate(g_llegAngle[0][1], 1, 0, 0);
  //lshin.matrix.rotate(g_llegAngle[1][1], 0, 1, 0);
  var lshinCoords = new Matrix4(lshin.matrix);
  lshin.matrix.scale(-0.125, 0.25, 0.1);
  lshin.render();

  var lfoot = new Cube();
  lfoot.color = [0.137,0.09,0.06,1.0];
  lfoot.matrix = lshinCoords;
  lfoot.matrix.translate(0.00625, -0.1, -0.0125);
  //lfoot.matrix.rotate(g_llegAngle[0][2], 1, 0, 0);
  //lfoot.matrix.rotate(g_llegAngle[2][2], 0, 0, 1);
  lfoot.matrix.scale(-0.125, 0.1, 0.15);
  lfoot.render();

  // right leg ---------------------------------------------------------------------
  
  var rthigh = new Cube();
  rthigh.color = [0.1,0.1,0.1,1.0];
  rthigh.matrix.translate(0,-0.49, 0.0);
  rthigh.matrix.rotate(0, 0, 0, 1); //initial rotation
  //rthigh.matrix.rotate(g_rlegAngle[0][0], 1, 0, 0);
  //rthigh.matrix.rotate(g_rlegAngle[1][0], 0, 1, 0);
  //rthigh.matrix.rotate(g_rlegAngle[2][0], 0, 0, 1);
  var rthighCoordinates = new Matrix4(rthigh.matrix);
  rthigh.matrix.scale(0.15, 0.3, 0.125);
  rthigh.render();
  
  var rshin = new Cube();
  rshin.color = [0.2,0.2,0.2,1.0];
  rshin.matrix = rthighCoordinates;
  rshin.matrix.translate(0.01625, -0.2, 0.0125);
  //rshin.matrix.rotate(g_rlegAngle[0][1], 1, 0, 0);
  //rshin.matrix.rotate(g_rlegAngle[1][1], 0, 1, 0);
  var rshinCoords = new Matrix4(rshin.matrix);
  rshin.matrix.scale(0.125, 0.25, 0.1);
  rshin.render();

  var rsoot = new Cube();
  rsoot.color = [0.137,0.09,0.06,1.0];
  rsoot.matrix = rshinCoords;
  rsoot.matrix.translate(0.00625, -0.1, -0.0125);
  //rsoot.matrix.rotate(g_rlegAngle[0][2], 1, 0, 0);
  //rsoot.matrix.rotate(g_rlegAngle[2][2], 0, 0, 1);
  rsoot.matrix.scale(0.125, 0.1, 0.15);
  rsoot.render();

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
