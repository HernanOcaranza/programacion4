const express = require('express')
const cors = require('cors')
const db = require("./db");

const PORT = 3000

const app = express()

app.use(cors())

//Endpoints
app.get('/', (req, res)=>{
    res.send('Parcial')
})

app.listen(PORT, ()=>{
    console.log('escuchando en http://localhost:'+ PORT)
})