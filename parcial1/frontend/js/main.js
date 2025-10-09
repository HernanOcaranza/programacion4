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
        
        // Cargar el módulo específico de la página
        cargarModuloPagina(archivo);
      }
    })
    .catch(err => {
      console.error(err);
    });
}

// Función para cargar el módulo específico de cada página
function cargarModuloPagina(archivo) {
  switch(archivo) {
    case 'ingresarProducto':
      import('./pages/productos.js');
      break;
    case 'productos':
      import('./pages/productos.js');
      break;
    case 'nuevaVenta':
      import('./pages/ventas.js');
      break;
    case 'apertura':
    case 'cierre':
    case 'movimientos':
      import('./pages/caja.js');
      break;
    default:
      // Para páginas que no necesitan JavaScript específico
      break;
  }
}

// Event listeners para navegación
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
