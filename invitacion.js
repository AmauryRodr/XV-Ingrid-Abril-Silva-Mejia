const sobreInicial = document.getElementById("sobre-inicial");
const abrirInvitacion = document.getElementById("abrir-invitacion");
const tarjetaBienvenida = document.querySelector(".welcome__card");
const contenidoPrincipal = document.getElementById("contenido-principal");
const botonRegalo = document.getElementById("gift-surprise");
const countdownEl = document.getElementById("countdown");
const musica = document.getElementById("musica-xv");
const btnMusica = document.getElementById("btn-musica");
const fechaEvento = new Date("2027-02-06T17:00:00");

function actualizarContador() {
    const diferencia = fechaEvento.getTime() - Date.now();

    if (diferencia <= 0) {
        countdownEl.innerHTML = '<span class="hero__countdown-message">¡Gracias por celebrar conmigo!</span>';
        return;
    }

    const unidades = [
        [Math.floor(diferencia / 86400000), "Días"],
        [Math.floor((diferencia / 3600000) % 24), "Horas"],
        [Math.floor((diferencia / 60000) % 60), "Minutos"],
        [Math.floor((diferencia / 1000) % 60), "Segundos"]
    ];

    countdownEl.innerHTML = unidades.map(([valor, etiqueta]) => `
        <span class="countdown-unit"><strong>${valor}</strong><span>${etiqueta}</span></span>
    `).join("");
}

actualizarContador();
window.setInterval(actualizarContador, 1000);

function cerrarPortada() {
    sobreInicial.hidden = true;
    document.body.classList.remove("is-locked");
    window.scrollTo({ top: 0, behavior: "instant" });
    actualizarNivelAgua();
}

abrirInvitacion.addEventListener("click", async () => {
    abrirInvitacion.disabled = true;
    contenidoPrincipal.hidden = false;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        cerrarPortada();
    } else {
        sobreInicial.classList.add("is-opening");
        tarjetaBienvenida.classList.add("is-opening");
        let respaldoCierre;
        const terminarApertura = (evento) => {
            if (evento && (evento.target !== tarjetaBienvenida || evento.propertyName !== "transform")) {
                return;
            }
            window.clearTimeout(respaldoCierre);
            tarjetaBienvenida.removeEventListener("transitionend", terminarApertura);
            cerrarPortada();
        };
        tarjetaBienvenida.addEventListener("transitionend", terminarApertura);
        respaldoCierre = window.setTimeout(() => terminarApertura(), 1000);
    }

    try {
        await musica.play();
        actualizarControlMusica(true);
    } catch {
        actualizarControlMusica(false);
    }
});

document.body.classList.add("is-locked");

function actualizarControlMusica(estaReproduciendo) {
    const texto = estaReproduciendo ? "Pausar música" : "Reproducir música";
    btnMusica.setAttribute("aria-label", texto);
    btnMusica.title = texto;
    btnMusica.querySelector(".music-toggle__label").textContent = estaReproduciendo ? "Pausar" : "Música";
}

btnMusica.addEventListener("click", async () => {
    if (musica.paused) {
        try {
            await musica.play();
            actualizarControlMusica(true);
        } catch {
            actualizarControlMusica(false);
        }
    } else {
        musica.pause();
        actualizarControlMusica(false);
    }
});

/*
const imagenesGaleria = ["7.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"];
const imgCarrusel = document.getElementById("imagen-carrusel");
const contadorFoto = document.getElementById("foto-contador");
let indiceActual = 0;

function mostrarImagen() {
    imgCarrusel.style.opacity = "0.3";
    window.setTimeout(() => {
        imgCarrusel.src = imagenesGaleria[indiceActual];
        imgCarrusel.alt = `Foto de ejemplo de la quinceañera, ${indiceActual + 1} de ${imagenesGaleria.length}`;
        contadorFoto.textContent = `${String(indiceActual + 1).padStart(2, "0")} / ${String(imagenesGaleria.length).padStart(2, "0")}`;
        imgCarrusel.style.opacity = "1";
    }, 140);
}

document.getElementById("anterior").addEventListener("click", () => {
    indiceActual = (indiceActual - 1 + imagenesGaleria.length) % imagenesGaleria.length;
    mostrarImagen();
});

document.getElementById("siguiente").addEventListener("click", () => {
    indiceActual = (indiceActual + 1) % imagenesGaleria.length;
    mostrarImagen();
});
*/

const elementosItinerario = document.querySelectorAll(".schedule__list li");
let actualizacionAgendada = false;

