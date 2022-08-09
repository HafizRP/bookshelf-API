import express from "express"
import fs from 'fs'
import { body, check, validationResult } from 'express-validator'

const db = JSON.parse(fs.readFileSync('./books.json', 'utf-8'))
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', async (req, res) => {
    try {
        res.send({ status: "success", data: db })
    } catch (error) {
        res.status(400).send({ status: "failed", data: [] })
    }
})

app.post('/books', body('name').custom(value => {
    if (value === null || value === '') return Promise.reject("name has to defined!")
    else return Promise.resolve()
}), async (req, res) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) return res.status(400).send({ status: "failed", data: errors })

        const { name, year, author, summary, publisher, pageCount, readPage, reading } = req.body
        const data = { name: name, year: year, author: author, summary: summary, publisher: publisher, pageCount: pageCount, readPage: readPage, reading: reading }

        db.push(data)

        fs.writeFileSync('books.json', JSON.stringify(db, null, 4))
        res.status(201).send({ status: "success" })
    } catch (error) {
        res.status(500).send({ status: 'failed', reason: "Server error" })
    }
})


app.listen(5000, () => {
    console.log("Server was open in port 5000!")
})
