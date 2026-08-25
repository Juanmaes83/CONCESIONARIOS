# CONCESIONARIOS — Vehicle Carousel Choreography

## Objetivo

Replicar en el proyecto `CONCESIONARIOS` la coreografía del vídeo de referencia: un carrusel horizontal premium de coches, no una órbita gastronómica ni un slider convencional.

El repo donante `WEB-RESTAURACI-N-PREMIUM-DIN-MICA` aporta el lenguaje técnico: dirección de movimiento premium, contenido editable, panel Studio, persistencia, snap, drag, wheel, teclado, copy sincronizado y jerarquía de producto. La adaptación cambia el producto y la geometría: de platos orbitales a vehículos horizontales.

## Qué hace el vídeo

La referencia muestra una línea horizontal de vehículos sobre un fondo editorial claro. Siempre existe:

- coche activo protagonista;
- coche anterior insinuado/cortado en un lateral;
- coche siguiente insinuado/cortado en el otro lateral;
- texto pequeño en la zona superior izquierda;
- letra/número gigante de fondo;
- hotspot circular sobre el vehículo activo;
- indicador inferior de posición;
- desplazamiento horizontal continuo con snap.

No es una web de restaurante. No es una web de concesionario clásico. Es una galería de producto premium donde cada coche se presenta como pieza editorial.

## Gramática base heredada del restaurante

Del repo donante se conservan estos principios:

1. No reconstruir desde cero: la nueva capa se añade sobre una base aprobada.
2. La navegación debe sentirse audiovisual, no como secciones independientes.
3. El producto protagonista debe avanzar al centro y el copy debe sincronizarse con su llegada.
4. La interacción debe conservar wheel, drag, swipe, teclado, momentum y snap.
5. El Studio debe exponer lenguajes diseñados, no parámetros técnicos.
6. La dirección de arte de los assets es parte del sistema: el código no debe compensar imágenes incoherentes.

## Traducción restaurante → concesionario

- Plato protagonista → vehículo protagonista.
- Orbital Menu → Vehicle Showcase Track.
- Dish Copy → Vehicle Copy.
- Explore dish → Discover vehicle.
- Ficha emocional de plato → ficha técnica/emocional de vehículo.
- Ingredients / Origin / Technique / Pairing → Design / Range / Performance / Interior / Financing.
- Reserve table → Book test drive / Request offer.
- Motion preset del proyecto → Carousel choreography preset.

## Movimiento exacto por fases

### Fase 0 — Composición inicial

- Fondo claro, editorial y limpio.
- Coche activo en el carril inferior/central, alineado a una baseline común.
- Coche anterior y siguiente visibles parcialmente en los laterales.
- Letra/número gigante en el fondo con opacidad muy baja.
- Texto superior izquierdo visible.
- Hotspot circular anclado al coche activo.
- Indicador inferior marcando posición.

### Fase 1 — Intención de avance

Cuando el usuario hace wheel, drag, swipe, teclado o botón:

- el coche activo empieza a salir horizontalmente;
- el coche entrante aparece desde el lateral opuesto;
- el copy no cambia de golpe;
- el hotspot se desplaza con el coche o se apaga y reaparece sobre el nuevo activo;
- el número/letra gigante empieza crossfade/translate hacia el siguiente estado.

### Fase 2 — Desplazamiento principal

- El track completo se mueve en X.
- Todos los coches comparten baseline.
- El coche activo pasa a lateral.
- El coche entrante gana escala/claridad y ocupa el centro protagonista.
- El movimiento no debe parecer un fade de imagen: debe sentirse como escaparate físico.

### Fase 3 — Snap premium

- El coche entrante llega a la posición protagonista exacta.
- No queda a medio camino.
- No hay vibración.
- Un gesto no debe saltar varios coches.
- El snap debe tener desaceleración suave y decisión final.

### Fase 4 — Sincronización editorial

Sólo cuando el coche ya está asentado:

- cambia nombre/modelo;
- cambia subtítulo técnico;
- cambia CTA;
- cambia letra/número gigante;
- hotspot queda sobre el coche activo;
- indicador inferior avanza.

### Fase 5 — Loop continuo

- El último coche debe tener como vecino al primero.
- El primer coche debe tener como vecino al último.
- El sistema debe ser circular, no una lista que termina.

## Reglas visuales de assets

Para replicar el vídeo, los vehículos deben cumplir un contrato visual:

- PNG/webp recortado o fondo transparente;
- coche completo;
- vista 3/4 frontal o lateral coherente;
- misma altura visual de ruedas;
- misma dirección de luz/reflejo;
- escala comparable;
- sin fondo, suelo, texto ni entorno;
- no más de 2 imágenes del mismo coche/plano;
- modelos y colores diferenciados.

Primera serie aprobada:

1. Tesla Model S rojo metálico.
2. Tesla Model X blanco perla.
3. Tesla Model Y azul metálico.

## Adaptación técnica propuesta

Crear una nueva capa/módulo sobre la base clonada:

- `vehicle-showcase.js` para motor horizontal;
- `vehicle-studio.js` o extensión del Studio existente para marca/vehículos/media/CTA;
- `styles-vehicle.css` para composición editorial;
- preset `presets/TESLA-PREMIUM-DEMO.json`;
- carpeta `assets/vehicles/` para PNGs recortados.

## Comportamiento del Studio

El Studio no debe exponer duración, grados, easing o offsets técnicos. Debe exponer lenguaje editable:

- marca del concesionario;
- claim;
- lista de vehículos;
- modelo/color/precio/rango/potencia;
- imagen recortada;
- hotspot/copy;
- CTA principal;
- modo visual: `Editorial Track` como preset inicial.

## Criterio de aprobación

La adaptación no se considera válida hasta que:

1. se vea el carrusel horizontal con 3 coches reales;
2. los coches entren y salgan como en el vídeo;
3. haya vecinos laterales cortados;
4. el texto y la letra gigante cambien sincronizados;
5. el hotspot siga al vehículo activo;
6. el loop sea circular;
7. wheel, drag, botones y teclado funcionen;
8. el panel permita cambiar coches/textos/CTA;
9. se valide visualmente con capturas o vídeo antes de entregar como final.
