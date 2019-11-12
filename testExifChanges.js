const exiftool = require('node-exiftool')
const ep = new exiftool.ExiftoolProcess()


  // use $.isEmptyObject or this
function isEmpty( o ) {
    for ( var p in o ) { 
        if ( o.hasOwnProperty( p ) ) { return false; }
    }
    return true;
}

var compareObj = function(obj1, obj2) { 
  var ret = {},rett; 
  for(var i in obj2) { 
      rett = {};  
      if (typeof obj2[i] === 'object'){
          rett = compareObj (obj1[i], obj2[i]) ;
          if (!isEmpty(rett) ){
           ret[i]= rett
          }              
       }else{
           if(!obj1 || !obj1.hasOwnProperty(i) || obj2[i] !== obj1[i]) { 
              ret[i] = obj2[i]; 
      } 
   }
  } 
  return ret; 
}; 

 
var file1json = ''
var file2json = ''

ep
  .open()
  // display pid
  .then((pid) => console.log('Started exiftool process %s', pid))
  .then(() => ep.readMetadata('file_example_MP4_1920_18MG_1.mp4', ['-File:all']))
//   .then(() => ep.readMetadata('file_example_MP4_1920_18MG_1.mp4_1280_L.mp4', ['-File:all']))
  .then((a)=>{file1json=a}, console.error)
  .then(() => ep.readMetadata('file_example_MP4_1920_18MG_1.mp4_1280_L.mp4', ['-File:all']))
  .then((a)=>{file2json=a}, console.error)
  .then(() => ep.close())
  .then(() => console.log('Closed exiftool'))
  .then(()=>{console.log(compareObj(file1json,file2json))})
  .catch(console.error)

  