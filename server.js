require('dotenv').config()

const express = require('express'),
{ MongoClient, ObjectId } = require('mongodb'),
app = express()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.PASS}@${process.env.HOST}/?retryWrites=true&w=majority`
console.log('uri:', uri)
const client = new MongoClient(uri)

let collection = null

async function connect() {
    await client.connect()
    collection = await client.db("readingtracker").collection("books")
}

connect()

app.use( express.static( 'public') )
app.use( express.json() )

app.use((req, res, next) => {
    if (collection !== null) {
        next()
    } else {
        res.status(503).send()
    }
})

app.get('/data', async (req, res) => {
    const books = await collection.find({}).toArray()
    res.json(books)
})

app.post('/submit', async (req, res) => {
    const newBook = req.body

    newBook.percentComplete = Math.round(
        (newBook.pagesRead / newBook.totalPages) * 100
    )

    const result = await collection.insertOne(newBook)

    res.json(result)
})

app.post('/delete', async (req, res) => {
    const result = await collection.deleteOne({
        _id: new ObjectId(req.body._id)
    })

    res.json(result)
})

app.post('/update', async (req, res) => {
    const result = await collection.updateOne(
        { _id: new ObjectId(req.body._id) },
        {
            $set: {
                book: req.body.book,
                author: req.body.author,
                pagesRead: req.body.pagesRead,
                totalPages: req.body.totalPages,
                percentComplete: Math.round(
                    (req.body.pagesRead / req.body.totalPages) * 100
                )
            }
        }
    )

    res.json(result)
})

app.listen(process.env.PORT || 3000)