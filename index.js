const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        // get items
        app.get("/items", async (req, res) => {
            const pageNum = parseInt(req.query.pageNum);
            const itemsNum = parseInt(req.query.itemsNum);
            const query = {};
            const cursor = itemCollection.find(query);
            let items;
            if (pageNum || itemsNum) {
                items = await cursor.skip(pageNum * itemsNum).limit(itemsNum).toArray();
            } else {
                items = await cursor.toArray();
            }
            res.send(items);
        });

        // get one item
        app.get("/item/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await itemCollection.findOne(query);
            res.send(item);
        });

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

        // count items
        app.get("/itemscount", async (req, res) => {
            const count = await itemCollection.estimatedDocumentCount();
            res.json(count);
        });

        // get my items
        app.get("/myitems", async (req, res) => {
            const { email } = req.query;
            const query = { email };
            const cursor = itemCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        // add item
        app.post("/additem", async (req, res) => {
            const item = req.body;
            const result = await itemCollection.insertOne(item);
            res.send(result);
        });

        // update item 
        app.put("/update/:id", async (req, res) => {
            const id = req.params.id;
            const { email, name, sname, price, quantity, image, description } = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: { email, name, sname, price, quantity, image, description }
            };
            const result = await itemCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

        // delete item
        app.delete("/deleteitem/:id", async (req, res) => {
            const { id } = req.params;
            const query = { _id: ObjectId(id) };
            const result = await itemCollection.deleteOne(query);
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