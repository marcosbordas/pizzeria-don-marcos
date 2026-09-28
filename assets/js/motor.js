/* =========================================================
   MOTOR.JS
   Todo lo que "se mueve" en la pagina.
   =========================================================
   Que hace este archivo:

     1. Menu del celular (el boton de las 3 lineas)
     2. Menu transparente que se pone solido al bajar
     3. Animaciones al aparecer con el scroll
     4. Preguntas frecuentes (abrir y cerrar)
     5. Contadores de numeros que suben solos
     6. Formularios (muestra el aviso de enviado)
     7. Carrito que arma el pedido y lo manda a WhatsApp
     8. Anio actual automatico en el pie de pagina
     9. Barra de anuncio que se puede cerrar

   ---------------------------------------------------------
   COMO USARLO:
   Pegalo antes de </body> en el index.html:

       <script src="assets/js/motor.js"></script>
   </body>

   No hay que cambiar nada aqui para cada cliente.
   Todo se controla desde el HTML.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  menuCelular();
  menuTransparente();
  animacionesAlBajar();
  preguntasFrecuentes();
  contadores();
  formularios();
  carritoWhatsApp();
  anioActual();
  barraAnuncio();
  selectorIdioma();
});


/* =========================================================
   1. MENU DEL CELULAR
   ========================================================= */
function menuCelular() {
  var boton   = document.querySelector('.boton-menu');
  var enlaces = document.querySelector('.enlaces');
  var cerrar  = document.querySelector('.cerrar-menu');

  if (!boton || !enlaces) return;

  function abrirMenu() {
    enlaces.classList.add('activo');
    boton.setAttribute('aria-label', 'Cerrar menu');
    boton.textContent = '\u00D7';
  }

  function cerrarMenu() {
    enlaces.classList.remove('activo');
    boton.setAttribute('aria-label', 'Abrir menu');
    boton.textContent = '\u2630';
  }

  boton.addEventListener('click', function () {
    if (enlaces.classList.contains('activo')) { cerrarMenu(); } else { abrirMenu(); }
  });

  /* El boton grande de "volver" que esta al final del menu. */
  if (cerrar) { cerrar.addEventListener('click', cerrarMenu); }

  /* Tocar cualquier enlace del menu lo cierra solo. */
  enlaces.querySelectorAll('a').forEach(function (enlace) {
    enlace.addEventListener('click', cerrarMenu);
  });

  /* Con la tecla Escape tambien se cierra. */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { cerrarMenu(); }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) { cerrarMenu(); }
  });
}


/* =========================================================
   2. MENU TRANSPARENTE
   ========================================================= */
function menuTransparente() {
  var menu = document.querySelector('.menu-transparente');
  if (!menu) return;

  function revisar() {
    menu.classList.toggle('pegado', window.scrollY > 60);
  }

  window.addEventListener('scroll', revisar, { passive: true });
  revisar();
}


/* =========================================================
   3. ANIMACIONES AL BAJAR
   ========================================================= */
function animacionesAlBajar() {
  var elementos = document.querySelectorAll('.aparece');

  if (!('IntersectionObserver' in window)) {
    elementos.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visible');
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  elementos.forEach(function (el) { observador.observe(el); });
}


/* =========================================================
   4. PREGUNTAS FRECUENTES
   Solo una abierta a la vez.
   ========================================================= */
function preguntasFrecuentes() {
  var preguntas = document.querySelectorAll('.pregunta');

  preguntas.forEach(function (pregunta) {
    var boton = pregunta.querySelector('button');
    if (!boton) return;

    boton.addEventListener('click', function () {
      var estabaAbierta = pregunta.classList.contains('abierta');

      preguntas.forEach(function (otra) { otra.classList.remove('abierta'); });

      if (!estabaAbierta) pregunta.classList.add('abierta');
    });
  });
}


/* =========================================================
   5. CONTADORES
   Van de 0 hasta el valor de data-hasta. Empiezan al verse.
   ========================================================= */
function contadores() {
  var cajas = document.querySelectorAll('[data-hasta]');
  if (!cajas.length) return;

  function animar(caja) {
    var hasta  = parseInt(caja.getAttribute('data-hasta'), 10);
    var sufijo = caja.getAttribute('data-sufijo') || '';
    var duracion = 1400;
    var inicio = null;

    function paso(ahora) {
      if (inicio === null) inicio = ahora;
      var proporcion = Math.min((ahora - inicio) / duracion, 1);
      var suavizado = 1 - Math.pow(1 - proporcion, 3);
      caja.textContent = Math.round(hasta * suavizado) + sufijo;
      if (proporcion < 1) requestAnimationFrame(paso);
    }

    requestAnimationFrame(paso);
  }

  if (!('IntersectionObserver' in window)) {
    cajas.forEach(animar);
    return;
  }

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        animar(entrada.target);
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.5 });

  cajas.forEach(function (c) { observador.observe(c); });
}


