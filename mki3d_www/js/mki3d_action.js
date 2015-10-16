/** editing actions invoked by the event calbacks **/

mki3d.action = {};

/** some constants **/
/* mode constants */
mki3d.action.ROTATE_MODE = "ROTATE";
mki3d.action.CURSOR_MODE = "CURSOR";
mki3d.action.SELECTED_MODE = "SELECTED";

/* rotation step */
mki3d.action.rotationStep = Math.PI / 36; // 5 degrees 

/* array of some modes and current mode index */

mki3d.action.modes = [
    mki3d.action.ROTATE_MODE,
    mki3d.action.CURSOR_MODE,
    mki3d.action.SELECTED_MODE
];

mki3d.action.modeIdx = 0;

mki3d.action.mode = mki3d.action.modes[mki3d.action.modeIdx]; // default starting mode


/* setting actions for the mode */

mki3d.action.setModeActions= function(){
    /* sets actions for current mki3d.action.mode */
    mki3d.message("MODE: <strong>"+mki3d.action.mode+"</strong>" );
    switch(mki3d.action.mode){
    case mki3d.action.ROTATE_MODE:
	mki3d.action.up = mki3d.action.upRotate;
	mki3d.action.down = mki3d.action.downRotate;
	mki3d.action.right = mki3d.action.rightRotate;
	mki3d.action.left = mki3d.action.leftRotate;
	mki3d.action.forward = mki3d.action.forwardRotate;
	mki3d.action.back = mki3d.action.backRotate;
	// ...
	mki3d.data.view.focusPoint = mki3d.vectorClone( mki3d.data.cursor.position );
	mki3d.setModelViewMatrix();
        mki3d.redraw();
	break;
    case mki3d.action.CURSOR_MODE:
	mki3d.action.up = mki3d.action.upCursor;
	mki3d.action.down = mki3d.action.downCursor;
	mki3d.action.right = mki3d.action.rightCursor;
	mki3d.action.left = mki3d.action.leftCursor;
	mki3d.action.forward = mki3d.action.forwardCursor;
	mki3d.action.back = mki3d.action.backCursor;
	// ...
	mki3d.messageAppend(" (CURSOR = "+JSON.stringify(mki3d.data.cursor.position)+")" );
	break;
    case mki3d.action.SELECTED_MODE:
	mki3d.action.up = mki3d.action.upSelected;
	mki3d.action.down = mki3d.action.downSelected;
	mki3d.action.right = mki3d.action.rightSelected;
	mki3d.action.left = mki3d.action.leftSelected;
	mki3d.action.forward = mki3d.action.forwardSelected;
	mki3d.action.back = mki3d.action.backSelected;
	// ...
	if(!mki3d.tmp.selected)
	    mki3d.messageAppend("  -- NOTHING SELECTED !!!");
	else
	    mki3d.messageAppend(" (NUMBER OF SELECTED POINTS = "+JSON.stringify(mki3d.tmp.selected.length)+")" );
	break;
    }

}

/* initialisation of actions */

mki3d.action.init= function() {
    mki3d.action.setModeActions(); // set the actions for initial mode
}


/* action of switching the set index */
mki3d.action.nextSetIndex= function() {
    if(!mki3d.tmp.nextSetDisplayModelBackup){
	mki3d.compressSetIndexes( mki3d.data );
	console.log(mki3d.data);
	var maxIdx = mki3d.getMaxSetIndex( mki3d.data.model );
	mki3d.data.set.current = (mki3d.data.set.current + 1) % (maxIdx+2);
	mki3d.tmp.nextSetDisplayModelBackup= mki3d.tmp.display.model;
	mki3d.tmp.display.model=mki3d.createInSetModel(mki3d.data.set.current);
	mki3d.redraw();
	mki3d.message( mki3d.currentSetStatistics(mki3d.data) );
	mki3d.messageAppend("<br>VIEW RESTRICTED TO INCLUDED ELEMENTS (PRESS 'N' AGAIN TO RESTORE PREVIOUS DISPLAY.)");
    }  else {
	mki3d.tmp.display.model=mki3d.tmp.nextSetDisplayModelBackup;
	mki3d.tmp.nextSetDisplayModelBackup=null;
	mki3d.message( mki3d.currentSetStatistics(mki3d.data) );
	mki3d.messageAppend("<br>(PRESS 'N' AGAIN TO CHANGE CURRENT SET.)");
	mki3d.redraw();
    }
}

