class Cube{
    constructor(){
      this.type='cube';
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.matrix = new Matrix4();
    }
  
    render() {
      var rgba = this.color;

      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

      // Pass the matrix to u_ModelMatrix attribute
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      // just the front of the cube
      drawTriangle3D( [0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0,]);
      drawTriangle3D( [0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0,]);

      gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);

      // back side
      drawTriangle3D( [0.0,0.0,1.0, 1.0,1.0,1.0, 1.0,0.0,1.0,]);
      drawTriangle3D( [0.0,0.0,1.0, 0.0,1.0,1.0, 1.0,1.0,1.0,]);

      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      
      // top side
      drawTriangle3D( [0.0,1.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0,]);
      drawTriangle3D( [0.0,1.0,0.0, 1.0,1.0,1.0, 0.0,1.0,1.0,]);

      gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);

      // bottom side
      drawTriangle3D( [0.0,0.0,0.0, 1.0,0.0,0.0, 1.0,0.0,1.0,]);
      drawTriangle3D( [0.0,0.0,0.0, 1.0,0.0,1.0, 0.0,0.0,1.0,]);

      gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

      // left side
      drawTriangle3D( [0.0,0.0,0.0, 0.0,1.0,1.0, 0.0,0.0,1.0,]);
      drawTriangle3D( [0.0,0.0,0.0, 0.0,1.0,0.0, 0.0,1.0,1.0,]);

      // right side
      drawTriangle3D( [1.0,0.0,0.0, 1.0,1.0,1.0, 1.0,0.0,1.0,]);
      drawTriangle3D( [1.0,0.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0,]);

    }
  }

  function drawCube(pos, scale, irot, rot, color) {
    var body = new Cube();
    body.color = color;
    body.matrix.translate(pos[0],pos[1],pos[2]);
    body.matrix.rotate(irot[0], irot[1], irot[2], irot[3]);
    body.matrix.rotate(rot[0], rot[1], rot[2], rot[3]);
    var matrixStore = new Matrix4(body.matrix);
    body.matrix.scale(scale[0],scale[1],scale[2]);
    body.render();

    return matrixStore;
  }

