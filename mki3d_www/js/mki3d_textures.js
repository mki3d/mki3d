/* the code for dealing with texturing */

mki3d_texture={};

mki3d_texture.texSize= 256; // the default size of the texture

// def contains fields def.R, def.G, def.B, def.A with strings defining R,G,B,A dependencies on x,y coordinates
mki3d_texture.renderTextureVS= function(def){
    return ""+
	"const float PI = " + Math.PI +";\n"+
	"const int texSize= "+mki3d_texture.texSize+";\n"+
	"float G(float x,float y);\n"+
	"float B(float x,float y);\n"+
	"float A(float x,float y);\n"+
	"float R(float x,float y){ return  "+def.R+"; }\n"+
	"float G(float x,float y){ return  "+def.G+"; }\n"+
	"float B(float x,float y){ return  "+def.B+"; }\n"+
	"float A(float x,float y){ return  "+def.A+"; }\n"+
	"attribute float h;\n"+
	"uniform float v;\n"+
	"varying vec4 color;\n"+
	"void main()\n"+
	"{\n"+
	"  float  args[6];\n"+
	"  float h=h-float(texSize)/2.0;\n"+
	"  float v=v-float(texSize)/2.0;\n"+
	"  float x= 2.0*h/float(texSize); \n"+
	"  float y= 2.0*v/float(texSize); \n"+
	"  color= vec4( R(x,y), G(x,y), B(x,y), A(x,y) );\n"+
	"  gl_Position = vec4( x, y, 0.0, 1.0 );\n"+ /// w=0.5 for perspective division
	"  gl_PointSize=1.0;\n"+ /// test it
	"}\n";
}

mki3d_texture.renderTextureFS=""+
    "precision mediump float;\n"+
    "varying vec4 color;\n"+
    "void main()\n"+
    "{\n"+
    "  gl_FragColor= color;\n"+
    "}\n";

mki3d_texture.drawTextureVS=""+
    "attribute vec3 posAttr;\n"+
    "attribute vec2 texAttr;\n"+
    "varying vec2 texCoords;\n"+
    "void main()\n"+
    "{\n"+
    "    gl_Position = vec4(posAttr.xyz, 1.0);\n"+
    "    texCoords = texAttr;\n"+
    "}\n";

mki3d_texture.drawTextureFS=""+
    "precision mediump float;\n"+
    "varying vec2 texCoords;\n"+
    "uniform sampler2D texSampler;\n"+
    "void main()\n"+
    "{\n"+
    "    gl_FragColor = texture2D(texSampler, texCoords);\n"+
    "}\n";

mki3d_texture.posAttrFloat32Array= new Float32Array( [
    -1,  -1,  0,
    -1,  +1,  0,
    +1,  +1,  0,
    +1,  +1,  0,
    +1,  -1,  0,
    -1,  -1,  0 
] );

mki3d_texture.texAttrFloat32Array= new Float32Array( [
    0,  0,
    0,  1,
    1,  1,
    1,  1,
    1,  0,
    0,  0 
] );


