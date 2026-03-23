import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';

const app= express()

app.use(cors())
app.use(express.json())

app.use("/", (req, res, next) => {
    console.log("Health Check, OK!!!")
})

app.use("/customer", proxy('http://localhost:3001'))
app.use("/shopping", proxy('http://localhost:3003'))
app.use("/products", proxy('http://localhost:3002'))

app.listen(8000, () => {
    console.log("API Gateway is listening on port 8000")
})