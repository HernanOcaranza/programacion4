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
        // buscar caja abierta
        const [caja] = await conn.query(`
            select id, apertura from caja
            where cierre is null
            limit 1
        `);

        if (caja.length === 0) throw new Error('No hay caja abierta');

        const cajaId = caja[0].id;

        // registrar ingreso en caja
        await conn.query(`
            insert into movimientos_caja (caja_id, descripcion, monto, tipo)
            values (?, ?, ?, 'entrada')
        `, [cajaId, 'Venta realizada', total]);

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





app.get('/detalle_venta/:id_venta', async (req, res) => {
    const { id_venta } = req.params
    let [filas] = await db.query('select dv.id , p.nombre ,dv.cantidad, dv.precio_unitario from detalle_venta dv inner join productos p on(dv.producto_id = p.id) where dv.venta_id = ?', [id_venta])
    if (filas.length === 0) return res.status(404).send({ mensaje: 'Detalle no encontrado' })
    res.send(filas[0])
})




// ------------------------------
// ENDPOINTS DE CAJA
// ------------------------------

// ✅ Abrir caja
app.post('/caja/abrir', async (req, res) => {
    const { apertura, usuario_id } = req.body;

    if (!apertura || !usuario_id)
        return res.status(400).send({ mensaje: 'Faltan datos: apertura o usuario_id' });

    // Buscar si ya hay una caja abierta
    let [abierta] = await db.query(
        'SELECT id FROM caja WHERE cierre IS NULL'
    );

    if (abierta.length > 0)
        return res.status(409).send({ mensaje: 'Ya hay una caja abierta' });

    let [result] = await db.query(
        'INSERT INTO caja (fecha, apertura, usuario_id) VALUES (CURDATE(), ?, ?)',
        [apertura, usuario_id]
    );

    res.send({ mensaje: 'Caja abierta correctamente', caja_id: result.insertId });
});


// ✅ Obtener caja abierta
app.get('/caja/abierta', async (req, res) => {
    const [caja] = await db.query(
        `SELECT *,
        (apertura 
         + COALESCE((SELECT SUM(monto) FROM movimientos_caja WHERE caja_id = c.id AND tipo='entrada'), 0)
         - COALESCE((SELECT SUM(monto) FROM movimientos_caja WHERE caja_id = c.id AND tipo='salida'), 0)
        ) AS saldo_esperado
        FROM caja c
        WHERE cierre IS NULL
        LIMIT 1`
    );

    if (caja.length === 0)
        return res.status(404).send({ mensaje: 'No hay caja abierta' });

    res.send(caja[0]);
});


// ✅ Agregar movimiento a la caja abierta
app.post('/caja/movimientos', async (req, res) => {
    const { descripcion, monto, tipo } = req.body;

    if (!monto || !tipo)
        return res.status(400).send({ mensaje: 'Faltan monto o tipo' });

    if (!['entrada', 'salida'].includes(tipo))
        return res.status(400).send({ mensaje: 'Tipo inválido: entrada o salida' });

    let [caja] = await db.query('SELECT id FROM caja WHERE cierre IS NULL LIMIT 1');
    if (caja.length === 0)
        return res.status(404).send({ mensaje: 'No hay caja abierta' });

    const caja_id = caja[0].id;

    let [result] = await db.query(
        'INSERT INTO movimientos_caja (caja_id, descripcion, monto, tipo) VALUES (?, ?, ?, ?)',
        [caja_id, descripcion || '', monto, tipo]
    );

    res.send({ mensaje: 'Movimiento registrado', id: result.insertId });
});


// ✅ Obtener movimientos de la caja abierta
app.get('/caja/movimientos', async (req, res) => {
    let [caja] = await db.query('SELECT id FROM caja WHERE cierre IS NULL LIMIT 1');
    if (caja.length === 0)
        return res.status(404).send({ mensaje: 'No hay caja abierta' });

    let [filas] = await db.query(
        'SELECT * FROM movimientos_caja WHERE caja_id = ? ORDER BY fecha ASC',
        [caja[0].id]
    );

    res.send(filas);
});


