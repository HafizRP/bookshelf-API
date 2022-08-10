import express from "express";
import fs, { read } from "fs";
import { body, check, validationResult } from "express-validator";
import { nanoid } from "nanoid";

const db = JSON.parse(fs.readFileSync("./books.json", "utf-8"));
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/books", async (req, res) => {
    try {
        res.send({ status: "success", data: db });
    } catch (error) {
        res.status(400).send({ status: "failed", data: "Server error" });
    }
});

app.get('/books/:bookId', (req, res) => {
    const data = db.find(val => val.id === req.params.bookId)

    if (!data) return res.status(404).send({ status: "failed", message: "book not found" })
    else res.send({
        status: 'success', data: {
            book: data
        }
    })
})


function checkNewBooks(req, res, next) {
    if (req.body.name === null || req.body.name === '') return res.status(400).send({ status: "failed", data: "name has to defined!" })
    if (req.body.readPage > req.body.pageCount) return res.status(400).send({ status: "failed", data: "Read page has to lower than Page Count!" })
    next()
}

app.post(
    "/books",
    checkNewBooks,
    async (req, res) => {
        const {
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            reading,
        } = req.body;
        try {
            const data = {
                id: nanoid(),
                name: name || null,
                year: year || null,
                author: author || null,
                summary: summary || null,
                publisher: publisher || null,
                pageCount: pageCount || null,
                readPage: readPage || 0,
                reading: reading || false,
                finished: pageCount === readPage,
                insertedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            db.push(data);
            fs.writeFileSync("books.json", JSON.stringify(db, null, 4));

            res.status(201).send({ status: "success", data: { bookId: data.id } });
        } catch (error) {
            res.status(500).send({ status: "failed", reason: "Server error" });
        }
    }
);

app.put('/books/:bookId', checkNewBooks, async (req, res) => {
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = req.body;
    try {
        const data = db.find(val => val.id === req.params.bookId)

        if (!data) return res.status(404).send({ status: 'fail', message: 'book not found' })

        Object.assign(data, { name: name, year: year, author: author, summary: summary, publisher: publisher, pageCount: pageCount, readPage: readPage, reading: reading, updatedAt: new Date().toISOString() })

        fs.writeFileSync('books.json', JSON.stringify(db, null, 4))

        res.status(200).send({ status: "success", message: "book edit successfull" })
    } catch (error) {
        res.status(500).send({ status: "failed", message: "server error" })
    }
})

app.delete('/books/:bookId', (req, res) => {
    try {
        const data = db.findIndex(val => val.id === req.params.bookId)

        if (data === -1) return res.status(404).send({ status: "failed", message: "book not found" })

        db.splice(data, 1)

        fs.writeFileSync('books.json', JSON.stringify(db, null, 4))

        res.status(200).send({ status: 'success', message: "book successfullt deleted!" })
    } catch (error) {
        res.status(500).send({ status: "failed", message: "server error" })
    }



})

app.listen(5000, () => {
    console.log("Server was open in port 5000!");
});
