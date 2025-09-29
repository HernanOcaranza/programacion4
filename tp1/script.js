let lista = document.getElementById("lista");
let entrada = document.getElementById("entrada") ;
let lista2 = document.getElementById("lista2");
let select = document.getElementById("select");

function agregarElemento(){

    let item = document.createElement("li")
    item.innerHTML = entrada.value
    lista.appendChild(item)
}

let boton = document.getElementById("boton");
boton.addEventListener("click", function(e){
    e.preventDefault()
    if (entrada.value !== "") {
        agregarElemento()
    }
    
})

function agregarEnOl(){
    let li = document.createElement("li")
    li.innerHTML = entrada.value
    lista2.appendChild(li)
}

let boton2 = document.getElementById("boton2");
boton2.addEventListener("click", function(e){
    e.preventDefault()
    if (entrada.value !== "") {
        agregarEnOl()
    }
})

function agregarOption(){
    let option = document.createElement("option")
    option.innerHTML = entrada.value
    select.appendChild(option)
}

let boton3 = document.getElementById("boton3");
boton3.addEventListener("click", function(e){
    e.preventDefault()
    if (entrada.value !== "") {
        agregarOption()
    }
})

