const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
    const authHeaders = req.headers.authorization;
    if (!authHeaders) {
        return res.status(401).send({ message: "unauthorized access" });
    }

    const getToken = authHeaders.split(" ")[1];

    jwt.verify(getToken, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "forbidden access" });
        }
        req.decoded = decoded;
        next();
    });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ftcfo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const itemCollection = client.db("assignment11").collection("items");
        const orderCollection = client.db("assignment11").collection("order");

        // auth token
        app.post("/signin", (req, res) => {
            const email = req.body;
            const jotToken = jwt.sign(email, process.env.JWT_KEY, {
                expiresIn: "3d"
            });
            res.send({ jotToken });
        });

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
        app.get("/myitems", verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const { email } = req.query;
            if (email === decodedEmail) {
                const query = { email };
                const cursor = itemCollection.find(query);
                const items = await cursor.toArray();
                res.send(items);
            } else {
                return res.status(403).send({ message: "forbidden access" });
            }
        });

        // add item
        app.post("/additem", async (req, res) => {
            const item = req.body;
            const result = await itemCollection.insertOne(item);
            res.send(result);
        });

        // add orders
        app.post("/addorders", async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        });

        // get orders
        app.get("/getorders", async (req, res) => {
            const query = {};
            const cursor = orderCollection.find(query)
            const orders = await cursor.toArray();
            res.send(orders);
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