// js/pages/ventas.js - Solo lógica de ventas
import { getProductos } from "../api.js"

// Función para manejar nueva venta
async function handleNuevaVenta(){
    const producto = document.getElementById("producto")?.value;
    const cantidad = document.getElementById("cantidad")?.value;
    const precio = document.getElementById("precio")?.value;

    if (!producto || !cantidad || !precio) {
        console.log("Por favor completa todos los campos");
        return;
    }

    console.log("Procesando venta:", { producto, cantidad, precio });
    // Aquí iría la lógica para procesar la venta
}

// Event delegation para manejar formularios de ventas
document.addEventListener('submit', (e) => {
    if (e.target.id === 'formVenta') {
        e.preventDefault();
        handleNuevaVenta();
    }
});

console.log("Módulo de ventas cargado");
