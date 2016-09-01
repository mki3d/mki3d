
/* 
   mki3d -- the main object 
*/
var mki3d = {}; 


/** setting callbacks **/

window.onload= function(){
    mki3d.html.initObjects();
    mki3d.gl.initGL( mki3d.html.canvas );
    mki3d.text.initTexShaderProgram();
    window.onresize= mki3d.callback.onWindowResize;
    mki3d.callback.onWindowResize();
    mki3d.setProjectionMatrix();
    mki3d.setModelViewMatrix();
    mki3d.action.init(); // mki3d.action requires initialization
    mki3d.html.divUpperMessage.innerHTML += "  (Press 'H' for help and <span style='color:red;'>Chrome Web Store problem info</span>.)";
    mki3d.backup();// init backups
    mki3d.redraw();
    window.onbeforeunload= function(){
	return "Do not forget to save your data!\n";
    }
    window.onkeydown=mki3d.callback.canvasOnKeyDown;
}


