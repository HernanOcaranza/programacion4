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
        console.log("Por favor completa todos los campos");
        return;
    }

    const res = await agregarProducto(nombre, descripcion, precio, stock);

    if(res.status === 200){
        console.log("Producto agregado exitosamente");
        // Limpiar formulario
        document.getElementById("inputNombreProducto").value = "";
        document.getElementById("inputDescripcionProducto").value = "";
        document.getElementById("inputPrecioProducto").value = "";
        document.getElementById("inputStockProducto").value = "";
    } else {
        console.log("ERROR al ingresar un producto:", res);
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
        console.error("Error al cargar productos:", error);
        const mensajeDiv = document.getElementById("mensajeProductos");
        mensajeDiv.innerHTML = "Error al cargar productos";
        mensajeDiv.style.color = "red";
    }
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
});

// Cargar productos automáticamente cuando se accede a la página de productos
setTimeout(() => {
    if (document.getElementById("btnCargarProductos")) {
        cargarProductos();
    }
}, 100);

console.log("Módulo de productos cargado");
