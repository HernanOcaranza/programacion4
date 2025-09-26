let formLogin = document.getElementById("formLogin")
let inputSubmit = document.getElementById("inputSubmit")
let inputUsuario = document.getElementById("inputUsuario")
let inputPass = document.getElementById("inputPass")
let main = document.querySelector("main")
let menu = document.getElementById("menu")
const submenus = document.querySelectorAll('.submenu');


function login(){
     if (inputUsuario.value === "admin" && inputPass.value === "1234"){        
        mostrarMenu()
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

// CREAMOS LAS VARIABLES DE CADA MAIN
// Ventas
let mainNuevaVenta = document.createElement("main");
mainNuevaVenta.innerHTML = "Aquí se realiza una nueva venta.";

let mainHistorial = document.createElement("main");
mainHistorial.innerHTML = "Historial de ventas realizadas.";

// Stock
let mainProductos = document.createElement("main");
mainProductos.innerHTML = "Listado de productos disponibles.";

let mainIngresarProducto = document.createElement("main");
mainIngresarProducto.innerHTML = "Formulario para ingresar un nuevo producto.";

let mainReportesStock = document.createElement("main");
mainReportesStock.innerHTML = "Reportes de stock.";

// Caja
let mainApertura = document.createElement("main");
mainApertura.innerHTML = "Abrir caja del día.";

let mainCierre = document.createElement("main");
mainCierre.innerHTML = "Cerrar caja del día.";

let mainMovimientos = document.createElement("main");
mainMovimientos.innerHTML = "Ver movimientos de caja.";

function mostrarMain(main) {
    // Primero eliminamos cualquier main existente
    const mainExistente = document.querySelector("main");
    if(mainExistente) mainExistente.remove();
  
    // Insertamos el main que queremos mostrar
    document.body.appendChild(main);
}

//EVENTOS PARA MOSTRAR CADA MAIN
// Ventas
document.getElementById("nuevaVenta").addEventListener("click", () => mostrarMain(mainNuevaVenta));
document.getElementById("historial").addEventListener("click", () => mostrarMain(mainHistorial));

// Stock
document.getElementById("productos").addEventListener("click", () => mostrarMain(mainProductos));
document.getElementById("ingresarProducto").addEventListener("click", () => mostrarMain(mainIngresarProducto));
document.getElementById("reportesStock").addEventListener("click", () => mostrarMain(mainReportesStock));

// Caja
document.getElementById("apertura").addEventListener("click", () => mostrarMain(mainApertura));
document.getElementById("cierre").addEventListener("click", () => mostrarMain(mainCierre));
document.getElementById("movimientos").addEventListener("click", () => mostrarMain(mainMovimientos));