/* action of switching the mode */

mki3d.action.nextMode= function() {
    /* slect next mode from mki3d.action.modes */
    mki3d.action.modeIdx = (mki3d.action.modeIdx + 1) % mki3d.action.modes.length;
    mki3d.action.mode = mki3d.action.modes[mki3d.action.modeIdx];
    mki3d.action.setModeActions();
}

/* actions for arrows (depeding on the mode) */

/* ROTATE */

mki3d.action.upRotate = function(){
    mki3d.action.viewRotateUp( mki3d.action.rotationStep);
}

mki3d.action.downRotate = function(){
    mki3d.action.viewRotateUp( -mki3d.action.rotationStep);
}

mki3d.action.rightRotate = function(){
    mki3d.action.viewRotateRight( mki3d.action.rotationStep);
}

mki3d.action.leftRotate = function(){
    mki3d.action.viewRotateRight( -mki3d.action.rotationStep);
}

mki3d.action.forwardRotate = function(){
    mki3d.action.viewRotateForward( mki3d.action.rotationStep);
}

mki3d.action.backRotate = function(){
    mki3d.action.viewRotateForward( -mki3d.action.rotationStep);
}

/* editing actions */

mki3d.action.enter = function(){ 
    var p = mki3d.data.cursor.position;
    var c = mki3d.data.cursor.color;
    var point = mki3d.newPoint( p[0], p[1], p[2],  
				c[0], c[1], c[2] ,  
				mki3d.data.set.current );
    var cursor = mki3d.data.cursor;

    mki3d.message("ENTER: ");
    if(cursor.marker1 === null) {
	// enter the first endpoint
	cursor.marker1 =  point;
    } else { // mki3d.data.cursor.marker1 is not null
	if(cursor.marker2 === null) { 
	    if(mki3d.vectorCompare(cursor.marker1.position, point.position) != 0 ) { // enter segment
		var seg = mki3d.newSegment( cursor.marker1, point );
		mki3d.modelInsertElement( mki3d.data.model.segments, seg);
                mki3d.modelChange();
		mki3d.messageAppend(" SEGMENT "+JSON.stringify(seg)
				    +" INSERTED.<br>NR OF SEGMENTS: "+mki3d.data.model.segments.length);
		cursor.marker1 = point;
	    } else
		mki3d.messageAppend("DEGENERATE SEGMENT "+JSON.stringify(seg)+" -- not inserted");
	} else {
	    var normal = mki3d.normalToPlane( cursor.marker1.position, cursor.marker2.position, point.position );
	    if( 
		mki3d.scalarProduct( normal, normal ) != 0 
 	    ) { // enter triangle 
		var tr = mki3d.newTriangle( cursor.marker1, cursor.marker2, point );
		mki3d.modelInsertElement( mki3d.data.model.triangles, tr);
                mki3d.modelChange();
		mki3d.messageAppend(" TRIANGLE "+JSON.stringify(tr)
				    +" INSERTED. <br>NR OF TRIANGLES: "+mki3d.data.model.triangles.length);
		cursor.marker1 = point;
		cursor.marker2 = null;
	    } else 
		mki3d.messageAppend("DEGENERATE TRIANGLE "+JSON.stringify(tr)+"-- not inserted");	
	}
    }

    mki3d.messageAppend("<br> MARKER1 ="+ JSON.stringify(mki3d.data.cursor.marker1)+
			"<br> MARKER2 ="+ JSON.stringify(mki3d.data.cursor.marker2) 
		       );

    mki3d.redraw();
};

