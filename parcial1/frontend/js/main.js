// js/main.js - Navegación principal y login
import { login } from "./api.js"

let formLogin = document.getElementById("formLogin")
let inputSubmit = document.getElementById("inputSubmit")
let inputUsuario = document.getElementById("inputUsuario")
let inputPass = document.getElementById("inputPass")
let main = document.querySelector("main")
let menu = document.getElementById("menu")
let submenus = document.querySelectorAll('.submenu');

async function handleLogin() {
  const usuario = inputUsuario.value;
  const password = inputPass.value;
  const res = await login(usuario, password)
  if (res.mensaje == undefined) {
    mostrarMenu()
    cargarMainDesdeArchivo("historial")
  } else {
    let mensaje = document.getElementById("mensaje")
    mensaje.innerHTML = "Los datos ingresados son incorrectos"
    mensaje.style.color = "red"
  }
}

function mostrarMenu() {
  main.style.display = "none";
  menu.style.display = "block";
}

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault()
  await handleLogin()
})

submenus.forEach(menu => {
  menu.addEventListener('mouseenter', () => {
    menu.querySelector('.dropdown').style.display = 'block';
  });

  menu.addEventListener('mouseleave', () => {
    menu.querySelector('.dropdown').style.display = 'none';
  });
});

function cargarMainDesdeArchivo(archivo) {
  fetch(`html/${archivo}.html`)
    .then(res => {
      if (!res.ok) throw new Error("Error al cargar " + archivo);
      return res.text();
    })
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const nuevoMain = doc.querySelector("main");

      if (nuevoMain) {
        const mainExistente = document.querySelector("main");
        if (mainExistente) mainExistente.remove();
        document.body.appendChild(nuevoMain);
        
        cargarModuloPagina(archivo);
      }
    })
    .catch(err => {
      console.error(err);
    });
}

function cargarModuloPagina(archivo) {
  switch(archivo) {
    case 'historial':
      import('./pages/ventas.js').then(() => {
        setTimeout(() => {
          if (document.getElementById('tbodyHistorial') && window.cargarHistorial) {
            window.cargarHistorial();
          }
        }, 100);
      });
      break;
    case 'ingresarProducto':
      import('./pages/productos.js');
      break;
    case 'productos':
      import('./pages/productos.js').then(() => {
        setTimeout(() => {
          if (document.getElementById('tablaProd')) {
            if (window.cargarProductos) {
              window.cargarProductos();
            }
          }
        }, 100);
      });
      break;
    case 'nuevaVenta':
      import('./pages/ventas.js');
      break;
    case 'apertura':
    case 'cierre':
    case 'movimientos':
      import('./pages/caja.js').then(() => {
        setTimeout(async () => {
          if (window.verificarEstadoCaja) {
            await window.verificarEstadoCaja();
          }
          
          if (document.getElementById('movdecaja') && window.handleMovimientosCaja) {
            await window.handleMovimientosCaja();
          }
          
          if (document.getElementById('totalRecaudado') && window.cargarResumenCaja) {
            await window.cargarResumenCaja();
          }
        }, 100);
      });
      break;
    case 'reportesStock':
      import('./pages/reportes.js').then(() => {
        setTimeout(() => {
          if (document.getElementById('tablareportdestock')) {
            if (window.cargarReportesStock) {
              window.cargarReportesStock();
            }
          }
        }, 100);
      });
      break;
    default:
      break;
  }
}

document.getElementById("nuevaVenta")
  .addEventListener("click", () => cargarMainDesdeArchivo("nuevaVenta"));

document.getElementById("historial")
  .addEventListener("click", () => cargarMainDesdeArchivo("historial"));

document.getElementById("productos")
  .addEventListener("click", () => cargarMainDesdeArchivo("productos"));

document.getElementById("ingresarProducto")
  .addEventListener("click", () => cargarMainDesdeArchivo("ingresarProducto"));

document.getElementById("reportesStock")
  .addEventListener("click", () => cargarMainDesdeArchivo("reportesStock"));

document.getElementById("apertura")
  .addEventListener("click", () => cargarMainDesdeArchivo("apertura"));

document.getElementById("cierre")
  .addEventListener("click", () => cargarMainDesdeArchivo("cierre"));

document.getElementById("movimientos")
  .addEventListener("click", () => cargarMainDesdeArchivo("movimientos"));
