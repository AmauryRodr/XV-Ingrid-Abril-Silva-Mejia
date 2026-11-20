const formPase = document.getElementById("form-pase");
const nombreInvitadoEl = document.getElementById("invitado");
const cupoEl = document.getElementById("cupo");
const enlaceInvitacionEl = document.getElementById("enlace-invitacion");
const mensajePaseEl = document.getElementById("mensaje-pase");
const resultadoPaseEl = document.getElementById("resultado-pase");
const lienzoPase = document.getElementById("lienzo-pase");
const contextoPase = lienzoPase.getContext("2d");
let enlaceGenerado = "";

const enlaceBase = new URL("index.html", window.location.href);
if (enlaceBase.protocol === "https:" || enlaceBase.protocol === "http:") {
    enlaceInvitacionEl.value = enlaceBase.href;
}

function dibujarTextoEnvuelto(contexto, texto, x, y, anchoMaximo, altoLinea, maxLineas) {
    const palabras = texto.split(/\s+/);
    let linea = "";
    let lineas = 0;

    palabras.forEach((palabra, indice) => {
        const prueba = linea ? `${linea} ${palabra}` : palabra;
        if (contexto.measureText(prueba).width > anchoMaximo && linea) {
            contexto.fillText(linea, x, y + lineas * altoLinea, anchoMaximo);
            lineas += 1;
            linea = palabra;
        } else {
            linea = prueba;
        }

        if (indice === palabras.length - 1 && linea && lineas < maxLineas) {
            contexto.fillText(linea, x, y + lineas * altoLinea, anchoMaximo);
            lineas += 1;
        }
    });

    return lineas;
}

function crearLienzoQr(enlace) {
    const codigo = qrcode(0, "M");
    codigo.addData(enlace);
    codigo.make();

    const modulos = codigo.getModuleCount();
    const margenModulos = 4;
    const pixelesPorModulo = Math.max(3, Math.floor(840 / (modulos + margenModulos * 2)));
    const lado = (modulos + margenModulos * 2) * pixelesPorModulo;
    const lienzoQr = document.createElement("canvas");
    const contextoQr = lienzoQr.getContext("2d");
    lienzoQr.width = lado;
    lienzoQr.height = lado;
    contextoQr.fillStyle = "#ffffff";
    contextoQr.fillRect(0, 0, lado, lado);
    contextoQr.fillStyle = "#421322";

    for (let fila = 0; fila < modulos; fila += 1) {
        for (let columna = 0; columna < modulos; columna += 1) {
            if (codigo.isDark(fila, columna)) {
                contextoQr.fillRect(
                    (columna + margenModulos) * pixelesPorModulo,
                    (fila + margenModulos) * pixelesPorModulo,
                    pixelesPorModulo,
                    pixelesPorModulo
                );
            }
        }
    }

    return lienzoQr;
}

function crearImagenPase(nombre, cupo, enlace) {
    const ancho = lienzoPase.width;
    const centro = ancho / 2;
    contextoPase.fillStyle = "#fffaf8";
    contextoPase.fillRect(0, 0, ancho, lienzoPase.height);
    contextoPase.strokeStyle = "#6b1832";
    contextoPase.lineWidth = 5;
    contextoPase.strokeRect(24, 24, ancho - 48, lienzoPase.height - 48);

    contextoPase.textAlign = "center";
    contextoPase.fillStyle = "#6b1832";
    contextoPase.font = "600 34px Georgia, serif";
    contextoPase.fillText("MIS XV AÑOS", centro, 105);
    contextoPase.font = "600 58px Georgia, serif";
    contextoPase.fillText("Ingrid Abril", centro, 185);
    contextoPase.font = "400 30px Arial, sans-serif";
    contextoPase.fillStyle = "#796870";
    contextoPase.fillText("Pase de invitación", centro, 250);

    contextoPase.font = "600 36px Arial, sans-serif";
    contextoPase.fillStyle = "#421322";
    dibujarTextoEnvuelto(contextoPase, `Para: ${nombre}`, centro, 330, 820, 48, 2);

    contextoPase.fillStyle = "#6b1832";
    contextoPase.font = "700 50px Arial, sans-serif";
    contextoPase.fillText(`VÁLIDO POR ${cupo} INVITADOS`, centro, 475);

    const lienzoQr = crearLienzoQr(enlace);
    const maximoQr = 740;
    const ladoQr = Math.min(maximoQr, lienzoQr.width);
    contextoPase.fillStyle = "#ffffff";
    contextoPase.fillRect(centro - ladoQr / 2 - 20, 520, ladoQr + 40, ladoQr + 40);
    contextoPase.drawImage(lienzoQr, centro - ladoQr / 2, 540, ladoQr, ladoQr);

    contextoPase.fillStyle = "#421322";
    contextoPase.font = "500 28px Arial, sans-serif";
    contextoPase.fillText("Escanea para abrir la invitación", centro, 1330);
    contextoPase.fillStyle = "#796870";
    contextoPase.font = "400 17px Arial, sans-serif";
    contextoPase.textAlign = "left";
    dibujarTextoEnvuelto(contextoPase, enlace, 90, 1365, 820, 22, 2);
}

formPase.addEventListener("submit", (evento) => {
    evento.preventDefault();
    mensajePaseEl.textContent = "";
    resultadoPaseEl.hidden = true;

    const nombre = nombreInvitadoEl.value.trim();
    const cupo = Number(cupoEl.value);
    let urlInvitacion;

    try {
        urlInvitacion = new URL(enlaceInvitacionEl.value.trim());
    } catch {
        mensajePaseEl.textContent = "Escribe el enlace completo y publicado de la invitación.";
        return;
    }

    if (nombre.length < 2) {
        mensajePaseEl.textContent = "Escribe el nombre del invitado.";
        return;
    }
    if (!["http:", "https:"].includes(urlInvitacion.protocol)) {
        mensajePaseEl.textContent = "El enlace debe comenzar con http:// o https://; un enlace file:// solo funciona en tu computadora.";
        return;
    }
    if (!Number.isInteger(cupo) || cupo < 2 || cupo > 10) {
        mensajePaseEl.textContent = "El cupo debe ser de 2 a 10 invitados.";
        return;
    }

    urlInvitacion.searchParams.set("cupo", String(cupo));
    urlInvitacion.hash = "confirmacion";
    enlaceGenerado = urlInvitacion.toString();

    try {
        crearImagenPase(nombre, cupo, enlaceGenerado);
        document.getElementById("vista-pase").src = lienzoPase.toDataURL("image/png");
        document.getElementById("descargar-pase").href = lienzoPase.toDataURL("image/png");
        document.getElementById("descargar-pase").download = `pase-${nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
        resultadoPaseEl.hidden = false;
        mensajePaseEl.textContent = "Pase listo. La imagen se generó en este dispositivo.";
    } catch (error) {
        mensajePaseEl.textContent = `No se pudo crear el QR: ${error.message}`;
    }
});

document.getElementById("copiar-enlace").addEventListener("click", async () => {
    if (!enlaceGenerado) {
        mensajePaseEl.textContent = "Primero genera un pase.";
        return;
    }

    try {
        await navigator.clipboard.writeText(enlaceGenerado);
        mensajePaseEl.textContent = "Enlace copiado. Descarga y adjunta también la imagen del pase.";
    } catch {
        mensajePaseEl.textContent = `Copia este enlace para enviarlo junto con la imagen: ${enlaceGenerado}`;
    }
});
