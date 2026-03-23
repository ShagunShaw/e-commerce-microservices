import express from 'express';

const app= express()

app.use(express.json())

app.use('/', (req, res, next) => {
    return res.status(200)
              .json({"mssg": "hello from products"})
})

app.listen(8002, () => {
    console.log("Products is listening on port 8002")
})