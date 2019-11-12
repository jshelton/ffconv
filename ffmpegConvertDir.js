var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
var ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
var command = ffmpeg();
const path = require('path');
const fs = require('fs');
const process = require('process');
var async = require('async');

const exiftool = require('node-exiftool')
const ep = new exiftool.ExiftoolProcess()


var directoryPath;
var file1json = ''
var newProperties = {}
var modificationProperties = ['ModifyDate','CreateDate','TrackCreateDate','TrackModifyDate','MediaCreateDate','MediaModifyDate']


// 
function usage(){
	console.log("Usage: " + __filename + " path/to/directory");
	process.exit(-1);    
}


// Check Arguments
if (process.argv.length == 3 && process.argv[2] === "-h") {
    usage();
} else if ( process.argv.length == 3 ) {
	directoryPath = process.argv[2];
} else {
	directoryPath = process.cwd()
}


console.error(directoryPath)
// Check if it is a directory

try {
    if (!fs.statSync(directoryPath).isDirectory()){
		console.log('Path is not a directory');
		usage()
	}
}
catch (err) {
  if (err.code === 'ENOENT') {
	console.log('file or directory does not exist');
	usage()
  }
}
const scaleName = '1280'

console.log("Starting")
//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach


    const movieFiles = files.filter(function(file) {
		return path.extname(file).toLowerCase() === '.mp4' && !file.includes('_L.');
    });

    //files.filter(el => /\.txt$/.test(el))

    async.eachSeries(movieFiles, (file,seriesCallback) => {

		//sourceFilePath = '/Volumes/Seagate Pictures 8TB/Import/2019-10-10/U32/DCIM/101MEDIA/DJI_0039D.MOV'
		//destFilePath = '/Volumes/Seagate Pictures 8TB/Import/2019-10-10/U32/DCIM/101MEDIA/DJI_0039E.MOV'

		let sourceFilePath = path.join(directoryPath, file);
		let destFilePath =  path.join(directoryPath, path.basename(file)+'_'+scaleName+'_L'+path.extname(file));

		function pad(n, width) { 
			n = n + ''; 
			return n.length >= width ? n :  
				new Array(width - n.length + 1).join('0') + n; 
		} 

		ffmpeg(sourceFilePath)
		    .audioCodec('copy')
			.videoFilter('scale='+scaleName+':-1')
			.on('start', (commandLine) => {
				console.log('Spawned Ffmpeg with command: '+commandLine);
				console.time(sourceFilePath);
			  })
		    .on('error', (err) => console.log('An error occurred: ' + err.message))
		    .on('progress', (progress) => {
				process.stdout.clearLine();
				process.stdout.cursorTo(0);
				process.stdout.write('Processing: ' + pad(parseFloat(progress.percent ).toFixed(2),5)+ '% done ('+sourceFilePath+')');
			})
			.save(destFilePath)
			.on('end',() => {
				console.log();//enter empty line after progress bar

				ep
				.open()
				.then(() => ep.readMetadata(sourceFilePath, ['-File:all']))
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
				.then(() => ep.writeMetadata(destFilePath, {
				  all: '', // remove existing tags
				  //comment: 'Exiftool rules!',
				  ... newProperties,
				  'Keywords+': [ 'resizedMedia' ],
				}, ['overwrite_original']))
				.then(console.log, console.error) // output that 
				.then(() => ep.close())
				.then(() =>
					{
						console.log('Processing finished ('+ destFilePath +')' )
						console.timeEnd(sourceFilePath);
						seriesCallback();
					})
				.catch(console.error)

				// 
				
			});


		});
});



 


