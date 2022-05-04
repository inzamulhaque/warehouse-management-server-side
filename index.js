const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ftcfo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const itemCollection = client.db("assignment11").collection("items");

        // get six products for home page
        app.get("/sixProducts", async (req, res) => {
            const query = {};
            const cursor = itemCollection.find(query).sort({ quantity: -1 }).limit(6);
            const items = await cursor.toArray();
            res.send(items);
        });

        // get one sepical qty products
        app.get("/sepicalQtyOne", async (req, res) => {
            const query = {};
            const cursor = itemCollection.find(query).sort({ quantity: +1 }).limit(1);
            const items = await cursor.toArray();
            res.send(items);
        });

        // get one sepical qty products
        app.get("/sepicalQtyTwo", async (req, res) => {
            const query = {};
            const cursor = itemCollection.find(query).sort({ quantity: -1 }).limit(1);
            const items = await cursor.toArray();
            res.send(items);
        });

        // get one sepical price products
        app.get("/sepicalPrice", async (req, res) => {
            const query = {};
            const cursor = itemCollection.find(query).sort({ price: +1 }).limit(1);
            const items = await cursor.toArray();
            res.send(items);
        });

        // add item
        app.post("/additem", async (req, res) => {
            const item = req.body;
            const result = await itemCollection.insertOne(item);
            res.send(result);
        });
    } finally {

    }
}

run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("SERVER RUNNING");
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});