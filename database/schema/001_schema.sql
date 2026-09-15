-- ===========================================
-- FASTGO DATABASE
-- PostgreSQL 17
-- Versión: 1.0
-- ===========================================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(30) UNIQUE NOT NULL,
    descripcion VARCHAR(150),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (

    id SERIAL PRIMARY KEY,

    nombre VARCHAR(80) NOT NULL,

    apellido VARCHAR(80) NOT NULL,

    correo VARCHAR(150) UNIQUE NOT NULL,

    telefono VARCHAR(20) UNIQUE,

    password VARCHAR(255) NOT NULL,

    foto VARCHAR(255),

    estado BOOLEAN DEFAULT TRUE,

    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

CREATE TABLE usuarios_roles (

    id SERIAL PRIMARY KEY,

    usuario_id INTEGER NOT NULL,

    rol_id INTEGER NOT NULL,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    FOREIGN KEY (rol_id)
        REFERENCES roles(id)
        ON DELETE CASCADE

);

CREATE TABLE direcciones (

    id SERIAL PRIMARY KEY,

    usuario_id INTEGER NOT NULL,

    alias VARCHAR(50) NOT NULL,

    direccion VARCHAR(255) NOT NULL,

    ciudad VARCHAR(100) NOT NULL,

    departamento VARCHAR(100),

    codigo_postal VARCHAR(20),

    latitud DECIMAL(10,8),

    longitud DECIMAL(11,8),

    principal BOOLEAN DEFAULT FALSE,

    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE

);

CREATE TABLE categorias_comercio (

    id SERIAL PRIMARY KEY,

    nombre VARCHAR(80) NOT NULL,

    icono VARCHAR(255),

    descripcion TEXT,

    activo BOOLEAN DEFAULT TRUE

);

CREATE TABLE comercios (

    id SERIAL PRIMARY KEY,

    categoria_id INTEGER NOT NULL,

    nombre VARCHAR(120) NOT NULL,

    descripcion TEXT,

    telefono VARCHAR(20),

    correo VARCHAR(150),

    logo VARCHAR(255),

    banner VARCHAR(255),

    nit VARCHAR(30) UNIQUE,

    activo BOOLEAN DEFAULT TRUE,

    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (categoria_id)
        REFERENCES categorias_comercio(id)

);

CREATE TABLE sucursales (

    id SERIAL PRIMARY KEY,

    comercio_id INTEGER NOT NULL,

    nombre VARCHAR(120) NOT NULL,

    direccion VARCHAR(255) NOT NULL,

    ciudad VARCHAR(100) NOT NULL,

    departamento VARCHAR(100),

    telefono VARCHAR(20),

    latitud DECIMAL(10,8),

    longitud DECIMAL(11,8),

    radio_entrega_km DECIMAL(5,2) DEFAULT 5.00,

    abierta BOOLEAN DEFAULT TRUE,

    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (comercio_id)
        REFERENCES comercios(id)
        ON DELETE CASCADE

);

CREATE TABLE horarios_sucursal (

    id SERIAL PRIMARY KEY,

    sucursal_id INTEGER NOT NULL,

    dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),

    hora_apertura TIME NOT NULL,

    hora_cierre TIME NOT NULL,

    FOREIGN KEY (sucursal_id)
        REFERENCES sucursales(id)
        ON DELETE CASCADE

);


CREATE TABLE categorias_producto (

    id SERIAL PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL,

    descripcion TEXT,

    icono VARCHAR(255),

    activo BOOLEAN DEFAULT TRUE

);


CREATE TABLE productos (

    id SERIAL PRIMARY KEY,

    sucursal_id INTEGER NOT NULL,

    categoria_id INTEGER NOT NULL,

    nombre VARCHAR(150) NOT NULL,

    descripcion TEXT,

    precio DECIMAL(12,2) NOT NULL,

    tiempo_preparacion INTEGER,

    imagen_principal VARCHAR(255),

    disponible BOOLEAN DEFAULT TRUE,

    destacado BOOLEAN DEFAULT FALSE,

    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sucursal_id)
        REFERENCES sucursales(id)
        ON DELETE CASCADE,

    FOREIGN KEY (categoria_id)
        REFERENCES categorias_producto(id)

);


CREATE TABLE imagenes_producto (

    id SERIAL PRIMARY KEY,

    producto_id INTEGER NOT NULL,

    url VARCHAR(255) NOT NULL,

    principal BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (producto_id)
        REFERENCES productos(id)
        ON DELETE CASCADE

);


CREATE TABLE extras_producto (

    id SERIAL PRIMARY KEY,

    producto_id INTEGER NOT NULL,

    nombre VARCHAR(100) NOT NULL,

    precio DECIMAL(12,2) DEFAULT 0,

    disponible BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (producto_id)
        REFERENCES productos(id)
        ON DELETE CASCADE

);

CREATE TABLE carritos (

    id SERIAL PRIMARY KEY,

    usuario_id INTEGER NOT NULL,

    sucursal_id INTEGER NOT NULL,

    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    FOREIGN KEY (sucursal_id)
        REFERENCES sucursales(id)
        ON DELETE CASCADE

);

CREATE TABLE carrito_detalle (

    id SERIAL PRIMARY KEY,

    carrito_id INTEGER NOT NULL,

    producto_id INTEGER NOT NULL,

    cantidad INTEGER NOT NULL DEFAULT 1,

    precio DECIMAL(12,2) NOT NULL,

    subtotal DECIMAL(12,2) NOT NULL,

    FOREIGN KEY (carrito_id)
        REFERENCES carritos(id)
        ON DELETE CASCADE,

    FOREIGN KEY (producto_id)
        REFERENCES productos(id)

);


CREATE TABLE pedidos (

    id SERIAL PRIMARY KEY,

    usuario_id INTEGER NOT NULL,

    sucursal_id INTEGER NOT NULL,

    direccion_id INTEGER NOT NULL,

    estado VARCHAR(30) NOT NULL,

    subtotal DECIMAL(12,2) NOT NULL,

    costo_envio DECIMAL(12,2) NOT NULL,

    total DECIMAL(12,2) NOT NULL,

    observaciones TEXT,

    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id),

    FOREIGN KEY (sucursal_id)
        REFERENCES sucursales(id),

    FOREIGN KEY (direccion_id)
        REFERENCES direcciones(id)

);

CREATE TABLE detalle_pedido (

    id SERIAL PRIMARY KEY,

    pedido_id INTEGER NOT NULL,

    producto_id INTEGER NOT NULL,

    cantidad INTEGER NOT NULL,

    precio DECIMAL(12,2) NOT NULL,

    subtotal DECIMAL(12,2) NOT NULL,

    FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id)
        ON DELETE CASCADE,

    FOREIGN KEY (producto_id)
        REFERENCES productos(id)

);

CREATE TABLE pagos (

    id SERIAL PRIMARY KEY,

    pedido_id INTEGER UNIQUE NOT NULL,

    metodo VARCHAR(50) NOT NULL,

    estado VARCHAR(30) NOT NULL,

    referencia VARCHAR(150),

    fecha_pago TIMESTAMP,

    FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id)
        ON DELETE CASCADE

);