function actualizarNivelAgua() {
    if (actualizacionAgendada) {
        return;
    }

    actualizacionAgendada = true;
    window.requestAnimationFrame(() => {
        const alturaVentana = window.innerHeight;
        const inicioLlenado = alturaVentana * 0.85;
        const finLlenado = alturaVentana * 0.35;
        const distanciaLlenado = inicioLlenado - finLlenado;

        elementosItinerario.forEach((elemento) => {
            const posicionSuperior = elemento.getBoundingClientRect().top;
            const progreso = Math.max(0, Math.min(1, (inicioLlenado - posicionSuperior) / distanciaLlenado));
            const porcentaje = `${Math.round(progreso * 100)}%`;
            elemento.style.setProperty("--nivel-agua", porcentaje);
        });

        actualizacionAgendada = false;
    });
}

window.addEventListener("scroll", actualizarNivelAgua, { passive: true });
window.addEventListener("resize", actualizarNivelAgua);

const pieConfetti = document.getElementById("footer-confetti");
const pieConfettiContext = pieConfetti.getContext("2d");
const coloresPieConfetti = ["#6b1832", "#a95069", "#e6a9bc", "#d9aa48", "#f1c8d3"];
const confettiReducido = window.matchMedia("(prefers-reduced-motion: reduce)");
let particulasPieConfetti = [];
let animacionPieConfetti;
let pieVisible = false;
let anchoPieConfetti = 0;
let altoPieConfetti = 0;

function ajustarCanvasPie() {
    const escala = Math.min(window.devicePixelRatio || 1, 2);
    anchoPieConfetti = pieConfetti.clientWidth;
    altoPieConfetti = pieConfetti.clientHeight;
    pieConfetti.width = Math.round(anchoPieConfetti * escala);
    pieConfetti.height = Math.round(altoPieConfetti * escala);
    pieConfettiContext.setTransform(escala, 0, 0, escala, 0, 0);
    particulasPieConfetti = Array.from({ length: Math.min(90, Math.ceil(anchoPieConfetti / 14)) }, () => ({
        x: Math.random() * anchoPieConfetti,
        y: Math.random() * altoPieConfetti,
        ancho: 3 + Math.random() * 5,
        alto: 6 + Math.random() * 7,
        velocidadY: 22 + Math.random() * 38,
        velocidadX: (Math.random() - 0.5) * 18,
        angulo: Math.random() * Math.PI * 2,
        giro: (Math.random() - 0.5) * 3,
        oscilacion: Math.random() * 2 + 0.5,
        color: coloresPieConfetti[Math.floor(Math.random() * coloresPieConfetti.length)]
    }));
}

function dibujarConfettiPie(tiempo) {
    if (!pieVisible || confettiReducido.matches) {
        animacionPieConfetti = undefined;
        return;
    }

    const paso = Math.min((tiempo - (dibujarConfettiPie.ultimoTiempo || tiempo)) / 1000, 0.05);
    dibujarConfettiPie.ultimoTiempo = tiempo;
    pieConfettiContext.clearRect(0, 0, anchoPieConfetti, altoPieConfetti);
    particulasPieConfetti.forEach((particula) => {
        particula.y += particula.velocidadY * paso;
        particula.x += (particula.velocidadX + Math.sin(tiempo / 1000 * particula.oscilacion) * 12) * paso;
        particula.angulo += particula.giro * paso;

        if (particula.y > altoPieConfetti + 12) {
            particula.y = -12;
            particula.x = Math.random() * anchoPieConfetti;
        }
        if (particula.x < -12) particula.x = anchoPieConfetti + 12;
        if (particula.x > anchoPieConfetti + 12) particula.x = -12;

        pieConfettiContext.save();
        pieConfettiContext.translate(particula.x, particula.y);
        pieConfettiContext.rotate(particula.angulo);
        pieConfettiContext.fillStyle = particula.color;
        pieConfettiContext.fillRect(-particula.ancho / 2, -particula.alto / 2, particula.ancho, particula.alto);
        pieConfettiContext.restore();
    });

    animacionPieConfetti = window.requestAnimationFrame(dibujarConfettiPie);
}

function actualizarAnimacionPie() {
    if (pieVisible && !confettiReducido.matches && !animacionPieConfetti) {
        dibujarConfettiPie.ultimoTiempo = undefined;
        animacionPieConfetti = window.requestAnimationFrame(dibujarConfettiPie);
    } else if ((!pieVisible || confettiReducido.matches) && animacionPieConfetti) {
        window.cancelAnimationFrame(animacionPieConfetti);
        animacionPieConfetti = undefined;
        pieConfettiContext.clearRect(0, 0, anchoPieConfetti, altoPieConfetti);
    }
}

