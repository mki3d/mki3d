mki3d.idb={} // object related to IndexedDB

if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB.");
} else {
    console.log("Your browser supports a stable version of IndexedDB.");
}


mki3d.idb.onupgradeneeded = function( event ) {
    // PODSTAWIAĆ JAKO CALLBACK DO REQUEST ...
    
    // PRZEROBIĆ:
    var db = event.target.result;
    
    // Create an objectStore and date as its index 
    if(!db.objectStoreNames.contains("files")) {
	var os = db.createObjectStore("files", {keyPath: 'id', autoIncrement:true});
	os.createIndex("date", "date", {unique:false});
    }

}

mki3d.idb.dataBackup=null;

mki3d.idb.tmpLoad = function( id ){
    if(mki3d.idb.dataBackup == null) mki3d.idb.dataBackup=mki3d.data;
    
    mki3d.idb.db.transaction(["files"]).objectStore("files").get(id).onsuccess = function(event) {
	mki3d.data= JSON.parse( event.target.result.dataString);
        mki3d.tmpCancel();
	mki3d.setModelViewMatrix();
    };
    
}


mki3d.idb.filesFound= [];
mki3d.idb.filesIdx= -1;


mki3d.idb.findFiles= function( finalFunction ) {
    /*
      finalFunction - function called with the event argument after request.onsuccess
     */
    /* 
       REMADE FROM EXAMPLE:
       https://static.raymondcamden.com/demos/2013/jun/6/test1.html
    */
    
    var fromDate = document.querySelector("#inputIDBFromDate").value;
    var toDate = document.querySelector("#inputIDBToDate").value;
    var substring = document.querySelector("#inputIDBNameSubString").value;
    var range=null;

    // if(fromDate == "" && toDate == "") return;

    // console.log('doSearch',fromDate,toDate);
    var transaction = mki3d.idb.db.transaction(["files"],"readonly");
    var store = transaction.objectStore("files");
    var index = store.index("date");

    if(fromDate != "") fromDate = new Date(fromDate);
    if(toDate != "") toDate = new Date(toDate);
    
    if(fromDate != "" && toDate != "") {
	range = IDBKeyRange.bound(fromDate, toDate);
    } else if(toDate != "") {
	range = IDBKeyRange.upperBound(toDate);
    } else if(fromDate != "") {
	range = IDBKeyRange.lowerBound(fromDate);
    }

    mki3d.idb.filesFound= [];
    console.dir(range); /// test

    var request=index.openCursor(range);

    mki3d.idb.filesFound.finalFunction = finalFunction; // the function to be called when mki3d.idb.filesFound is complete
    
    request.onsuccess = function(e) {
	var cursor = e.target.result;
        console.log('got something');
	if(cursor) { // anything more found ...
	    var name =  cursor.value['name']
	    if(  name.includes(substring) ) { // substring filter ...
		item= {} ;
		item.id =  cursor.value['id'];
		item.date = cursor.value['date'];
		item.name = name;
		mki3d.idb.filesFound.push(item);
	    }
	    cursor.continue();
	} else {
	    if(  mki3d.idb.filesFound.finalFunction ) mki3d.idb.filesFound.finalFunction( e );
	}
    }

}


mki3d.idb.dbName = "mki3d" // name of the database


mki3d.idb.openDB = function( onsuccessFunction, onerrorFunction ){
    /* 
       onsuccessFunction - function to be called on success with event as parametr 
       onerrorFunction - function to be called on error with event as parametr 
     */
    var request = indexedDB.open(mki3d.idb.dbName);

    request.onsuccessFunction=onsuccessFunction;
    request.onerrorFunction=onerrorFunction;
    
    request.onupgradeneeded = mki3d.idb.onupgradeneeded;
    
    request.onerror = function( event) {
	console.log( event );
	if( this.onerrorFunction ) this.onerrorFunction( event );
    };
    
    request.onsuccess = function( event ) {
	mki3d.idb.db = event.target.result;
	console.log( event );
	if( this.onsuccessFunction )  this.onsuccessFunction( event );
    };

}

mki3d.idb.prepareItem= function(){
    var item = {}
    item.name = mki3d.file.suggestedName.repeat(1); // copy
    item.date = new Date();
    item.dataString = JSON.stringify(mki3d.data);
    return item;
}

mki3d.idb.addToIDB= function(){
    mki3d.idb.db.transaction(["files"],"readwrite").objectStore("files").add( mki3d.idb.prepareItem() );
}

