const path = require("path")

const exiftool = require('node-exiftool')
const ep = new exiftool.ExiftoolProcess()


var ObjectId = require('mongodb').ObjectID;
const mongo = require('mongodb');
const url = "mongodb://localhost:27017";

const mediaDatabaseName = "mediaTest"

ep
  .open()
  .then(() => ep.readMetadata('testData', ['-File:all']))
  .then((exifData)=>{

        let dateNow = new Date().getTime();
    
        let exifSet = exifData.data.map(element=> ({ importGroupDate: dateNow, uniqID:element.HandlerVendorID+element.CreateDate+path.basename(element.SourceFile), filename: path.basename(element.SourceFile), exif:element }))

        console.log(exifSet)

        mongo.connect(url, {useUnifiedTopology: true})
        .then( (db)=>{
        //, (err, db) => {
            // if(err) {
            //     console.log(err);

            // process.exit(0);
            // }
            var dbo = db.db(mediaDatabaseName);
            console.log('database connected!');
            
            // db.collection.find({_id: "myId"}, {_id: 1}).limit(1)


            dbo.collection('Products').insertMany(exifSet)
            .then((result)=>{
                // , (err, result) => {
                // if (err) return console.log(err);

                console.log(result)//.ops[0]._id.getTimestamp());
            })
            .then(()=>db.close())
        })        
        .catch((error)=>{console.error(error); db.close()})
    })
  .then(() => ep.close())
  .catch((error)=>{ 
      console.error(error); 
      ep.close()
    })

//  .then()