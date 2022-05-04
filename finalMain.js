  /**
* Final Exam - Assignment to render Luxo Jr scene, and apply lighting, textures, etc.
*
* @author Vaibhav Santurkar
*/
  'use strict';

  // Global variables that are set and used
  // across the application
  let gl;

  // GLSL programs
  let program_Sphere, program_Floor, program_Lamp, program_LampArm, program_LampHead;
  
  // VAOs for the objects
  var mySphere = null;
  var myFloor = null;
  var myLampStand = null;
  var myLampArm = null;
  var myLampHead = null;

  // textures
  let woodTexture, ballTexture, lampTexture;
 
//
// create shapes and VAOs for objects.
// Note that you will need to bindVAO separately for each object / program based
// upon the vertex attributes found in each program
//
function createShapes() {

  gl.useProgram(program_Sphere);
  mySphere = new Sphere(20, 20);
  mySphere.VAO = bindVAOUV (mySphere, program_Sphere);
  setUpCamera(program_Sphere);

  gl.useProgram(program_Floor);
  myFloor = new Cube(20);
  myFloor.VAO = bindVAOUV(myFloor, program_Floor);
  setUpCamera(program_Floor);

  gl.useProgram(program_Lamp);
  myLampStand = new Cube(20, 20);
  myLampStand.VAO = bindVAONormal(myLampStand, program_Lamp);
  setUpCamera(program_Lamp);
  setUpNormals(program_Lamp);

  gl.useProgram(program_LampArm);
  myLampArm = new Cube(20);
  myLampArm.VAO = bindVAOUV(myLampArm, program_LampArm);
  setUpCamera(program_LampArm);

  gl.useProgram(program_LampHead);
  myLampHead = new Cone(20, 20);
  myLampHead.VAO = bindVAOUV(myLampHead, program_LampHead);
  setUpCamera(program_LampHead);


  drawScene();

}


//
// Here you set up your camera position, orientation, and projection
// Remember that your projection and view matrices are sent to the vertex shader
// as uniforms, using whatever name you supply in the shaders
//
function setUpCamera(program) {
    
    gl.useProgram(program);

    // set up your projection
    let projectionMatrix = glMatrix.mat4.create();
    glMatrix.mat4.perspective(projectionMatrix, radians(80), 1, 0.1, 300.0);
    gl.uniformMatrix4fv (program.uProjT, false, projectionMatrix);

    
    // set up your view
    let viewMatrix = glMatrix.mat4.create();
    glMatrix.mat4.lookAt(viewMatrix, [0, 0, -1.5], [0, 0, 0], [0, 1, 0]);
    gl.uniformMatrix4fv (program.uViewT, false, viewMatrix);

}

//
// This function draws the entire scene by performing the following operations:
// First, the function binds the active texture. Then the modelMatrix for 
// each object is created and the transformations are applied to it. 
// Finally the object is drawn in the canvas.
// 
function drawScene(){
    
    // flip Y for WebGL
    gl.pixelStorei (gl.UNPACK_FLIP_Y_WEBGL, true);
    
    // get some texture space from the gpu
    var lampImage = document.getElementById('lamp-texture')
        lampImage.crossOrigin = "";
        lampImage.onload = () =>{
          var woodImage = document.getElementById('image-texture')
              woodImage.crossOrigin = "";
              woodImage.onload = () =>{
                var ballImage = document.getElementById('ball-texture')
                    ballImage.crossOrigin = "";
                    ballImage.onload = () =>{

                      gl.useProgram(program_Sphere);

                      ballTexture = gl.createTexture();

                      setUpTexture(ballTexture, ballImage);

                      let modelMatrix = glMatrix.mat4.create();

                      setUpTransform(modelMatrix, -1.2, -0.9, -0.2, 0.4, 0.4, 0.4, program_Sphere);

                      drawSphere();

                      gl.useProgram(program_Floor);

                      woodTexture = gl.createTexture();
                      
                      setUpTexture(woodTexture, woodImage);

                      let floormodelMatrix = glMatrix.mat4.create();

                      setUpTransform(floormodelMatrix, 0, -1.0, 0, 3.0, 1.1, 0.4, program_Floor);

                      drawFloor();

                      gl.useProgram(program_Lamp);

                      lampTexture = gl.createTexture();
                      
                      setUpTexture(lampTexture, lampImage);

                      let lampmodelMatrix = glMatrix.mat4.create();

                      setUpTransform(lampmodelMatrix, 6.0, 0, -2.0, 0.1, 1.0, 0.1, program_Lamp);

                      drawLamp();

                      gl.useProgram(program_LampArm);

                      let lampArmmodelMatrix = glMatrix.mat4.create();

                      setUpTransform(lampArmmodelMatrix, 0.5, 4.5, -2.0, 0.65, 0.1, 0.1, program_LampArm);

                      drawLampArm();

                      gl.useProgram(program_LampHead);

                      let lampHeadmodelMatrix = glMatrix.mat4.create();

                      setUpTransform(lampHeadmodelMatrix, 0.1, 0.7, -11.6, 0.1, 0.1, 0.1, program_LampHead);

                      drawLampHead();

                      
        }

      }
      
    }
}