ajustarCanvasPie();
if ("ResizeObserver" in window) {
    new ResizeObserver(ajustarCanvasPie).observe(pieConfetti);
} else {
    window.addEventListener("resize", ajustarCanvasPie);
}
if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entrada]) => {
        pieVisible = entrada.isIntersecting;
        actualizarAnimacionPie();
    }).observe(pieConfetti);
} else {
    pieVisible = true;
    actualizarAnimacionPie();
}
confettiReducido.addEventListener("change", actualizarAnimacionPie);

const confetiRegalo = botonRegalo.querySelector(".gift-table__confetti");
const coloresConfetiRegalo = ["#6b1832", "#a95069", "#e6a9bc", "#d9aa48", "#8d4b2f", "#98d4f8"];
botonRegalo.addEventListener("click", () => {
    if (confettiReducido.matches) {
        return;
    }

    const fragmento = document.createDocumentFragment();
    for (let indice = 0; indice < 36; indice += 1) {
        const pieza = document.createElement("span");
        const angulo = Math.random() * Math.PI * 2;
        const distancia = 45 + Math.random() * 105;
        pieza.className = "gift-table__confetti-piece";
        pieza.style.setProperty("--x", `${Math.cos(angulo) * distancia}px`);
        pieza.style.setProperty("--y", `${Math.sin(angulo) * distancia}px`);
        pieza.style.setProperty("--rotation", `${Math.random() * 900 - 450}deg`);
        pieza.style.setProperty("--color", coloresConfetiRegalo[Math.floor(Math.random() * coloresConfetiRegalo.length)]);
        fragmento.append(pieza);
        pieza.addEventListener("animationend", () => pieza.remove(), { once: true });
    }
    confetiRegalo.append(fragmento);
});

const confettisFamilia = document.querySelector(".family__confettis");
if (!confettiReducido.matches) {
    const fragmentoConfetti = document.createDocumentFragment();
    for (let indice = 0; indice < 100; indice += 1) {
        const pieza = document.createElement("i");
        const tira = document.createElement("span");
        pieza.className = "family__confetti-piece";
        pieza.style.setProperty("--left", `${Math.random() * 100}%`);
        pieza.style.setProperty("--rotation", `${-50 + Math.random() * 100}deg`);
        pieza.style.setProperty("--speed", `${0.7 + Math.random() * 0.8}`);
        pieza.style.setProperty("--delay", `${-Math.random() * 12}s`);
        pieza.style.setProperty("--color", `hsl(${Math.random() * 360} 90% 72%)`);
        pieza.append(tira);
        fragmentoConfetti.append(pieza);
    }
    confettisFamilia.append(fragmentoConfetti);
}

const elementosRevelar = document.querySelectorAll(".section-reveal");
if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver((entradas, observer) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add("is-visible");
                observer.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.12 });

    elementosRevelar.forEach((elemento) => observador.observe(elemento));
} else {
    elementosRevelar.forEach((elemento) => elemento.classList.add("is-visible"));
}

document.getElementById("form-rsvp").addEventListener("submit", (evento) => {
    evento.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const mensajeEl = document.getElementById("mensaje");
    const destinatario = evento.submitter?.value;

    if (nombre.length < 3) {
        mensajeEl.textContent = "Escribe tu nombre completo para confirmar.";
        return;
    }

    const numerosWhatsApp = {
        "Mamá": "525512307291",
        "Papá": "525520660563"
    };
    const numero = numerosWhatsApp[destinatario];
    if (!numero) {
        mensajeEl.textContent = "Elige si deseas confirmar con mamá o papá.";
        return;
    }

    const texto = `Hola ${destinatario} Gracias por invitarme!!. Soy ${nombre} y quiero confirmar mi asistencia a los XV años de ♡ Ingrid Abril ♡.`;
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, "_blank", "noopener,noreferrer");
    mensajeEl.textContent = `Gracias, ${nombre}. WhatsApp se abrirá con tu mensaje para ${destinatario}.`;
});

const cupoCompartido = new URLSearchParams(window.location.search).get("cupo");
const paseCupoEl = document.getElementById("pase-cupo");
if (/^(?:[2-9]|10)$/.test(cupoCompartido || "")) {
    paseCupoEl.textContent = `Esta invitación es válida por ${cupoCompartido} invitados.`;
    paseCupoEl.hidden = false;
}

