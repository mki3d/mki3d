/** export mki3d.data to COLLADA **/

mki3d.collada={};
mki3d.collada.oDOM=null; // object DOM

mki3d_collada_export= function(){
    return '<?xml version="1.0" encoding="utf-8"?>\n'+
	mki3d_collada();
}

mki3d_collada= function() {
    var initString='<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1"></COLLADA>';
    var oParser = new DOMParser();
    mki3d.collada.oDOM = oParser.parseFromString(initString, "text/xml");

    mki3d_collada_assets();
    mki3d_collada_library_geometries();
    mki3d_collada_library_visual_scenes();
    mki3d_collada_scene();
    
    var oSerializer = new XMLSerializer();
    var outString = oSerializer.serializeToString( mki3d.collada.oDOM);
    return outString;
}

mki3d_collada_assets= function() {
    oDOM=mki3d.collada.oDOM; // reference to COLLADA DOM
    var asset = oDOM.createElement("asset");
    var collada = oDOM.getElementsByTagName("COLLADA")[0]; // root element
    collada.appendChild(asset);

    var contributor=oDOM.createElement("contributor");
    asset.appendChild(contributor);

    var author=oDOM.createElement("author");
    contributor.appendChild(author);
    author.appendChild( oDOM.createTextNode("MKI3D User") );

    var authoring_tool= oDOM.createElement("authoring_tool");
    contributor.appendChild(authoring_tool);
    authoring_tool.appendChild( oDOM.createTextNode("MKI3D RAPID MODELER") );

    var created= oDOM.createElement("created");
    asset.appendChild(created);
    created.appendChild( oDOM.createTextNode((new Date()).toISOString()));

    var keywords= oDOM.createElement("keywords");
    asset.appendChild(keywords);
    keywords.appendChild( oDOM.createTextNode("COLLADA interchange"));
    
    var modified= oDOM.createElement("modified");
    asset.appendChild(modified);
    modified.appendChild( oDOM.createTextNode((new Date()).toISOString()));
    
}


