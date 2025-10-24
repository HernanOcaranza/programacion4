// js/pages/caja.js - Lógica de caja conectada al backend
import { 
    abrirCaja, 
    getCajaAbierta, 
    cerrarCaja, 
    getMovimientosCaja, 
    getResumenCaja 
} from "../api.js"

let usuarioActual = { id: 1, nombre: 'Usuario' };

// ==================== APERTURA DE CAJA ====================

async function handleAperturaCaja(){
    try {
        const montoInicial = document.getElementById('montoInicial')?.value;
        
        if (!montoInicial || parseFloat(montoInicial) < 0) {
            alert('Por favor ingrese un monto inicial válido');
            return;
        }

        const res = await abrirCaja(parseFloat(montoInicial), usuarioActual.id);
        
        if (res.mensaje) {
            if (res.mensaje.includes('Ya hay una caja abierta')) {
                alert('Ya hay una caja abierta. Debe cerrar la caja actual antes de abrir una nueva.');
            } else if (res.mensaje.includes('Caja abierta correctamente')) {
                alert('Caja abierta correctamente');
                document.getElementById('montoInicial').value = '';
            } else {
                alert(`Error: ${res.mensaje}`);
            }
        } else {
            alert('Caja abierta correctamente');
            document.getElementById('montoInicial').value = '';
        }
    } catch (error) {
        console.error('Error al abrir caja:', error);
        alert('Error al abrir la caja');
    }
}

// ==================== CIERRE DE CAJA ====================

async function handleCierreCaja(){
    try {
        const cierreReal = document.getElementById('cierreReal')?.value;
        
        if (!cierreReal || parseFloat(cierreReal) < 0) {
            alert('Por favor ingrese el monto real contado');
            return;
        }

        const res = await cerrarCaja(parseFloat(cierreReal));
        
        if (res.mensaje) {
            if (res.mensaje.includes('No hay caja abierta')) {
                alert('No hay caja abierta para cerrar');
            } else if (res.mensaje.includes('Caja cerrada correctamente')) {
                // Mostrar resumen del cierre
                const mensaje = `
                    Caja cerrada correctamente

                    Resumen del cierre:
                    Saldo esperado: $${res.esperado}
                    Saldo real: $${res.real}
                    Diferencia: $${res.diferencia}
                `;
                alert(mensaje);
                
                // Limpiar el formulario
                document.getElementById('cierreReal').value = '';
            } else {
                alert(`Error: ${res.mensaje}`);
            }
        } else {
            // Mostrar resumen del cierre
            const mensaje = `
Caja cerrada correctamente

Resumen del cierre:
Saldo esperado: $${res.esperado}
Saldo real: $${res.real}
Diferencia: $${res.diferencia}
            `;
            alert(mensaje);
            
            // Limpiar el formulario
            document.getElementById('cierreReal').value = '';
        }
    } catch (error) {
        console.error('Error al cerrar caja:', error);
        alert('Error al cerrar la caja');
    }
}

// ==================== MOVIMIENTOS DE CAJA ====================

