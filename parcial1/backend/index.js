const express = require('express')
const cors = require('cors')
const db = require("./db")
const bcrypt = require('bcryptjs')

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
    // no devolver passwords
    filas = filas.map(u => { delete u.password; return u })
    res.send(filas)
})

// endpoint para registro de usuarios
app.post('/usuarios', async (req, res)=>{
    const { nombre, usuario , password, rol } = req.body

    // hashear password
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    let [filas] = await db.query(
        "insert into usuarios (nombre, usuario, password, rol) values (?, ?, ?, ?)", 
        [nombre, usuario, hash, rol]
    )
    // devolver id insertado
    res.send({ id: filas.insertId })
})

// endpoints usuarios - CRUD
app.get('/usuarios/:id', async (req, res) => {
    const { id } = req.params
    let [filas] = await db.query('select * from usuarios where id = ?', [id])
    if (filas.length === 0) return res.status(404).send({ mensaje: 'Usuario no encontrado' })
    const usuario = filas[0]
    delete usuario.password
    res.send(usuario)
})

app.put('/usuarios/:id', async (req, res) => {
    const { id } = req.params
    const { nombre, usuario, password, rol } = req.body
    // si viene password, hashearla
    let hash = password
    if (password) {
        const salt = await bcrypt.genSalt(10)
        hash = await bcrypt.hash(password, salt)
    }
    let [result] = await db.query(
        'update usuarios set nombre = ?, usuario = ?, password = ?, rol = ? where id = ?',
        [nombre, usuario, hash, rol, id]
    )
    res.send(result)
})

app.delete('/usuarios/:id', async (req, res) => {
    const { id } = req.params
    let [result] = await db.query('delete from usuarios where id = ?', [id])
    res.send(result)
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
    let [filas]=await db.query ('select v.id, v.fecha , v.total , u.nombre from ventas v inner join usuarios u on(v.usuario_id = u.id);') 
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

// endpoint para crear una venta completa con items dentro de una transacción
// body: { usuario_id, items: [{ producto_id, cantidad, precio_unitario }, ...] }
app.post('/ventas/completa', async (req, res) => {
    const { usuario_id, items } = req.body
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).send({ mensaje: 'items es requerido y debe ser un array con al menos un elemento' })
    }

    // calcular total a partir de las líneas
    const total = items.reduce((acc, it) => acc + (Number(it.precio_unitario) * Number(it.cantidad)), 0)

    const conn = await db.getConnection()
    try {
        await conn.beginTransaction()

        // insertar venta y obtener id
        const [ventaResult] = await conn.query('insert into ventas (total, usuario_id) values (?, ?)', [total, usuario_id])
        const ventaId = ventaResult.insertId

        // por cada item: comprobar stock (con bloqueo), actualizar stock e insertar detalle
        for (const it of items) {
            const productoId = it.producto_id
            const cantidad = Number(it.cantidad)
            const precio_unitario = Number(it.precio_unitario)

            // seleccionar stock con bloqueo para evitar race conditions
            const [rows] = await conn.query('select stock from productos where id = ? for update', [productoId])
            if (rows.length === 0) throw new Error(`Producto ${productoId} no existe`)
            const stockActual = rows[0].stock
            if (stockActual < cantidad) throw new Error(`Stock insuficiente para producto ${productoId}`)

            // actualizar stock
            await conn.query('update productos set stock = stock - ? where id = ?', [cantidad, productoId])

            // insertar detalle
            await conn.query(
                'insert into detalle_venta (venta_id, producto_id, cantidad, precio_unitario) values (?, ?, ?, ?)',
                [ventaId, productoId, cantidad, precio_unitario]
            )
        }

        await conn.commit()
        res.send({ ventaId, total })
    } catch (err) {
        await conn.rollback()
        res.status(400).send({ mensaje: err.message })
    } finally {
        conn.release()
    }
})
// endpoint login

app.post('/login', async (req, res) => {
    const { usuario , password} = req.body
    let [filas] = await db.query(
        "select * from usuarios where usuario = ?",
        [usuario]
    )
    if (filas.length == 0){
        return res.status(401).send({"mensaje": "Usuario o contraseña incorrecta"})
    }
    const user = filas[0]
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).send({"mensaje": "Usuario o contraseña incorrecta"})
    delete user.password
    res.send(user)
})

// --- CRUD Productos adicionales ---
app.get('/productos/:id', async (req, res) => {
    const { id } = req.params
    let [filas] = await db.query('select * from productos where id = ?', [id])
    if (filas.length === 0) return res.status(404).send({ mensaje: 'Producto no encontrado' })
    res.send(filas[0])
})

app.put('/productos/:id', async (req, res) => {
    const { id } = req.params
    const { nombre, descripcion, precio, stock } = req.body
    let [result] = await db.query(
        'update productos set nombre = ?, descripcion = ?, precio = ?, stock = ? where id = ?',
        [nombre, descripcion, precio, stock, id]
    )
    res.send(result)
})

app.delete('/productos/:id', async (req, res) => {
    const { id } = req.params
    let [result] = await db.query('delete from productos where id = ?', [id])
    res.send(result)
})

// --- CRUD Ventas adicionales ---
app.get('/ventas/:id', async (req, res) => {
    const { id } = req.params
    let [filas] = await db.query('select * from ventas where id = ?', [id])
    if (filas.length === 0) return res.status(404).send({ mensaje: 'Venta no encontrada' })
    res.send(filas[0])
})

