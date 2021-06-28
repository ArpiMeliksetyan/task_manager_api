const {MongoClient, ObjectID} = require('mongodb');

const connectionUrl = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager';

const id = new ObjectID();

MongoClient.connect(connectionUrl, {useNewUrlParser: true}, (error, client) => {
    if (error) {
        return console.log('Unable to connect database');
    }
    const db = client.db(databaseName);

    const deletedPromise = db.collection('users').deleteMany({age: 25});

    deletedPromise.then(result => console.log(result)).catch(error => console.log(error));

    // const updatePromise = db.collection('users').updateOne({_id: new ObjectID('603be1707a041d151c841f0e')},
    //     {
    //         $inc: {
    //             age: 5,
    //         }
    //     });
    //
    // updatePromise.then(result => console.log(result)).catch(error=> console.log(error));

    // db.collection('users').find({age: 24}).toArray((error, users) => {
    //     console.log(users)
    // })
    // db.collection('users').find({age: 24}).count((error, count) => {
    //     console.log(count)
    // })

    // db.collection('users').findOne({
    //        _id: ObjectID("603be1707a041d151c841f0e"),
    //     }, (error, user) => {
    //         if (error) {
    //             return console.log('Unable to insert user')
    //         }
    //
    //         console.log(user);
    //     }
    // )

// db.collection('users').insertOne({
//     _id: id,
//     name: 'Arpushik',
//     age: 24,
// }, (error, result) => {
//     if (error) {
//         return console.log('Unable to insert user')
//     }
//     console.log(result.ops)
// })

// db.collection('users').insertMany([
//     {
//         name: 'Arpi',
//         age: 24,
//     },
//     {
//         name: 'David',
//         age: 25,
//     }
// ], (error,result)=>{
//     if (error) {
//                 return console.log('Unable to insert user')
//             }
//             console.log(result.ops)
// })
// db.collection('taks').insertMany([
//     {
//         description: 'Running',
//         completed: true,
//     },
//     {
//         description: 'Singing',
//         completed: false,
//     },
//     {
//         description: 'Reading',
//         completed: true,
//     }
// ], (error, result) => {
//     if (error) {
//         return console.log('Unable to insert user')
//     }
//     console.log(result.ops)
// })
})