mki3d.action.escape = function(){ 
    mki3d.data.cursor.marker1=null;
    mki3d.data.cursor.marker2=null;
    mki3d.message("MARKERS CANCELED");
    mki3d.redraw();
}

mki3d.action.toggleMarker2 = function(){
    mki3d.message("TOGGLE MARKER2: ");
    var p = mki3d.data.cursor.position;
    var c = mki3d.data.cursor.color;
    var point = mki3d.newPoint( p[0], p[1], p[2],  
				c[0], c[1], c[2] ,  
				mki3d.data.set.current );
    var cursor = mki3d.data.cursor;
    if(mki3d.data.cursor.marker1 === null ) {
	mki3d.messageAppend("First you have to set MARKER1 with Enter.");
        return;
    }

    if(mki3d.data.cursor.marker2 === null ) {
	if(mki3d.vectorCompare(cursor.marker1.position, point.position) != 0 ) {
	    mki3d.data.cursor.marker2 = point;
	}
    } else {
	mki3d.data.cursor.marker2 = null;
    }

    mki3d.messageAppend("<br> MARKER1 ="+ JSON.stringify(mki3d.data.cursor.marker1)+
			"<br> MARKER2 ="+ JSON.stringify(mki3d.data.cursor.marker2) 
		       );

    mki3d.redraw();
}



/* CURSOR */

mki3d.action.cursorScaleUp = function() {
    if( 2*mki3d.data.cursor.step*mki3d.data.view.scale > 4 ) return; // upper bound 
    mki3d.data.cursor.step = 2*mki3d.data.cursor.step ;
    mki3d.redraw();
}

mki3d.action.cursorScaleDown = function() {
    if( mki3d.data.cursor.step*mki3d.data.view.scale/2 < 1/4 ) return; // upper bound 
    mki3d.data.cursor.step = 2*mki3d.data.cursor.step ;
    mki3d.redraw();
}


mki3d.action.upCursor = function(){
    /* temporary: fixed directons ... */
    mki3d.action.cursorMove(0, mki3d.data.cursor.step, 0);
}

mki3d.action.downCursor = function(){
    /* temporary: fixed directons ... */
    mki3d.action.cursorMove(0, -mki3d.data.cursor.step, 0);
}

mki3d.action.rightCursor = function(){
    /* temporary: fixed directons ... */
    mki3d.action.cursorMove(mki3d.data.cursor.step, 0, 0);
}

mki3d.action.leftCursor = function(){
    /* temporary: fixed directons ... */
    mki3d.action.cursorMove(-mki3d.data.cursor.step, 0, 0);
}

mki3d.action.forwardCursor = function(){
    /* temporary: fixed directons ... */
    mki3d.action.cursorMove( 0, 0, mki3d.data.cursor.step);
}

mki3d.action.backCursor = function(){
    /* temporary: fixed directons ... */
    mki3d.action.cursorMove( 0, 0, -mki3d.data.cursor.step);
}

/* cursor manipulations */

mki3d.action.cursorMove = function( dx, dy, dz ) {
    mki3d.tmpRefreshVersorsMatrix();
    var d = mki3d.matrixVectorProduct( mki3d.tmp.versorsMatrix , [dx,dy,dz] );
    cursor = mki3d.data.cursor;
    mki3d.vectorMove(cursor.position, d[0], d[1], d[2]);
    // mki3d.loadCursor(); // -- is in redraw()
    mki3d.redraw();
    mki3d.message( "CURSOR = "+JSON.stringify(cursor.position) );
}


/* selection manipulations */

mki3d.action.selectedMove = function( dx, dy, dz ) {
    if( !mki3d.tmp.selected ) return; // nothing to be moved
    mki3d.tmpRefreshVersorsMatrix();
    var d = mki3d.matrixVectorProduct( mki3d.tmp.versorsMatrix , [dx,dy,dz] );
    selected =mki3d.tmp.selected;
    var i;
    for(i=0; i<selected.length; i++){
	mki3d.vectorMove(selected[i].position, d[0], d[1], d[2]);
    }

    mki3d.cancelShades();
    mki3d.redraw();
    mki3d.message( "SELECTED ENDPOINTS MOVED BY: "+JSON.stringify(d) );
}


