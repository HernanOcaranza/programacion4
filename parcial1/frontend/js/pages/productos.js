// js/pages/productos.js - Solo lógica de productos
import { agregarProducto, getProductos } from "../api.js"

// Función para manejar agregar producto
async function handleAgregarProducto(){
    const nombre = document.getElementById("inputNombreProducto")?.value; 
    const descripcion = document.getElementById("inputDescripcionProducto")?.value;
    const precio = document.getElementById("inputPrecioProducto")?.value;
    const stock = document.getElementById("inputStockProducto")?.value;

    // Validar que todos los campos estén completos
    if (!nombre || !descripcion || !precio || !stock) {
        alert("Por favor completa todos los campos");
        return;
    }

    const res = await agregarProducto(nombre, descripcion, precio, stock);
    // respuesta esperada: objeto con insertId u objeto de error
    if (res && (res.insertId || res.id)) {
        // Limpiar formulario
        document.getElementById("inputNombreProducto").value = "";
        document.getElementById("inputDescripcionProducto").value = "";
        document.getElementById("inputPrecioProducto").value = "";
        document.getElementById("inputStockProducto").value = "";
        // opcional: recargar la lista de productos
        if (document.getElementById('btnCargarProductos')) cargarProductos()
    } else if (res && res.mensaje) {
        alert('Error: ' + res.mensaje)
    } else {
        alert('Producto agregado')
    }
}

// Función para cargar y mostrar productos
async function cargarProductos() {
    try {
        const mensajeDiv = document.getElementById("mensajeProductos");
        const tbody = document.getElementById("tbodyProductos");
        
        // Mostrar mensaje de carga
        mensajeDiv.innerHTML = "Cargando productos...";
        mensajeDiv.style.color = "blue";
        
        const productos = await getProductos();
        
        if (productos && productos.length > 0) {
            // Limpiar tabla
            tbody.innerHTML = "";
            
            // Agregar cada producto a la tabla
            productos.forEach(producto => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${producto.id}</td>
                    <td>${producto.nombre}</td>
                    <td>${producto.descripcion || 'Sin descripción'}</td>
                    <td>$${producto.precio}</td>
                    <td>${producto.stock}</td>
                    <td>${new Date(producto.creado_en).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-editar" data-id="${producto.id}" title="Editar">✏️</button>
                        <button class="btn-borrar" data-id="${producto.id}" title="Eliminar">🗑️</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            mensajeDiv.innerHTML = `Se cargaron ${productos.length} productos`;
            mensajeDiv.style.color = "green";
        } else {
            tbody.innerHTML = "<tr><td colspan='6'>No hay productos disponibles</td></tr>";
            mensajeDiv.innerHTML = "No se encontraron productos";
            mensajeDiv.style.color = "orange";
        }
    } catch (error) {
        const mensajeDiv = document.getElementById("mensajeProductos");
        mensajeDiv.innerHTML = "Error al cargar productos";
        mensajeDiv.style.color = "red";
    }
}

// Handlers para editar/borrar
import { actualizarProducto, borrarProducto } from "../api.js"

async function handleEditarProducto(id){
    // solicitar datos nuevos (simple y entendible):
    const nombre = prompt('Nombre nuevo:')
    if (nombre === null) return // cancel
    const descripcion = prompt('Descripción nueva:')
    if (descripcion === null) return
    const precio = prompt('Precio:')
    if (precio === null) return
    const stock = prompt('Stock:')
    if (stock === null) return

    const res = await actualizarProducto(id, nombre, descripcion, parseFloat(precio), parseInt(stock))
    cargarProductos()
}

async function handleBorrarProducto(id){
    if (!confirm('¿Eliminar este producto?')) return
    const res = await borrarProducto(id)
    cargarProductos()
}

// Event delegation para manejar clicks en elementos que se cargan dinámicamente
document.addEventListener('click', (e) => {
    if (e.target.id === 'botonAgregarProducto') {
        e.preventDefault();
        handleAgregarProducto();
    }
    
    if (e.target.id === 'btnCargarProductos') {
        e.preventDefault();
        cargarProductos();
    }
    
    if (e.target.classList.contains('btn-editar')){
        const id = e.target.dataset.id
        handleEditarProducto(id)
    }
    
    if (e.target.classList.contains('btn-borrar')){
        const id = e.target.dataset.id
        handleBorrarProducto(id)
    }
});

// Cargar productos automáticamente cuando se accede a la página de productos
setTimeout(() => {
    if (document.getElementById("btnCargarProductos")) {
        cargarProductos();
    }
}, 100);