// Function to set normals for Phong Shading/Lighting
// Applies to the lampStand object
function setUpNormals(program){

  let Lx = 1.0, Ly = 1.0, Lz = 1.0;

  gl.uniform3f(program.ambientLight, Lx, Ly, Lz);
  gl.uniform3f(program.lightPosition, Lx, Ly, -Lz);
  gl.uniform3f(program.lightColor, Lx, Ly, Lz);
  gl.uniform3f(program.baseColor, Lx, Ly, Lz);
  gl.uniform3f(program.specHighlightColor, Lx, Ly, Lz);
  gl.uniform1f(program.ka, 0.2);
  gl.uniform1f(program.kd, 0.4);
  gl.uniform1f(program.ks, 0.4);
  gl.uniform1f(program.ke, 1.0);
}

// Function to perform the transformations for each object.
// Creates a scaler and translation vector and then applies 
// the transforms to the modelMatrix 
function setUpTransform(modelMatrix, Tx, Ty, Tz, Sx, Sy, Sz, program){

  let scaler = glMatrix.vec3.create();
  scaler[0] = Sx;
  scaler[1] = Sy;
  scaler[2] = Sz;

  let translation = glMatrix.vec3.create();
  translation[0] = Tx;
  translation[1] = Ty;
  translation[2] = Tz;

  glMatrix.mat4.scale(modelMatrix, modelMatrix, scaler);
  glMatrix.mat4.translate(modelMatrix, modelMatrix, translation);
  gl.uniformMatrix4fv(program.uModelT, false, modelMatrix);

}

// Function to bind and wrap the active texture.
function setUpTexture(texture, image){
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture)

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

}

// Function to convert degree to radians. 
function radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

//
//  This function draws all of the shapes required for your scene
//
  function drawSphere(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.useProgram(program_Sphere);

    gl.bindVertexArray(mySphere.VAO)
    gl.drawElements(gl.TRIANGLES, mySphere.indices.length, gl.UNSIGNED_SHORT, 0);

  }

  function drawFloor(){
    gl.useProgram(program_Floor);

    gl.bindVertexArray(myFloor.VAO);
    gl.drawElements(gl.TRIANGLES, myFloor.indices.length, gl.UNSIGNED_SHORT, 0);

  }

  function drawLamp(){
    gl.useProgram(program_Lamp);

    gl.bindVertexArray(myLampStand.VAO);
    gl.drawElements(gl.TRIANGLES, myLampStand.indices.length, gl.UNSIGNED_SHORT, 0);

  }

  function drawLampArm(){
    gl.useProgram(program_LampArm);

    gl.bindVertexArray(myLampArm.VAO);
    gl.drawElements(gl.TRIANGLES, myLampArm.indices.length, gl.UNSIGNED_SHORT, 0);

  }

  function drawLampHead(){
    gl.useProgram(program_LampHead);

    gl.bindVertexArray(myLampHead.VAO);
    gl.drawElements(gl.TRIANGLES, myLampHead.indices.length, gl.UNSIGNED_SHORT, 0);

    // Clean
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  }

  // creates a VAO and returns its ID
  function bindVAOUV (shape, program) {
      //create and bind VAO
      let theVAO = gl.createVertexArray();
      gl.bindVertexArray(theVAO);
      
      // create and bind vertex buffer
      let myVertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, myVertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.points), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(program.aVertexPosition);
      gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

      let uvBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.uv), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(program.aUV);
      gl.vertexAttribPointer(program.aUV, 2, gl.FLOAT, false, 0, 0);
      
      // Setting up the IBO
      let myIndexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, myIndexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(shape.indices), gl.STATIC_DRAW);

      // Clean
      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      
      return theVAO;
  }

  // bindVAO function for normals
  function bindVAONormal(shape, program){
    //create and bind VAO
    let theVAO = gl.createVertexArray();
    gl.bindVertexArray(theVAO);
    
    // create and bind vertex buffer
    let myVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, myVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.points), gl.STATIC_DRAW);
    if (program.aVertexPosition === undefined) {
      console.log("Hello")
    }
    gl.enableVertexAttribArray(program.aVertexPosition);
    gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
  

    let myNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, myNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.normals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(program.aNormal);
    gl.vertexAttribPointer(program.aNormal, 3, gl.FLOAT, false, 0, 0);

    // Setting up the IBO
    let myIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, myIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(shape.indices), gl.STATIC_DRAW);

    // Clean
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return theVAO;

  }


