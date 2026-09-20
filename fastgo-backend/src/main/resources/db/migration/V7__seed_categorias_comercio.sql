-- V7__seed_categorias_comercio.sql
-- Inserción idempotente de categorías maestras de comercio para FASTGO

INSERT INTO categorias_comercio (nombre, descripcion, activo)
SELECT c.nombre, c.descripcion, c.activo
FROM (
    VALUES
        ('Restaurante', 'Restaurantes, comidas rápidas, cafeterías y panaderías', true),
        ('Supermercado', 'Supermercados, abarrotes y productos de consumo masivo', true),
        ('Minimercado', 'Tiendas de barrio, mini markets y víveres', true),
        ('Frutas y Verduras', 'Fruvers, verduras frescas, frutas y hortalizas', true),
        ('Ropa y Moda', 'Boutiques, prendas de vestir, confecciones y moda', true),
        ('Calzado', 'Zapaterías, calzado deportivo, formal e informal', true),
        ('Tecnología', 'Electrónica, celulares, computadores y accesorios', true),
        ('Farmacia', 'Droguerías, medicamentos, salud y cuidado personal', true),
        ('Mascotas', 'Pet shops, alimentos, accesorios y cuidado animal', true),
        ('Ferretería', 'Materiales de ferretería, herramientas y acabados', true),
        ('Hogar y Variedades', 'Artículos para el hogar, papelería y variedades', true)
) AS c(nombre, descripcion, activo)
WHERE NOT EXISTS (
    SELECT 1 FROM categorias_comercio existing WHERE LOWER(existing.nombre) = LOWER(c.nombre)
);
