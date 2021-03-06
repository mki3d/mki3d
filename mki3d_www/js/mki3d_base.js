/* Basic functions such as operations on model data structures */
mki3d.newPoint = function ( x, y, z,  r, g, b , setIdx ){
    return { position: [x,y,z], color: [r,g,b], set: setIdx };
}

mki3d.pointClone= function( p ) { // return clone of point p
    return mki3d.newPoint(  p.position[0],
			    p.position[1],
			    p.position[2],
			    p.color[0],
			    p.color[1],
			    p.color[2],
			    p.set 
			 );
}

/* compare points: first compare set index, then positions */
mki3d.pointCompare= function( point1, point2 ){
    var cmp = point1.set-point2.set;
    if(cmp != 0 ) return cmp;
    return mki3d.vectorCompare( point1.position , point2.position );
    // curently the color is ignored
}


/* segment is a sorted array of two points */
mki3d.newSegment = function ( point1, point2 ){
    var points= [mki3d.pointClone(point1), 
		 mki3d.pointClone(point2)];
    points.sort( mki3d.pointCompare );
    return points; 
}

/* triangle is a sorted array of three points */
mki3d.newTriangle = function ( point1, point2, point3 ){
    var points= [mki3d.pointClone(point1),
		 mki3d.pointClone(point2),  
		 mki3d.pointClone(point3)];
    points.sort( mki3d.pointCompare );
    return points; 
}


/* make disjoint clone of the element */
mki3d.elementClone = function ( element ) {
    var points=[];
    var i;
    for(i=0; i<element.length; i++)
	points.push( mki3d.pointClone( element[i] ) );
    return points;
}

/* make disjoint clone of the elements' array */
mki3d.elementArrayClone = function( elementArray ){
    var out =[];
    var i;
    for(i=0; i< elementArray.length; i++) 
	out.push(mki3d.elementClone(elementArray[i]));
    return out;
}



/* compare elements of the same type: either segments or triangles */
mki3d.elementCompare = function(e1, e2){
    var i;
    var cmp=0;
    for( i=0 ; i<e1.length; i++) {
	cmp = mki3d.pointCompare(e1[i], e2[i])
	if( cmp != 0 ) return cmp;
    }
    return cmp; // should be cmp == 0
}


/* An element is either a segment or a triangle.
   areEqual( el1, el2 )  tests equality of two elements  */


mki3d.areEqualElements = function( element1, element2 ){
    element1.sort( mki3d.pointCompare );
    element2.sort( mki3d.pointCompare );
    if( element1.length != element2.length ) return false;
    var i;
    for( i=0 ; i<element1.length; i++)
	if( mki3d.pointCompare(element1[i], element2[i]) != 0 ) return false;
    return true;
}

/* get array of endpoints of the elements */

mki3d.getEndpointsOfElements = function(elements){
    var out=[];
    var i,j;
    for(i=0; i<elements.length; i++)
	for(j=0; j<elements[i].length; j++)
	    out.push(elements[i][j]);
    return out;
}


/* select */

/* select all endpoints of the element */
mki3d.selectElement= function( element ) {
    var j;
    for( j=0; j<element.length; j++ ) element[j].selected=true;
    return true;
}


/* element is labeled  if all its endpoints have  field label evaluating to true */

mki3d.elementLabeled= function( element, label ) {
    var j;
    for( j=0; j<element.length; j++ )
	if(!element[j][label]) return false;
    return true;
}

mki3d.getLabeledElements= function( elements, label ){
    var out=[];
    var i;
    for(i=0; i<elements.length; i++) {
	if( mki3d.elementLabeled(elements[i], label) ) out.push( elements[i] );
    }
    return out;
}

/* get bookmarked elements */
mki3d.getBookmarkedElements= function( elements ){
    if(!mki3d.tmp.bookmarked || mki3d.tmp.bookmarked.length == 0) return []; // nothing bookmarked
    var i;

    /* label with "bookmarked" */
    for(i=0; i<mki3d.tmp.bookmarked.length; i++) {
	mki3d.tmp.bookmarked[i].bookmarked=true;
    }

    var out= mki3d.getLabeledElements( elements, "bookmarked" );
    
    /* clean label "bookmarked" */
    for(i=0; i<mki3d.tmp.bookmarked.length; i++) {
	delete mki3d.tmp.bookmarked[i].bookmarked;
    }

    return out;
}

