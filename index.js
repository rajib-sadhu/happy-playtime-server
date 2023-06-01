require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

const port = process.env.PORT || 5000;

const { MongoClient, ObjectId } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USERNAME, process.env.DB_PASSWORD)





var uri = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@ac-kodbbia-shard-00-00.6iqnpnz.mongodb.net:27017,ac-kodbbia-shard-00-01.6iqnpnz.mongodb.net:27017,ac-kodbbia-shard-00-02.6iqnpnz.mongodb.net:27017/?ssl=true&replicaSet=atlas-12qn8w-shard-0&authSource=admin&retryWrites=true&w=majority`;




// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        // version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();

        const toyConnection = client.db('happyPlaytime').collection('allToys');

        // All Toys
        app.get('/allToys', async (req, res) => {
            const cursor = toyConnection.find();
            const result = await cursor.limit(20).toArray();
            res.send(result)
        });

        app.get('/allToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const toy = await toyConnection.findOne(query);
            res.send(toy)
        });

        app.get('/allToys/category', async (req, res) => {

            console.log(req.query)

            let query = {};

            if (req.query?.category) {
                query = { subCategory: req.query.category };
                console.log(query)
            };

            const result = await toyConnection.find(query).toArray();
            res.send(result)
        });

        app.post('/allToys', async (req, res) => {

            const addedToy = req.body;
            console.log(addedToy);
            const result = await toyConnection.insertOne(addedToy);
            res.send(result)

        });


        // My Toys
        app.get('/myToys/:sort', async (req, res) => {

            // console.log(req.query)
            const sorting = req.params.sort ;

            let sortData = 1

            if(sorting==='A'){
                sortData = 1;
            }
            else{
                sortData = -1
            }
            // console.log(sorting)


            let query = {};
            if (req.query?.email) {
                query = { sellerEmail: req.query.email };
            }
            const result = await toyConnection.find(query).sort({ "price": sortData }).toArray();
            res.send(result)
        });

        // app.get('/myToys/:id', async (req, res) => {

        //     const id = req.params.id;
        //     console.log(id)
        //     const query = { _id: new ObjectId(id) };
        //     const toy = await toyConnection.findOne(query);
        //     res.send(toy)
        // });

        app.delete('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: new ObjectId(id) };
            const result = await toyConnection.deleteOne(query);
            res.send(result)
        });

        app.put('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const toy = req.body;
            console.log(toy, "id:", id);



            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateToy = {
                $set: {
                    name: toy?.name,
                    description: toy?.description,
                    price: toy?.price,
                    image: toy?.image,
                    availableQuantity: toy?.availableQuantity
                }
            };

            const result = await toyConnection.updateOne(filter, updateToy, options);
            res.send(result)

        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('happy playtime serve is running.....');
});



app.listen(port, () => {
    console.log(`HappyPlaytime server running on PORT: ${port}`)
});

