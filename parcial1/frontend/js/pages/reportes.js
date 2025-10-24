// js/pages/reportes.js - Lógica de reportes
import { getReportesStock } from "../api.js"

// Función para cargar reportes de stock
async function cargarReportesStock() {
    try {
        const tbody = document.getElementById('tablareportdestock')?.querySelector('tbody');
        const resumenDiv = document.querySelector('#reportesdestock .resumen-caja');
        
        if (!tbody) return;
        
        // Mostrar estado de carga
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #6c757d;">Cargando reporte de stock...</td></tr>';
        
        const reporte = await getReportesStock(20); // Límite de stock bajo = 20
        
        if (!reporte || !reporte.productos) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #6c757d;">No hay datos de reportes</td></tr>';
            return;
        }
        
        // Limpiar tabla
        tbody.innerHTML = '';
        
        if (reporte.productos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #27ae60; font-weight: 600;">¡Excelente! No hay productos con stock bajo</td></tr>';
        } else {
            // Agregar cada producto con stock bajo a la tabla
            reporte.productos.forEach(producto => {
                const row = document.createElement('tr');
                const stockClass = producto.stock <= 2 ? 'salida' : 'entrada';
                const stockIcon = producto.stock <= 2 ? '🔴' : producto.stock <= 5 ? '🟡' : '🟢';
                
                row.innerHTML = `
                    <td>${producto.id}</td>
                    <td>${producto.nombre}</td>
                    <td>${producto.descripcion || 'Sin descripción'}</td>
                    <td class="${stockClass}">${stockIcon} ${producto.stock}</td>
                    <td>$${parseFloat(producto.precio).toFixed(2)}</td>
                `;
                tbody.appendChild(row);
            });
        }
        
        // Actualizar resumen
        if (resumenDiv) {
            const porcentaje = ((reporte.productos_bajo_stock / reporte.total_productos) * 100).toFixed(1);
            resumenDiv.innerHTML = `
                <h3 style="margin-top: 0; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 0.5rem;">Resumen del Reporte</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                    <div style="background: rgba(52, 152, 219, 0.1); padding: 1rem; border-radius: 8px; text-align: center;">
                        <p style="margin: 0; font-size: 1.5rem; font-weight: 700; color: #3498db;">${reporte.total_productos}</p>
                        <p style="margin: 0; color: #2c3e50; font-size: 0.9rem;">Total Productos</p>
                    </div>
                    <div style="background: rgba(231, 76, 60, 0.1); padding: 1rem; border-radius: 8px; text-align: center;">
                        <p style="margin: 0; font-size: 1.5rem; font-weight: 700; color: #e74c3c;">${reporte.productos_bajo_stock}</p>
                        <p style="margin: 0; color: #2c3e50; font-size: 0.9rem;">Stock Bajo (≤${reporte.limite_stock})</p>
                    </div>
                    <div style="background: rgba(39, 174, 96, 0.1); padding: 1rem; border-radius: 8px; text-align: center;">
                        <p style="margin: 0; font-size: 1.5rem; font-weight: 700; color: #27ae60;">${porcentaje}%</p>
                        <p style="margin: 0; color: #2c3e50; font-size: 0.9rem;">Porcentaje</p>
                    </div>
                </div>
                <p style="margin-top: 1rem; color: #7f8c8d; font-size: 0.9rem; text-align: center;">
                    Reporte generado: ${new Date(reporte.fecha_reporte).toLocaleString('es-ES')}
                </p>
            `;
        }
        
    } catch (error) {
        console.error('Error al cargar reportes de stock:', error);
        const tbody = document.getElementById('tablareportdestock')?.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #e74c3c;">Error al cargar reportes</td></tr>';
        }
    }
}

window.cargarReportesStock = cargarReportesStock;

setTimeout(() => {
    if (document.getElementById('tablareportdestock')) {
        cargarReportesStock();
    }
}, 100);
