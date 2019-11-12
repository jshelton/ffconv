const exiftool = require('node-exiftool')
const ep = new exiftool.ExiftoolProcess()
 
ep
  .open()
  // read directory
  .then(() => ep.readMetadata('./.', ['-File:all']))
  .then(console.log, console.error)
  .then(() => ep.close())
  .catch(console.error)