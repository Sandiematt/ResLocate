
// Requirements-
const express= require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

// Create Express App-
const app=express();
app.use(express.json());
app.use(express.static(__dirname+"/client"));


// Connect Mongo Client-
const uri = "mongodb+srv://Hardik:1234@mdb.eo3b4jv.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// CRUD Functions Mongo-

// List Databases
async function listDatabases(client){
    const dblist= await client.db().admin().listDatabases();

    console.log("Databases:");
    dblist.databases.forEach(db => {
        console.log(`- ${db.name}`);
    });
}

// Create
async function create(client,data,table){
    const result= await client.db("Main").collection(table).insertOne(data);
    console.log(`New Data Inserted: ${result.insertedID}`);
}

// Read
async function read(client,data){
    const res=await client.db("Main").collection("Users").findOne({ username: data });

    if (res){
        return res;
    }
}

// Read Mult.
async function readMult(client,data){
    const res=await client.db("Main").collection("Resource Data").find({ "coords.lat": {$gte: 0} });
    const result=await res.toArray();

    if(res){
        return result;
    }
    else{
        console.log("No DATA!");
    }
}

// Delete
async function del(client,data){
    const result=await client.db("Main").collection("Users").deleteOne({_id:data});

    console.log("Deleted!");
}

//-------------------------------------------

// Calculate diatance-
function rad(degrees){
  var pi = Math.PI;
  return degrees * (pi/180);
}
function distance(Lat1,Lat2,Lon1,Lon2){
  let dist=Math.acos((Math.sin(rad(Lat1))*Math.sin(rad(Lat2)))+(Math.cos(rad(Lat1))*Math.cos(rad(Lat2)))*(Math.cos(rad(Lon2)-rad(Lon1))))*6371
  return dist;
}
//-------------------------------------------


// Main Runner-

async function run() {
    try {
      // Vardiables-
      let is_logged_in=0; // 0- Not Logged In | 1- Logged In.
      let lat=0;
      let lon=0;
      //-------------------------

      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
  
      app.get("/",(req,res)=>{
        res.sendStatus(200).status("Good");
      })

// Init Pages--------------------------------------------------
      app.get("/login",(req,res)=>{
        res.sendFile(__dirname + "/Client/login.html");
      })
      app.get("/Contributors_page",(req,res)=>{
        res.sendFile(__dirname + "/Client/Contributors.html");
      })
      app.get("/home",(req,res)=>{
        res.sendFile(__dirname + "/Client/main.html");
      })
      app.get("/aboutUs",(req,res)=>{
        res.sendFile(__dirname + "/Client/aboutUs.html");
      })
      app.get("/learn",(req,res)=>{
        res.sendFile(__dirname + "/Client/learn.html");
      })
      app.get("/maps",(req,res)=>{
        res.sendFile(__dirname + "/Client/GoogleMaps.html");
      })
      app.get("/AddRec",(req,res)=>{
        res.sendFile(__dirname + "/Client/AddRec.html");
      })
      app.get("/findRes",(req,res)=>{
        res.sendFile(__dirname + "/Client/find_res.html");
      })
      app.get("/findWork",(req,res)=>{
        res.sendFile(__dirname + "/Client/Find_Work.html");
      })
      app.get("/AddWork",(req,res)=>{
        res.sendFile(__dirname + "/Client/AddWork.html");
      })
//-------------------------------------------------------------------

// User Auth-
      app.post("/auth",async function(req,res){
          const result= await read(client,req.body.username);
          //console.log("res-",result);
          if(result){
            if(result.password == req.body.password){
              is_logged_in=1;
              res.json({
                auth: 1
              })
            }
            else{
              is_logged_in=0;
              res.json({
                auth: 0
              })
            }
          }
          else{
            res.json({
              auth: 0
            })
          }
      })
//-------------------------------------------------------------------

// Logout-
      app.get("/logout",(req,res)=>{
        //console.log("logging Out: ",is_logged_in);
        is_logged_in=0;
        res.json({
          log: 0
        })
      })
//-------------------------------------------------------------------


// check loging-
      app.get("/check",(req,res)=>{
        //console.log("Ckecking login");
        if(is_logged_in==0){
          res.json({
            log: 0
          })
        }
        else{
          res.json({
            log: 1
          })
        }
      })
//-------------------------------------------------------------------

// Get Locations-
      app.post("/getLoc",async function(req,res){
        const lat=req.body.lat;
        const lon=req.body.lon;
        const agg = [
          {
            '$geoNear': {
              'near': {
                'type': 'Point', 
                'coordinates': [
                  lat,lon
                ]
              }, 
              'distanceField': 'distance',
              "distanceMultiplier" : 0.001,
              'maxDistance': 3000, 
              'spherical': false
            }
          }
        ];
        // console.log(agg);        
        // console.log(lat,lon);
        const coll = client.db('Main').collection('Resource Data');
        const cursor = coll.aggregate(agg);
        const result = await cursor.toArray();
        //console.log(result);
        res.json(result);
      })
//-------------------------------------------------------------------


// Get Locations-
app.post("/getLocWork", async (req, res) => {
  const lat = req.body.lat;
  const lon = req.body.lon;
  const agg = [
    {
      '$geoNear': {
        'near': {
          'type': 'Point', 
          'coordinates': [lat, lon]
        }, 
        'distanceField': 'distance', 
        'maxDistance': 5000, 
        'spherical': false
      }
    }
  ];

  const coll = client.db('Main').collection('Work Data');
  const cursor = coll.aggregate(agg);
  try {
    const result = await cursor.toArray();
    //console.log(result);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//-------------------------------------------------------------------


// Add Resources---------------------
      app.post("/sendCords",(req,res)=>{
        lat=req.body.lat;
        lon=req.body.lon;
      })
      app.get("/getCord",(req,res)=>{
        res.json({
          latC: lat,
          lonC: lon
        })
      })
      app.post("/sendData",async (req,res) => {
        let obj=req.body;
        const count=(await client.db("Main").collection("Resource Data").countDocuments())+1;
      
        obj = Object.assign({_id:count},obj) 
        create(client,obj,"Resource Data"); // Create Doc.
        //console.log("Data Created");
        res.json({
          log:1
        })
      })
// Add Wok data-
      app.post("/sendWorkData",async function(req,res){
        let obj=req.body;
        const count=(await client.db("Main").collection("Work Data").countDocuments())+1; // get next id and push it to object.
        obj = Object.assign({_id:count},obj)
        //console.log(obj);
        create(client,obj,"Work Data"); // Create Doc.
        //console.log("Data Created");
        res.json({
          log:1
        })
      })
//-------------------------------------------------------------------

  } //Dont touch.
//-------------------------------------------------------------------
    
  finally {
    //Ensures that the client will close when you finish/error
    //await client.close();
  }
}
  
run().catch(console.dir);
app.listen(5000,()=> {console.log("Server Started On Port 5000")});