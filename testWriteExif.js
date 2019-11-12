const exiftool = require('node-exiftool')
const ep = new exiftool.ExiftoolProcess()
 
var file1json = ''
var newProperties = {}
var modificationProperties = ['ModifyDate','CreateDate','TrackCreateDate','TrackModifyDate','MediaCreateDate','MediaModifyDate']

ep
  .open()
  .then(() => ep.readMetadata('file_example_MP4_1920_18MG_1.mp4', ['-File:all']))
  .then((a) => 
    {
      file1json=a.data[0];
      
      newProperties = {}
      for (const key in modificationProperties) { 
          if (file1json.hasOwnProperty(modificationProperties[key])){
            newProperties[modificationProperties[key]] = file1json[modificationProperties[key]];
          }
      }
    //   console.log(newProperties);
    }, console.error)
  .then(() => ep.writeMetadata('file_example_MP4_1920_18MG_1.mp4_1280_LB.mp4', {
    all: '', // remove existing tags
    comment: 'Exiftool rules!',
    ... newProperties,
    'Keywords+': [ 'keywordA', 'keywordB' ],
  }, ['overwrite_original']))
  .then(console.log, console.error)
  .then(() => ep.close())
  .catch(console.error)


