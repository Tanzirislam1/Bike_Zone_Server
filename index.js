const express = require('express');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());

/* mongoDb database connection with server */

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z4aagjz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

/* connect to the client useing async function */
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   console.log('connect with db');
//   // perform actions on the collection object
//   client.close();
// });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('productManagement').collection('product');
        console.log('connect db');

        /* read data */
        app.get('/products', async (req, res) => {
            const query = req.query;
            // console.log(query);
            const cursor = productCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        /* get single data */
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productCollection.findOne(query);
            res.send(result);
        })

        /* post data useing insertOne() (create data in database/ send data in database) */
        app.post('/product', async (req, res) => {
            const data = req.body;
            const result = await productCollection.insertOne(data);
            res.send(result);
        })

        /* delete single data */
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        });

        /* update data */
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    ...data
                },
            };
            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })
    }

    finally {
        // client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('hello world');
})

app.listen(port, () => {
    console.log('Listening to the port', port);
});