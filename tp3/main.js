let miDiv = document.querySelector('div')

miDiv.addEventListener('click', ()=>{
    let altoR = Math.floor(Math.random() * 85) + '%'
    let anchoR = Math.floor(Math.random() * 85) + '%'
    let colR = Math.floor(Math.random() * 255)
    let colG = Math.floor(Math.random() * 255)
    let colB = Math.floor(Math.random() * 255)
    let bgColorR = `rgb(${colR},${colG},${colB})`

    console.log(altoR)
    console.log(anchoR)
    miDiv.style.top = altoR
    miDiv.style.left = anchoR
    miDiv.style.backgroundColor = bgColorR
})