/* =========================================================
   6. FORMULARIOS
   ---------------------------------------------------------
   EL FORMULARIO ABRE EL CORREO DEL VISITANTE CON EL MENSAJE
   YA ESCRITO. No hay servidor ni cadastro: al darle enviar
   se abre su programa de correo y solo tiene que darle
   "enviar". Asi el mensaje llega de verdad al correo que
   tenga puesto la pagina.

   Para cambiar a quien le llega, se cambia el atributo
   data-correo del <form>:

   EN EL HTML:
       <form class="formulario" data-formulario
             data-correo="tucorreo@tucorreo.com"
             data-asunto="Mensaje desde la pagina web">
         <input name="nombre" placeholder="Tu nombre" required>
         <input name="correo" type="email" placeholder="Tu correo" required>
         <textarea name="mensaje" placeholder="Escribi aqui" required></textarea>
         <button class="boton" type="submit">Enviar mensaje</button>
         <p class="aviso" data-aviso></p>
       </form>

   OPCIONAL, para poner un nombre lindo a cada campo:

         <input name="nombre" data-etiqueta="Nombre">

   Si un dia se quiere mandar sin abrir el correo del
   visitante, se conecta Formspree (gratis) y se le pone
   action y method ahi. Ver el bloque del final del archivo.
   ========================================================= */
function formularios() {
  document.querySelectorAll('[data-formulario]').forEach(function (formulario) {
    var aviso = formulario.querySelector('[data-aviso]');

    formulario.addEventListener('submit', function (evento) {
      evento.preventDefault();

      var destino = formulario.getAttribute('data-correo');
      if (!destino) { return; }

      var asunto = formulario.getAttribute('data-asunto') || T('Mensaje desde la pagina web');

      var cuerpo = '';
      var faltan = [];

      formulario.querySelectorAll('input, textarea, select').forEach(function (campo) {
        if (!campo.name) { return; }
        var valor = (campo.value || '').trim();
        if (!valor) {
          if (campo.required) {
            faltan.push(campo.getAttribute('data-etiqueta') || campo.name);
          }
          return;
        }
        var etiqueta = campo.getAttribute('data-etiqueta') || campo.name;
        cuerpo += etiqueta + ': ' + valor + '\n';
      });

      if (faltan.length) {
        if (aviso) {
          aviso.textContent = T('Falta completar: ') + faltan.join(', ') + '.';
          aviso.classList.add('visible');
        }
        return;
      }

      cuerpo += '\n---\n' + T('Enviado desde: ') + window.location.href;

      var enlace = 'mailto:' + destino +
                   '?subject=' + encodeURIComponent(asunto) +
                   '&body=' + encodeURIComponent(cuerpo);

      if (aviso) {
        aviso.textContent = T('Te abrimos tu programa de correo con el mensaje escrito. Solo falta darle enviar.');
        aviso.classList.add('visible');
        setTimeout(function () { aviso.classList.remove('visible'); }, 12000);
      }

      window.location.href = enlace;
    });
  });
}


/* =========================================================
   7. CARRITO QUE MANDA EL PEDIDO A WHATSAPP
   ---------------------------------------------------------
   EN EL HTML, cada boton de agregar:
     <button class="boton agregar" data-producto="Pizza pepperoni"
             data-precio="12.00">Agregar</button>

   El boton del carrito:
     <button class="carrito" data-enviar-pedido>
       <span class="cuenta" data-cuenta>0</span> Pedir por WhatsApp
     </button>

   ---------------------------------------------------------
   DONDE VA EL NUMERO DE WHATSAPP:
   La linea NUMERO_WHATSAPP de mas abajo. Cambiala por cada
   cliente. Formato: codigo del pais + numero, sin + ni espacios.
     Cuba +53 5 5642848  ->  5355642848
   ========================================================= */