mki3d.action.upSelected = function(){
    /* temporary: fixed directons ... */
    mki3d.action.selectedMove(0, mki3d.data.cursor.step, 0);
}

mki3d.action.downSelected = function(){
    /* temporary: fixed directons ... */
    mki3d.action.selectedMove(0, -mki3d.data.cursor.step, 0);
}

mki3d.action.rightSelected = function(){
    /* temporary: fixed directons ... */
    mki3d.action.selectedMove(mki3d.data.cursor.step, 0, 0);
}

mki3d.action.leftSelected = function(){
    /* temporary: fixed directons ... */
    mki3d.action.selectedMove(-mki3d.data.cursor.step, 0, 0);
}

mki3d.action.forwardSelected = function(){
    /* temporary: fixed directons ... */
    mki3d.action.selectedMove( 0, 0, mki3d.data.cursor.step);
}

mki3d.action.backSelected = function(){
    /* temporary: fixed directons ... */
    mki3d.action.selectedMove( 0, 0, -mki3d.data.cursor.step);
}


/* CLIP */

mki3d.action.upClip = function(){
    /* temporary: fixed directons ... */
    mki3d.action.clip(0,1, 0);
}

mki3d.action.downClip = function(){
    /* temporary: fixed directons ... */
    mki3d.action.clip(0, -1, 0);
}

mki3d.action.rightClip = function(){
    /* temporary: fixed directons ... */
    mki3d.action.clip(1, 0, 0);
}

mki3d.action.leftClip = function(){
    /* temporary: fixed directons ... */
    mki3d.action.clip(-1, 0, 0);
}

mki3d.action.forwardClip = function(){
    /* temporary: fixed directons ... */
    mki3d.action.clip( 0, 0,1);
}

mki3d.action.backClip = function(){
    /* temporary: fixed directons ... */
    mki3d.action.clip( 0, 0, -1);
}





/* view manipulations */

mki3d.action.viewRotateUp = function(alpha) {
    view = mki3d.data.view;
    view.rotationMatrix= mki3d.matrixRotatedYZ(view.rotationMatrix, alpha );
    mki3d.setModelViewMatrix();
    mki3d.redraw();
}

mki3d.action.viewRotateRight = function(alpha) {
    view = mki3d.data.view;
    view.rotationMatrix= mki3d.matrixRotatedXZ(view.rotationMatrix, alpha );
    mki3d.setModelViewMatrix();
    mki3d.redraw();
}

mki3d.action.viewRotateForward = function(alpha) {
    view = mki3d.data.view;
    view.rotationMatrix= mki3d.matrixRotatedXY(view.rotationMatrix, -alpha );
    mki3d.setModelViewMatrix();
    mki3d.redraw();
}


mki3d.action.viewAlignRotation = function() {
    view = mki3d.data.view;
    mki3d.tmpRefreshVersorsMatrix();
    view.rotationMatrix= mki3d.matrixTransposed( mki3d.tmp.versorsMatrix );
    mki3d.setModelViewMatrix();
    mki3d.redraw();
} 


mki3d.action.cursorMoveToNearestEndpoint = function() {
    var sPoint = mki3d.findNearestEndpoint( mki3d.data.cursor.position, mki3d.data.model.segments );
    var tPoint = mki3d.findNearestEndpoint( mki3d.data.cursor.position, mki3d.data.model.triangles );
    var found=sPoint;
    if( found === null ) found = tPoint;
    if( found === null ) return; // sPoint == tPoint == null
    // here: found != null
    if( found !== tPoint && tPoint !== null) {
	if( mki3d.distanceSquare(mki3d.data.cursor.position, tPoint.position ) <
	    mki3d.distanceSquare(mki3d.data.cursor.position, found.position )
	  ) 
	    found = tPoint;
	}
    // here: found != null and found is nearest endpoint
    mki3d.vectorSet( 
	mki3d.data.cursor.position, 
	found.position[0], found.position[1], found.position[2] 
		   );
    mki3d.redraw();
}

