const mongo = require('mongodb');
const url = "mongodb://localhost:27017";
var ObjectId = require('mongodb').ObjectID;

//# Make a unique restriction
// db.collection.createIndex( { user: 1, title: 1, Bank: 1 }, {unique:true} )


if (false){
// Create Database

// mongo.connect(url, {useUnifiedTopology: true}, (err, db) => {
//         if(err) {
//            console.log(err);
//            process.exit(0);
//         }
//         console.log('database connected!');

//         var dbo = db.db('codeforgeek');
//         dbo.createCollection('users', (err, result) => {
//             if(err) {
//                console.log(err);
//                process.exit(0);
//             }
//             console.log('collection created!');
//             db.close();
//         });
// });

// Insert Data
        mongo.connect(url, { useUnifiedTopology: true}, (err, db) => {
        if(err) {
           console.log(err);
           process.exit(0);
        }
        let data = [{
           "id": 108,
            "name": "Shahid"
        }
        // ,{
        //     "id": 101,
        //     "name": "Rahil"
        // },{
        //     "id": 102,
        //     "name": "John"
        // }
        ];
        var dbo = db.db('codeforgeek');
        console.log('database connected!');
        var collection = dbo.collection('users');
        collection.insertMany(data, (err, result) => {
            if(err) {
                console.log(err);
                process.exit(0);
            }
            console.log(result);
            db.close();
        });
    });
    

// //     Update
// mongo.connect(url, {useUnifiedTopology: true}, (err, db) => {
//         if(err) {
//            console.log(err);
//            process.exit(0);
//         }
//         var dbo = db.db('codeforgeek');
//         console.log('database connected!');
//         var collection = dbo.collection('users');
                
//         collection.updateOne({name: 'Shahid'}, {'$set': {'name': 'Shahid Shaikh'}}, (err, results) => {
//                 if(err) {
//                         console.log(err);
//                         process.exit(0);
//                 }
//                         console.log(results);
//                         db.close();
//                 });
//     });



    
// mongo.connect(url, {useUnifiedTopology: true}, (err, db) => {
//         if(err) {
//            console.log(err);
//            process.exit(0);
//         }
//         var dbo = db.db('codeforgeek');
//         console.log('database connected!');
//         var collection = dbo.collection('users');
        


//         collection.deleteOne({name: 'Shahid Shaikh'}, (err, results) => {
//                 if(err) {
//                 console.log(err);
//                 process.exit(0);
//                 }
//                 console.log(results);
//                 db.close();
//         });
        
//     });




    
    mongo.connect(url, {useUnifiedTopology: true}, (err, db) => {
        if(err) {
           console.log(err);
           process.exit(0);
        }
        var dbo = db.db('codeforgeek');
        console.log('database connected!');
        var collection = dbo.collection('users');
        collection.find().toArray((err, results) => {
            if(err) {
                console.log(err);
                process.exit(0);
            }
            console.log(results);
            db.close();
        });
    });
}


    mongo.connect(url, {useUnifiedTopology: true}, (err, db) => {
        if(err) {
           console.log(err);
           process.exit(0);
        }
        var dbo = db.db('codeforgeek');
        console.log('database connected!');
        
        
        dbo.collection('Products').insertOne({
                name: 'iPhone X',
                trademark: 'Apple'
        }, (err, result) => {
                if (err) return console.log(err);
        
                console.log(result.ops[0]._id.getTimestamp());
                db.close()
        });
        
    });


