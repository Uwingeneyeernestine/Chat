const {MongoClient} = require('mongodb');

const url = 'mongodb://localhost:27017';
let db = '';


process.on('uncaughtException',(err,data)=>{
   if(err){
    console.log('critical issues');
    return;
   }
  });

 MongoClient.connect(url,{useUnifiedTopology: true},(err,res)=>{
    if(err){
        console.log('database error');
    } else {
       db = res.db('sign');
       const user = {"name":"Ernestine","pass":"it's me"};
        db.collection('users').insertOne(user,(err,res)=>{  
        if(err){
            console.log('database error');
            return;
        }
        console.log(res);
        });
    }
});
