const express = require('express')
const cors = require('cors')
const db = require("./db")

const PORT = 3000

const app = express()

app.use(express.json())
app.use(cors())

//Endpoints
app.get('/', (req, res)=>{
    res.send("Parcial")
})

// endpoint para listar los usuarios
app.get('/usuarios', async (req, res)=>{
    let [filas] = await db.query('select * from usuarios;')
    res.send(filas)
})

// endpoint para registro de usuarios
app.post('/usuarios', async (req, res)=>{
    const { nombre, usuario , password, rol } = req.body

    let [filas] = await db.query(
        "insert into usuarios (nombre, usuario, password, rol) values (?, ?, ?, ?)", 
        [nombre, usuario, password, rol]
    )
    res.send(filas)
})

//endpoint para listar productos
app.get('/productos', async (req, res) =>{
    let [filas] = await db.query('select * from productos')
    res.send(filas)

})

//endpoint para agregar productos
app.post('/productos', async (req, res) => {
    const { nombre, descripcion, precio, stock } =req.body

    let [filas] = await db.query(
        "insert into productos (nombre, descripcion, precio, stock) values (?, ?, ?, ?)",
        [nombre, descripcion, precio, stock]
    )
    res.send(filas)

})

//endpoint para listar ventas
app.get('/ventas', async (req, res) => {
    let [filas]=await db.query ('select * from ventas') 
    res.send(filas)
})

//endpoint para agregar ventas
app.post('/ventas', async (req, res) => {
    const { total, usuario_id}=req.body

    let [result] =await db.query(
        "insert into ventas (total, usuario_id) values (?,?)",
        [total, usuario_id]
    )
    res.send(result)
})

app.listen(PORT, ()=>{
    console.log('escuchando en http://localhost:'+ PORT)
})