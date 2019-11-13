const mongo = require('mongodb');
const url = "mongodb://localhost:27017";

//# Make a unique restriction
// db.collection.createIndex( { user: 1, title: 1, Bank: 1 }, {unique:true} )



// Create Database

mongo.connect(url, {useUnifiedTopology: true}, (err, db) => {
        if(err) {
           console.log(err);
           process.exit(0);
        }
        console.log('database connected!');

        var dbo = db.db('media');
        dbo.createCollection('videos', (err, result) => {
            if(err) {
               console.log(err);
               process.exit(0);
            }
            console.log('collection created!');
            db.close();
        });
});