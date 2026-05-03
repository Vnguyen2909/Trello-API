import express from "express"

const app = express()

const hostname = 'localhost'

const port = 8025

app.get('/', function(req, res) {
    res.send('Hello Nguyenv2909')
})

app.listen(port, hostname, ()=> {
    console.log(`Hello Nguyenv2909, I'm running sever at http://${hostname}:${port}/`)
})