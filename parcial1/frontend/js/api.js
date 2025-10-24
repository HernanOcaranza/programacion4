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


// crear venta completa (transaccional) con items
export async function agregarVentaCompleta(usuario_id, items){
  const res = await fetch('http://localhost:3000/ventas/completa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id, items })
  })
  return res.json()
}


// obtener detalle de una venta específica
export async function getDetalleVentaPorVenta(id_venta){
  const res = await fetch(`http://localhost:3000/detalle_venta/${id_venta}`)
  return res.json()
}

// --- Caja y movimientos ---

// Abrir caja
export async function abrirCaja(apertura, usuario_id){
  const res = await fetch('http://localhost:3000/caja/abrir', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apertura, usuario_id })
  })
  return res.json()
}

// Obtener caja abierta
export async function getCajaAbierta(){
  const res = await fetch('http://localhost:3000/caja/abierta')
  return res.json()
}


// Obtener movimientos de la caja abierta
export async function getMovimientosCaja(){
  const res = await fetch('http://localhost:3000/caja/movimientos')
  return res.json()
}

// Cerrar caja
export async function cerrarCaja(cierre_real){
  const res = await fetch('http://localhost:3000/caja/cerrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cierre_real })
  })
  return res.json()
}


// Obtener resumen de caja abierta
export async function getResumenCaja(){
  const res = await fetch('http://localhost:3000/caja/resumen')
  return res.json()
}

// --- Reportes ---
export async function getReportesStock(limite = 20){
  const res = await fetch(`http://localhost:3000/reportes/stock?limite=${limite}`)
  return res.json()
}

