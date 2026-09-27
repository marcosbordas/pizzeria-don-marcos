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
});


/* =========================================================
   1. MENU DEL CELULAR
   ========================================================= */
function menuCelular() {
  var boton   = document.querySelector('.boton-menu');
  var enlaces = document.querySelector('.enlaces');

  if (!boton || !enlaces) return;

  boton.addEventListener('click', function () {
    var abierto = enlaces.classList.toggle('activo');
    boton.setAttribute('aria-label', abierto ? 'Cerrar menu' : 'Abrir menu');
    boton.textContent = abierto ? '\u00D7' : '\u2630';
  });

  enlaces.querySelectorAll('a').forEach(function (enlace) {
    enlace.addEventListener('click', function () {
      enlaces.classList.remove('activo');
      boton.setAttribute('aria-label', 'Abrir menu');
      boton.textContent = '\u2630';
    });
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) {
      enlaces.classList.remove('activo');
      boton.textContent = '\u2630';
    }
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
   ASI COMO ESTA, EL FORMULARIO NO MANDA CORREOS DE VERDAD.
   Solo muestra un aviso. Para que le lleguen al cliente hay
   que conectarlo a un servicio gratuito (Formspree, Netlify).
   Eso se configura en UN SOLO LUGAR, al final de este archivo.

   EN EL HTML:
       <form class="formulario" data-formulario>
         <label>Nombre <input name="nombre" required></label>
         <button class="boton" type="submit">Enviar</button>
         <p class="aviso" data-aviso>Gracias</p>
       </form>
   ========================================================= */
function formularios() {
  document.querySelectorAll('[data-formulario]').forEach(function (formulario) {
    formulario.addEventListener('submit', function (evento) {
      evento.preventDefault();

      var aviso = formulario.querySelector('[data-aviso]');
      if (aviso) {
        aviso.classList.add('visible');
        aviso.textContent = 'Gracias. Tu mensaje fue enviado, te contestamos en menos de 24 horas.';
      }

      formulario.reset();

      if (aviso) {
        setTimeout(function () { aviso.classList.remove('visible'); }, 7000);
      }
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
      var nombre = boton.getAttribute('data-producto') || 'Producto';
      var precio = boton.getAttribute('data-precio') || '0';

      var existente = pedido.find(function (p) { return p.nombre === nombre; });
      if (existente) {
        existente.cantidad++;
      } else {
        pedido.push({ nombre: nombre, precio: precio, cantidad: 1 });
      }

      actualizar();
      mostrarBrindis('Agregado: ' + nombre);
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

    texto += '\nTotal: ' + total.toFixed(2);

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
