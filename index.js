const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors())
app.use(express.json())


// run function and api's


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.irfuj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const billingCollection = client.db('powerhack-billing').collection('billinglist');

        // get all billing list
        app.get('/billing-list', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            // console.log(page, size);
            const query = {};
            let billinglist;
            if (page || size) {
                billinglist = await billingCollection.find(query).skip(page * size).limit(size).toArray();
            } else {
                billinglist = await billingCollection.find(query).toArray();
            }
            // const billinglist = await billingCollection.find(query).toArray();
            res.send(billinglist);
        })
        // add billing data
        app.post('/add-billing', async (req, res) => {
            const billingData = req.body;
            const doc = billingData;
            const result = await billingCollection.insertOne(doc);
            res.send(result)
        })
        // update single data
        app.patch('/update-billing/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updatedBill = req.body;
            const updateDoc = {
                $set: updatedBill
            };
            const result = await billingCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        // delete data
        app.delete('/delete-billing/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await billingCollection.deleteOne(query);
            res.send(result);
        })
        // pagination
        app.get('/productCount', async (req, res) => {
            const count = await billingCollection.estimatedDocumentCount();
            res.send({ count })
        })


    } finally {

    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Hello Power!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})