const preguntasTrivia = [
    {
        pregunta: "¿Qué celebramos esta noche?",
        opciones: ["Mis XV años", "Una boda", "Una graduación"],
        respuesta: 0
    },
    {
        pregunta: "¿Qué momento viene después de la misa?",
        opciones: ["El vals", "La comida", "El grupo musical"],
        respuesta: 1
    },
    {
        pregunta: "¿Mi color favorito es?",
        opciones: ["Morado", "Rosa", "Rojo"],
        respuesta: 0
    },
    {
        pregunta: "¿Cuál es mi animal favorito?",
        opciones: ["Changuito", "Conejito", "Perrito"],
        respuesta: 0
    },
    {
        pregunta: "¿Cuál es mi deporte favorito?",
        opciones: ["Box", "Fútbol", "Natación"],
        respuesta: 0
    }
];

const triviaPregunta = document.getElementById("trivia-pregunta");
const triviaOpciones = document.getElementById("trivia-opciones");
const triviaMensaje = document.getElementById("trivia-mensaje");
const triviaProgreso = document.getElementById("trivia-progreso");
const triviaIniciar = document.getElementById("trivia-iniciar");
const triviaConfetti = document.getElementById("trivia-confetti");
const confettiContext = triviaConfetti.getContext("2d");
let audioTrivia;
const coloresConfetti = ["#6b1832", "#a95069", "#e6a9bc", "#f1c8d3", "#d9aa48"];
let particulasConfetti = [];
let animacionConfetti;
let indiceTrivia = 0;
let aciertosTrivia = 0;
triviaProgreso.textContent = `${preguntasTrivia.length} preguntas`;

function reproducirClicTrivia() {
    const AudioContext = window.AudioContext;
    if (!AudioContext) {
        return;
    }

    audioTrivia ??= new AudioContext();
    const emitirClic = () => {
        const oscilador = audioTrivia.createOscillator();
        const volumen = audioTrivia.createGain();
        const ahora = audioTrivia.currentTime;

        oscilador.type = "sine";
        oscilador.frequency.setValueAtTime(900, ahora);
        oscilador.frequency.exponentialRampToValueAtTime(520, ahora + 0.045);
        volumen.gain.setValueAtTime(0.055, ahora);
        volumen.gain.exponentialRampToValueAtTime(0.001, ahora + 0.05);
        oscilador.connect(volumen);
        volumen.connect(audioTrivia.destination);
        oscilador.start(ahora);
        oscilador.stop(ahora + 0.05);
    };

    if (audioTrivia.state === "suspended") {
        audioTrivia.resume().then(emitirClic);
        return;
    }

    emitirClic();
}