mki3d_collada_library_geometries= function() {
    oDOM=mki3d.collada.oDOM; // reference to COLLADA DOM
    var library_geometries = oDOM.createElement("library_geometries");
    var collada = oDOM.getElementsByTagName("COLLADA")[0]; // root element
    collada.appendChild(library_geometries);

    /* geometry "Lines-geometry" */
    var geometry=oDOM.createElement("geometry");
    library_geometries.appendChild(geometry);
    geometry.setAttribute("id", "Lines-geometry");

    var mesh=oDOM.createElement("mesh");
    geometry.appendChild(mesh);

    /* source "Lines-positions" */
    var source=oDOM.createElement("source");
    mesh.appendChild(source);
    source.setAttribute("id", "Lines-positions");

    var float_array=oDOM.createElement("float_array");
    source.appendChild(float_array);
    float_array.setAttribute("id", "Lines-positions-array");
    float_array.setAttribute("count",mki3d.data.model.segments.length*2*3);
    var linesEndpoints= mki3d.getElementsEndpoints(mki3d.data.model.segments);
    float_array.appendChild( oDOM.createTextNode(" "));
    for( var i=0; i<linesEndpoints.length; i++ ) {
	float_array.childNodes[0].appendData(" "+linesEndpoints[i].position[0]);
	float_array.childNodes[0].appendData(" "+linesEndpoints[i].position[1]);
	float_array.childNodes[0].appendData(" "+(-linesEndpoints[i].position[2]));
    }

    var technique_common=oDOM.createElement("technique_common");
    source.appendChild(technique_common);
    var accessor=oDOM.createElement("accessor");
    technique_common.appendChild(accessor);
    accessor.setAttribute("source", "Lines-positions-array");
    accessor.setAttribute("count", mki3d.data.model.segments.length*2);
    accessor.setAttribute("stride", 3);

    var param=oDOM.createElement("param");
    accessor.appendChild(param);
    param.setAttribute("name","X");
    param.setAttribute("type","float");
    
    param=oDOM.createElement("param");
    accessor.appendChild(param);
    param.setAttribute("name","Y");
    param.setAttribute("type","float");

    param=oDOM.createElement("param");
    accessor.appendChild(param);
    param.setAttribute("name","Z");
    param.setAttribute("type","float");
    
    /* source "Lines-colors" */
    var source=oDOM.createElement("source");
    mesh.appendChild(source);
    source.setAttribute("id", "Lines-colors");

    var float_array=oDOM.createElement("float_array");
    source.appendChild(float_array);
    float_array.setAttribute("id", "Lines-colors-array");
    float_array.setAttribute("count",mki3d.data.model.segments.length*2*3);
    var linesEndpoints= mki3d.getElementsEndpoints(mki3d.data.model.segments);
    float_array.appendChild( oDOM.createTextNode(" "));
    for( var i=0; i<linesEndpoints.length; i++ )
	for( var j=0; j<3; j++)
	    float_array.childNodes[0].appendData(" "+linesEndpoints[i].color[j]);

    var technique_common=oDOM.createElement("technique_common");
    source.appendChild(technique_common);
    var accessor=oDOM.createElement("accessor");
    technique_common.appendChild(accessor);
    accessor.setAttribute("source", "Lines-colors-array");
    accessor.setAttribute("count", mki3d.data.model.segments.length*2);
    accessor.setAttribute("stride", 3);

    var param=oDOM.createElement("param");
    accessor.appendChild(param);
    param.setAttribute("name","R");
    param.setAttribute("type","float");
    
    param=oDOM.createElement("param");
    accessor.appendChild(param);
    param.setAttribute("name","G");
    param.setAttribute("type","float");

    param=oDOM.createElement("param");
    accessor.appendChild(param);
    param.setAttribute("name","B");
    param.setAttribute("type","float");
    
    /* vertices */
    var vertices=oDOM.createElement("vertices");
    mesh.appendChild(vertices);
    vertices.setAttribute("id", "Lines-vertices");

    var input=oDOM.createElement("input");
    vertices.appendChild(input);
    input.setAttribute("semantic", "POSITION");
    input.setAttribute("source", "#Lines-positions");

    var input=oDOM.createElement("input");
    vertices.appendChild(input);
    input.setAttribute("semantic", "COLOR");
    input.setAttribute("source", "#Lines-colors");

    /* lines */
    var lines=oDOM.createElement("lines");
    mesh.appendChild(lines);
    lines.setAttribute("count",  mki3d.data.model.segments.length);
    input=oDOM.createElement("input");
    lines.appendChild(input);
    input.setAttribute("semantic","VERTEX");
    input.setAttribute("source", "#Lines-vertices");
    input.setAttribute("offset",0);
    input=oDOM.createElement("input");
    lines.appendChild(input);
    input.setAttribute("semantic","COLOR");
    input.setAttribute("source", "#Lines-colors");
    input.setAttribute("offset",0);
    var p=oDOM.createElement("p");
    lines.appendChild(p);
    p.appendChild( oDOM.createTextNode(" "));
    for( var i=0; i<mki3d.data.model.segments.length; i++)
	p.childNodes[0].appendData(" "+2*i+" "+(2*i+1));	
    
    
}


mki3d_collada_library_visual_scenes= function() {
    oDOM=mki3d.collada.oDOM; // reference to COLLADA DOM
    var library_visual_scenes = oDOM.createElement("library_visual_scenes");
    var collada = oDOM.getElementsByTagName("COLLADA")[0]; // root element
    collada.appendChild(library_visual_scenes);

    var visual_scene =oDOM.createElement("visual_scene");
    library_visual_scenes.appendChild(visual_scene);
    visual_scene.setAttribute("id", "Scene_MKI3D");

    var node=oDOM.createElement("node");
    visual_scene.appendChild(node);

    var instance_geometry=oDOM.createElement("instance_geometry");
    node.appendChild(instance_geometry);
    instance_geometry.setAttribute("url", "#Lines-geometry");
}

mki3d_collada_scene= function() {
    oDOM=mki3d.collada.oDOM; // reference to COLLADA DOM
    var scene = oDOM.createElement("scene");
    var collada = oDOM.getElementsByTagName("COLLADA")[0]; // root element
    collada.appendChild(scene);

    var instance_visual_scene =  oDOM.createElement("instance_visual_scene");
    scene.appendChild(instance_visual_scene);
    instance_visual_scene.setAttribute("url","#Scene_MKI3D");
   
}
