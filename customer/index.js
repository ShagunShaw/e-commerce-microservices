import express from 'express';

const app= express()

app.use(express.json())

app.use('/', (req, res, next) => {
    return res.status(200)
              .json({"mssg": "hello from customer"})
})

app.listen(8001, () => {
    console.log("Customer is listening on port 8001")
})