function animarRespuestaTrivia(boton, correcta) {
    if (!confettiContext || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    if (animacionConfetti) {
        window.cancelAnimationFrame(animacionConfetti);
    }

    const escala = Math.min(window.devicePixelRatio || 1, 2);
    const ancho = window.innerWidth;
    const alto = window.innerHeight;
    triviaConfetti.width = ancho * escala;
    triviaConfetti.height = alto * escala;
    confettiContext.setTransform(escala, 0, 0, escala, 0, 0);

    const rectangulo = boton.getBoundingClientRect();
    const origenX = rectangulo.left + rectangulo.width / 2;
    const origenY = rectangulo.top + rectangulo.height / 2;
    particulasConfetti = Array.from({ length: correcta ? 90 : 28 }, () => {
        const angulo = Math.random() * Math.PI * 2;
        const velocidad = correcta ? 2 + Math.random() * 6 : 4 + Math.random() * 5;
        return {
            x: origenX,
            y: origenY,
            velocidadX: Math.cos(angulo) * velocidad,
            velocidadY: correcta ? Math.sin(angulo) * velocidad - 2 : -4 - Math.random() * 5,
            giro: Math.random() * Math.PI,
            velocidadGiro: (Math.random() - 0.5) * (correcta ? 0.25 : 0.08),
            ancho: 5 + Math.random() * 5,
            alto: 4 + Math.random() * 5,
            color: coloresConfetti[Math.floor(Math.random() * coloresConfetti.length)],
            esCaritaTriste: !correcta,
            tamano: 22 + Math.random() * 10,
            vida: 1
        };
    });

    triviaConfetti.classList.add("is-active");
    let tiempoAnterior = 0;

    function dibujarConfetti(tiempo) {
        const paso = tiempoAnterior ? Math.min((tiempo - tiempoAnterior) / 16.67, 2) : 1;
        tiempoAnterior = tiempo;
        confettiContext.clearRect(0, 0, ancho, alto);

        particulasConfetti = particulasConfetti.filter((particula) => particula.vida > 0);
        particulasConfetti.forEach((particula) => {
            particula.x += particula.velocidadX * paso;
            particula.y += particula.velocidadY * paso;
            particula.velocidadY += (particula.esCaritaTriste ? 0.1 : 0.12) * paso;
            particula.giro += particula.velocidadGiro * paso;
            particula.vida -= (particula.esCaritaTriste ? 0.025 : 0.009) * paso;

            confettiContext.save();
            confettiContext.globalAlpha = Math.max(particula.vida, 0);
            confettiContext.translate(particula.x, particula.y);
            confettiContext.rotate(particula.giro);
            if (particula.esCaritaTriste) {
                confettiContext.font = `${particula.tamano}px sans-serif`;
                confettiContext.textAlign = "center";
                confettiContext.textBaseline = "middle";
                confettiContext.fillText("😢", 0, 0);
            } else {
                confettiContext.fillStyle = particula.color;
                confettiContext.fillRect(-particula.ancho / 2, -particula.alto / 2, particula.ancho, particula.alto);
            }
            confettiContext.restore();
        });

        if (particulasConfetti.length) {
            animacionConfetti = window.requestAnimationFrame(dibujarConfetti);
        } else {
            triviaConfetti.classList.remove("is-active");
            confettiContext.clearRect(0, 0, ancho, alto);
            animacionConfetti = undefined;
        }
    }

    animacionConfetti = window.requestAnimationFrame(dibujarConfetti);
}

function mostrarPreguntaTrivia() {
    const preguntaActual = preguntasTrivia[indiceTrivia];
    triviaPregunta.textContent = preguntaActual.pregunta;
    triviaProgreso.textContent = `Pregunta ${indiceTrivia + 1} de ${preguntasTrivia.length}`;
    triviaMensaje.textContent = "";
    triviaOpciones.replaceChildren();

    preguntaActual.opciones.forEach((opcion, indice) => {
        const boton = document.createElement("button");
        boton.className = "trivia__option";
        boton.type = "button";
        boton.textContent = opcion;
        boton.addEventListener("click", () => {
            reproducirClicTrivia();
            triviaOpciones.querySelectorAll("button").forEach((elemento, indiceOpcion) => {
                elemento.disabled = true;
                elemento.classList.add(indiceOpcion === preguntaActual.respuesta ? "is-correct" : "is-incorrect");
            });

            if (indice === preguntaActual.respuesta) {
                aciertosTrivia += 1;
                triviaMensaje.textContent = "¡Muy bien! Esa es la respuesta correcta.";
                animarRespuestaTrivia(boton, true);
            } else {
                triviaMensaje.textContent = `La respuesta era: ${preguntaActual.opciones[preguntaActual.respuesta]}.`;
                animarRespuestaTrivia(boton, false);
            }

            triviaIniciar.textContent = indiceTrivia === preguntasTrivia.length - 1 ? "Ver resultado" : "Siguiente pregunta";
        });
        triviaOpciones.append(boton);
    });
}

triviaIniciar.addEventListener("click", () => {
    if (triviaIniciar.dataset.jugando !== "true") {
        indiceTrivia = 0;
        aciertosTrivia = 0;
        triviaIniciar.dataset.jugando = "true";
        triviaIniciar.textContent = "Elige una respuesta";
        triviaIniciar.disabled = true;
        mostrarPreguntaTrivia();
        return;
    }

    if (!triviaOpciones.querySelector("button:disabled")) {
        return;
    }

    if (indiceTrivia < preguntasTrivia.length - 1) {
        indiceTrivia += 1;
        mostrarPreguntaTrivia();
        triviaIniciar.textContent = "Elige una respuesta";
        triviaIniciar.disabled = true;
        return;
    }

    triviaPregunta.textContent = `¡Acertaste ${aciertosTrivia} de ${preguntasTrivia.length}!`;
    triviaProgreso.textContent = "Trivia terminada";
    triviaOpciones.replaceChildren();
    triviaMensaje.textContent = aciertosTrivia === preguntasTrivia.length ? "¡Conoces muy bien los detalles de la fiesta!" : "¡Gracias por jugar! Nos vemos en la fiesta.";
    triviaIniciar.dataset.jugando = "false";
    triviaIniciar.disabled = false;
    triviaIniciar.textContent = "Jugar otra vez";
});

triviaOpciones.addEventListener("click", () => {
    triviaIniciar.disabled = false;
});