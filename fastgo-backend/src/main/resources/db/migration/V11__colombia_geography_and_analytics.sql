-- ============================================================
-- FASTGO: MIGRACIÓN V11
-- 1. Catálogo Oficial de Colombia DANE (Departamentos y Municipios)
-- 2. Vinculación Geográfica para Sucursales y Comercios
-- 3. Sistema Central de Analítica de Eventos (analytics_events)
-- ============================================================

-- 1) Tabla de Departamentos
CREATE TABLE IF NOT EXISTS departamentos (
    id SERIAL PRIMARY KEY,
    codigo_dane VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_departamentos_codigo_dane ON departamentos(codigo_dane);
CREATE INDEX IF NOT EXISTS idx_departamentos_nombre ON departamentos(nombre);

-- 2) Tabla de Municipios
CREATE TABLE IF NOT EXISTS municipios (
    id SERIAL PRIMARY KEY,
    departamento_id INTEGER NOT NULL REFERENCES departamentos(id) ON DELETE RESTRICT,
    codigo_dane VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    latitud DECIMAL(10,8),
    longitud DECIMAL(11,8),
    activo BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_municipios_departamento_id ON municipios(departamento_id);
CREATE INDEX IF NOT EXISTS idx_municipios_codigo_dane ON municipios(codigo_dane);
CREATE INDEX IF NOT EXISTS idx_municipios_nombre ON municipios(nombre);

-- 3) Poblado de Departamentos Oficiales DANE
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('05', 'ANTIOQUIA', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('08', 'ATLÁNTICO', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('11', 'BOGOTÁ, D.C.', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('13', 'BOLÍVAR', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('15', 'BOYACÁ', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('17', 'CALDAS', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('18', 'CAQUETÁ', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('19', 'CAUCA', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('20', 'CESAR', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('23', 'CÓRDOBA', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('25', 'CUNDINAMARCA', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('27', 'CHOCÓ', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('41', 'HUILA', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('44', 'LA GUAJIRA', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('47', 'MAGDALENA', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('50', 'META', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('52', 'NARIÑO', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('54', 'NORTE DE SANTANDER', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('63', 'QUINDÍO', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('66', 'RISARALDA', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('68', 'SANTANDER', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('70', 'SUCRE', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('73', 'TOLIMA', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('76', 'VALLE DEL CAUCA', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('81', 'ARAUCA', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('85', 'CASANARE', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('86', 'PUTUMAYO', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('88', 'ARCHIPIÉLAGO DE SAN ANDRÉS, PROVIDENCIA Y SANTA CATALINA', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('91', 'AMAZONAS', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('94', 'GUAINÍA', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('95', 'GUAVIARE', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('97', 'VAUPÉS', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO departamentos (codigo_dane, nombre, activo) VALUES ('99', 'VICHADA', TRUE) ON CONFLICT (codigo_dane) DO NOTHING;

-- 4) Poblado de Municipios Oficiales DANE (1.122 Municipios)
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05002', 'ABEJORRAL', 5.789315, -75.428739, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05004', 'ABRIAQUÍ', 6.632282, -76.064304, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05021', 'ALEJANDRÍA', 6.376061, -75.141346, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05030', 'AMAGÁ', 6.038708, -75.702188, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05031', 'AMALFI', 6.909655, -75.077501, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05034', 'ANDES', 5.657194, -75.878828, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05036', 'ANGELÓPOLIS', 6.109719, -75.711389, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05038', 'ANGOSTURA', 6.885175, -75.335116, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05040', 'ANORÍ', 7.074703, -75.148355, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05044', 'ANZÁ', 6.302641, -75.854442, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05045', 'APARTADÓ', 7.882968, -76.625279, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05051', 'ARBOLETES', 8.849317, -76.426708, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05055', 'ARGELIA', 5.731474, -75.14107, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05059', 'ARMENIA', 6.155667, -75.786647, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05079', 'BARBOSA', 6.439195, -75.331627, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05088', 'BELLO', 6.333587, -75.555245, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05086', 'BELMIRA', 6.606319, -75.667779, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05091', 'BETANIA', 5.74615, -75.97679, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05093', 'BETULIA', 6.115208, -75.984452, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05107', 'BRICEÑO', 7.112803, -75.55036, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05113', 'BURITICÁ', 6.720759, -75.907, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05120', 'CÁCERES', 7.578366, -75.35205, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05125', 'CAICEDO', 6.405607, -75.98293, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05129', 'CALDAS', 6.091077, -75.633673, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05134', 'CAMPAMENTO', 6.979771, -75.298091, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05138', 'CAÑASGORDAS', 6.753859, -76.028228, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05142', 'CARACOLÍ', 6.409829, -74.757421, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05145', 'CARAMANTA', 5.54853, -75.643868, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05147', 'CAREPA', 7.755148, -76.652652, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05150', 'CAROLINA', 6.725995, -75.283192, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05154', 'CAUCASIA', 7.977278, -75.197996, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05172', 'CHIGORODÓ', 7.666147, -76.681531, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05190', 'CISNEROS', 6.537829, -75.087047, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05101', 'CIUDAD BOLÍVAR', 5.850273, -76.021509, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05197', 'COCORNÁ', 6.058295, -75.185483, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05206', 'CONCEPCIÓN', 6.394348, -75.257587, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05209', 'CONCORDIA', 6.045738, -75.908448, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05212', 'COPACABANA', 6.348557, -75.509384, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05234', 'DABEIBA', 6.998112, -76.261614, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05237', 'DONMATÍAS', 6.485603, -75.39263, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05240', 'EBÉJICO', 6.325615, -75.766413, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05250', 'EL BAGRE', 7.5975, -74.799097, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05148', 'EL CARMEN DE VIBORAL', 6.082885, -75.333901, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05697', 'EL SANTUARIO', 6.136871, -75.265465, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05264', 'ENTRERRÍOS', 6.566273, -75.517685, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05266', 'ENVIGADO', 6.166695, -75.582192, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05282', 'FREDONIA', 5.928039, -75.675072, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05284', 'FRONTINO', 6.776066, -76.130765, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05306', 'GIRALDO', 6.680808, -75.952158, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05308', 'GIRARDOTA', 6.379472, -75.444238, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05310', 'GÓMEZ PLATA', 6.683269, -75.220018, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05313', 'GRANADA', 6.142892, -75.184446, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05315', 'GUADALUPE', 6.815069, -75.239862, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05318', 'GUARNE', 6.27787, -75.441612, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05321', 'GUATAPÉ', 6.232461, -75.160041, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05347', 'HELICONIA', 6.206757, -75.734322, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05353', 'HISPANIA', 5.799461, -75.906587, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05360', 'ITAGÜÍ', 6.175079, -75.612056, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05361', 'ITUANGO', 7.171629, -75.764673, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05364', 'JARDÍN', 5.597542, -75.818982, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05368', 'JERICÓ', 5.789748, -75.785499, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05376', 'LA CEJA', 6.028062, -75.429433, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05380', 'LA ESTRELLA', 6.145238, -75.637708, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05390', 'LA PINTADA', 5.743808, -75.60781, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05400', 'LA UNIÓN', 5.973845, -75.360874, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05411', 'LIBORINA', 6.677316, -75.812838, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05425', 'MACEO', 6.552116, -74.78716, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05440', 'MARINILLA', 6.173995, -75.339345, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05001', 'MEDELLÍN', 6.246631, -75.581775, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05467', 'MONTEBELLO', 5.946313, -75.523455, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05475', 'MURINDÓ', 6.97771, -76.817485, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05480', 'MUTATÁ', 7.242875, -76.435875, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05483', 'NARIÑO', 5.610777, -75.176262, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05495', 'NECHÍ', 8.094129, -74.77647, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05490', 'NECOCLÍ', 8.434526, -76.787271, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05501', 'OLAYA', 6.626492, -75.811773, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05541', 'PEÑOL', 6.219349, -75.242693, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05543', 'PEQUE', 7.021029, -75.910357, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05576', 'PUEBLORRICO', 5.79158, -75.839903, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05579', 'PUERTO BERRÍO', 6.487028, -74.410016, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05585', 'PUERTO NARE', 6.186025, -74.583012, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05591', 'PUERTO TRIUNFO', 5.871318, -74.64119, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05604', 'REMEDIOS', 7.029424, -74.698135, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05607', 'RETIRO', 6.062454, -75.501301, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05615', 'RIONEGRO', 6.147148, -75.377316, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05628', 'SABANALARGA', 6.850028, -75.816645, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05631', 'SABANETA', 6.149903, -75.615479, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05642', 'SALGAR', 5.964198, -75.976807, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05647', 'SAN ANDRÉS DE CUERQUÍA', 6.916676, -75.674564, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05649', 'SAN CARLOS', 6.187746, -74.988097, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05652', 'SAN FRANCISCO', 5.963476, -75.101562, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05656', 'SAN JERÓNIMO', 6.44809, -75.726975, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05658', 'SAN JOSÉ DE LA MONTAÑA', 6.85009, -75.683352, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05659', 'SAN JUAN DE URABÁ', 8.758964, -76.52857, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05660', 'SAN LUIS', 6.043017, -74.993619, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05664', 'SAN PEDRO DE LOS MILAGROS', 6.46012, -75.556743, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05665', 'SAN PEDRO DE URABÁ', 8.276884, -76.380567, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05667', 'SAN RAFAEL', 6.293759, -75.02849, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05670', 'SAN ROQUE', 6.485939, -75.019109, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05679', 'SANTA BÁRBARA', 5.875527, -75.567351, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05042', 'SANTA FÉ DE ANTIOQUIA', 6.556484, -75.826648, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05686', 'SANTA ROSA DE OSOS', 6.643366, -75.460723, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05690', 'SANTO DOMINGO', 6.473032, -75.164903, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05674', 'SAN VICENTE FERRER', 6.282164, -75.332616, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05736', 'SEGOVIA', 7.079648, -74.701596, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05756', 'SONSÓN', 5.714851, -75.309596, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05761', 'SOPETRÁN', 6.500745, -75.747378, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05789', 'TÁMESIS', 5.664645, -75.714429, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05790', 'TARAZÁ', 7.580127, -75.401407, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05792', 'TARSO', 5.864542, -75.822956, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05809', 'TITIRIBÍ', 6.062391, -75.791887, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05819', 'TOLEDO', 7.010328, -75.692281, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05837', 'TURBO', 8.089929, -76.728858, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05842', 'URAMITA', 6.898393, -76.173284, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05847', 'URRAO', 6.317343, -76.133951, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05854', 'VALDIVIA', 7.1652, -75.439274, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05856', 'VALPARAÍSO', 5.614555, -75.624452, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05858', 'VEGACHÍ', 6.773525, -74.798714, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05861', 'VENECIA', 5.964693, -75.735544, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05873', 'VIGÍA DEL FUERTE', 6.588164, -76.896004, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05885', 'YALÍ', 6.676554, -74.840059, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05887', 'YARUMAL', 6.963832, -75.418828, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05890', 'YOLOMBÓ', 6.594511, -75.013385, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05893', 'YONDÓ', 7.00396, -73.912445, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '05895', 'ZARAGOZA', 7.488583, -74.867075, TRUE
FROM departamentos d
WHERE d.codigo_dane = '05'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08078', 'BARANOA', 10.79445, -74.916077, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08001', 'BARRANQUILLA', 10.977961, -74.815546, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08137', 'CAMPO DE LA CRUZ', 10.378291, -74.880847, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08141', 'CANDELARIA', 10.461903, -74.879717, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08296', 'GALAPA', 10.919033, -74.870385, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08372', 'JUAN DE ACOSTA', 10.83254, -75.041032, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08421', 'LURUACO', 10.610491, -75.14199, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08433', 'MALAMBO', 10.857086, -74.776923, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08436', 'MANATÍ', 10.449089, -74.956867, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08520', 'PALMAR DE VARELA', 10.738591, -74.754765, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08549', 'PIOJÓ', 10.749216, -75.107592, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08558', 'POLONUEVO', 10.777363, -74.852981, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08560', 'PONEDERA', 10.641779, -74.753885, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08573', 'PUERTO COLOMBIA', 11.015322, -74.888627, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08606', 'REPELÓN', 10.493357, -75.125534, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08634', 'SABANAGRANDE', 10.792453, -74.759496, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08638', 'SABANALARGA', 10.632091, -74.921256, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08675', 'SANTA LUCÍA', 10.324303, -74.959204, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08685', 'SANTO TOMÁS', 10.758735, -74.757859, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08758', 'SOLEDAD', 10.909921, -74.786054, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08770', 'SUAN', 10.335432, -74.881687, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08832', 'TUBARÁ', 10.873586, -74.978704, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '08849', 'USIACURÍ', 10.74298, -74.976985, TRUE
FROM departamentos d
WHERE d.codigo_dane = '08'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '11001', 'BOGOTÁ, D.C.', 4.649251, -74.106992, TRUE
FROM departamentos d
WHERE d.codigo_dane = '11'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13006', 'ACHÍ', 8.570107, -74.557676, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13030', 'ALTOS DEL ROSARIO', 8.791865, -74.164905, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13042', 'ARENAL', 8.458865, -73.941099, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13052', 'ARJONA', 10.25666, -75.344332, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13062', 'ARROYOHONDO', 10.250075, -75.019215, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13074', 'BARRANCO DE LOBA', 8.947787, -74.104391, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13140', 'CALAMAR', 10.250431, -74.916144, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13160', 'CANTAGALLO', 7.378678, -73.914605, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13001', 'CARTAGENA DE INDIAS', 10.385126, -75.496269, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13188', 'CICUCO', 9.274281, -74.645981, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13222', 'CLEMENCIA', 10.567452, -75.328469, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13212', 'CÓRDOBA', 9.586942, -74.827399, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13244', 'EL CARMEN DE BOLÍVAR', 9.718653, -75.121178, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13248', 'EL GUAMO', 10.030958, -74.976084, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13268', 'EL PEÑÓN', 8.988271, -73.949274, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13300', 'HATILLO DE LOBA', 8.956014, -74.077912, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13430', 'MAGANGUÉ', 9.263799, -74.766742, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13433', 'MAHATES', 10.233285, -75.191643, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13440', 'MARGARITA', 9.15784, -74.285137, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13442', 'MARÍA LA BAJA', 9.982402, -75.300516, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13458', 'MONTECRISTO', 8.297234, -74.471176, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13473', 'MORALES', 8.276558, -73.868172, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13490', 'NOROSÍ', 8.526259, -74.038003, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13549', 'PINILLOS', 8.914947, -74.462279, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13580', 'REGIDOR', 8.666258, -73.821638, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13600', 'RÍO VIEJO', 8.58795, -73.840466, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13620', 'SAN CRISTÓBAL', 10.392836, -75.065076, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13647', 'SAN ESTANISLAO', 10.398602, -75.153101, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13650', 'SAN FERNANDO', 9.214183, -74.323811, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13654', 'SAN JACINTO', 9.830275, -75.12105, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13655', 'SAN JACINTO DEL CAUCA', 8.25158, -74.721156, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13657', 'SAN JUAN NEPOMUCENO', 9.953751, -75.081761, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13667', 'SAN MARTÍN DE LOBA', 8.937485, -74.039134, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13670', 'SAN PABLO', 7.476747, -73.924602, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13673', 'SANTA CATALINA', 10.605294, -75.287855, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13468', 'SANTA CRUZ DE MOMPOX', 9.244241, -74.42818, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13683', 'SANTA ROSA', 10.444396, -75.369824, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13688', 'SANTA ROSA DEL SUR', 7.963938, -74.052243, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13744', 'SIMITÍ', 7.953916, -73.947264, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13760', 'SOPLAVIENTO', 10.38839, -75.136404, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13780', 'TALAIGUA NUEVO', 9.30403, -74.567479, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13810', 'TIQUISIO', 8.558666, -74.262922, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13836', 'TURBACO', 10.348316, -75.427249, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13838', 'TURBANÁ', 10.274585, -75.44265, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13873', 'VILLANUEVA', 10.444089, -75.275613, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '13894', 'ZAMBRANO', 9.746306, -74.817879, TRUE
FROM departamentos d
WHERE d.codigo_dane = '13'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15022', 'ALMEIDA', 4.970857, -73.378933, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15047', 'AQUITANIA', 5.518602, -72.88399, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15051', 'ARCABUCO', 5.755673, -73.437503, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15087', 'BELÉN', 5.98923, -72.911641, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15090', 'BERBEO', 5.227451, -73.12721, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15092', 'BETÉITIVA', 5.909978, -72.809014, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15097', 'BOAVITA', 6.330703, -72.584905, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15104', 'BOYACÁ', 5.454578, -73.361945, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15106', 'BRICEÑO', 5.690879, -73.92326, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15109', 'BUENAVISTA', 5.512594, -73.94217, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15114', 'BUSBANZÁ', 5.831393, -72.884158, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15131', 'CALDAS', 5.55458, -73.865553, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15135', 'CAMPOHERMOSO', 5.031676, -73.104173, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15162', 'CERINZA', 5.955939, -72.947918, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15172', 'CHINAVITA', 5.167486, -73.368476, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15176', 'CHIQUINQUIRÁ', 5.61379, -73.818745, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15232', 'CHÍQUIZA', 5.639834, -73.449463, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15180', 'CHISCAS', 6.553136, -72.500957, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15183', 'CHITA', 6.187083, -72.471892, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15185', 'CHITARAQUE', 6.027425, -73.4471, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15187', 'CHIVATÁ', 5.558949, -73.282529, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15236', 'CHIVOR', 4.888173, -73.368398, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15189', 'CIÉNEGA', 5.408694, -73.296049, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15204', 'CÓMBITA', 5.634545, -73.323957, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15212', 'COPER', 5.475074, -74.045636, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15215', 'CORRALES', 5.828064, -72.844795, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15218', 'COVARACHÍA', 6.500177, -72.738978, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15223', 'CUBARÁ', 6.997275, -72.107939, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15224', 'CUCAITA', 5.544452, -73.454338, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15226', 'CUÍTIVA', 5.580367, -72.965923, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15238', 'DUITAMA', 5.822964, -73.03063, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15244', 'EL COCUY', 6.407738, -72.444537, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15248', 'EL ESPINO', 6.483027, -72.497007, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15272', 'FIRAVITOBA', 5.668885, -72.993392, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15276', 'FLORESTA', 5.859519, -72.918111, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15293', 'GACHANTIVÁ', 5.751891, -73.549092, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15296', 'GÁMEZA', 5.802333, -72.80553, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15299', 'GARAGOA', 5.083234, -73.364413, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15317', 'GUACAMAYAS', 6.459667, -72.500812, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15322', 'GUATEQUE', 5.007321, -73.471207, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15325', 'GUAYATÁ', 4.967122, -73.489698, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15332', 'GÜICÁN DE LA SIERRA', 6.462864, -72.411763, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15362', 'IZA', 5.611577, -72.979559, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15367', 'JENESANO', 5.385813, -73.363738, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15368', 'JERICÓ', 6.145735, -72.571122, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15377', 'LABRANZAGRANDE', 5.562687, -72.57777, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15380', 'LA CAPILLA', 5.095687, -73.444347, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15403', 'LA UVITA', 6.31616, -72.559982, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15401', 'LA VICTORIA', 5.523792, -74.234393, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15425', 'MACANAL', 4.972464, -73.319593, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15442', 'MARIPÍ', 5.550091, -74.00405, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15455', 'MIRAFLORES', 5.196515, -73.14563, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15464', 'MONGUA', 5.754242, -72.79809, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15466', 'MONGUÍ', 5.723486, -72.849292, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15469', 'MONIQUIRÁ', 5.876331, -73.573374, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15476', 'MOTAVITA', 5.5777, -73.367841, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15480', 'MUZO', 5.532758, -74.10269, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15491', 'NOBSA', 5.768046, -72.937042, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15494', 'NUEVO COLÓN', 5.355317, -73.456759, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15500', 'OICATÁ', 5.595235, -73.308399, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15507', 'OTANCHE', 5.657536, -74.180965, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15511', 'PACHAVITA', 5.140065, -73.396953, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15514', 'PÁEZ', 5.097319, -73.052737, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15516', 'PAIPA', 5.779894, -73.11782, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15518', 'PAJARITO', 5.293783, -72.703231, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15522', 'PANQUEBA', 6.443416, -72.459424, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15531', 'PAUNA', 5.656323, -73.978449, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15533', 'PAYA', 5.625699, -72.423775, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15537', 'PAZ DE RÍO', 5.987645, -72.749137, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15542', 'PESCA', 5.558808, -73.050872, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15550', 'PISBA', 5.72141, -72.486023, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15572', 'PUERTO BOYACÁ', 5.976646, -74.587782, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15580', 'QUÍPAMA', 5.52055, -74.180033, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15599', 'RAMIRIQUÍ', 5.400303, -73.334839, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15600', 'RÁQUIRA', 5.539136, -73.632543, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15621', 'RONDÓN', 5.357378, -73.208474, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15632', 'SABOYÁ', 5.697756, -73.764456, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15638', 'SÁCHICA', 5.584305, -73.542539, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15646', 'SAMACÁ', 5.492161, -73.485589, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15660', 'SAN EDUARDO', 5.22401, -73.077747, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15664', 'SAN JOSÉ DE PARE', 6.018924, -73.545397, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15667', 'SAN LUIS DE GACENO', 4.81976, -73.168076, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15673', 'SAN MATEO', 6.401683, -72.555264, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15676', 'SAN MIGUEL DE SEMA', 5.518083, -73.722009, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15681', 'SAN PABLO DE BORBUR', 5.650743, -74.069963, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15690', 'SANTA MARÍA', 4.857193, -73.263518, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15686', 'SANTANA', 6.056866, -73.481639, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15693', 'SANTA ROSA DE VITERBO', 5.874547, -72.982461, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15696', 'SANTA SOFÍA', 5.713269, -73.602707, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15720', 'SATIVANORTE', 6.131132, -72.708458, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15723', 'SATIVASUR', 6.093183, -72.712435, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15740', 'SIACHOQUE', 5.511811, -73.24466, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15753', 'SOATÁ', 6.331945, -72.684051, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15757', 'SOCHA', 5.996717, -72.691963, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15755', 'SOCOTÁ', 6.041162, -72.636653, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15759', 'SOGAMOSO', 5.723976, -72.924355, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15761', 'SOMONDOCO', 4.985726, -73.433393, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15762', 'SORA', 5.56684, -73.450153, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15764', 'SORACÁ', 5.500898, -73.332804, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15763', 'SOTAQUIRÁ', 5.764986, -73.246585, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15774', 'SUSACÓN', 6.230332, -72.690289, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15776', 'SUTAMARCHÁN', 5.619781, -73.620536, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15778', 'SUTATENZA', 5.022989, -73.452317, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15790', 'TASCO', 5.909821, -72.781011, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15798', 'TENZA', 5.076781, -73.421176, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15804', 'TIBANÁ', 5.317251, -73.396457, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15806', 'TIBASOSA', 5.74723, -72.999449, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15808', 'TINJACÁ', 5.579713, -73.646847, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15810', 'TIPACOQUE', 6.419203, -72.691729, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15814', 'TOCA', 5.566464, -73.184794, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15816', 'TOGÜÍ', 5.937438, -73.513655, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15820', 'TÓPAGA', 5.768201, -72.832245, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15822', 'TOTA', 5.560497, -72.985898, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15001', 'TUNJA', 5.53988, -73.355539, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15832', 'TUNUNGUÁ', 5.730582, -73.933155, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15835', 'TURMEQUÉ', 5.323261, -73.491825, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15837', 'TUTA', 5.689082, -73.230285, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15839', 'TUTAZÁ', 6.032608, -72.856035, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15842', 'ÚMBITA', 5.221176, -73.456917, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15861', 'VENTAQUEMADA', 5.368739, -73.522368, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15407', 'VILLA DE LEYVA', 5.632455, -73.524948, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15879', 'VIRACACHÁ', 5.436833, -73.296894, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '15897', 'ZETAQUIRA', 5.283443, -73.17098, TRUE
FROM departamentos d
WHERE d.codigo_dane = '15'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17013', 'AGUADAS', 5.610244, -75.45487, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17042', 'ANSERMA', 5.236471, -75.784343, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17050', 'ARANZAZU', 5.271195, -75.49129, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17088', 'BELALCÁZAR', 4.993785, -75.811918, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17174', 'CHINCHINÁ', 4.985227, -75.607529, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17272', 'FILADELFIA', 5.297091, -75.562474, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17380', 'LA DORADA', 5.460834, -74.668819, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17388', 'LA MERCED', 5.39647, -75.546486, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17001', 'MANIZALES', 5.057657, -75.491025, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17433', 'MANZANARES', 5.255699, -75.152829, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17442', 'MARMATO', 5.47422, -75.600049, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17444', 'MARQUETALIA', 5.297525, -75.053097, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17446', 'MARULANDA', 5.284304, -75.259721, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17486', 'NEIRA', 5.166895, -75.520006, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17495', 'NORCASIA', 5.574796, -74.889543, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17513', 'PÁCORA', 5.527172, -75.459621, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17524', 'PALESTINA', 5.017879, -75.624577, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17541', 'PENSILVANIA', 5.383281, -75.160299, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17614', 'RIOSUCIO', 5.423673, -75.702104, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17616', 'RISARALDA', 5.164509, -75.76722, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17653', 'SALAMINA', 5.403025, -75.487223, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17662', 'SAMANÁ', 5.41308, -74.992263, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17665', 'SAN JOSÉ', 5.08231, -75.792063, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17777', 'SUPÍA', 5.446843, -75.64966, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17867', 'VICTORIA', 5.317437, -74.911239, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17873', 'VILLAMARÍA', 5.038925, -75.502487, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '17877', 'VITERBO', 5.062664, -75.87061, TRUE
FROM departamentos d
WHERE d.codigo_dane = '17'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '18029', 'ALBANIA', 1.328526, -75.878375, TRUE
FROM departamentos d
WHERE d.codigo_dane = '18'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '18094', 'BELÉN DE LOS ANDAQUÍES', 1.415812, -75.872405, TRUE
FROM departamentos d
WHERE d.codigo_dane = '18'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '18150', 'CARTAGENA DEL CHAIRÁ', 1.332371, -74.847867, TRUE
FROM departamentos d
WHERE d.codigo_dane = '18'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '18205', 'CURILLO', 1.033473, -75.919205, TRUE
FROM departamentos d
WHERE d.codigo_dane = '18'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '18247', 'EL DONCELLO', 1.679951, -75.283631, TRUE
FROM departamentos d
WHERE d.codigo_dane = '18'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '18256', 'EL PAUJÍL', 1.570226, -75.326093, TRUE
FROM departamentos d
WHERE d.codigo_dane = '18'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '18001', 'FLORENCIA', 1.618196, -75.609831, TRUE
FROM departamentos d
WHERE d.codigo_dane = '18'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '18410', 'LA MONTAÑITA', 1.479173, -75.436408, TRUE
FROM departamentos d
WHERE d.codigo_dane = '18'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '18460', 'MILÁN', 1.29021, -75.506926, TRUE
FROM departamentos d
WHERE d.codigo_dane = '18'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '18479', 'MORELIA', 1.486611, -75.724146, TRUE
FROM departamentos d
WHERE d.codigo_dane = '18'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '18592', 'PUERTO RICO', 1.909063, -75.157604, TRUE
FROM departamentos d
WHERE d.codigo_dane = '18'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '18610', 'SAN JOSÉ DEL FRAGUA', 1.330266, -75.973796, TRUE
FROM departamentos d
WHERE d.codigo_dane = '18'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '18753', 'SAN VICENTE DEL CAGUÁN', 2.119413, -74.767894, TRUE
FROM departamentos d
WHERE d.codigo_dane = '18'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '18756', 'SOLANO', 0.699077, -75.253702, TRUE
FROM departamentos d
WHERE d.codigo_dane = '18'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '18785', 'SOLITA', 0.87654, -75.619902, TRUE
FROM departamentos d
WHERE d.codigo_dane = '18'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '18860', 'VALPARAÍSO', 1.194619, -75.70671, TRUE
FROM departamentos d
WHERE d.codigo_dane = '18'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19022', 'ALMAGUER', 1.913429, -76.85607, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19050', 'ARGELIA', 2.257427, -77.24905, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19075', 'BALBOA', 2.040998, -77.215773, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19100', 'BOLÍVAR', 1.837538, -76.966215, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19110', 'BUENOS AIRES', 3.015382, -76.642238, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19130', 'CAJIBÍO', 2.623371, -76.570682, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19137', 'CALDONO', 2.798059, -76.484319, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19142', 'CALOTO', 3.034531, -76.408941, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19212', 'CORINTO', 3.173854, -76.261866, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19256', 'EL TAMBO', 2.451409, -76.810911, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19290', 'FLORENCIA', 1.682535, -77.072547, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19300', 'GUACHENÉ', 3.134153, -76.392189, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19318', 'GUAPI', 2.571337, -77.88797, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19355', 'INZÁ', 2.549183, -76.063503, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19364', 'JAMBALÓ', 2.777834, -76.323877, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19392', 'LA SIERRA', 2.179383, -76.763278, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19397', 'LA VEGA', 2.001803, -76.778771, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19418', 'LÓPEZ DE MICAY', 2.846788, -77.247803, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19450', 'MERCADERES', 1.789193, -77.164319, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19455', 'MIRANDA', 3.254651, -76.228722, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19473', 'MORALES', 2.754684, -76.629106, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19513', 'PADILLA', 3.220984, -76.313265, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19517', 'PÁEZ', 2.645724, -75.970685, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19532', 'PATÍA', 2.115875, -76.981075, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19533', 'PIAMONTE', 1.11754, -76.327588, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19548', 'PIENDAMÓ - TUNÍA', 2.64228, -76.528615, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19001', 'POPAYÁN', 2.459641, -76.599377, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19573', 'PUERTO TEJADA', 3.233254, -76.417673, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19585', 'PURACÉ', 2.341507, -76.496698, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19622', 'ROSAS', 2.260941, -76.740336, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19693', 'SAN SEBASTIÁN', 1.838451, -76.769467, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19698', 'SANTANDER DE QUILICHAO', 3.015008, -76.485141, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19701', 'SANTA ROSA', 1.700916, -76.573252, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19743', 'SILVIA', 2.611927, -76.379753, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19760', 'SOTARÁ - PAISPAMBA', 2.253156, -76.613365, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19780', 'SUÁREZ', 2.959785, -76.69357, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19785', 'SUCRE', 2.038237, -76.926279, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19807', 'TIMBÍO', 2.349686, -76.684476, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19809', 'TIMBIQUÍ', 2.777312, -77.667541, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19821', 'TORIBÍO', 2.953017, -76.270284, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19824', 'TOTORÓ', 2.510252, -76.403628, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '19845', 'VILLA RICA', 3.17762, -76.458025, TRUE
FROM departamentos d
WHERE d.codigo_dane = '19'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20011', 'AGUACHICA', 8.306811, -73.614027, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20013', 'AGUSTÍN CODAZZI', 10.040454, -73.238389, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20032', 'ASTREA', 9.498062, -73.975842, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20045', 'BECERRIL', 9.704404, -73.278707, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20060', 'BOSCONIA', 9.975098, -73.888761, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20175', 'CHIMICHAGUA', 9.25875, -73.813278, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20178', 'CHIRIGUANÁ', 9.361058, -73.599913, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20228', 'CURUMANÍ', 9.201716, -73.540843, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20238', 'EL COPEY', 10.149883, -73.962703, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20250', 'EL PASO', 9.668461, -73.742012, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20295', 'GAMARRA', 8.324793, -73.737558, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20310', 'GONZÁLEZ', 8.389604, -73.38004, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20383', 'LA GLORIA', 8.619298, -73.80321, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20400', 'LA JAGUA DE IBIRICO', 9.563752, -73.334143, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20621', 'LA PAZ', 10.387552, -73.171365, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20443', 'MANAURE BALCÓN DEL CESAR', 10.390776, -73.029472, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20517', 'PAILITAS', 8.959399, -73.625825, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20550', 'PELAYA', 8.689451, -73.666735, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20570', 'PUEBLO BELLO', 10.417321, -73.586211, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20614', 'RÍO DE ORO', 8.292292, -73.386393, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20710', 'SAN ALBERTO', 7.76111, -73.393889, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20750', 'SAN DIEGO', 10.333039, -73.181208, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20770', 'SAN MARTÍN', 7.999855, -73.510914, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20787', 'TAMALAMEQUE', 8.861725, -73.812172, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '20001', 'VALLEDUPAR', 10.460472, -73.259398, TRUE
FROM departamentos d
WHERE d.codigo_dane = '20'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23068', 'AYAPEL', 8.313838, -75.146048, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23079', 'BUENAVISTA', 8.221187, -75.480897, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23090', 'CANALETE', 8.786939, -76.241476, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23162', 'CERETÉ', 8.888532, -75.796093, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23168', 'CHIMÁ', 9.149698, -75.626886, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23182', 'CHINÚ', 9.105473, -75.399633, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23189', 'CIÉNAGA DE ORO', 8.875794, -75.620807, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23300', 'COTORRA', 9.037163, -75.799216, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23350', 'LA APARTADA', 8.050125, -75.336031, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23417', 'LORICA', 9.240789, -75.816084, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23419', 'LOS CÓRDOBAS', 8.892098, -76.35518, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23464', 'MOMIL', 9.240707, -75.67796, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23500', 'MOÑITOS', 9.245223, -76.1291, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23466', 'MONTELÍBANO', 7.973777, -75.416818, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23001', 'MONTERÍA', 8.759789, -75.873096, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23555', 'PLANETA RICA', 8.4082, -75.583241, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23570', 'PUEBLO NUEVO', 8.504099, -75.508035, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23574', 'PUERTO ESCONDIDO', 9.005372, -76.260411, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23580', 'PUERTO LIBERTADOR', 7.888859, -75.671761, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23586', 'PURÍSIMA DE LA CONCEPCIÓN', 9.239295, -75.724987, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23660', 'SAHAGÚN', 8.943048, -75.445834, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23670', 'SAN ANDRÉS DE SOTAVENTO', 9.145448, -75.50879, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23672', 'SAN ANTERO', 9.376434, -75.76112, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23675', 'SAN BERNARDO DEL VIENTO', 9.35247, -75.955107, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23678', 'SAN CARLOS', 8.799282, -75.698799, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23682', 'SAN JOSÉ DE URÉ', 7.787303, -75.533476, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23686', 'SAN PELAYO', 8.958436, -75.835615, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23807', 'TIERRALTA', 8.170612, -76.059797, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23815', 'TUCHÍN', 9.186625, -75.553962, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '23855', 'VALENCIA', 8.255016, -76.150756, TRUE
FROM departamentos d
WHERE d.codigo_dane = '23'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25001', 'AGUA DE DIOS', 4.375309, -74.669221, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25019', 'ALBÁN', 4.878022, -74.438261, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25035', 'ANAPOIMA', 4.562737, -74.528676, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25040', 'ANOLAIMA', 4.7617, -74.46384, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25599', 'APULO', 4.520304, -74.593926, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25053', 'ARBELÁEZ', 4.272534, -74.414901, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25086', 'BELTRÁN', 4.802832, -74.741666, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25095', 'BITUIMA', 4.872171, -74.539609, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25099', 'BOJACÁ', 4.737205, -74.344594, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25120', 'CABRERA', 3.985164, -74.484549, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25123', 'CACHIPAY', 4.730957, -74.435711, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25126', 'CAJICÁ', 4.920009, -74.02298, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25148', 'CAPARRAPÍ', 5.34758, -74.491045, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25151', 'CÁQUEZA', 4.404112, -73.946473, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25154', 'CARMEN DE CARUPA', 5.349119, -73.901357, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25168', 'CHAGUANÍ', 4.948916, -74.593455, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25175', 'CHÍA', 4.866508, -74.05, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25178', 'CHIPAQUE', 4.442671, -74.044876, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25181', 'CHOACHÍ', 4.527048, -73.922894, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25183', 'CHOCONTÁ', 5.145224, -73.683533, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25200', 'COGUA', 5.061842, -73.978497, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25214', 'COTA', 4.812564, -74.102569, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25224', 'CUCUNUBÁ', 5.249795, -73.766113, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25245', 'EL COLEGIO', 4.577951, -74.442261, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25258', 'EL PEÑÓN', 5.248747, -74.290207, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25260', 'EL ROSAL', 4.850589, -74.263103, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25269', 'FACATATIVÁ', 4.813353, -74.350085, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25279', 'FÓMEQUE', 4.485474, -73.892523, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25281', 'FOSCA', 4.339093, -73.93902, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25286', 'FUNZA', 4.710412, -74.201528, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25288', 'FÚQUENE', 5.403997, -73.795855, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25290', 'FUSAGASUGÁ', 4.336723, -74.37543, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25293', 'GACHALÁ', 4.693579, -73.520161, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25295', 'GACHANCIPÁ', 4.990947, -73.873464, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25297', 'GACHETÁ', 4.816411, -73.636377, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25299', 'GAMA', 4.763325, -73.611037, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25307', 'GIRARDOT', 4.313069, -74.798201, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25312', 'GRANADA', 4.519763, -74.350766, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25317', 'GUACHETÁ', 5.383378, -73.686972, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25320', 'GUADUAS', 5.072076, -74.603402, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25322', 'GUASCA', 4.866719, -73.877143, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25324', 'GUATAQUÍ', 4.517517, -74.790058, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25326', 'GUATAVITA', 4.935211, -73.83293, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25328', 'GUAYABAL DE SÍQUIMA', 4.877968, -74.467437, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25335', 'GUAYABETAL', 4.215306, -73.815107, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25339', 'GUTIÉRREZ', 4.254679, -74.003042, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25368', 'JERUSALÉN', 4.562273, -74.695474, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25372', 'JUNÍN', 4.79057, -73.662961, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25377', 'LA CALERA', 4.721104, -73.968161, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25386', 'LA MESA', 4.631028, -74.461588, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25394', 'LA PALMA', 5.358816, -74.391022, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25398', 'LA PEÑA', 5.198945, -74.394105, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25402', 'LA VEGA', 4.997768, -74.336885, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25407', 'LENGUAZAQUE', 5.306131, -73.711512, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25426', 'MACHETÁ', 5.08007, -73.608226, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25430', 'MADRID', 4.732791, -74.265854, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25436', 'MANTA', 5.009008, -73.540444, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25438', 'MEDINA', 4.506298, -73.348449, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25473', 'MOSQUERA', 4.70653, -74.221154, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25483', 'NARIÑO', 4.399837, -74.824732, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25486', 'NEMOCÓN', 5.068705, -73.877888, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25488', 'NILO', 4.305838, -74.620009, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25489', 'NIMAIMA', 5.125992, -74.38604, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25491', 'NOCAIMA', 5.069466, -74.379093, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25513', 'PACHO', 5.136907, -74.156132, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25518', 'PAIME', 5.370487, -74.152213, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25524', 'PANDI', 4.190393, -74.486641, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25530', 'PARATEBUENO', 4.374832, -73.212825, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25535', 'PASCA', 4.308979, -74.302276, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25572', 'PUERTO SALGAR', 5.465413, -74.653695, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25580', 'PULÍ', 4.682022, -74.71438, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25592', 'QUEBRADANEGRA', 5.118076, -74.48014, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25594', 'QUETAME', 4.329884, -73.863214, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25596', 'QUIPILE', 4.74481, -74.533705, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25612', 'RICAURTE', 4.282113, -74.772861, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25645', 'SAN ANTONIO DEL TEQUENDAMA', 4.616138, -74.351443, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25649', 'SAN BERNARDO', 4.179433, -74.42296, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25653', 'SAN CAYETANO', 5.332938, -74.024754, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25658', 'SAN FRANCISCO', 4.972917, -74.289672, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25662', 'SAN JUAN DE RIOSECO', 4.847575, -74.621919, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25718', 'SASAIMA', 4.962167, -74.432628, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25736', 'SESQUILÉ', 5.04476, -73.796099, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25740', 'SIBATÉ', 4.492625, -74.257874, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25743', 'SILVANIA', 4.381981, -74.405534, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25745', 'SIMIJACA', 5.505231, -73.850703, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25754', 'SOACHA', 4.579268, -74.215463, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25758', 'SOPÓ', 4.915395, -73.943328, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25769', 'SUBACHOQUE', 4.929118, -74.172773, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25772', 'SUESCA', 5.103495, -73.798227, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25777', 'SUPATÁ', 5.06162, -74.235403, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25779', 'SUSA', 5.455291, -73.813938, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25781', 'SUTATAUSA', 5.247482, -73.853159, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25785', 'TABIO', 4.916832, -74.096461, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25793', 'TAUSA', 5.196333, -73.887813, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25797', 'TENA', 4.655286, -74.389193, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25799', 'TENJO', 4.872014, -74.143724, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25805', 'TIBACUY', 4.348605, -74.452662, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25807', 'TIBIRITA', 5.052278, -73.504514, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25815', 'TOCAIMA', 4.459279, -74.636296, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25817', 'TOCANCIPÁ', 4.964641, -73.91207, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25823', 'TOPAIPÍ', 5.336224, -74.300626, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25839', 'UBALÁ', 4.74762, -73.531489, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25841', 'UBAQUE', 4.483788, -73.933477, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25845', 'UNE', 4.40245, -74.025183, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25851', 'ÚTICA', 5.19055, -74.483154, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25506', 'VENECIA', 4.089056, -74.478301, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25862', 'VERGARA', 5.117258, -74.346163, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25867', 'VIANÍ', 4.875208, -74.56132, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25843', 'VILLA DE SAN DIEGO DE UBATÉ', 5.307463, -73.814367, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25871', 'VILLAGÓMEZ', 5.273024, -74.195145, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25873', 'VILLAPINZÓN', 5.216393, -73.595704, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25875', 'VILLETA', 5.012754, -74.469686, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25878', 'VIOTÁ', 4.43935, -74.523131, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25885', 'YACOPÍ', 5.459272, -74.33806, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25898', 'ZIPACÓN', 4.759932, -74.379566, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '25899', 'ZIPAQUIRÁ', 5.025477, -73.994444, TRUE
FROM departamentos d
WHERE d.codigo_dane = '25'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27006', 'ACANDÍ', 8.512178, -77.279951, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27025', 'ALTO BAUDÓ', 5.516221, -76.974373, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27050', 'ATRATO', 5.531419, -76.635674, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27073', 'BAGADÓ', 5.409681, -76.416063, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27075', 'BAHÍA SOLANO', 6.222807, -77.401359, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27077', 'BAJO BAUDÓ', 4.954576, -77.365717, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27099', 'BOJAYÁ', 6.559708, -76.886773, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27150', 'CARMEN DEL DARIÉN', 7.158294, -76.970798, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27160', 'CÉRTEGUI', 5.371373, -76.607619, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27205', 'CONDOTO', 5.091003, -76.650683, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27135', 'EL CANTÓN DEL SAN PABLO', 5.335321, -76.726844, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27245', 'EL CARMEN DE ATRATO', 5.899789, -76.142112, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27250', 'EL LITORAL DEL SAN JUAN', 4.259564, -77.363702, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27361', 'ISTMINA', 5.153946, -76.68518, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27372', 'JURADÓ', 7.103619, -77.762751, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27413', 'LLORÓ', 5.49789, -76.545147, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27425', 'MEDIO ATRATO', 5.994935, -76.783042, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27430', 'MEDIO BAUDÓ', 5.192471, -76.950891, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27450', 'MEDIO SAN JUAN', 5.098291, -76.694409, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27491', 'NÓVITA', 4.956063, -76.609467, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27493', 'NUEVO BELÉN DE BAJIRÁ', 7.3719, -76.71727, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27495', 'NUQUÍ', 5.709812, -77.265507, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27001', 'QUIBDÓ', 5.682166, -76.638144, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27580', 'RÍO IRÓ', 5.1863, -76.472925, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27600', 'RÍO QUITO', 5.483667, -76.740684, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27615', 'RIOSUCIO', 7.436704, -77.113156, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27660', 'SAN JOSÉ DEL PALMAR', 4.896954, -76.234227, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27745', 'SIPÍ', 4.65262, -76.643453, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27787', 'TADÓ', 5.264873, -76.558571, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27800', 'UNGUÍA', 8.04406, -77.092538, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '27810', 'UNIÓN PANAMERICANA', 5.281108, -76.630143, TRUE
FROM departamentos d
WHERE d.codigo_dane = '27'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41006', 'ACEVEDO', 1.805173, -75.888706, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41013', 'AGRADO', 2.25987, -75.772022, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41016', 'AIPE', 3.223996, -75.239017, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41020', 'ALGECIRAS', 2.521674, -75.315389, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41026', 'ALTAMIRA', 2.063841, -75.788471, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41078', 'BARAYA', 3.152204, -75.054843, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41132', 'CAMPOALEGRE', 2.686767, -75.325748, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41206', 'COLOMBIA', 3.376745, -74.802815, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41244', 'ELÍAS', 2.012854, -75.938301, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41298', 'GARZÓN', 2.196493, -75.627057, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41306', 'GIGANTE', 2.384031, -75.547681, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41319', 'GUADALUPE', 2.02426, -75.757185, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41349', 'HOBO', 2.580812, -75.447697, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41357', 'ÍQUIRA', 2.649359, -75.634497, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41359', 'ISNOS', 1.929467, -76.217637, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41378', 'LA ARGENTINA', 2.198496, -75.979763, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41396', 'LA PLATA', 2.389263, -75.891254, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41483', 'NÁTAGA', 2.5451, -75.808756, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41001', 'NEIVA', 2.935432, -75.277327, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41503', 'OPORAPA', 2.025088, -75.995165, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41518', 'PAICOL', 2.449651, -75.773158, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41524', 'PALERMO', 2.889649, -75.435296, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41530', 'PALESTINA', 1.723725, -76.133251, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41548', 'PITAL', 2.266618, -75.804544, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41551', 'PITALITO', 1.852631, -76.049441, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41615', 'RIVERA', 2.777586, -75.258753, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41660', 'SALADOBLANCO', 1.9934, -76.044747, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41668', 'SAN AGUSTÍN', 1.881081, -76.27036, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41676', 'SANTA MARÍA', 2.939603, -75.586223, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41770', 'SUAZA', 1.976051, -75.79525, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41791', 'TARQUI', 2.111325, -75.823976, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41799', 'TELLO', 3.067538, -75.138773, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41801', 'TERUEL', 2.740968, -75.567034, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41797', 'TESALIA', 2.486364, -75.730271, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41807', 'TIMANÁ', 1.974539, -75.932167, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41872', 'VILLAVIEJA', 3.218822, -75.217174, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '41885', 'YAGUARÁ', 2.664694, -75.518023, TRUE
FROM departamentos d
WHERE d.codigo_dane = '41'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '44035', 'ALBANIA', 11.151628, -72.61232, TRUE
FROM departamentos d
WHERE d.codigo_dane = '44'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '44078', 'BARRANCAS', 10.958669, -72.793639, TRUE
FROM departamentos d
WHERE d.codigo_dane = '44'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '44090', 'DIBULLA', 11.27155, -73.307598, TRUE
FROM departamentos d
WHERE d.codigo_dane = '44'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '44098', 'DISTRACCIÓN', 10.898414, -72.887405, TRUE
FROM departamentos d
WHERE d.codigo_dane = '44'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '44110', 'EL MOLINO', 10.653505, -72.92673, TRUE
FROM departamentos d
WHERE d.codigo_dane = '44'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '44279', 'FONSECA', 10.886734, -72.846319, TRUE
FROM departamentos d
WHERE d.codigo_dane = '44'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '44378', 'HATONUEVO', 11.068864, -72.75904, TRUE
FROM departamentos d
WHERE d.codigo_dane = '44'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '44420', 'LA JAGUA DEL PILAR', 10.511862, -73.072638, TRUE
FROM departamentos d
WHERE d.codigo_dane = '44'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '44430', 'MAICAO', 11.378535, -72.242738, TRUE
FROM departamentos d
WHERE d.codigo_dane = '44'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '44560', 'MANAURE', 11.773767, -72.438739, TRUE
FROM departamentos d
WHERE d.codigo_dane = '44'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '44001', 'RIOHACHA', 11.528588, -72.911795, TRUE
FROM departamentos d
WHERE d.codigo_dane = '44'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '44650', 'SAN JUAN DEL CESAR', 10.769546, -73.000629, TRUE
FROM departamentos d
WHERE d.codigo_dane = '44'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '44847', 'URIBIA', 11.711904, -72.265906, TRUE
FROM departamentos d
WHERE d.codigo_dane = '44'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '44855', 'URUMITA', 10.560169, -73.012507, TRUE
FROM departamentos d
WHERE d.codigo_dane = '44'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '44874', 'VILLANUEVA', 10.608774, -72.977583, TRUE
FROM departamentos d
WHERE d.codigo_dane = '44'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47030', 'ALGARROBO', 10.188059, -74.061132, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47053', 'ARACATACA', 10.589791, -74.186702, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47058', 'ARIGUANÍ', 9.847047, -74.236515, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47161', 'CERRO DE SAN ANTONIO', 10.325531, -74.868474, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47170', 'CHIVOLO', 10.026631, -74.622242, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47189', 'CIÉNAGA', 11.006654, -74.241286, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47205', 'CONCORDIA', 10.257314, -74.83303, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47245', 'EL BANCO', 9.008503, -73.97437, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47258', 'EL PIÑÓN', 10.402781, -74.823094, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47268', 'EL RETÉN', 10.610488, -74.268444, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47288', 'FUNDACIÓN', 10.514146, -74.191453, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47318', 'GUAMAL', 9.144354, -74.223689, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47460', 'NUEVA GRANADA', 9.80186, -74.391841, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47541', 'PEDRAZA', 10.18825, -74.9154, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47545', 'PIJIÑO DEL CARMEN', 9.331922, -74.459034, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47551', 'PIVIJAY', 10.460707, -74.613312, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47555', 'PLATO', 9.796713, -74.784549, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47570', 'PUEBLOVIEJO', 10.994766, -74.28253, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47605', 'REMOLINO', 10.701952, -74.716172, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47660', 'SABANAS DE SAN ÁNGEL', 10.032536, -74.213946, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47675', 'SALAMINA', 10.491229, -74.794189, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47692', 'SAN SEBASTIÁN DE BUENAVISTA', 9.241656, -74.351498, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47707', 'SANTA ANA', 9.324294, -74.566845, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47720', 'SANTA BÁRBARA DE PINTO', 9.432263, -74.704667, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47001', 'SANTA MARTA', 11.204679, -74.199829, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47703', 'SAN ZENÓN', 9.245061, -74.498992, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47745', 'SITIONUEVO', 10.775285, -74.720021, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47798', 'TENERIFE', 9.898273, -74.859783, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47960', 'ZAPAYÁN', 10.168297, -74.716878, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '47980', 'ZONA BANANERA', 10.763024, -74.140091, TRUE
FROM departamentos d
WHERE d.codigo_dane = '47'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50006', 'ACACÍAS', 3.990413, -73.766034, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50110', 'BARRANCA DE UPÍA', 4.566225, -72.961083, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50124', 'CABUYARO', 4.286705, -72.791768, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50150', 'CASTILLA LA NUEVA', 3.830005, -73.687302, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50223', 'CUBARRAL', 3.793653, -73.837999, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50226', 'CUMARAL', 4.270042, -73.487052, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50245', 'EL CALVARIO', 4.352665, -73.713325, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50251', 'EL CASTILLO', 3.563907, -73.794225, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50270', 'EL DORADO', 3.739984, -73.835264, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50287', 'FUENTE DE ORO', 3.462875, -73.618121, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50313', 'GRANADA', 3.547147, -73.705815, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50318', 'GUAMAL', 3.879657, -73.768815, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50350', 'LA MACARENA', 2.177143, -73.78661, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50400', 'LEJANÍAS', 3.525115, -74.023514, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50325', 'MAPIRIPÁN', 2.896617, -72.135509, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50330', 'MESETAS', 3.382732, -74.044328, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50450', 'PUERTO CONCORDIA', 2.624006, -72.760209, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50568', 'PUERTO GAITÁN', 4.314905, -72.087649, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50577', 'PUERTO LLERAS', 3.272117, -73.37385, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50573', 'PUERTO LÓPEZ', 4.09349, -72.957324, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50590', 'PUERTO RICO', 2.939621, -73.206314, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50606', 'RESTREPO', 4.259556, -73.565408, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50680', 'SAN CARLOS DE GUAROA', 3.71065, -73.242253, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50683', 'SAN JUAN DE ARAMA', 3.373728, -73.875832, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50686', 'SAN JUANITO', 4.458181, -73.676699, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50689', 'SAN MARTÍN', 3.701899, -73.695812, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50370', 'URIBE', 3.239634, -74.351508, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50001', 'VILLAVICENCIO', 4.126369, -73.622601, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '50711', 'VISTAHERMOSA', 3.125579, -73.750966, TRUE
FROM departamentos d
WHERE d.codigo_dane = '50'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52019', 'ALBÁN', 1.474978, -77.080712, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52022', 'ALDANA', 0.882381, -77.700564, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52036', 'ANCUYA', 1.263276, -77.514512, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52051', 'ARBOLEDA', 1.503418, -77.135467, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52079', 'BARBACOAS', 1.671733, -78.13765, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52083', 'BELÉN', 1.595681, -77.015619, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52110', 'BUESACO', 1.381453, -77.156463, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52240', 'CHACHAGÜÍ', 1.360545, -77.281869, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52203', 'COLÓN', 1.643878, -77.019777, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52207', 'CONSACÁ', 1.207854, -77.466136, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52210', 'CONTADERO', 0.910458, -77.549409, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52215', 'CÓRDOBA', 0.854564, -77.517897, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52224', 'CUASPUD CARLOSAMA', 0.862978, -77.728947, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52227', 'CUMBAL', 0.906367, -77.792505, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52233', 'CUMBITARA', 1.647163, -77.578616, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52250', 'EL CHARCO', 2.479688, -78.110217, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52254', 'EL PEÑOL', 1.453567, -77.438522, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52256', 'EL ROSARIO', 1.745309, -77.33417, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52258', 'EL TABLÓN DE GÓMEZ', 1.427277, -77.097101, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52260', 'EL TAMBO', 1.407913, -77.390772, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52520', 'FRANCISCO PIZARRO', 2.040629, -78.658361, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52287', 'FUNES', 1.001159, -77.448913, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52317', 'GUACHUCAL', 0.959744, -77.731589, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52320', 'GUAITARILLA', 1.129574, -77.549824, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52323', 'GUALMATÁN', 0.919652, -77.568701, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52352', 'ILES', 0.96952, -77.521227, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52354', 'IMUÉS', 1.05506, -77.496339, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52356', 'IPIALES', 0.827732, -77.646367, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52378', 'LA CRUZ', 1.601318, -76.970504, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52381', 'LA FLORIDA', 1.29753, -77.402882, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52385', 'LA LLANADA', 1.472892, -77.58091, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52390', 'LA TOLA', 2.398999, -78.189725, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52399', 'LA UNIÓN', 1.600219, -77.131316, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52405', 'LEIVA', 1.934453, -77.306135, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52411', 'LINARES', 1.350814, -77.523953, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52418', 'LOS ANDES', 1.494587, -77.521303, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52427', 'MAGÜÍ', 1.765633, -78.182924, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52435', 'MALLAMA', 1.141037, -77.864549, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52473', 'MOSQUERA', 2.507139, -78.452992, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52480', 'NARIÑO', 1.288979, -77.357972, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52490', 'OLAYA HERRERA', 2.347457, -78.325814, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52506', 'OSPINA', 1.058433, -77.566082, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52001', 'PASTO', 1.212352, -77.278795, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52540', 'POLICARPA', 1.627196, -77.458686, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52560', 'POTOSÍ', 0.806639, -77.573003, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52565', 'PROVIDENCIA', 1.237814, -77.596794, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52573', 'PUERRES', 0.885125, -77.504211, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52585', 'PUPIALES', 0.870442, -77.636042, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52612', 'RICAURTE', 1.212492, -77.995153, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52621', 'ROBERTO PAYÁN', 1.697492, -78.245716, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52678', 'SAMANIEGO', 1.335438, -77.594341, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52835', 'SAN ANDRÉS DE TUMACO', 1.807399, -78.764073, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52685', 'SAN BERNARDO', 1.513762, -77.0475, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52683', 'SANDONÁ', 1.283438, -77.47313, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52687', 'SAN LORENZO', 1.503362, -77.21542, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52693', 'SAN PABLO', 1.669429, -77.013984, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52694', 'SAN PEDRO DE CARTAGO', 1.551572, -77.11941, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52696', 'SANTA BÁRBARA', 2.449653, -77.979916, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52699', 'SANTACRUZ', 1.222589, -77.677035, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52720', 'SAPUYES', 1.037536, -77.62028, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52786', 'TAMINANGO', 1.570358, -77.2808, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52788', 'TANGUA', 1.09482, -77.393735, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52838', 'TÚQUERRES', 1.085044, -77.61672, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '52885', 'YACUANQUER', 1.115937, -77.400169, TRUE
FROM departamentos d
WHERE d.codigo_dane = '52'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54003', 'ÁBREGO', 8.081616, -73.221722, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54051', 'ARBOLEDAS', 7.642985, -72.798952, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54099', 'BOCHALEMA', 7.612192, -72.64701, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54109', 'BUCARASICA', 8.041299, -72.868231, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54128', 'CÁCHIRA', 7.741248, -73.048983, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54125', 'CÁCOTA', 7.268705, -72.642059, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54172', 'CHINÁCOTA', 7.603112, -72.601162, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54174', 'CHITAGÁ', 7.138187, -72.665468, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54206', 'CONVENCIÓN', 8.470374, -73.3372, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54223', 'CUCUTILLA', 7.539633, -72.772816, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54239', 'DURANIA', 7.714804, -72.658491, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54245', 'EL CARMEN', 8.510579, -73.446687, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54250', 'EL TARRA', 8.574281, -73.09614, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54261', 'EL ZULIA', 7.938572, -72.604717, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54313', 'GRAMALOTE', 7.916946, -72.787233, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54344', 'HACARÍ', 8.321506, -73.145997, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54347', 'HERRÁN', 7.506541, -72.483519, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54377', 'LABATECA', 7.298414, -72.495983, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54385', 'LA ESPERANZA', 7.639839, -73.328126, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54398', 'LA PLAYA', 8.21124, -73.239986, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54405', 'LOS PATIOS', 7.833186, -72.505612, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54418', 'LOURDES', 7.945631, -72.832376, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54480', 'MUTISCUA', 7.300469, -72.747169, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54498', 'OCAÑA', 8.248574, -73.35607, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54518', 'PAMPLONA', 7.372802, -72.647714, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54520', 'PAMPLONITA', 7.436745, -72.639111, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54553', 'PUERTO SANTANDER', 8.359993, -72.411363, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54599', 'RAGONVALIA', 7.577861, -72.476708, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54660', 'SALAZAR', 7.773683, -72.813064, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54670', 'SAN CALIXTO', 8.40214, -73.208622, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54673', 'SAN CAYETANO', 7.875695, -72.625459, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54001', 'SAN JOSÉ DE CÚCUTA', 7.905725, -72.508178, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54680', 'SANTIAGO', 7.865856, -72.716203, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54720', 'SARDINATA', 8.082105, -72.800577, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54743', 'SILOS', 7.204736, -72.757128, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54800', 'TEORAMA', 8.438134, -73.28707, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54810', 'TIBÚ', 8.639891, -72.734496, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54820', 'TOLEDO', 7.307692, -72.481915, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54871', 'VILLA CARO', 7.914244, -72.973601, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '54874', 'VILLA DEL ROSARIO', 7.847672, -72.469758, TRUE
FROM departamentos d
WHERE d.codigo_dane = '54'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '63001', 'ARMENIA', 4.53598, -75.680786, TRUE
FROM departamentos d
WHERE d.codigo_dane = '63'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '63111', 'BUENAVISTA', 4.360029, -75.739572, TRUE
FROM departamentos d
WHERE d.codigo_dane = '63'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '63130', 'CALARCÁ', 4.520982, -75.646085, TRUE
FROM departamentos d
WHERE d.codigo_dane = '63'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '63190', 'CIRCASIA', 4.617759, -75.636533, TRUE
FROM departamentos d
WHERE d.codigo_dane = '63'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '63212', 'CÓRDOBA', 4.392485, -75.687866, TRUE
FROM departamentos d
WHERE d.codigo_dane = '63'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '63272', 'FILANDIA', 4.674338, -75.658387, TRUE
FROM departamentos d
WHERE d.codigo_dane = '63'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '63302', 'GÉNOVA', 4.206641, -75.790402, TRUE
FROM departamentos d
WHERE d.codigo_dane = '63'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '63401', 'LA TEBAIDA', 4.453755, -75.786887, TRUE
FROM departamentos d
WHERE d.codigo_dane = '63'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '63470', 'MONTENEGRO', 4.565057, -75.749827, TRUE
FROM departamentos d
WHERE d.codigo_dane = '63'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '63548', 'PIJAO', 4.335036, -75.703329, TRUE
FROM departamentos d
WHERE d.codigo_dane = '63'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '63594', 'QUIMBAYA', 4.624387, -75.765074, TRUE
FROM departamentos d
WHERE d.codigo_dane = '63'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '63690', 'SALENTO', 4.637157, -75.570844, TRUE
FROM departamentos d
WHERE d.codigo_dane = '63'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '66045', 'APÍA', 5.106526, -75.942356, TRUE
FROM departamentos d
WHERE d.codigo_dane = '66'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '66075', 'BALBOA', 4.949096, -75.958663, TRUE
FROM departamentos d
WHERE d.codigo_dane = '66'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '66088', 'BELÉN DE UMBRÍA', 5.200793, -75.868334, TRUE
FROM departamentos d
WHERE d.codigo_dane = '66'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '66170', 'DOSQUEBRADAS', 4.833131, -75.675371, TRUE
FROM departamentos d
WHERE d.codigo_dane = '66'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '66318', 'GUÁTICA', 5.315367, -75.799005, TRUE
FROM departamentos d
WHERE d.codigo_dane = '66'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '66383', 'LA CELIA', 5.002787, -76.0032, TRUE
FROM departamentos d
WHERE d.codigo_dane = '66'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '66400', 'LA VIRGINIA', 4.896624, -75.880394, TRUE
FROM departamentos d
WHERE d.codigo_dane = '66'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '66440', 'MARSELLA', 4.935771, -75.73879, TRUE
FROM departamentos d
WHERE d.codigo_dane = '66'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '66456', 'MISTRATÓ', 5.297039, -75.882886, TRUE
FROM departamentos d
WHERE d.codigo_dane = '66'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '66001', 'PEREIRA', 4.804985, -75.719711, TRUE
FROM departamentos d
WHERE d.codigo_dane = '66'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '66572', 'PUEBLO RICO', 5.222043, -76.030801, TRUE
FROM departamentos d
WHERE d.codigo_dane = '66'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '66594', 'QUINCHÍA', 5.340456, -75.730431, TRUE
FROM departamentos d
WHERE d.codigo_dane = '66'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '66682', 'SANTA ROSA DE CABAL', 4.876271, -75.623268, TRUE
FROM departamentos d
WHERE d.codigo_dane = '66'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '66687', 'SANTUARIO', 5.074911, -75.964628, TRUE
FROM departamentos d
WHERE d.codigo_dane = '66'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68013', 'AGUADA', 6.162355, -73.523132, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68020', 'ALBANIA', 5.759166, -73.91336, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68051', 'ARATOCA', 6.694418, -73.01786, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68077', 'BARBOSA', 5.932531, -73.615965, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68079', 'BARICHARA', 6.634111, -73.223047, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68081', 'BARRANCABERMEJA', 7.064857, -73.849243, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68092', 'BETULIA', 6.899525, -73.283669, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68101', 'BOLÍVAR', 5.988953, -73.771346, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68001', 'BUCARAMANGA', 7.11647, -73.132562, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68121', 'CABRERA', 6.592118, -73.246475, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68132', 'CALIFORNIA', 7.347989, -72.946491, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68147', 'CAPITANEJO', 6.527394, -72.695427, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68152', 'CARCASÍ', 6.629016, -72.627099, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68160', 'CEPITÁ', 6.753518, -72.973536, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68162', 'CERRITO', 6.840405, -72.694851, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68167', 'CHARALÁ', 6.284339, -73.146873, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68169', 'CHARTA', 7.28082, -72.968798, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68176', 'CHIMA', 6.344348, -73.373656, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68179', 'CHIPATÁ', 6.062521, -73.637111, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68190', 'CIMITARRA', 6.320886, -73.953011, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68207', 'CONCEPCIÓN', 6.768908, -72.694567, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68209', 'CONFINES', 6.357327, -73.240554, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68211', 'CONTRATACIÓN', 6.290561, -73.474426, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68217', 'COROMORO', 6.294999, -73.040816, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68229', 'CURITÍ', 6.605099, -73.069383, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68235', 'EL CARMEN DE CHUCURÍ', 6.700038, -73.51066, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68245', 'EL GUACAMAYO', 6.245111, -73.496908, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68250', 'EL PEÑÓN', 6.05537, -73.815532, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68255', 'EL PLAYÓN', 7.470715, -73.20287, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68264', 'ENCINO', 6.137429, -73.098749, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68266', 'ENCISO', 6.668034, -72.699647, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68271', 'FLORIÁN', 5.804659, -73.97143, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68276', 'FLORIDABLANCA', 7.072329, -73.099104, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68296', 'GALÁN', 6.638423, -73.287769, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68298', 'GÁMBITA', 5.945998, -73.344185, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68307', 'GIRÓN', 7.070432, -73.166832, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68318', 'GUACA', 6.876563, -72.856322, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68320', 'GUADALUPE', 6.245847, -73.419292, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68322', 'GUAPOTÁ', 6.308635, -73.320732, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68324', 'GUAVATÁ', 5.954348, -73.700906, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68327', 'GÜEPSA', 6.025013, -73.575146, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68344', 'HATO', 6.543957, -73.308399, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68368', 'JESÚS MARÍA', 5.876497, -73.783396, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68370', 'JORDÁN', 6.732727, -73.096053, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68377', 'LA BELLEZA', 5.85925, -73.965494, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68385', 'LANDÁZURI', 6.218812, -73.811359, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68397', 'LA PAZ', 6.178509, -73.58959, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68406', 'LEBRIJA', 7.113351, -73.219524, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68418', 'LOS SANTOS', 6.755203, -73.102739, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68425', 'MACARAVITA', 6.50658, -72.593105, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68432', 'MÁLAGA', 6.703081, -72.732089, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68444', 'MATANZA', 7.323175, -73.015566, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68464', 'MOGOTES', 6.475246, -72.969807, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68468', 'MOLAGAVITA', 6.67432, -72.809175, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68498', 'OCAMONTE', 6.339988, -73.122563, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68500', 'OIBA', 6.26521, -73.299791, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68502', 'ONZAGA', 6.344104, -72.816766, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68522', 'PALMAR', 6.537789, -73.29109, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68524', 'PALMAS DEL SOCORRO', 6.406139, -73.287764, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68533', 'PÁRAMO', 6.416811, -73.17022, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68547', 'PIEDECUESTA', 6.997245, -73.054795, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68549', 'PINCHOTE', 6.531552, -73.174209, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68572', 'PUENTE NACIONAL', 5.878381, -73.677567, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68573', 'PUERTO PARRA', 6.650785, -74.056129, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68575', 'PUERTO WILCHES', 7.344057, -73.899909, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68615', 'RIONEGRO', 7.265014, -73.150177, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68655', 'SABANA DE TORRES', 7.391919, -73.49906, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68669', 'SAN ANDRÉS', 6.811511, -72.848864, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68673', 'SAN BENITO', 6.126656, -73.50907, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68679', 'SAN GIL', 6.551952, -73.134776, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68682', 'SAN JOAQUÍN', 6.427548, -72.867638, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68684', 'SAN JOSÉ DE MIRANDA', 6.658995, -72.733616, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68686', 'SAN MIGUEL', 6.575315, -72.644123, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68705', 'SANTA BÁRBARA', 6.990996, -72.907445, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68720', 'SANTA HELENA DEL OPÓN', 6.339565, -73.616716, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68689', 'SAN VICENTE DE CHUCURÍ', 6.880383, -73.411024, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68745', 'SIMACOTA', 6.443469, -73.337368, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68755', 'SOCORRO', 6.46387, -73.261198, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68770', 'SUAITA', 6.101329, -73.44165, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68773', 'SUCRE', 5.918743, -73.790975, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68780', 'SURATÁ', 7.36658, -72.984232, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68820', 'TONA', 7.201417, -72.967023, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68855', 'VALLE DE SAN JOSÉ', 6.448028, -73.143507, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68861', 'VÉLEZ', 6.009275, -73.672447, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68867', 'VETAS', 7.30981, -72.871041, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68872', 'VILLANUEVA', 6.670078, -73.174307, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '68895', 'ZAPATOCA', 6.814387, -73.268034, TRUE
FROM departamentos d
WHERE d.codigo_dane = '68'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70110', 'BUENAVISTA', 9.319794, -74.972827, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70124', 'CAIMITO', 8.789324, -75.117141, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70230', 'CHALÁN', 9.545352, -75.312697, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70204', 'COLOSÓ', 9.494192, -75.353256, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70215', 'COROZAL', 9.318749, -75.293048, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70221', 'COVEÑAS', 9.402779, -75.680158, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70233', 'EL ROBLE', 9.100647, -75.198378, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70235', 'GALERAS', 9.160379, -75.04959, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70265', 'GUARANDA', 8.468556, -74.537749, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70400', 'LA UNIÓN', 8.853975, -75.276056, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70418', 'LOS PALMITOS', 9.380269, -75.268716, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70429', 'MAJAGUAL', 8.541163, -74.628077, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70473', 'MORROA', 9.331395, -75.305949, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70508', 'OVEJAS', 9.527176, -75.229037, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70523', 'PALMITO', 9.333157, -75.541264, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70670', 'SAMPUÉS', 9.183193, -75.380222, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70678', 'SAN BENITO ABAD', 8.930108, -75.031089, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70823', 'SAN JOSÉ DE TOLUVIEJO', 9.451819, -75.44085, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70702', 'SAN JUAN DE BETULIA', 9.273066, -75.243565, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70742', 'SAN LUIS DE SINCÉ', 9.244308, -75.145999, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70708', 'SAN MARCOS', 8.661774, -75.133831, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70713', 'SAN ONOFRE', 9.736955, -75.522398, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70717', 'SAN PEDRO', 9.39625, -75.063647, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70820', 'SANTIAGO DE TOLÚ', 9.525387, -75.581112, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70001', 'SINCELEJO', 9.302322, -75.395445, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '70771', 'SUCRE', 8.811737, -74.723175, TRUE
FROM departamentos d
WHERE d.codigo_dane = '70'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73024', 'ALPUJARRA', 3.391548, -74.9329, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73026', 'ALVARADO', 4.567356, -74.953418, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73030', 'AMBALEMA', 4.782682, -74.764429, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73043', 'ANZOÁTEGUI', 4.631756, -75.093772, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73055', 'ARMERO', 5.030744, -74.884438, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73067', 'ATACO', 3.590591, -75.382545, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73124', 'CAJAMARCA', 4.438812, -75.431971, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73148', 'CARMEN DE APICALÁ', 4.152334, -74.717633, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73152', 'CASABIANCA', 5.078465, -75.120966, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73168', 'CHAPARRAL', 3.722918, -75.480765, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73200', 'COELLO', 4.287276, -74.898464, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73217', 'COYAIMA', 3.798036, -75.193862, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73226', 'CUNDAY', 4.059259, -74.692227, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73236', 'DOLORES', 3.539072, -74.896761, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73268', 'ESPINAL', 4.151314, -74.885446, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73270', 'FALAN', 5.123104, -74.953007, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73275', 'FLANDES', 4.276373, -74.818763, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73283', 'FRESNO', 5.153576, -75.035722, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73319', 'GUAMO', 4.030992, -74.968135, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73347', 'HERVEO', 5.080228, -75.177151, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73349', 'HONDA', 5.211816, -74.75699, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73001', 'IBAGUÉ', 4.432248, -75.19425, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73352', 'ICONONZO', 4.176487, -74.531969, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73408', 'LÉRIDA', 4.862046, -74.910716, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73411', 'LÍBANO', 4.92042, -75.061959, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73449', 'MELGAR', 4.203655, -74.641317, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73461', 'MURILLO', 4.874341, -75.171022, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73483', 'NATAGAIMA', 3.624324, -75.093182, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73504', 'ORTEGA', 3.934916, -75.222601, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73520', 'PALOCABILDO', 5.120918, -75.022167, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73547', 'PIEDRAS', 4.543951, -74.878106, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73555', 'PLANADAS', 3.197911, -75.644163, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73563', 'PRADO', 3.750939, -74.927447, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73585', 'PURIFICACIÓN', 3.857246, -74.935555, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73616', 'RIOBLANCO', 3.529932, -75.644069, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73622', 'RONCESVALLES', 4.011567, -75.605959, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73624', 'ROVIRA', 4.239019, -75.240648, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73671', 'SALDAÑA', 3.929815, -75.016852, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73675', 'SAN ANTONIO', 3.914146, -75.480074, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73678', 'SAN LUIS', 4.133721, -75.095804, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73443', 'SAN SEBASTIÁN DE MARIQUITA', 5.199708, -74.889276, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73686', 'SANTA ISABEL', 4.713606, -75.097934, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73770', 'SUÁREZ', 4.048891, -74.831885, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73854', 'VALLE DE SAN JUAN', 4.197494, -75.115669, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73861', 'VENADILLO', 4.717878, -74.929333, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73870', 'VILLAHERMOSA', 5.030452, -75.117729, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '73873', 'VILLARRICA', 3.936902, -74.600285, TRUE
FROM departamentos d
WHERE d.codigo_dane = '73'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76020', 'ALCALÁ', 4.674994, -75.779792, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76036', 'ANDALUCÍA', 4.171713, -76.167925, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76041', 'ANSERMANUEVO', 4.794984, -75.992003, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76054', 'ARGELIA', 4.726945, -76.119905, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76100', 'BOLÍVAR', 4.337846, -76.183583, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76109', 'BUENAVENTURA', 3.875708, -77.01074, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76113', 'BUGALAGRANDE', 4.208358, -76.15682, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76122', 'CAICEDONIA', 4.334808, -75.830594, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76126', 'CALIMA', 3.933664, -76.484132, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76130', 'CANDELARIA', 3.408354, -76.346519, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76147', 'CARTAGO', 4.742192, -75.924374, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76233', 'DAGUA', 3.657318, -76.68886, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76243', 'EL ÁGUILA', 4.906062, -76.042779, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76246', 'EL CAIRO', 4.760874, -76.221611, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76248', 'EL CERRITO', 3.684229, -76.311972, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76250', 'EL DOVIO', 4.510452, -76.237084, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76275', 'FLORIDA', 3.324118, -76.234199, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76306', 'GINEBRA', 3.724181, -76.268068, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76318', 'GUACARÍ', 3.761815, -76.330911, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76111', 'GUADALAJARA DE BUGA', 3.900736, -76.298979, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76364', 'JAMUNDÍ', 3.258751, -76.538472, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76377', 'LA CUMBRE', 3.649268, -76.56805, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76400', 'LA UNIÓN', 4.533869, -76.099661, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76403', 'LA VICTORIA', 4.523603, -76.036529, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76497', 'OBANDO', 4.575712, -75.974709, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76520', 'PALMIRA', 3.531544, -76.298846, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76563', 'PRADERA', 3.419793, -76.241799, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76606', 'RESTREPO', 3.821351, -76.523329, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76616', 'RIOFRÍO', 4.156908, -76.288313, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76622', 'ROLDANILLO', 4.413601, -76.152277, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76670', 'SAN PEDRO', 3.995073, -76.228692, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76001', 'SANTIAGO DE CALI', 3.413686, -76.52133, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76736', 'SEVILLA', 4.270714, -75.931629, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76823', 'TORO', 4.608085, -76.076859, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76828', 'TRUJILLO', 4.212037, -76.318818, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76834', 'TULUÁ', 4.085399, -76.197731, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76845', 'ULLOA', 4.703623, -75.737808, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76863', 'VERSALLES', 4.575019, -76.199203, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76869', 'VIJES', 3.698686, -76.441804, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76890', 'YOTOCO', 3.861241, -76.382698, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76892', 'YUMBO', 3.540097, -76.499893, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '76895', 'ZARZAL', 4.392658, -76.070795, TRUE
FROM departamentos d
WHERE d.codigo_dane = '76'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '81001', 'ARAUCA', 7.072726, -70.747408, TRUE
FROM departamentos d
WHERE d.codigo_dane = '81'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '81065', 'ARAUQUITA', 7.02702, -71.426733, TRUE
FROM departamentos d
WHERE d.codigo_dane = '81'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '81220', 'CRAVO NORTE', 6.303913, -70.204286, TRUE
FROM departamentos d
WHERE d.codigo_dane = '81'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '81300', 'FORTUL', 6.796695, -71.76877, TRUE
FROM departamentos d
WHERE d.codigo_dane = '81'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '81591', 'PUERTO RONDÓN', 6.281461, -71.10339, TRUE
FROM departamentos d
WHERE d.codigo_dane = '81'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '81736', 'SARAVENA', 6.953926, -71.872812, TRUE
FROM departamentos d
WHERE d.codigo_dane = '81'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '81794', 'TAME', 6.453324, -71.754427, TRUE
FROM departamentos d
WHERE d.codigo_dane = '81'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '85010', 'AGUAZUL', 5.172641, -72.546838, TRUE
FROM departamentos d
WHERE d.codigo_dane = '85'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '85015', 'CHÁMEZA', 5.214527, -72.87016, TRUE
FROM departamentos d
WHERE d.codigo_dane = '85'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '85125', 'HATO COROZAL', 6.154099, -71.764213, TRUE
FROM departamentos d
WHERE d.codigo_dane = '85'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '85136', 'LA SALINA', 6.127762, -72.334978, TRUE
FROM departamentos d
WHERE d.codigo_dane = '85'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '85139', 'MANÍ', 4.81681, -72.281384, TRUE
FROM departamentos d
WHERE d.codigo_dane = '85'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '85162', 'MONTERREY', 4.877017, -72.894065, TRUE
FROM departamentos d
WHERE d.codigo_dane = '85'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '85225', 'NUNCHÍA', 5.636474, -72.195323, TRUE
FROM departamentos d
WHERE d.codigo_dane = '85'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '85230', 'OROCUÉ', 4.790258, -71.338533, TRUE
FROM departamentos d
WHERE d.codigo_dane = '85'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '85250', 'PAZ DE ARIPORO', 5.879827, -71.890348, TRUE
FROM departamentos d
WHERE d.codigo_dane = '85'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '85263', 'PORE', 5.72773, -71.99286, TRUE
FROM departamentos d
WHERE d.codigo_dane = '85'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '85279', 'RECETOR', 5.229181, -72.760991, TRUE
FROM departamentos d
WHERE d.codigo_dane = '85'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '85300', 'SABANALARGA', 4.854787, -73.038696, TRUE
FROM departamentos d
WHERE d.codigo_dane = '85'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '85315', 'SÁCAMA', 6.096738, -72.250157, TRUE
FROM departamentos d
WHERE d.codigo_dane = '85'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '85325', 'SAN LUIS DE PALENQUE', 5.422397, -71.732198, TRUE
FROM departamentos d
WHERE d.codigo_dane = '85'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '85400', 'TÁMARA', 5.829543, -72.16165, TRUE
FROM departamentos d
WHERE d.codigo_dane = '85'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '85410', 'TAURAMENA', 5.018977, -72.74662, TRUE
FROM departamentos d
WHERE d.codigo_dane = '85'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '85430', 'TRINIDAD', 5.412178, -71.662812, TRUE
FROM departamentos d
WHERE d.codigo_dane = '85'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '85440', 'VILLANUEVA', 4.61035, -72.927797, TRUE
FROM departamentos d
WHERE d.codigo_dane = '85'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '85001', 'YOPAL', 5.327102, -72.396132, TRUE
FROM departamentos d
WHERE d.codigo_dane = '85'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '86219', 'COLÓN', 1.190133, -76.972566, TRUE
FROM departamentos d
WHERE d.codigo_dane = '86'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '86001', 'MOCOA', 1.151172, -76.654238, TRUE
FROM departamentos d
WHERE d.codigo_dane = '86'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '86320', 'ORITO', 0.663593, -76.873276, TRUE
FROM departamentos d
WHERE d.codigo_dane = '86'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '86568', 'PUERTO ASÍS', 0.505627, -76.496887, TRUE
FROM departamentos d
WHERE d.codigo_dane = '86'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '86569', 'PUERTO CAICEDO', 0.687784, -76.606118, TRUE
FROM departamentos d
WHERE d.codigo_dane = '86'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '86571', 'PUERTO GUZMÁN', 0.962854, -76.407663, TRUE
FROM departamentos d
WHERE d.codigo_dane = '86'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '86573', 'PUERTO LEGUÍZAMO', -0.192318, -74.781842, TRUE
FROM departamentos d
WHERE d.codigo_dane = '86'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '86755', 'SAN FRANCISCO', 1.174194, -76.879283, TRUE
FROM departamentos d
WHERE d.codigo_dane = '86'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '86757', 'SAN MIGUEL', 0.34346, -76.91217, TRUE
FROM departamentos d
WHERE d.codigo_dane = '86'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '86760', 'SANTIAGO', 1.147076, -77.002641, TRUE
FROM departamentos d
WHERE d.codigo_dane = '86'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '86749', 'SIBUNDOY', 1.20026, -76.917814, TRUE
FROM departamentos d
WHERE d.codigo_dane = '86'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '86865', 'VALLE DEL GUAMUEZ', 0.423506, -76.906751, TRUE
FROM departamentos d
WHERE d.codigo_dane = '86'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '86885', 'VILLAGARZÓN', 1.028821, -76.61721, TRUE
FROM departamentos d
WHERE d.codigo_dane = '86'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '88564', 'PROVIDENCIA', 13.373185, -81.368386, TRUE
FROM departamentos d
WHERE d.codigo_dane = '88'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '88001', 'SAN ANDRÉS', 12.578108, -81.707181, TRUE
FROM departamentos d
WHERE d.codigo_dane = '88'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '91263', 'EL ENCANTO', -1.74806, -73.207114, TRUE
FROM departamentos d
WHERE d.codigo_dane = '91'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '91405', 'LA CHORRERA', -1.442617, -72.791889, TRUE
FROM departamentos d
WHERE d.codigo_dane = '91'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '91407', 'LA PEDRERA', -1.320301, -69.585499, TRUE
FROM departamentos d
WHERE d.codigo_dane = '91'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '91430', 'LA VICTORIA', 0.054936, -71.223208, TRUE
FROM departamentos d
WHERE d.codigo_dane = '91'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '91001', 'LETICIA', -4.19895, -69.941721, TRUE
FROM departamentos d
WHERE d.codigo_dane = '91'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '91460', 'MIRITÍ - PARANÁ', -0.888833, -70.98893, TRUE
FROM departamentos d
WHERE d.codigo_dane = '91'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '91530', 'PUERTO ALEGRÍA', -1.005674, -74.014461, TRUE
FROM departamentos d
WHERE d.codigo_dane = '91'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '91536', 'PUERTO ARICA', -2.147039, -71.752186, TRUE
FROM departamentos d
WHERE d.codigo_dane = '91'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '91540', 'PUERTO NARIÑO', -3.779934, -70.364937, TRUE
FROM departamentos d
WHERE d.codigo_dane = '91'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '91669', 'PUERTO SANTANDER', -0.621184, -72.384213, TRUE
FROM departamentos d
WHERE d.codigo_dane = '91'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '91798', 'TARAPACÁ', -2.890126, -69.741745, TRUE
FROM departamentos d
WHERE d.codigo_dane = '91'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '94343', 'BARRANCOMINAS', 3.494178, -69.814066, TRUE
FROM departamentos d
WHERE d.codigo_dane = '94'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '94886', 'CACAHUAL', 3.52617, -67.413312, TRUE
FROM departamentos d
WHERE d.codigo_dane = '94'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '94001', 'INÍRIDA', 3.866764, -67.918613, TRUE
FROM departamentos d
WHERE d.codigo_dane = '94'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '94885', 'LA GUADALUPE', 1.632464, -66.963692, TRUE
FROM departamentos d
WHERE d.codigo_dane = '94'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '94888', 'MORICHAL', 2.265132, -69.919404, TRUE
FROM departamentos d
WHERE d.codigo_dane = '94'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '94887', 'PANA PANA', 1.865668, -69.0099, TRUE
FROM departamentos d
WHERE d.codigo_dane = '94'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '94884', 'PUERTO COLOMBIA', 2.726438, -67.566774, TRUE
FROM departamentos d
WHERE d.codigo_dane = '94'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '94883', 'SAN FELIPE', 1.912495, -67.067848, TRUE
FROM departamentos d
WHERE d.codigo_dane = '94'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '95015', 'CALAMAR', 1.960982, -72.655197, TRUE
FROM departamentos d
WHERE d.codigo_dane = '95'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '95025', 'EL RETORNO', 2.330164, -72.627304, TRUE
FROM departamentos d
WHERE d.codigo_dane = '95'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '95200', 'MIRAFLORES', 1.337539, -71.950416, TRUE
FROM departamentos d
WHERE d.codigo_dane = '95'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '95001', 'SAN JOSÉ DEL GUAVIARE', 2.565932, -72.639254, TRUE
FROM departamentos d
WHERE d.codigo_dane = '95'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '97161', 'CARURÚ', 1.016116, -71.30221, TRUE
FROM departamentos d
WHERE d.codigo_dane = '97'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '97001', 'MITÚ', 1.253151, -70.232641, TRUE
FROM departamentos d
WHERE d.codigo_dane = '97'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '97511', 'PACOA', 0.020698, -71.004339, TRUE
FROM departamentos d
WHERE d.codigo_dane = '97'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '97777', 'PAPUNAHUA', 1.908124, -70.76091, TRUE
FROM departamentos d
WHERE d.codigo_dane = '97'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '97666', 'TARAIRA', -0.564984, -69.635497, TRUE
FROM departamentos d
WHERE d.codigo_dane = '97'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '97889', 'YAVARATÉ', 0.609142, -69.203337, TRUE
FROM departamentos d
WHERE d.codigo_dane = '97'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '99773', 'CUMARIBO', 4.446352, -69.795533, TRUE
FROM departamentos d
WHERE d.codigo_dane = '99'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '99524', 'LA PRIMAVERA', 5.486309, -70.410515, TRUE
FROM departamentos d
WHERE d.codigo_dane = '99'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '99001', 'PUERTO CARREÑO', 6.186636, -67.487095, TRUE
FROM departamentos d
WHERE d.codigo_dane = '99'
ON CONFLICT (codigo_dane) DO NOTHING;
INSERT INTO municipios (departamento_id, codigo_dane, nombre, latitud, longitud, activo)
SELECT d.id, '99624', 'SANTA ROSALÍA', 5.136393, -70.859499, TRUE
FROM departamentos d
WHERE d.codigo_dane = '99'
ON CONFLICT (codigo_dane) DO NOTHING;

-- 5) Extensión de Sucursales y Comercios con Referencias Geográficas
ALTER TABLE sucursales ADD COLUMN IF NOT EXISTS departamento_id INTEGER REFERENCES departamentos(id);
ALTER TABLE sucursales ADD COLUMN IF NOT EXISTS municipio_id INTEGER REFERENCES municipios(id);

CREATE INDEX IF NOT EXISTS idx_sucursales_departamento_id ON sucursales(departamento_id);
CREATE INDEX IF NOT EXISTS idx_sucursales_municipio_id ON sucursales(municipio_id);

ALTER TABLE comercios ADD COLUMN IF NOT EXISTS departamento_id INTEGER REFERENCES departamentos(id);
ALTER TABLE comercios ADD COLUMN IF NOT EXISTS municipio_id INTEGER REFERENCES municipios(id);

CREATE INDEX IF NOT EXISTS idx_comercios_departamento_id ON comercios(departamento_id);
CREATE INDEX IF NOT EXISTS idx_comercios_municipio_id ON comercios(municipio_id);

-- 6) Sistema Central de Analítica de Eventos
CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    anonymous_id VARCHAR(100),
    user_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    session_id VARCHAR(100),
    source VARCHAR(100),
    medium VARCHAR(100),
    campaign VARCHAR(100),
    content VARCHAR(100),
    page_path VARCHAR(255),
    entity_type VARCHAR(50),
    entity_id VARCHAR(50),
    metadata_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_anonymous_id ON analytics_events(anonymous_id);

-- Restricción de idempotencia para APP_FIRST_OPEN por dispositivo anónimo
CREATE UNIQUE INDEX IF NOT EXISTS uq_analytics_app_first_open
ON analytics_events (anonymous_id)
WHERE event_type = 'APP_FIRST_OPEN';
