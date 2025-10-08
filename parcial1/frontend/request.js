export async function login(usuario, password){
    const res = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      usuario,
      password
    })
  });

  return res.json()
}

export async function getProductos() {
    const res = await fetch("http://localhost:3000/productos")
    
    return res.json()
}

export async function agregarProducto(nombre, descripcion, precio, stock) {
    const res = await fetch("http://localhost:3000/productos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nombre, 
      descripcion, 
      precio,
      stock
    })
  });
  return res.json()
}