/* TO DO: reimplement following '...Selected(...)' functions using '...Labeled(...)' functions */

/* element is selected if all its endpoints are selected */

mki3d.elementSelected= function( element ) {
    var j;
    for( j=0; j<element.length; j++ )
	if(!element[j].selected) return false;
    return true;
}

/* element is incident to selected if at least one of its endpoints is selected */

mki3d.elementIncidentToSelected= function( element ) {
    var j;
    for( j=0; j<element.length; j++ )
	if(element[j].selected) return true;
    return false;
}

/* get array of elements with all endpoints selected from the input */

mki3d.getSelectedElements= function( elements ){
    if(!mki3d.tmp.selected) return []; // nothing selected
    var out=[];
    var i;
    for(i=0; i<elements.length; i++) {
	if( mki3d.elementSelected(elements[i]) ) out.push( elements[i] );
    }
    return out;
}

// remove 'selected' key from all endpoints in data
mki3d.cancelSelection= function( data ){
    mki3d.cleanElementEndpointsFromKey(data.model.segments, 'selected');
    mki3d.cleanElementEndpointsFromKey(data.model.triangles, 'selected');
    mki3d.cleanElementEndpointsFromKey( mki3d_texture.triangles( data ), 'selected');
}


/* get the not selected elements */

mki3d.getNotSelectedElements= function( elements ) {
    if(!mki3d.tmp.selected) return elements; // nothing selected
    var out=[];
    var i,j;
    for(i=0; i<elements.length; i++) {
	if( !mki3d.elementSelected(elements[i]) ) out.push( elements[i] );
    }
    return out;
}


/* get the elements incident to selected */

mki3d.getIncidentToSelectedElements= function( elements ){
    if(!mki3d.tmp.selected) return []; // nothing selected
    var out=[];
    var i;
    for(i=0; i<elements.length; i++) {
	if( mki3d.elementIncidentToSelected(elements[i]) ) out.push( elements[i] );
    }
    return out;
}


/* get the array of the clones of selected elements from the elements */
mki3d.copyOfSelected= function( elements, setIdx ){
    var copy= mki3d.elementArrayClone( mki3d.getSelectedElements(elements) );
    mki3d.elementArrayPlaceInSet(copy, setIdx );
    return copy;
}


/* cleaning elements */

/* clean temporary keys from elements */

mki3d.cleanElementEndpointsFromKey = function ( elements, key ) {
    var i,j;
    for(i=0; i<elements.length; i++) 
	for(j=0; j<elements[i].length; j++)
            delete elements[i][j][key];
}

/* sort the elements and remove duplicates  */

/* sort the array and remove duplicates using compare function */

mki3d.uniqueSorted= function(array, compare){
    array.sort(compare);
    var out=[];
    if(array.length == 0) return out;
    out.push( array[0] );
    var i;
    for(i=1; i<array.length; i++) {
	if(compare( array[i-1], array[i] ) != 0 ){
	    out.push(array[i]);
	}
	/*
	  else { // for tests
	  console.log(elements[i-1]);
	  console.log(elements[i]);
	  }
	*/
    }
    return out;
}

/** block / unblock the elements **/

mki3d.blockElements= function( elements ){
    for( let i=0; i< elements.length; i++){
	elements[i].blocked=true;
    }
}

mki3d.unblockElements= function( elements ){
    for( let i=0; i< elements.length; i++){
	delete elements[i]['blocked'];
    }
}


/** preparing data for saving or usage **/

// create JSON clean from temporary atributes for saving 
mki3d.dataToJSON=function( origData ){
    let data= JSON.parse( JSON.stringify ( origData ) );
    mki3d_texture.cleanGlFromElements( data );
    let segmentsAdnTriangles = data.model.segments.concat( data.model.triangles ).concat( mki3d_texture.triangles( data ) );
    // clean selected from endpoints
    mki3d.cleanElementEndpointsFromKey(segmentsAdnTriangles, 'selected');
    

}