async function handleMovimientosCaja(){
    try {
        const movimientos = await getMovimientosCaja();
        const tabla = document.getElementById('movdecaja');
        
        if (!tabla) return;
        
        const tbody = tabla.querySelector('tbody');
        tbody.innerHTML = '';
        
        if (!movimientos || movimientos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #666;">No hay movimientos registrados</td></tr>';
            return;
        }
        
        movimientos.forEach(m => {
            const tr = document.createElement('tr');
            const fecha = new Date(m.fecha).toLocaleDateString('es-ES') || '';
            const tipoClass = m.tipo === 'entrada' ? 'entrada' : 'salida';
            const tipoIcon = m.tipo === 'entrada' ? '+' : '-';
            
            tr.innerHTML = `
                <td>${fecha}</td>
                <td>${m.descripcion || 'Sin descripción'}</td>
                <td class="${tipoClass}">${tipoIcon} ${m.tipo.toUpperCase()}</td>
                <td class="${tipoClass}">$${parseFloat(m.monto).toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });
        
        // Cargar resumen
        await cargarResumenCaja();
        
    } catch (error) {
        console.error('Error al cargar movimientos:', error);
        const tabla = document.getElementById('movdecaja');
        if (tabla) {
            const tbody = tabla.querySelector('tbody');
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #e74c3c;">Error al cargar movimientos</td></tr>';
        }
    }
}

// ==================== RESUMEN DE CAJA ====================

async function cargarResumenCaja(){
    try {
        const resumen = await getResumenCaja();
        
        if (resumen.mensaje) {
            const totalRecaudado = document.getElementById('totalRecaudado');
            if (totalRecaudado) {
                totalRecaudado.innerHTML = `
                    <span style="color: #e74c3c; font-size: 1.2rem;">No hay caja abierta</span>
                `;
            }
            return;
        }
        
        const resumenDiv = document.querySelector('.resumen-caja');
        if (resumenDiv) {
            resumenDiv.innerHTML = `
                <p style="font-size: 1.1rem; margin-bottom: 0.5rem; color: #27ae60; font-weight: 600;">
                    Total de Ingresos: $${parseFloat(resumen.total_ingresos).toFixed(2)}
                </p>
                <p style="font-size: 1.1rem; margin-bottom: 0.5rem; color: #e74c3c; font-weight: 600;">
                    Total de Egresos: $${parseFloat(resumen.total_egresos).toFixed(2)}
                </p>
                <p style="font-size: 1.2rem; font-weight: 700; color: #2c3e50;">
                    Saldo Esperado: $${parseFloat(resumen.saldo_esperado).toFixed(2)}
                </p>
            `;
        }
        
        const totalRecaudado = document.getElementById('totalRecaudado');
        if (totalRecaudado) {
            totalRecaudado.innerHTML = `
                Saldo esperado: $${parseFloat(resumen.saldo_esperado).toFixed(2)}
            `;
        }
        
    } catch (error) {
        console.error('Error al cargar resumen:', error);
        const totalRecaudado = document.getElementById('totalRecaudado');
        if (totalRecaudado) {
            totalRecaudado.innerHTML = `
                <span style="color: #e74c3c; font-size: 1.2rem;">Error al cargar datos</span>
            `;
        }
    }
}


// ==================== VERIFICAR ESTADO DE CAJA ====================

async function verificarEstadoCaja(){
    try {
        const cajaAbierta = await getCajaAbierta();
        
        if (cajaAbierta && !cajaAbierta.mensaje) {
            const estadoDiv = document.getElementById('estadoCaja');
            if (estadoDiv) {
                estadoDiv.innerHTML = `
                    <div style="background: rgba(46, 204, 113, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #2ecc71;">
                        <p style="margin: 0; color: #27ae60; font-weight: 600;">
                            Caja abierta desde: ${new Date(cajaAbierta.fecha).toLocaleDateString('es-ES')}
                        </p>
                        <p style="margin: 0.5rem 0 0 0; color: #2c3e50;">
                            Saldo actual: $${parseFloat(cajaAbierta.saldo_esperado).toFixed(2)}
                        </p>
                    </div>
                `;
            }
            return true;
        } else {
            const estadoDiv = document.getElementById('estadoCaja');
            if (estadoDiv) {
                estadoDiv.innerHTML = `
                    <div style="background: rgba(231, 76, 60, 0.1); padding: 1rem; border-radius: 8px; border-left: 4px solid #e74c3c;">
                        <p style="margin: 0; color: #e74c3c; font-weight: 600;">
                            No hay caja abierta
                        </p>
                    </div>
                `;
            }
            return false;
        }
    } catch (error) {
        console.error('Error al verificar estado de caja:', error);
        return false;
    }
}

// ==================== EVENT LISTENERS ====================

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

// ==================== INICIALIZACIÓN ====================

window.verificarEstadoCaja = verificarEstadoCaja;
window.handleMovimientosCaja = handleMovimientosCaja;
window.cargarResumenCaja = cargarResumenCaja;

// Cargar datos automáticamente según la página
setTimeout(async () => {
    await verificarEstadoCaja();
    
    if (document.getElementById('movdecaja')) {
        await handleMovimientosCaja();
    }
    
    if (document.getElementById('totalRecaudado')) {
        await cargarResumenCaja();
    }
}, 100);