app.put('/ventas/:id', async (req, res) => {
    const { id } = req.params
    const { total, usuario_id } = req.body
    let [result] = await db.query('update ventas set total = ?, usuario_id = ? where id = ?', [total, usuario_id, id])
    res.send(result)
})

app.delete('/ventas/:id', async (req, res) => {
    const { id } = req.params
    // borrar primero detalle_venta asociado
    await db.query('delete from detalle_venta where venta_id = ?', [id])
    let [result] = await db.query('delete from ventas where id = ?', [id])
    res.send(result)
})

// --- CRUD detalle_venta ---
app.get('/detalle_venta', async (req, res) => {
    let [filas] = await db.query('select dv.id , p.nombre ,dv.cantidad, dv.precio_unitario from detalle_venta dv inner join productos p on(dv.producto_id = p.id)')
    res.send(filas)
})

app.get('/detalle_venta/:id_venta', async (req, res) => {
    const { id_venta } = req.params
    let [filas] = await db.query('select dv.id , p.nombre ,dv.cantidad, dv.precio_unitario from detalle_venta dv inner join productos p on(dv.producto_id = p.id) where dv.id_venta = ?', [id_venta])
    if (filas.length === 0) return res.status(404).send({ mensaje: 'Detalle no encontrado' })
    res.send(filas[0])
})

app.post('/detalle_venta', async (req, res) => {
    const { venta_id, producto_id, cantidad, precio_unitario } = req.body
    let [result] = await db.query(
        'insert into detalle_venta (venta_id, producto_id, cantidad, precio_unitario) values (?, ?, ?, ?)',
        [venta_id, producto_id, cantidad, precio_unitario]
    )
    res.send(result)
})

app.put('/detalle_venta/:id', async (req, res) => {
    const { id } = req.params
    const { venta_id, producto_id, cantidad, precio_unitario } = req.body
    let [result] = await db.query(
        'update detalle_venta set venta_id = ?, producto_id = ?, cantidad = ?, precio_unitario = ? where id = ?',
        [venta_id, producto_id, cantidad, precio_unitario, id]
    )
    res.send(result)
})

app.delete('/detalle_venta/:id', async (req, res) => {
    const { id } = req.params
    let [result] = await db.query('delete from detalle_venta where id = ?', [id])
    res.send(result)
})

// --- CRUD caja ---
app.get('/caja', async (req, res) => {
    let [filas] = await db.query('select * from caja')
    res.send(filas)
})

app.get('/caja/:id', async (req, res) => {
    const { id } = req.params
    let [filas] = await db.query('select * from caja where id = ?', [id])
    if (filas.length === 0) return res.status(404).send({ mensaje: 'Caja no encontrada' })
    res.send(filas[0])
})

app.post('/caja', async (req, res) => {
    const { fecha, apertura, cierre, usuario_id } = req.body
    let [result] = await db.query(
        'insert into caja (fecha, apertura, cierre, usuario_id) values (?, ?, ?, ?)',
        [fecha, apertura, cierre, usuario_id]
    )
    res.send(result)
})

app.put('/caja/:id', async (req, res) => {
    const { id } = req.params
    const { fecha, apertura, cierre, usuario_id } = req.body
    let [result] = await db.query(
        'update caja set fecha = ?, apertura = ?, cierre = ?, usuario_id = ? where id = ?',
        [fecha, apertura, cierre, usuario_id, id]
    )
    res.send(result)
})

app.delete('/caja/:id', async (req, res) => {
    const { id } = req.params
    // opcional: borrar movimientos asociados
    await db.query('delete from movimientos_caja where caja_id = ?', [id])
    let [result] = await db.query('delete from caja where id = ?', [id])
    res.send(result)
})

// --- CRUD movimientos_caja ---
app.get('/movimientos_caja', async (req, res) => {
    let [filas] = await db.query('select * from movimientos_caja')
    res.send(filas)
})

app.get('/movimientos_caja/:id', async (req, res) => {
    const { id } = req.params
    let [filas] = await db.query('select * from movimientos_caja where id = ?', [id])
    if (filas.length === 0) return res.status(404).send({ mensaje: 'Movimiento no encontrado' })
    res.send(filas[0])
})

app.post('/movimientos_caja', async (req, res) => {
    const { caja_id, descripcion, monto, tipo } = req.body
    let [result] = await db.query(
        'insert into movimientos_caja (caja_id, descripcion, monto, tipo) values (?, ?, ?, ?)',
        [caja_id, descripcion, monto, tipo]
    )
    res.send(result)
})

app.put('/movimientos_caja/:id', async (req, res) => {
    const { id } = req.params
    const { caja_id, descripcion, monto, tipo } = req.body
    let [result] = await db.query(
        'update movimientos_caja set caja_id = ?, descripcion = ?, monto = ?, tipo = ? where id = ?',
        [caja_id, descripcion, monto, tipo, id]
    )
    res.send(result)
})

app.delete('/movimientos_caja/:id', async (req, res) => {
    const { id } = req.params
    let [result] = await db.query('delete from movimientos_caja where id = ?', [id])
    res.send(result)
})

app.listen(PORT, ()=>{
    console.log('escuchando en http://localhost:'+ PORT)
})