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

// endpoint login

app.post('/login', async (req, res) => {
    const { usuario , password} = req.body
    let [filas] = await db.query(
        "select * from usuarios where usuario = ? and password = ?",
        [usuario, password]
    )
    if (filas.length == 0){
        res.send({"mensaje": "Usuario o contraseña incorrecta"})
    }
    else {
        res.send(filas)
    }
})

app.listen(PORT, ()=>{
    console.log('escuchando en http://localhost:'+ PORT)
})