/* clipping */

mki3d.action.clip = function ( dx, dy, dz ) {
    mki3d.tmpRefreshVersorsMatrix();
    var d = mki3d.matrixVectorProduct( mki3d.tmp.versorsMatrix , [dx,dy,dz] );
    var i;
    for(i=0; i<3; i++) { // toggle clippings
	if( d[i] > 0 ) {
	    if(  mki3d.data.clipMinVector[i] == -MKI3D_MAX_CLIP_ABS ){   
		mki3d.data.clipMinVector[i]= mki3d.data.cursor.position[i];
	    } 
	    else { 
		mki3d.data.clipMinVector[i]= -MKI3D_MAX_CLIP_ABS;
	    }
	}
	if( d[i] < 0 ) {
	    if(  mki3d.data.clipMaxVector[i] == MKI3D_MAX_CLIP_ABS ){
		mki3d.data.clipMaxVector[i]= mki3d.data.cursor.position[i];
	    }
	    else {
		mki3d.data.clipMaxVector[i]= MKI3D_MAX_CLIP_ABS;
	    }
	}
    }
    mki3d.redraw();
}

mki3d.action.unclip = function (){
    mki3d.data.clipMaxVector = [MKI3D_MAX_CLIP_ABS, MKI3D_MAX_CLIP_ABS, MKI3D_MAX_CLIP_ABS];
    mki3d.data.clipMinVector = [-MKI3D_MAX_CLIP_ABS, -MKI3D_MAX_CLIP_ABS, -MKI3D_MAX_CLIP_ABS];
    mki3d.redraw();
}

/* data */

mki3d.action.paintSelectedSegments = function(){
    var sel = mki3d.getSelectedElements(mki3d.data.model.segments);
    mki3d.paintElements( sel );
    mki3d.redraw();
}

mki3d.action.paintSelectedTriangles = function(){
    var sel = mki3d.getSelectedElements(mki3d.data.model.triangles);
    mki3d.paintElements( sel );
    mki3d.redraw();
}


mki3d.action.deleteSelectedSegments = function(){
    mki3d.data.model.segments = mki3d.getNotSelectedElements( mki3d.data.model.segments );
    mki3d.redraw();
}

mki3d.action.deleteSelectedTriangles = function(){
    mki3d.data.model.triangles = mki3d.getNotSelectedElements( mki3d.data.model.triangles );
    mki3d.redraw();
}



mki3d.action.copySelected = function(){
    mki3d.compressSetIndexes(mki3d.data);
    var newIdx = mki3d.getMaxSetIndex( mki3d.data.model )+1; // empty set

    /* copy segments */
    var copy = mki3d.copyOfSelected( mki3d.data.model.segments, newIdx );
    mki3d.data.model.segments = mki3d.data.model.segments.concat(copy);
    /* copy triangles */
    copy = mki3d.copyOfSelected( mki3d.data.model.triangles, newIdx );
    mki3d.data.model.triangles = mki3d.data.model.triangles.concat(copy);

    mki3d.data.set.current=newIdx;
}

/* glue selected segments' endpoints with current set */
mki3d.action.glueSegments = function(){
    var endpoints = mki3d.getElementsEndpoints(mki3d.getSelectedElements(mki3d.data.model.segments));
    var glues = mki3d.glueSegmentsOfEndpoints( endpoints, mki3d.data.set.current);
    mki3d.data.model.segments = mki3d.data.model.segments.concat(glues);
}

/* glue selected segments with current set */
mki3d.action.glueTriangles = function(){
    var segs = mki3d.getSelectedElements(mki3d.data.model.segments);
    var glues = mki3d.glueTrianglesOfSegments( segs, mki3d.data.set.current);
    mki3d.data.model.triangles = mki3d.data.model.triangles.concat(glues);
}


/* light */

