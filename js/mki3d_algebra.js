/** vector and matrix operations **/


/** Vector is an array [x,y,z] **/


mki3d.vectorClone= function (v){
    return [v[0],v[1],v[2]]; 
};

mki3d.vectorCompare = function( v, w ){
    var cmp=0;
    cmp= w[0]-v[0];
    if(cmp != 0) return cmp;
    cmp= w[1]-v[1];
    if(cmp != 0) return cmp;
    cmp= w[2]-v[2];
    return cmp;
};

/* Set elements of the existing vector v */
mki3d.vectorSet = function(v, x,y,z ) {
    v[0]=x;
    v[1]=y;
    v[2]=z;
};

mki3d.vectorMove = function(v, dx, dy, dz ) {
    v[0]+= dx;
    v[1]+= dy;
    v[2]+= dz;
};

mki3d.vectorScale = function(v, sx, sy, sz ) {
    v[0]*= sx;
    v[1]*= sy;
    v[2]*= sz;
};




mki3d.scalarProduct= function( v, w ) {
    return v[0]*w[0]+v[1]*w[1]+v[2]*w[2];
};

mki3d.vectorProduct= function( a, b ) {
    return [ a[1]*b[2]-a[2]*b[1],
             a[2]*b[0]-a[0]*b[2],
             a[0]*b[1]-a[1]*b[0]  ];
};

mki3d.vectorLength = function (a) {
    return Math.sqrt(mki3d.scalarProduct(a,a));
};

mki3d.vectorNormalized = function (v) { 
    var len= mki3d.vectorLength(v);
    if(len==0) return [0,0,0]; // normalized zero vector :-(
    var vn= mki3d.vectorClone(v);
    var s =1/len; 
    mki3d.vectorScale(vn,  s,s,s);
    return vn;
};

mki3d.normalToPlane = function ( a, b, c ) { // a,b,c are three points of the plane
    var v1 = [ b[0]-a[0], b[1]-a[1], b[2]-a[2] ];
    var v2 = [ c[0]-a[0], c[1]-a[1], c[2]-a[2] ];
    return mki3d.vectorNormalized( mki3d.vectorProduct( v1, v2 ) );
};

/* Matrix is an array of three vectors (rows of the matrix) */


/* returns new Identity matrix */
mki3d.newIdMatrix = function () {
    return [ [ 1, 0, 0],
             [ 0, 1, 0],
             [ 0, 0, 1] ]; 

};

mki3d.matrixClone = function( m ) {
    return [ mki3d.vectorClone( m[0] ),
	     mki3d.vectorClone( m[1] ),
	     mki3d.vectorClone( m[2] ) ];
};

/*
mki3d.matrixScale = function( m ) {
    mki3d.vectorScale( m[0] );
    mki3d.vectorScale( m[1] );
    mki3d.vectorScale( m[2] );
};
*/ 

mki3d.matrixColumn = function ( matrix, i ){
    return [ matrix[0][i], matrix[1][i], matrix[2][i] ];
};

mki3d.matrixTransposed = function ( matrix ){
    return [ mki3d.matrixColumn(matrix, 0),
	     mki3d.matrixColumn(matrix, 1),
	     mki3d.matrixColumn(matrix, 2) ];
};

mki3d.matrixVectorProduct = function ( m, v ) {
    var sp = mki3d.scalarProduct;
    return [ sp(m[0],v), sp(m[1],v), sp(m[2],v)];
};

mki3d.matrixProduct = function( m1, m2){ 
    var sp = mki3d.scalarProduct;
    var col = mki3d.matrixColumn;
    return [ [ sp(m1[0], col(m2, 0)) , sp(m1[0], col(m2, 1)),  sp(m1[0], col(m2, 2)) ], 
	     [ sp(m1[1], col(m2, 0)) , sp(m1[1], col(m2, 1)),  sp(m1[1], col(m2, 2)) ], 
	     [ sp(m1[2], col(m2, 0)) , sp(m1[2], col(m2, 1)),  sp(m1[2], col(m2, 2)) ] ];
};

mki3d.matrixRotatedXY= function(matrix, alpha ){
    var c = Math.cos( alpha );
    var s = Math.sin( alpha ); 
    var rot = [ [ c, -s, 0 ],
		[ s,  c, 0 ],
		[ 0,  0, 1 ] ];

    return mki3d.matrixProduct( rot, matrix );
};

mki3d.matrixRotatedXZ= function(matrix, alpha ){
    var c = Math.cos( alpha );
    var s = Math.sin( alpha ); 
    var rot = [ [ c,  0, -s ],
		[ 0,  1,  0 ],
		[ s,  0,  c ] ];

    return mki3d.matrixProduct( rot, matrix );
};

mki3d.matrixRotatedYZ= function(matrix, alpha ){
    var c = Math.cos( alpha );
    var s = Math.sin( alpha ); 
    var rot = [ [ 1,  0,  0 ],
		[ 0,  c, -s ],
		[ 0,  s,  c ] ];

    return mki3d.matrixProduct( rot, matrix );
};
