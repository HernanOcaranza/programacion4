// js/pages/ventas.js - Lógica de ventas conectada al backend
import { getProductos, agregarVentaCompleta, getDetalleVentaPorVenta } from "../api.js"
import { getVentas } from "../api.js"

// Cargar productos en un datalist o sugerencia para el input producto
async function popularProductos(){
    const productos = await getProductos()
    const select = document.getElementById('producto')
    if (!select) return
    select.innerHTML = '<option value="">-- Seleccione un producto --</option>'
    productos.forEach(p => {
        const opt = document.createElement('option')
        opt.value = p.id
        opt.textContent = `${p.nombre} - $${p.precio} (stock: ${p.stock})`
        opt.dataset.precio = p.precio
        select.appendChild(opt)
    })
    select.dataset.productos = JSON.stringify(productos || [])
}


// Inicializar
setTimeout(() => {
    if (document.getElementById('producto')) {
        popularProductos()
    }
}, 100);

let productosCache = []

async function cargarProductosCache(){
    productosCache = await getProductos() || []
}

function crearFilaItem(){
    const tbody = document.getElementById('itemsBody')
    const tr = document.createElement('tr')

    const tdProd = document.createElement('td')
    const sel = document.createElement('select')
    sel.className = 'item-producto'
    sel.innerHTML = '<option value="">-- Seleccione --</option>'
    productosCache.forEach(p => {
        const o = document.createElement('option')
        o.value = p.id
        o.textContent = `${p.nombre} (stock: ${p.stock})`
        o.dataset.precio = p.precio
        sel.appendChild(o)
    })
    tdProd.appendChild(sel)

    const tdCant = document.createElement('td')
    const inpCant = document.createElement('input')
    inpCant.type = 'number'
    inpCant.min = '1'
    inpCant.value = '1'
    inpCant.className = 'item-cantidad'
    tdCant.appendChild(inpCant)

    const tdPrecio = document.createElement('td')
    const inpPrecio = document.createElement('input')
    inpPrecio.type = 'number'
    inpPrecio.min = '0.01'
    inpPrecio.step = '0.01'
    inpPrecio.className = 'item-precio'
    tdPrecio.appendChild(inpPrecio)

    const tdAcc = document.createElement('td')
    const btnDel = document.createElement('button')
    btnDel.type = 'button'
    btnDel.textContent = '🗑️'
    btnDel.title = 'Eliminar'
    tdAcc.appendChild(btnDel)

    tr.appendChild(tdProd)
    tr.appendChild(tdCant)
    tr.appendChild(tdPrecio)
    tr.appendChild(tdAcc)
    tbody.appendChild(tr)

    sel.addEventListener('change', (e) => {
        const precio = e.target.selectedOptions[0]?.dataset?.precio || ''
        if (precio) inpPrecio.value = precio
        recalcularTotal()
    })

    inpCant.addEventListener('input', recalcularTotal)
    inpPrecio.addEventListener('input', recalcularTotal)
    btnDel.addEventListener('click', () => { tr.remove(); recalcularTotal() })

    return tr
}

function recalcularTotal(){
    const filas = Array.from(document.querySelectorAll('#itemsBody tr'))
    let total = 0
    filas.forEach(f => {
        const cant = parseFloat(f.querySelector('.item-cantidad')?.value || 0)
        const precio = parseFloat(f.querySelector('.item-precio')?.value || 0)
        total += cant * precio
    })
    document.getElementById('totalVenta').textContent = total.toFixed(2)
}

document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'btnAgregarItem'){
        crearFilaItem()
    }
})

document.addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'formVenta'){
        e.preventDefault()
        const filas = Array.from(document.querySelectorAll('#itemsBody tr'))
        const items = []
        for (const f of filas){
            const productoId = Number(f.querySelector('.item-producto')?.value || 0)
            const cantidad = Number(f.querySelector('.item-cantidad')?.value || 0)
            const precio_unitario = Number(f.querySelector('.item-precio')?.value || 0)
            if (!productoId || !cantidad || !precio_unitario) continue
            items.push({ producto_id: productoId, cantidad, precio_unitario })
        }
        if (items.length === 0){ alert('Agrega al menos un item válido'); return }

        try {
            const res = await agregarVentaCompleta(1, items)
            
            if (res && res.ventaId) {
            alert(`Venta creada exitosamente!\n\nID: ${res.ventaId}\nTotal: $${res.total}`)
            document.getElementById('itemsBody').innerHTML = ''
            recalcularTotal()
            } else if (res && res.mensaje) {
                alert(`Error: ${res.mensaje}`)
            } else {
                alert('Error: Respuesta inesperada del servidor')
            }
        } catch (error) {
            console.error('Error al crear venta:', error)
            alert('Error: No se pudo conectar con el servidor')
        }
    }
})

setTimeout(async () => {
    await cargarProductosCache()
    if (document.getElementById('itemsBody')) crearFilaItem()
}, 150);

// Hacer la función disponible globalmente
window.cargarHistorial = cargarHistorial;

setTimeout(() => {
    if (document.getElementById('tbodyHistorial')) {
        cargarHistorial();
    }
}, 100);

export async function cargarHistorial(){
    const mensajeDiv = document.getElementById('mensajeHistorial')
    const tbody = document.getElementById('tbodyHistorial')
    if (!tbody) return
    try {
        mensajeDiv.innerHTML = 'Cargando ventas...'
        const ventas = await getVentas()
        if (!ventas || ventas.length === 0){
            tbody.innerHTML = '<tr><td colspan="5">No hay ventas</td></tr>'
            mensajeDiv.innerHTML = ''
            return
        }
        tbody.innerHTML = ''
        for (const v of ventas){
            const tr = document.createElement('tr')
            tr.innerHTML = `
                <td>${v.id}</td>
                <td>$${v.total}</td>
                <td>${v.nombre || ''}</td>
                <td>${v.creado_en ? new Date(v.creado_en).toLocaleString() : ''}</td>
                <td><button class="btn-ver-detalle" data-id="${v.id}">Ver</button></td>
            `
            tbody.appendChild(tr)
        }
        mensajeDiv.innerHTML = ''
    } catch (err){
        mensajeDiv.innerHTML = 'Error al cargar ventas'
    }
}

document.addEventListener('click', async (e) => {
    if (e.target && e.target.classList.contains('btn-ver-detalle')){
        const id = e.target.dataset.id
        try{
            const detalle = await getDetalleVentaPorVenta(id)
            let arr = []
            if (!detalle) arr = []
            else if (Array.isArray(detalle)) arr = detalle
            else if (detalle && detalle.length === 0) arr = []
            else if (detalle && detalle.producto_id) arr = [detalle]
            else arr = Array.isArray(detalle) ? detalle : [detalle]

            if (arr.length === 0) {
                alert('No hay detalles para esta venta')
                return
            }
            const texto = arr.map(r => `${r.nombre || r.producto_id}: ${r.cantidad} x $${r.precio_unitario}`).join('\n')
            alert(texto)
        } catch(err){
            alert('Error al obtener detalles')
        }
    }
})
