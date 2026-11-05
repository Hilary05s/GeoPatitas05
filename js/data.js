/* =========================================================
   GeoPatitas — datos de demostración
   Reemplazar por llamadas a la API / base de datos real.
   ========================================================= */
window.GP_DATA = {
  STATUS: {
    help:   { label: 'Necesita ayuda', level: 1 },
    follow: { label: 'En seguimiento', level: 2 },
    done:   { label: 'Atendido',       level: 3 }
  },

  // Coordenadas x / y en % sobre el mapa ilustrativo
  REPORTS: [
    { id: '0142', x: 24, y: 24, status: 'help',   title: 'Mediano, café con blanco',    zona: 'Zona norte', time: 'Hace 2 h',    size: 'Mediano', color: 'Café con blanco',          salud: 'herida leve en una pata. Se recomienda valoración veterinaria.', rasgos: 'Collar azul gastado, oreja izquierda caída' },
    { id: '0141', x: 58, y: 20, status: 'help',   title: 'Grande, negro, collar rojo',  zona: 'Zona norte', time: 'Hace 1 día',  size: 'Grande',  color: 'Negro',                    salud: 'se ve desnutrido.',                 rasgos: 'Collar rojo, muy tranquilo' },
    { id: '0139', x: 44, y: 52, status: 'follow', title: 'Pequeño, blanco con manchas', zona: 'Centro',     time: 'Ayer',        size: 'Pequeño', color: 'Blanco con manchas cafés', salud: 'parece sano.',                      rasgos: 'Asustadizo, cola corta' },
    { id: '0138', x: 76, y: 48, status: 'help',   title: 'Cachorro, canela',            zona: 'Centro',     time: 'Hace 5 h',    size: 'Pequeño', color: 'Canela',                   salud: 'cachorro solo, posible abandono.',  rasgos: 'Sin collar, juguetón' },
    { id: '0131', x: 30, y: 70, status: 'done',   title: 'Mediano, canela',             zona: 'Zona sur',   time: 'Hace 3 días', size: 'Mediano', color: 'Canela',                   salud: 'atendido por veterinaria aliada.',  rasgos: 'Mancha blanca en el pecho' },
    { id: '0129', x: 64, y: 76, status: 'follow', title: 'Grande, gris',                zona: 'Zona sur',   time: 'Hace 2 días', size: 'Grande',  color: 'Gris',                     salud: 'cojea un poco.',                    rasgos: 'Pelo largo, collar café' }
  ],

  // Zonas para el formulario de reporte (x / y en % del mini mapa)
  ZONES: [
    { name: 'Zona norte',    x: 50, y: 18 },
    { name: 'Zona poniente', x: 20, y: 48 },
    { name: 'Centro',        x: 52, y: 50 },
    { name: 'Zona oriente',  x: 82, y: 46 },
    { name: 'Zona sur',      x: 40, y: 80 }
  ],

  DOGS: [
    { name: 'Canela', age: 'Adulto',   ageText: '2 años',  size: 'Mediano', sex: 'Hembra', desc: 'Cariñosa, sociable con niños.' },
    { name: 'Bruno',  age: 'Adulto',   ageText: '4 años',  size: 'Grande',  sex: 'Macho',  desc: 'Tranquilo, ideal para patio amplio.' },
    { name: 'Luna',   age: 'Cachorro', ageText: '8 meses', size: 'Pequeño', sex: 'Hembra', desc: 'Juguetona, ya vacunada.' },
    { name: 'Max',    age: 'Adulto',   ageText: '1 año',   size: 'Mediano', sex: 'Macho',  desc: 'Activo, aprende rápido.' }
  ],

  VETS: [
    { name: '[Nombre de la veterinaria]', badge: 'Veterinaria aliada' },
    { name: '[Nombre del negocio]',       badge: 'Negocio aliado' }
  ],

  TEAM: [
    { name: 'Hilary Sinaí Galindo Jiménez',     role: 'Liderazgo y moderación' },
    { name: 'Britney Stephany Ramírez Aguilar', role: 'Investigación y estrategia comercial' },
    { name: 'Brandon Rafael Lomelí Jacobo',     role: 'Diseño de interfaz (UI/UX)' },
    { name: 'Aldo Damián Domínguez Briseño',    role: 'Mapa interactivo y backend' },
    { name: 'Roy Eduardo Sandoval Rosales',     role: 'Estrategia comercial' }
  ],

  PENDING: [
    { id: 'a', foto: '[Foto]',   title: 'Mediano, blanco',            zona: 'Zona poniente', time: 'Hace 20 min', motivo: 'Nuevo reporte' },
    { id: 'b', foto: 'Sin foto', title: 'Cachorros (3), cafés',       zona: 'Centro',        time: 'Hace 1 h',    motivo: 'Nuevo reporte' },
    { id: 'c', foto: '[Foto]',   title: 'Grande, negro, collar rojo', zona: 'Zona norte',    time: 'Hace 3 h',    motivo: 'Posible duplicado de #0141' },
    { id: 'd', foto: 'Sin foto', title: 'Texto sin relación',         zona: 'Sin zona',      time: 'Hace 5 h',    motivo: 'Contenido fuera de tema' }
  ]
};