mki3d.action.setLight = function(){
    mki3d.setLight();
    mki3d.message("LIGHT ="+JSON.stringify(mki3d.data.light.vector));
    mki3d.redraw();
}

/* selections */
mki3d.action.cancelSelection= function(){
    mki3d.cleanElementEndpointsFromKey(mki3d.data.model.segments, 'selected');
    mki3d.cleanElementEndpointsFromKey(mki3d.data.model.triangles, 'selected');
    mki3d.tmp.selected=[];
}



mki3d.action.selectByCursor= function(){
    var i;
    var cursor= mki3d.data.cursor;

    if(!mki3d.tmp.selected) mki3d.tmp.selected=[];

    var points = mki3d.elementEndpointsInBox(
	mki3d.data.model.segments,
	[-MKI3D_MAX_CLIP_ABS, -MKI3D_MAX_CLIP_ABS, -MKI3D_MAX_CLIP_ABS],
	[MKI3D_MAX_CLIP_ABS, MKI3D_MAX_CLIP_ABS, MKI3D_MAX_CLIP_ABS] 
    );
   
    for(i=0; i<points.length; i++) 
	if( mki3d.vectorCompare( points[i].position, cursor.position ) == 0 ||
            (cursor.marker1 &&  mki3d.vectorCompare( points[i].position, cursor.marker1.position ) == 0) ||
            (cursor.marker2 &&  mki3d.vectorCompare( points[i].position, cursor.marker2.position ) == 0) 
	  ) {
	    points[i].selected=true;
	    // mki3d.tmp.selected.push( points[i] );
	}
    points = mki3d.elementEndpointsInBox(
	mki3d.data.model.triangles,
	[-MKI3D_MAX_CLIP_ABS, -MKI3D_MAX_CLIP_ABS, -MKI3D_MAX_CLIP_ABS],
	[MKI3D_MAX_CLIP_ABS, MKI3D_MAX_CLIP_ABS, MKI3D_MAX_CLIP_ABS] 
    );
   
    for(i=0; i<points.length; i++) 
	if( mki3d.vectorCompare( points[i].position, cursor.position ) == 0 ||
            (cursor.marker1 &&  mki3d.vectorCompare( points[i].position, cursor.marker1.position ) == 0) ||
            (cursor.marker2 &&  mki3d.vectorCompare( points[i].position, cursor.marker2.position ) == 0) 
	  ) {
	    points[i].selected=true;
	    // mki3d.tmp.selected.push( points[i] );
	}
    mki3d.tmpRebuildSelected();
}

mki3d.action.selectInClipBox= function(){
    if(!mki3d.tmp.selected) mki3d.tmp.selected=[];
    var i;
    var points = mki3d.elementEndpointsInBox(
	mki3d.data.model.segments,
	mki3d.data.clipMinVector,
	mki3d.data.clipMaxVector
    );
    for(i=0; i<points.length; i++) points[i].selected=true;
    // mki3d.tmp.selected=mki3d.tmp.selected.concat(points);

    points = mki3d.elementEndpointsInBox(
	mki3d.data.model.triangles,
	mki3d.data.clipMinVector,
	mki3d.data.clipMaxVector
    );
    for(i=0; i<points.length; i++) points[i].selected=true;
    // mki3d.tmp.selected=mki3d.tmp.selected.concat(points);
    mki3d.tmpRebuildSelected();
}

mki3d.action.selectCurrentSet= function(){
    var model = mki3d.data.model;
    var elements = model.segments.concat(model.triangles);
    var i,j;
    for(i=0; i<elements.length; i++) 
	for(j=0; j<elements[i].length; j++){
	    if(elements[i][j].set == mki3d.data.set.current ) elements[i][j].selected=true;
	}
    mki3d.tmpRebuildSelected();
}



/* view */

mki3d.action.cancelVisibilityRestrictions= function() {
    mki3d.tmpResetDisplayModel();
    mki3d.redraw();
}

