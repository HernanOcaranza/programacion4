let formulario = document.getElementById("formulario");
let entrada = document.getElementById("entrada");
let entradaTabla = document.getElementById("entradaTabla");
let botonSelect = document.getElementById("botonSelect");
let select = document.getElementById("select");
let botonTabla = document.getElementById("botonTabla");
let tbody = document.getElementById("tbody");
let botonEliminar = document.getElementById("botonEliminar")

function agregarLi() {
    let item = document.createElement("option")
    item.innerHTML = entrada.value
    select.appendChild(item)
}

botonSelect.addEventListener("click", function(e){
    e.preventDefault()
    if (entrada.value !== "") {
        agregarLi()
    }
})

function agregarTr() {
    let tr = document.createElement("tr")
    let tdNombre = document.createElement("td")
    tdNombre.innerHTML = entradaTabla.value
    let tdCategoria = document.createElement("td")
    tdCategoria.innerHTML = select.value
    let tdCheckbox = document.createElement("td")
    let check = document.createElement("input")
    check.setAttribute("type", "checkbox")
    check.setAttribute("class", "check")
    tdCheckbox.appendChild(check);
    tr.appendChild(tdNombre);
    tr.appendChild(tdCategoria);
    tr.appendChild(tdCheckbox);
    tbody.appendChild(tr);
}

botonTabla.addEventListener("click", function(e){
    e.preventDefault()
    if (entradaTabla.value !== "") {
        agregarTr()
    }
})

function eliminarMarcados() {
    let checkMarcados = document.querySelectorAll("#tabla .check:checked")
    checkMarcados.forEach(chck => {
        let fila = chck.closest('tr')
        fila.remove();
    })
}

botonEliminar.addEventListener("click", function(){
    eliminarMarcados()
})