/* EL NUMERO AL QUE LLEGAN LOS PEDIDOS. CAMBIALO POR CLIENTE. */
var NUMERO_WHATSAPP = '5355642848';

/* Lo que se escribe antes de la lista de productos */
var TEXTO_PEDIDO = 'Hola! Quiero hacer este pedido:';

function carritoWhatsApp() {
  var botonEnviar = document.querySelector('[data-enviar-pedido]');
  if (!botonEnviar) return;

  var cajaCuenta = botonEnviar.querySelector('[data-cuenta]');
  var pedido = [];

  document.querySelectorAll('.agregar').forEach(function (boton) {
    boton.addEventListener('click', function () {
      var nombre = boton.getAttribute('data-producto') || T('Producto');
      var precio = boton.getAttribute('data-precio') || '0';

      var existente = pedido.find(function (p) { return p.nombre === nombre; });
      if (existente) {
        existente.cantidad++;
      } else {
        pedido.push({ nombre: nombre, precio: precio, cantidad: 1 });
      }

      actualizar();
      mostrarBrindis(T('Agregado: ') + nombre);
    });
  });

  document.querySelectorAll('[data-vaciar-carrito]').forEach(function (boton) {
    boton.addEventListener('click', function () {
      pedido = [];
      actualizar();
    });
  });

  botonEnviar.addEventListener('click', function () {
    if (!pedido.length) return;

    var texto = TEXTO_PEDIDO + '\n\n';
    var total = 0;

    pedido.forEach(function (p) {
      var importe = parseFloat(p.precio) * p.cantidad;
      total += importe;
      texto += '- ' + p.nombre + ' x' + p.cantidad + ' : ' + importe.toFixed(2) + '\n';
    });

      texto += '\n' + T('Total:') + ' ' + total.toFixed(2);

    window.open('https://wa.me/' + NUMERO_WHATSAPP + '?text=' + encodeURIComponent(texto), '_blank');
  });

  function actualizar() {
    if (cajaCuenta) cajaCuenta.textContent = pedido.length;
    botonEnviar.classList.toggle('visible', pedido.length > 0);
  }

  function mostrarBrindis(texto) {
    var brindis = document.querySelector('.brindis');
    if (!brindis) return;
    brindis.textContent = texto;
    brindis.classList.add('visible');
    setTimeout(function () { brindis.classList.remove('visible'); }, 1800);
  }
}


/* =========================================================
   8. ANIO ACTUAL
   En el HTML:  <span data-anio></span>
   ========================================================= */