// returns the id of the new defined texture
mki3d_texture.createTexture= function(
    gl, /* the GL context */
    def /* the Texturion definition */
){
    let texSize= mki3d_texture.texSize;
    
    /* load buffer data */
    if( !mki3d_texture.hBufferId ) {
	mki3d_texture.hBufferId= gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, mki3d_texture.hBufferId );

	let hIn=[];
	for(var i=0; i< texSize+4; i++) {
	    hIn.push(i-2);
	}
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( hIn ) , gl.STATIC_DRAW );
    }



    /* create texture object and allocate image memories */
    let textureId=gl.createTexture();
    if(!textureId) return textureId; // reutrn null or zero here ..
    // render the texture image ...
    gl.bindTexture(gl.TEXTURE_2D, textureId);
    gl.texImage2D(gl.TEXTURE_2D , 0, gl.RGBA, texSize, texSize, 0 /* border */,
		  gl.RGBA, gl.UNSIGNED_BYTE, null);   
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    
    if(!mki3d_texture.frameBufferId) {
	/* create framebuffer object */
	mki3d_texture.frameBufferId=gl.createFramebuffer();
    }

    /* make texture rendering program */
    if( mki3d_texture.renderTextureShaderProgram ){
	gl.deleteProgram( mki3d_texture.renderTextureShaderProgram );
    }

    let makeShaderProgramTool=mki3d.gl.compileAndLinkShaderProgram; // use the function from mki3d.gl
    
    mki3d_texture.renderTextureShaderProgram=  makeShaderProgramTool(gl, mki3d_texture.renderTextureVS(def) , mki3d_texture.renderTextureFS );
    mki3d_texture.hLocation=gl.getAttribLocation(mki3d_texture.renderTextureShaderProgram, "h");
    mki3d_texture.vLocation=gl.getUniformLocation(mki3d_texture.renderTextureShaderProgram, "v");

    /* render texture */
    gl.useProgram(mki3d_texture.renderTextureShaderProgram);
    
    let defaultFBO = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    let oldViewport=gl.getParameter(gl.VIEWPORT);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, mki3d_texture.frameBufferId);

    gl.viewport(0,0,texSize,texSize);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureId, 0); // assign the texture to the framebuffer

    gl.enableVertexAttribArray(mki3d_texture.hLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, mki3d_texture.hBufferId);
    for( j=0; j<texSize+4; j++) {
	gl.uniform1f(mki3d_texture.vLocation, j-2);
	gl.vertexAttribPointer( mki3d_texture.hLocation, 1, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.POINTS, 0, texSize+4);
    }
    
    gl.bindTexture(gl.TEXTURE_2D, textureId);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindFramebuffer(gl.FRAMEBUFFER, defaultFBO); // return to default screen FBO
    gl.viewport(0,0, oldViewport[2], oldViewport[3]); // restore old size
    
    return textureId; // here return the id of the ready texture
    
}

mki3d_texture.drawTexture= function(gl, textureId){
    if( !mki3d_texture.drawTextureShaderProgram ){

	let makeShaderProgramTool=mki3d.gl.compileAndLinkShaderProgram; // use the function from mki3d.gl

	mki3d_texture.drawTextureShaderProgram=  makeShaderProgramTool(gl, mki3d_texture.drawTextureVS , mki3d_texture.drawTextureFS );
	mki3d_texture.posAttr=gl.getAttribLocation(mki3d_texture.drawTextureShaderProgram, "posAttr");
	mki3d_texture.texAttr=gl.getAttribLocation(mki3d_texture.drawTextureShaderProgram, "texAttr");
	mki3d_texture.texSampler=gl.getUniformLocation(mki3d_texture.drawTextureShaderProgram, "texSampler");
	// create and load data buffers
	mki3d_texture.posAttrBufferId= gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, mki3d_texture.posAttrBufferId );
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( mki3d_texture.posAttrFloat32Array ) , gl.STATIC_DRAW );
	mki3d_texture.texAttrBufferId= gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, mki3d_texture.texAttrBufferId );
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( mki3d_texture.texAttrFloat32Array ) , gl.STATIC_DRAW );
    }

    /// TODO: draw texture
    gl.useProgram(mki3d_texture.drawTextureShaderProgram);
    gl.enableVertexAttribArray(mki3d_texture.posAttr);
    gl.enableVertexAttribArray(mki3d_texture.texAttr);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, mki3d_texture.posAttrBufferId );
    gl.vertexAttribPointer( mki3d_texture.posAttr, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mki3d_texture.texAttrBufferId );
    gl.vertexAttribPointer( mki3d_texture.texAttr, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureId );
    gl.uniform1i(mki3d_texture.texSampler, 0 );

    gl.clearColor( 0,0,0,1 );
    gl.clear(gl.COLOR_BUFFER_BIT );
    gl.drawArrays(gl.TRIANGLES, 0, 6 );
 
}

mki3d_texture.debugTest=function(){
    let def={};
    def.label="myTexture";
    def.R="0.5*(1.0+sin(2.0*PI*y))";
    def.G="0.5*(1.0+cos(2.0*PI*x))";
    def.B="G(x,y)";
    def.A="1.0";

    let texID= mki3d_texture.createTexture(mki3d.gl.context, def );

    mki3d_texture.drawTexture( mki3d.gl.context, texID );

    
}