/////////////////////////////////////////////////////////////////////////////
//
//  You shouldn't have to edit anything below this line...but you can
//  if you find the need
//
/////////////////////////////////////////////////////////////////////////////

// Given an id, extract the content's of a shader script
// from the DOM and return the compiled shader
function getShader(id) {
  const script = document.getElementById(id);
  const shaderString = script.text.trim();

  // Assign shader depending on the type of shader
  let shader;
  if (script.type === 'x-shader/x-vertex') {
    shader = gl.createShader(gl.VERTEX_SHADER);
  }
  else if (script.type === 'x-shader/x-fragment') {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  }
  else {
    return null;
  }

  // Compile the shader using the supplied shader code
  gl.shaderSource(shader, shaderString);
  gl.compileShader(shader);

  // Ensure the shader is valid
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}


  //
  // compiles, loads, links and returns a program (vertex/fragment shader pair)
  //
  // takes in the id of the vertex and fragment shaders (as given in the HTML file)
  // and returns a program object.
  //
  // will return null if something went wrong
  //
  function initProgram(vertex_id, fragment_id) {
    const vertexShader = getShader(vertex_id);
    const fragmentShader = getShader(fragment_id);

    // Create a program
    let program = gl.createProgram();
      
    // Attach the shaders to this program
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Could not initialize shaders');
      return null;
    }

    program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    
    program.uModelT = gl.getUniformLocation (program, 'modelT');
    program.uViewT = gl.getUniformLocation (program, 'viewT');
    program.uProjT = gl.getUniformLocation (program, 'projT');
    
    program.aUV = gl.getAttribLocation(program, 'aUV');
    
    program.uTheTexture = gl.getUniformLocation (program, 'theTexture');
      
    return program;
  }

  //Same function as above just for Lighting Normal uniforms
  function initLightingProgram(vertex_id, fragment_id) {
    const vertexShader = getShader(vertex_id);
    const fragmentShader = getShader(fragment_id);

    // Create a program
    let program = gl.createProgram();
      
    // Attach the shaders to this program
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Could not initialize shaders');
      return null;
    }

    program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    program.aNormal = gl.getAttribLocation(program, 'aNormal');
      
    // uniforms
    program.uModelT = gl.getUniformLocation (program, 'modelT');
    program.uViewT = gl.getUniformLocation (program, 'viewT');
    program.uProjT = gl.getUniformLocation (program, 'projT');
    program.ambientLight = gl.getUniformLocation (program, 'ambientLight');
    program.lightPosition = gl.getUniformLocation (program, 'lightPosition');
    program.lightColor = gl.getUniformLocation (program, 'lightColor');
    program.baseColor = gl.getUniformLocation (program, 'baseColor');
    program.specHighlightColor = gl.getUniformLocation (program, 'specHighlightColor');
    program.ka = gl.getUniformLocation (program, 'ka');
    program.kd = gl.getUniformLocation (program, 'kd');
    program.ks = gl.getUniformLocation (program, 'ks');
    program.ke = gl.getUniformLocation (program, 'ke');

    return program;
     
  }

  // Entry point to our application
  function init() {
      
    // Retrieve the canvas
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) {
      console.error(`There is no canvas with id ${'webgl-canvas'} on this page.`);
      return null;
    }

    // deal with keypress
    window.addEventListener('keydown', gotKey ,false);

    // Retrieve a WebGL context
    gl = canvas.getContext('webgl2');
    if (!gl) {
        console.error(`There is no WebGL 2.0 context`);
        return null;
      }
      
    // deal with keypress
    window.addEventListener('keydown', gotKey ,false);
      
    // Set the clear color to be black
    gl.clearColor(0, 0, 0, 1);
      
    // some GL initialization
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.clearColor(0.0,0.0,0.0,1.0)
    gl.depthFunc(gl.LEQUAL)
    gl.clearDepth(1.0)

    // Read, compile, and link your shaders
    
    program_Sphere = initProgram('wireframe-V', 'wireframe-F');
    program_Floor = initProgram('wireframe-V', 'wireframe-F');
    program_LampArm = initProgram('wireframe-V', 'wireframe-F');
    program_LampHead = initProgram('wireframe-V', 'wireframe-F');
    program_Lamp = initLightingProgram('phongshader-V', 'phongshader-F');
    
    // create and bind your current object
    createShapes();

  }