mki3d.action.viewSelectedElements = function() {
    mki3d.tmp.display = {};
    mki3d.tmp.display.model = {};
    mki3d.tmp.display.model.segments = mki3d.getSelectedElements(mki3d.data.model.segments);
    mki3d.tmp.display.model.triangles = mki3d.getSelectedElements(mki3d.data.model.triangles);
    mki3d.redraw();
}


mki3d.action.viewSelectedSegments = function() {
    mki3d.tmp.display = {};
    mki3d.tmp.display.model = {};
    mki3d.tmp.display.model.segments = mki3d.getSelectedElements(mki3d.data.model.segments);
    mki3d.tmp.display.model.triangles = [];
    mki3d.redraw();
}

mki3d.action.viewSelectedTriangles = function() {
    mki3d.tmp.display = {};
    mki3d.tmp.display.model = {};
    mki3d.tmp.display.model.segments = [];
    mki3d.tmp.display.model.triangles = mki3d.getSelectedElements(mki3d.data.model.triangles);
    mki3d.redraw();
}




mki3d.action.viewScaleUp = function() {
    if( 2*mki3d.data.view.scale > MKI3D_MAX_SCALE ) return; // upper bound 
    mki3d.data.view.scale = 2*mki3d.data.view.scale;
    mki3d.data.cursor.step = 1/ mki3d.data.view.scale;
    mki3d.redraw();
}

mki3d.action.viewScaleDown = function() {
    if( mki3d.data.view.scale/2 < MKI3D_MIN_SCALE ) return; // upper bound 
    mki3d.data.view.scale = mki3d.data.view.scale/2;
    mki3d.data.cursor.step = 1/ mki3d.data.view.scale;
    mki3d.redraw();
}

/* display help */
mki3d.action.help = function() {
    mki3d.html.hideAllDivs();
    mki3d.html.showDiv(mki3d.html.divHelp);
    window.onkeydown = mki3d.callback.helpOnKeyDown;
}

/* menu actions */

mki3d.action.escapeToCanvas = function(){
    mki3d.html.hideAllDivs();
    mki3d.html.showDiv(mki3d.html.divCanvas);
    mki3d.action.setModeActions(); // reset current mode and message
    mki3d.redraw();
    window.onkeydown = mki3d.callback.canvasOnKeyDown;
}

mki3d.action.mainMenu = function(){
    mki3d.message( mki3d.html.divMainMenu.innerHTML );
    window.onkeydown = mki3d.callback.mainMenuOnKeyDown;
}

mki3d.action.colorMenu = function(){
    mki3d.message( mki3d.html.divColorMenu.innerHTML );
    window.onkeydown = mki3d.callback.colorMenuOnKeyDown; ////// temporary
}

mki3d.action.cursorMenu = function(){
    mki3d.message( mki3d.html.divCursorMenu.innerHTML );
    window.onkeydown = mki3d.callback.cursorMenuOnKeyDown;
}

mki3d.action.fileMenu = function(){
    mki3d.message( mki3d.html.divFileMenu.innerHTML );
    window.onkeydown = mki3d.callback.fileMenuOnKeyDown;
}

mki3d.action.dataMenu = function(){
    mki3d.message( mki3d.html.divDataMenu.innerHTML );
    window.onkeydown = mki3d.callback.dataMenuOnKeyDown;
}

mki3d.action.dataCopyMenu = function(){
    mki3d.message( mki3d.html.divDataCopyMenu.innerHTML );
    window.onkeydown = mki3d.callback.dataCopyMenuOnKeyDown;
}

mki3d.action.clipMenu = function(){
    mki3d.message( mki3d.html.divClipMenu.innerHTML );
    window.onkeydown = mki3d.callback.clipMenuOnKeyDown;
}

mki3d.action.selectionMenu = function(){
    mki3d.message( mki3d.html.divSelectionMenu.innerHTML );
    window.onkeydown = mki3d.callback.selectionMenuOnKeyDown;
}

mki3d.action.viewMenu = function(){
    mki3d.message( mki3d.html.divViewMenu.innerHTML );
    window.onkeydown = mki3d.callback.viewMenuOnKeyDown;
}

