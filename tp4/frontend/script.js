let formLogin = document.getElementById("formLogin")
let inputSubmit = document.getElementById("inputSubmit")
let inputUsuario = document.getElementById("inputUsuario")
let inputPass = document.getElementById("inputPass")
let main = document.querySelector("main")
let menu = document.getElementById("menu")
let submenus = document.querySelectorAll('.submenu');

function login(){
     if (inputUsuario.value === "admin" && inputPass.value === "1234"){        
        mostrarMenu()
        cargarMainDesdeArchivo("historial")
     } else {
        let mensaje = document.getElementById("mensaje")
        mensaje.innerHTML = "Los datos ingresados son incorrectos"
        mensaje.style.color = "red"        
     }
}

function mostrarMenu(){
    main.style.display = "none";
    menu.style.display = "block";
}

formLogin.addEventListener("submit", (e) =>{
    e.preventDefault()
    login()
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
      }
    })
    .catch(err => {
      console.error(err);
    });
}

// Ventas
document.getElementById("nuevaVenta")
  .addEventListener("click", () => cargarMainDesdeArchivo("nuevaVenta"));

document.getElementById("historial")
  .addEventListener("click", () => cargarMainDesdeArchivo("historial"));

// Stock
document.getElementById("productos")
  .addEventListener("click", () => cargarMainDesdeArchivo("productos"));

document.getElementById("ingresarProducto")
  .addEventListener("click", () => cargarMainDesdeArchivo("ingresarProducto"));

document.getElementById("reportesStock")
  .addEventListener("click", () => cargarMainDesdeArchivo("reportesStock"));

// Caja
document.getElementById("apertura")
  .addEventListener("click", () => cargarMainDesdeArchivo("apertura"));

document.getElementById("cierre")
  .addEventListener("click", () => cargarMainDesdeArchivo("cierre"));

document.getElementById("movimientos")
  .addEventListener("click", () => cargarMainDesdeArchivo("movimientos"));