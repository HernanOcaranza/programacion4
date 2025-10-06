-- Tabla de usuarios 
CREATE TABLE usuarios ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    nombre VARCHAR(50) NOT NULL, 
    usuario VARCHAR(30) UNIQUE NOT NULL, 
    password VARCHAR(255) NOT NULL, -- en backend se guarda hasheada 
    rol ENUM('admin', 'vendedor', 'cajero') DEFAULT 'vendedor' 
); 
 -- Tabla de productos 
CREATE TABLE productos ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    nombre VARCHAR(100) NOT NULL, 
    descripcion TEXT, 
    precio DECIMAL(10,2) NOT NULL, 
    stock INT NOT NULL DEFAULT 0, 
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
); 
 -- Tabla de ventas 
CREATE TABLE ventas ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    total DECIMAL(10,2) NOT NULL, 
    usuario_id INT, 
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) 
); 
-- Detalle de cada venta (productos vendidos) 
CREATE TABLE detalle_venta ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    venta_id INT, 
    producto_id INT, 
    cantidad INT NOT NULL, 
    precio_unitario DECIMAL(10,2) NOT NULL, 
    FOREIGN KEY (venta_id) REFERENCES ventas(id), 
    FOREIGN KEY (producto_id) REFERENCES productos(id) 
); 
 -- Tabla de caja 
CREATE TABLE caja ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    fecha DATE NOT NULL, 
    apertura DECIMAL(10,2) NOT NULL, 
    cierre DECIMAL(10,2), 
    usuario_id INT, 
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) 
); 
 -- Movimientos de caja 
CREATE TABLE movimientos_caja ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    caja_id INT, 
    descripcion VARCHAR(255), 
    monto DECIMAL(10,2) NOT NULL, 
    tipo ENUM('entrada','salida') NOT NULL, 
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (caja_id) REFERENCES caja(id) 
); 