// js/pages/caja.js - Lógica de caja conectada al backend
import { getCajas, abrirCaja, cerrarCaja, getMovimientosCaja, agregarMovimientoCaja } from "../api.js"

// Manejar apertura de caja: toma el monto inicial y crea una caja nueva
async function handleAperturaCaja(){
    const montoInicial = document.getElementById('montoInicial')?.value || 0
    // crear una caja con fecha hoy
    const fecha = new Date().toISOString().slice(0,10)
    const res = await abrirCaja(fecha, parseFloat(montoInicial), 0, 1) // usuario_id hardcodeado 1 por simplicidad
    if (res && (res.insertId || res.id)) {
        alert('Apertura registrada')
    } else if (res && res.mensaje) {
        alert('Error: ' + res.mensaje)
    } else {
        alert('Apertura registrada')
    }
}

// Manejar cierre de caja: para este ejemplo buscamos la última caja y actualizamos cierre
async function handleCierreCaja(){
    // obtener cajas y tomar la última
    const cajas = await getCajas()
    if (!cajas || cajas.length === 0) {
        alert('No hay cajas abiertas')
        return
    }
    const ultima = cajas[cajas.length - 1]
    const fecha = ultima.fecha || new Date().toISOString().slice(0,10)
    // asumir cierre como total recaudado (mock) - aquí solo ponemos un número de ejemplo o 0
    const cierre = parseFloat(ultima.apertura || 0) + 0
    const res = await cerrarCaja(ultima.id, fecha, ultima.apertura, cierre, ultima.usuario_id || 1)
    if (res && (res.affectedRows !== undefined || res.changedRows !== undefined)) {
        alert('Cierre de caja registrado')
    } else if (res && res.mensaje) {
        alert('Error: ' + res.mensaje)
    } else {
        alert('Cierre de caja registrado')
    }
}

// Cargar y mostrar movimientos de caja
async function handleMovimientosCaja(){
    const movimientos = await getMovimientosCaja()
    const tabla = document.getElementById('movdecaja')
    if (!tabla) return
    const tbody = tabla.querySelector('tbody')
    tbody.innerHTML = ''
    if (!movimientos || movimientos.length === 0){
        tbody.innerHTML = '<tr><td colspan="4">No hay movimientos</td></tr>'
        return
    }
    movimientos.forEach(m => {
        const tr = document.createElement('tr')
        const fecha = m.fecha || ''
        tr.innerHTML = `
            <td>${fecha}</td>
            <td>${m.descripcion}</td>
            <td>${m.tipo}</td>
            <td>${m.monto}</td>
        `
        tbody.appendChild(tr)
    })
}

// Permitir agregar un movimiento simple (si existe un formulario o botón se puede usar)
async function handleAgregarMovimiento(caja_id, descripcion, monto, tipo){
    const res = await agregarMovimientoCaja(caja_id, descripcion, monto, tipo)
    return res
}

// Event delegation para manejar clicks en elementos de caja
document.addEventListener('click', (e) => {
    switch(e.target.id) {
        case 'botonApertura':
            handleAperturaCaja();
            break;
        case 'botonCierre':
            handleCierreCaja();
            break;
        case 'botonMovimientos':
            handleMovimientosCaja();
            break;
    }
});

// Cargar movimientos automáticamente si la página tiene la tabla al entrar
setTimeout(() => {
    if (document.getElementById('movdecaja')) {
        handleMovimientosCaja()
    }
}, 100);

