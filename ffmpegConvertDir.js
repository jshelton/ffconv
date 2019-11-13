var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
var ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
var command = ffmpeg();
const path = require('path');
const fs = require('fs');
const process = require('process');
var async = require('async');
const { exec } = require('child_process');

const exiftool = require('node-exiftool')
const ep = new exiftool.ExiftoolProcess()

var ObjectId = require('mongodb').ObjectID;
const mongo = require('mongodb');
const url = "mongodb://localhost:27017";



var directoryPath;
var file1json = ''
var newProperties = {}
var modificationProperties = ['ModifyDate','CreateDate','TrackCreateDate','TrackModifyDate','MediaCreateDate','MediaModifyDate']

function pad(n, width) { 
			n = n + ''; 
			return n.length >= width ? n :  
				new Array(width - n.length + 1).join('0') + n; 
} 


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
		let sourceMd5 = ''
		let destMd5 = ''

		let sourceFileData = {}
		let sourceFileMd5 = ''

		let destFileData = {}
		let destFileMd5 = ''

		async.waterfall([
			(watercall)=>{
				// Add this movie to the database (make sure is unique)
				// Get md5 and exif info
				async.parallel([
				(myCallback)=>{
					exec('md5 -q "'+sourceFilePath+'"', (err, stdout, stderr) => {
						if (err) {
						// node couldn't execute the command
						console.log('An error occurred: ' + err.message)
						return;
						}
					
						sourceFileMd5 = stdout.trim()
						
						myCallback(null,sourceFileMd5)
					});
				},
				(myCallback)=>{

					ep
					.open()
					.then(() => ep.readMetadata(sourceFilePath, ['-File:all']))
					.then((a) => 
					{
						sourceFileData.exif = a.data[0];
										
					//   console.log(newProperties);
					}, console.error)
					.then(() => ep.close())
					.then(() =>	myCallback(null, sourceFileData ) )
					.catch(console.error)
				}
				],(err,[checksum,fileData])=>{ 
					// Add to database

					// fileData = sourceFileData;

					fileData.md5 = checksum
					fileData.initialPath = sourceFilePath

					mongo.connect(url, { useUnifiedTopology: true}, (err, db) => {
						if(err) {
						console.log(err);
						process.exit(0);
						}


						var dbo = db.db('media');
						
						console.log('database connected!');

						var collection = dbo.collection('videos');

						collection.findOne({"md5":fileData.md5}, (err,item)=> {
							
							

							if ( item === null ) {
								let data = [
									fileData
								];
								collection.insertMany(data, (err, result) => {
									if(err) {
										console.log(err);
										process.exit(0);
									}
									console.log("resulted in insert");

									db.close();
									watercall(null,result._id);
								});

							} else {
								console.log("This item may already exists in the dataabse item " )
								watercall(null,item._id);
							}
						})
					});

				})
		},(insertedID, watercall)=>{

			// if (insertedID === null){
			// 	console.log("skipping movie (because already exists in database) " + sourceFilePath)
			// 	watercall(null)
			// }
			
			console.log("source id:"+ insertedID)
			console.log(" inserted "+ObjectId(insertedID).getTimestamp())

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
						file1json.exif = a.data[0];
						
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
					.then(
						()=>{
							// Add this movie to the database (make sure is unique)
							// Get md5 and exif info
							async.parallel([
							(myCallback)=>{
								exec('md5 -q "'+sourceFilePath+'"', (err, stdout, stderr) => {
									if (err) {
									// node couldn't execute the command
									console.log('An error occurred: ' + err.message)
									return;
									}
								
									destFileMd5 = stdout.trim()
									
									myCallback(null,destFileMd5)
								});
							},
							(myCallback)=>{
			
								ep
								.open()
								.then(() => ep.readMetadata(destFilePath, ['-File:all']))
								.then((a) => 
								{
									destFileData.exif = a.data[0];
									destFileData.originalVideo = insertedID
													
								//   console.log(newProperties);
								}, console.error)
								.then(() => ep.close())
								.then(() =>	myCallback(null, destFileData ) )
								.catch(console.error)
							}
							],(err,[checksum,fileData])=>{ 
								// Add to database
	
			
								fileData.md5 = checksum
								fileData.initialPath = destFilePath
			
								mongo.connect(url, { useUnifiedTopology: true}, (err, db) => {
									if(err) {
									console.log(err);
									process.exit(0);
									}
			
			
									var dbo = db.db('media');
									
									console.log('database connected!');
			
									var collection = dbo.collection('videos');
			
									// onl difference here is that we don't check if record already exists
									let data = [
										fileData
									];

									collection.insertMany(data, (err, result) => {
										if(err) {
											console.log(err);
											process.exit(0);
										}
										console.log("resulted in insert of new movie");
	
										db.close();
										
										//call(null,result._id); doesn't work with then
									});
	
									
								});
			
							})
						}
					)
					.then(() =>
						{
							console.log('Processing finished ('+ destFilePath +')' )
							console.timeEnd(sourceFilePath);
							watercall(null)
						})
					.catch(console.error)

				});
			}
		],(err,result)=>{seriesCallback(err)}) // end processing movie file
	})

});