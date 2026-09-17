DROP TABLE IF EXISTS productos;
CREATE TABLE productos (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio TEXT,
    imagen_url TEXT,
    categoria TEXT
);

-- MOBILIARIO INFANTIL
INSERT INTO productos (id, nombre, descripcion, precio, imagen_url, categoria) VALUES 
(1, 'Brincolín Arcoiris', '¡El favorito de todos! \n\n Ideal para niños de todas las edades, incluye su propia alberca de pelotas para mayor diversión. Perfecto para pequeños de hasta 10 años.', '1100', 'BrincolinArcoiris.jpeg', 'Mobiliario'),
(2, 'Brincolin Arcoiris Baby', 'Este brincolín está diseñado para los más pequeños e incluye alberca de pelotas. Perfecto para niños de hasta 4 años.', '900', 'Brincolin_arcoiris_baby.jpeg', 'Mobiliario'),
(3, 'Brincolín bicolor baby', 'Diversión para los más pequeños, diseñado especialmente para su edad.\nPerfecto para niños de hasta 3 años.', '700', 'Brincolin_bicolor_baby.jpeg', 'Mobiliario'),
(4, 'Baby Set', 'Nuestro baby set con alberca es perfecto para estimular el juego y la convivencia.\nIdeal para los más pequeñitos.\nPerfecto para niños de hasta 3 años.', '1100', 'Baby_set.jpeg', 'Mobiliario'),
(5, 'Baby zone', 'Un espacio diseñado para jugar, explorar y divertirse.\nIncluye módulos suaves y perfectos para estimular el movimiento y la imaginación.\nIdeal para bebés y niños pequeños de hasta 3 años.', '1500', 'Softplay.jpeg', 'Mobiliario'),
(6, 'Baby zone con brincolín', 'A nuestro baby zone le puedes agregar la opción de integrar un brincolín baby para una experiencia más completa.', '2200', 'BrincolinesSoftplay.jpeg', 'Mobiliario'),
(7, 'Alberca de pelotas', 'Diversión garantizada con nuestras albercas de pelotas.\nContamos con 3 tamaños para adaptarnos a tu evento\n Grande: 3.00 x 2.00 mts en $1,100\n Mediana: 1.30 x 1.30 mts en $600\n Mini: 1.50 mts en $500\nLas versiones mediana y mini incluyen resbaladilla petit para mayor diversión.', '', 'AlbercaConjCompleto.jpeg', 'Mobiliario'),
(8, 'Caballetes infantiles', 'El espacio perfecto para despertar la creatividad de los más pequeños.\n \nIncluye 3 caballetes dobles con dibujos y crayolas para que los niños puedan pintar, colorear y divertirse.\n\n Ideal para actividades tranquilas y momentos creativos durante tu evento.', '600', 'Caballetes.jpeg', 'Mobiliario'),
(9, 'Mesas y Sillas', 'El complemento ideal para tu evento.\nIncluye una mesa con 6 sillitas.\nDiseño cómodo y a la medida de los niños.', '450', 'MesasySillas.jpeg', 'Mobiliario');

-- PAQUETES ESPECIALES
INSERT INTO productos (id, nombre, descripcion, precio, imagen_url, categoria) VALUES 
(10, 'Paquete 1', '• Brincolin arcoíris\n• Baby set\n• 3 caballetes dobles\n• 1 mesa con 8 sillitas', '3000 más flete', 'Paquete1.jpeg', 'Paquetes'),
(11, 'Paquete 2', '• Brincolin baby (Arcoiris o bicolor).\n• Baby zone.\n• 3 caballetes dobles .\n• 1 mesita con 8 sillitas.', '3400 más flete', 'Paquete2.jpeg', 'Paquetes'),
(12, 'Paquete 3', '• Alberca grande.\n• 3 caballetes dobles .\n• 1 mesita con 8 sillitas.', '1800 más flete', 'Paquete3.jpeg', 'Paquetes'),
(13, 'Paquete 4', '• Brincolin arcoíris.\n• 2 mesitas con 6 sillitas.', '1800 más flete', 'Paquete4.jpeg', 'Paquetes'),
(14, 'Paquete 5', '• Baby zone.\n• 2 mesitas con 6 sillitas.', '2200 + flete', 'Paquete5.jpeg', 'Paquetes'),
(15, 'Paquete 6', '• Baby zone con brincolín baby\n• 2 mesitas con 6 sillitas', '3000 más flete', 'Paquete6.jpeg', 'Paquetes');

-- TABLA DE FECHAS (Calendario)
DROP TABLE IF EXISTS fechas;
CREATE TABLE fechas (
    fecha TEXT PRIMARY KEY,
    estado TEXT NOT NULL
);