function anioActual() {
  document.querySelectorAll('[data-anio]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
}


/* =========================================================
   9. BARRA DE ANUNCIO
   El tachito de la esquina la cierra.
   ========================================================= */
function barraAnuncio() {
  document.querySelectorAll('.cerrar-anuncio').forEach(function (boton) {
    boton.addEventListener('click', function () {
      var anuncio = boton.closest('.anuncio');
      if (anuncio) anuncio.remove();
    });
  });
}


/* =========================================================
   10. IDIOMA ES / EN
   ---------------------------------------------------------
   Como funciona, para que quede claro y no haya que explicar:

   1) El HTML se escribe en ESPANOL. Ese es el texto de respaldo:
      si el visitante tiene el javascript apagado, ve todo en
      espanol y la pagina se lee completa. Nunca se borra el
      espanol del HTML.

   2) Para traducir un elemento se le pone data-en="..." :

        <h2 data-en="About me">Sobre mi</h2>

   3) Al cambiar a ingles, ese <h2> pasa a decir "About me".
      Al volver a espanol, vuelve a decir "Sobre mi".
      El espanol se guarda solo en data-es la primera vez.

   ---------------------------------------------------------
   ATRIBUTOS QUE TAMBIEN SE TRADUCEN:

        data-en-placeholder   (placeholder de input y textarea)
        data-en-aria          (aria-label de los botones)
        data-en-alt           (alt de las imagenes)
        data-en-title         (title)
        data-en-etiqueta      (data-etiqueta, para el boton del formulario)

   ---------------------------------------------------------
   LO QUE NO ES TEXTO VISIBLE (el titulo y la descripcion)
   ---------------------------------------------------------

        data-en-titulo        (el <title> del navegador)
        data-en-descripcion   (la <meta name="description">)

   Esos dos van en el <html>, no en un elemento:

        <html lang="es"
              data-en-titulo="Web design for small businesses"
              data-en-descripcion="I build websites for...">

   ---------------------------------------------------------
   NODOS QUE EL MOTOR NO TOCA (los escribe el propio motor):

        [data-hasta]   contadores que suben solos
        [data-anio]    anio del pie de pagina
        [data-cuenta]  numerito del carrito

   Para dejar algo siempre en espanol:

        data-sin-traducir

   ---------------------------------------------------------
   EL BOTON ES | EN

   Se dibuja solo, no hay que escribirlo en el HTML. Se coloca
   dentro de .menu-interior si existe, si no dentro de .menu, y
   si no al principio del <body>.

   ---------------------------------------------------------
   TRADUCIR TEXTO QUE MARCA EL PROPIO MOTOR (carrito, avisos):

        TEXTO_PEDIDO = T('Hola! Quiero hacer este pedido:');

   ========================================================= */
var IDIOMA_POR_DEFECTO = 'es';
var CLAVE_IDIOMA      = 'mb-lang';

/* Los textos que escribe el motor, en los dos idiomas. */
var TEXTOS_MOTOR = {
  es: {
    pedido:   'Hola! Quiero hacer este pedido:',
    total:    'Total:',
    agregado: 'Agregado: ',
    producto: 'Producto',
    faltan:  'Falta completar: ',
    enviado:  'Te abrimos tu programa de correo con el mensaje escrito. Solo falta darle enviar.',
    asunto:   'Mensaje desde la pagina web',
    origen:   'Enviado desde: '
  },
  en: {
    pedido:   'Hello! I would like to place this order:',
    total:    'Total:',
    agregado: 'Added: ',
    producto: 'Product',
    faltan:  'Please fill in: ',
    enviado:  'We opened your email app with the message ready. Just hit send.',
    asunto:   'Message from the website',
    origen:   'Sent from: '
  }
};

function idiomaActual() {
  try { return localStorage.getItem(CLAVE_IDIOMA) || IDIOMA_POR_DEFECTO; }
  catch (e) { return IDIOMA_POR_DEFECTO; }
}

function guardarIdioma(lang) {
  try { localStorage.setItem(CLAVE_IDIOMA, lang); } catch (e) { }
}

/* Traduce una cadena que escribe el motor. */
function T(texto) {
  var lang = idiomaActual();
  var grupo = TEXTOS_MOTOR[lang] || TEXTOS_MOTOR[IDIOMA_POR_DEFECTO];
  for (var clave in grupo) {
    if (grupo[clave] === texto) { return grupo[clave]; }
  }
  return texto;
}

/* Escribe en el PRIMER nodo de texto directo del elemento.
   Asi no se borran los hijos, por ejemplo el <span class="signo">+</span>
   que esta dentro de los botones de preguntas frecuentes. */
function fijarTexto(el, texto) {
  for (var i = 0; i < el.childNodes.length; i++) {
    if (el.childNodes[i].nodeType === 3) {
      el.childNodes[i].nodeValue = texto;
      return;
    }
  }
  el.insertBefore(document.createTextNode(texto), el.firstChild);
}

/* Atributo real  ->  atributo donde va la traduccion.
   Para inventar uno nuevo solo se agrega una linea aqui. */
var ATRIBUTOS_TRADUCIBLES = {
  'placeholder':   'data-en-placeholder',
  'aria-label':    'data-en-aria',
  'alt':           'data-en-alt',
  'title':         'data-en-title',
  'data-etiqueta': 'data-en-etiqueta'
};

/* El <title> del navegador y la <meta description> no son texto visible,
   asi que no los agarra el ciclo de [data-en]. Se cambian aqui.
   Las traducciones van puestas en el <html>:

     <html lang="es" data-en-titulo="..." data-en-descripcion="...">

   El espanol se guarda solo la primera vez, igual que data-en. */
function traducirMeta(lang) {
  var raiz = document.documentElement;

  if (raiz.getAttribute('data-es-titulo') === null) {
    raiz.setAttribute('data-es-titulo', document.title);
  }
  var titulo = raiz.getAttribute(lang === 'en' ? 'data-en-titulo' : 'data-es-titulo');
  if (titulo) { document.title = titulo; }

  var meta = document.querySelector('meta[name="description"]');
  if (!meta) { return; }
  if (raiz.getAttribute('data-es-descripcion') === null) {
    raiz.setAttribute('data-es-descripcion', meta.getAttribute('content') || '');
  }
  var desc = raiz.getAttribute(lang === 'en' ? 'data-en-descripcion' : 'data-es-descripcion');
  if (desc) { meta.setAttribute('content', desc); }
}

function selectorIdioma() {
  document.documentElement.setAttribute('data-idioma', idiomaActual());
  aplicarIdioma(idiomaActual());
  dibujarSelector();
}

function aplicarIdioma(lang) {
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('data-idioma', lang);

  var grupo = TEXTOS_MOTOR[lang] || TEXTOS_MOTOR[IDIOMA_POR_DEFECTO];
  TEXTO_PEDIDO = grupo.pedido;

  document.querySelectorAll('[data-en]').forEach(function (el) {
    if (el.closest('[data-sin-traducir]')) { return; }

    if (el.getAttribute('data-es') === null) {
      var actual = '';
      for (var i = 0; i < el.childNodes.length; i++) {
        if (el.childNodes[i].nodeType === 3) { actual += el.childNodes[i].nodeValue; }
      }
      el.setAttribute('data-es', actual.trim());
    }

    var texto = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-es');
    if (texto) { fijarTexto(el, texto); }

    for (var attr in ATRIBUTOS_TRADUCIBLES) {
      var valor = el.getAttribute(ATRIBUTOS_TRADUCIBLES[attr]);
      if (!valor) { continue; }
      if (lang === 'en') {
        el.setAttribute('data-es-' + attr, el.getAttribute(attr) || '');
        el.setAttribute(attr, valor);
      } else {
        var vuelta = el.getAttribute('data-es-' + attr);
        if (vuelta !== null && vuelta !== '') { el.setAttribute(attr, vuelta); }
      }
    }
  });

  traducirMeta(lang);
}

function dibujarSelector() {
  if (document.querySelector('.selector-idioma')) { return; }

  var caja = document.createElement('div');
  caja.className = 'selector-idioma';
  caja.setAttribute('role', 'group');
  caja.innerHTML =
    '<button type="button" data-idioma-btn="es">ES</button>' +
    '<button type="button" data-idioma-btn="en">EN</button>';

  var destino = document.querySelector('.menu-interior') ||
                document.querySelector('.menu') ||
                document.body;
  destino.appendChild(caja);

  function marcar() {
    var lang = idiomaActual();
    caja.querySelectorAll('[data-idioma-btn]').forEach(function (b) {
      var activo = b.getAttribute('data-idioma-btn') === lang;
      b.classList.toggle('activo', activo);
      b.setAttribute('aria-pressed', activo ? 'true' : 'false');
    });
  }

  caja.querySelectorAll('[data-idioma-btn]').forEach(function (boto) {
    boto.addEventListener('click', function () {
      var lang = boto.getAttribute('data-idioma-btn');
      guardarIdioma(lang);
      aplicarIdioma(lang);
      marcar();
    });
  });

  marcar();
}

/* =========================================================
   =========================================================
   PARA CONECTAR LOS FORMULARIOS DE VERDAD  (mas adelante)
   =========================================================
   =========================================================
   Por ahora el formulario solo muestra un aviso y ya.
   Cuando un cliente pague, se activa esto:

   1) Ve a https://formspree.io  (gratis, hasta 50 envios al mes)
   2) Crea un formulario con tu correo
   3) Formspree te da un link asi:

        https://formspree.io/f/XXXXXXXX

   4) En el HTML, en la linea del <form ...> cambia esto:

        <form class="formulario" data-formulario>

      por esto:

        <form class="formulario" data-formulario
              action="https://formspree.io/f/XXXXXXXX"
              method="POST">

   5) Listo. Los mensajes le llegan al cliente a su correo.
   ========================================================= */
