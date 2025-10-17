// js/api.js - Todas las llamadas al servidor
export async function login(usuario, password){
    const res = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      usuario,
      password
    })
  });

  return res.json()
}

export async function getProductos() {
    const res = await fetch("http://localhost:3000/productos")
    
    return res.json()
}

export async function agregarProducto(nombre, descripcion, precio, stock) {
    const res = await fetch("http://localhost:3000/productos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nombre, 
      descripcion, 
      precio,
      stock
    })
  });
  // devolver todo el objeto respuesta para que el caller pueda inspeccionar status
  return res.json()
}

export async function actualizarProducto(id, nombre, descripcion, precio, stock){
  const res = await fetch(`http://localhost:3000/productos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, descripcion, precio, stock })
  })
  return res.json()
}

export async function borrarProducto(id){
  const res = await fetch(`http://localhost:3000/productos/${id}`, {
    method: 'DELETE'
  })
  return res.json()
}

// --- Ventas ---
export async function getVentas(){
  const res = await fetch("http://localhost:3000/ventas")
  return res.json()
}

export async function agregarVenta(total, usuario_id){
  const res = await fetch("http://localhost:3000/ventas", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ total, usuario_id })
  })
  return res.json()
}

// crear venta completa (transaccional) con items
export async function agregarVentaCompleta(usuario_id, items){
  const res = await fetch('http://localhost:3000/ventas/completa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id, items })
  })
  return res.json()
}

// detalle_venta
export async function agregarDetalleVenta(venta_id, producto_id, cantidad, precio_unitario){
  const res = await fetch("http://localhost:3000/detalle_venta", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ venta_id, producto_id, cantidad, precio_unitario })
  })
  return res.json()
}

export async function getDetalleVenta(){
  const res = await fetch('http://localhost:3000/detalle_venta')
  return res.json()
}

// obtener detalle de una venta específica
export async function getDetalleVentaPorVenta(id_venta){
  const res = await fetch(`http://localhost:3000/detalle_venta/${id_venta}`)
  return res.json()
}

// --- Caja y movimientos ---
export async function getCajas(){
  const res = await fetch('http://localhost:3000/caja')
  return res.json()
}

export async function abrirCaja(fecha, apertura, cierre, usuario_id){
  const res = await fetch('http://localhost:3000/caja', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fecha, apertura, cierre, usuario_id })
  })
  return res.json()
}

export async function cerrarCaja(id, fecha, apertura, cierre, usuario_id){
  const res = await fetch(`http://localhost:3000/caja/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fecha, apertura, cierre, usuario_id })
  })
  return res.json()
}

export async function getMovimientosCaja(){
  const res = await fetch('http://localhost:3000/movimientos_caja')
  return res.json()
}

export async function agregarMovimientoCaja(caja_id, descripcion, monto, tipo){
  const res = await fetch('http://localhost:3000/movimientos_caja', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caja_id, descripcion, monto, tipo })
  })
  return res.json()
}

// --- Usuarios (básico) ---
export async function getUsuarios(){
  const res = await fetch('http://localhost:3000/usuarios')
  return res.json()
}

export async function agregarUsuario(nombre, usuario, password, rol){
  const res = await fetch('http://localhost:3000/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, usuario, password, rol })
  })
  return res.json()
}