// ✅ Cerrar caja
app.post('/caja/cerrar', async (req, res) => {
    const { cierre_real } = req.body;

    if (!cierre_real)
        return res.status(400).send({ mensaje: 'Falta el monto final contado (cierre_real)' });

    // Obtener totales
    const [[caja]] = await db.query(
        `SELECT id, apertura,
        (apertura 
         + COALESCE((SELECT SUM(monto) FROM movimientos_caja WHERE caja_id = c.id AND tipo='entrada'), 0)
         - COALESCE((SELECT SUM(monto) FROM movimientos_caja WHERE caja_id = c.id AND tipo='salida'), 0)
        ) AS saldo_esperado
        FROM caja c
        WHERE cierre IS NULL
        LIMIT 1`
    );

    if (!caja) return res.status(404).send({ mensaje: 'No hay caja abierta' });

    const diferencia = cierre_real - caja.saldo_esperado;

    // Actualizar cierre
    await db.query("UPDATE caja SET cierre = ? WHERE id = ?", [cierre_real, caja.id]);

    res.send({
        mensaje: 'Caja cerrada correctamente',
        esperado: caja.saldo_esperado,
        real: cierre_real,
        diferencia
    });
});


// ✅ Resumen de caja abierta
app.get('/caja/resumen', async (req, res) => {
    // Buscar caja abierta
    let [caja] = await db.query(`
        SELECT id, fecha, apertura
        FROM caja
        WHERE cierre IS NULL
        LIMIT 1
    `);

    if (caja.length === 0)
        return res.status(404).send({ mensaje: 'No hay caja abierta' });

    const cajaId = caja[0].id;

    // Totales
    const [[ingresos]] = await db.query(`
        SELECT COALESCE(SUM(monto), 0) AS total_ingresos
        FROM movimientos_caja
        WHERE caja_id = ? AND tipo = 'entrada'
    `, [cajaId]);

    const [[egresos]] = await db.query(`
        SELECT COALESCE(SUM(monto), 0) AS total_egresos
        FROM movimientos_caja
        WHERE caja_id = ? AND tipo = 'salida'
    `, [cajaId]);

    const saldo = Number(caja[0].apertura) + Number(ingresos.total_ingresos) - Number(egresos.total_egresos);

    res.send({
        fecha: caja[0].fecha,
        apertura: caja[0].apertura,
        total_ingresos: ingresos.total_ingresos,
        total_egresos: egresos.total_egresos,
        saldo_esperado: saldo
    });
});

// ✅ Consultar caja por ID (histórico)
app.get('/caja/:id', async (req, res) => {
    const { id } = req.params;

    const [caja] = await db.query(
        `SELECT *,
        (apertura 
         + COALESCE((SELECT SUM(monto) FROM movimientos_caja WHERE caja_id = c.id AND tipo='entrada'), 0)
         - COALESCE((SELECT SUM(monto) FROM movimientos_caja WHERE caja_id = c.id AND tipo='salida'), 0)
        ) AS saldo_esperado
        FROM caja c
        WHERE c.id = ?`,
        [id]
    );

    if (caja.length === 0)
        return res.status(404).send({ mensaje: 'Caja no encontrada' });

    res.send(caja[0]);
});

// ------------------------------
// ENDPOINTS DE REPORTES
// ------------------------------

// ✅ Reporte de productos con stock bajo
app.get('/reportes/stock', async (req, res) => {
    const { limite = 20 } = req.query; // Por defecto, stock <= 5
    
    try {
        const [productos] = await db.query(`
            SELECT id, nombre, descripcion, precio, stock, creado_en
            FROM productos 
            WHERE stock <= ?
            ORDER BY stock ASC, nombre ASC
        `, [limite]);

        const [totalProductos] = await db.query(`
            SELECT COUNT(*) as total FROM productos
        `);

        const [productosBajoStock] = await db.query(`
            SELECT COUNT(*) as cantidad FROM productos WHERE stock <= ?
        `, [limite]);

        res.send({
            limite_stock: Number(limite),
            total_productos: totalProductos[0].total,
            productos_bajo_stock: productosBajoStock[0].cantidad,
            productos: productos,
            fecha_reporte: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).send({ mensaje: 'Error al generar el reporte', error: error.message });
    }
});


app.listen(PORT, ()=>{
    console.log('escuchando en http://localhost:'+ PORT)
})