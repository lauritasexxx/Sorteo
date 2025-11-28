// ===============================================
// ** CONFIGURACIÓN DE LA VERSIÓN **
// ¡CAMBIA ESTE NÚMERO PARA RESETEAR EL CONCURSO!
// ===============================================
const APP_VERSION = 2; 

const CANVAS_SIZE = 400; 
const STORAGE_KEY_WINNER = 'ruleta_ganador_permanente'; 
const STORAGE_KEY_VERSION = 'ruleta_version_guardada';

// Configuración de WhatsApp
const WHATSAPP_NUMBER = "584249556777"; // Número sin el +
const WHATSAPP_MESSAGE = "Hola, Laura. Deseo comprar un nuevo boleto.";
// URL para abrir WhatsApp con el mensaje predefinido
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;


const canvas = document.getElementById('ruletaCanvas');
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;
const ctx = canvas.getContext('2d');

const girarBoton = document.getElementById('girarBoton');
const resultadoTexto = document.getElementById('resultado');
const comprarBoleto = document.getElementById('comprarBoleto'); 

// 1. Configuración de la Ruleta
const premios = [
    '5 m videollamada', '3 m videollamada', '2 m videollamada', 'Sorpresa', 'Promo 1', 
    'Promo 2', 'Sorpresa', 'VIP 1 semana', 'VIP 2 semanas', '10 Fotos', 
    '5 Fotos', 'zing', '1 video', '3 videos cortos', 'Sorpresa'
];
const numSectores = premios.length; 
const anguloSector = (2 * Math.PI) / numSectores; 
const radio = CANVAS_SIZE / 2;
const centroX = CANVAS_SIZE / 2;
const centroY = CANVAS_SIZE / 2;

const colores = [
    '#3498db', '#c1428b', '#e74c3c', '#2ecc71', '#f39c12', 
    '#9b59b6', '#1abc9c', '#d35400', '#bdc3c7', '#2980b9',
    '#c0392b', '#27ae60', '#f1c40f', '#8e44ad', '#7f8c8d'
];

let rotacionActual = 0; 
const anguloObjetivo = (3 * Math.PI) / 2; 

// 2. Función para Dibujar la Ruleta (Con fuente Poppins)
function dibujarRuleta() {
    for (let i = 0; i < numSectores; i++) {
        const anguloInicio = i * anguloSector;
        const anguloFin = (i + 1) * anguloSector;

        ctx.beginPath();
        ctx.arc(centroX, centroY, radio, anguloInicio, anguloFin);
        ctx.lineTo(centroX, centroY);
        ctx.fillStyle = colores[i % colores.length];
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.translate(centroX, centroY);
        const anguloCentro = anguloInicio + (anguloSector / 2);
        ctx.rotate(anguloCentro); 
        
        ctx.fillStyle = (i % 2 === 0) ? '#333' : '#FFF'; 
        // Aplicar la fuente Poppins al canvas
        ctx.font = 'bold 14px Poppins'; 
        ctx.textAlign = 'center';
        
        const radioTexto = radio * 0.6; 
        ctx.fillText(premios[i], radioTexto, 0); 
        ctx.restore();
    }
}

// 3. Función de Giro
function girarRuleta() {
    if (localStorage.getItem(STORAGE_KEY_WINNER)) {
        return; 
    }
    
    girarBoton.disabled = true;
    comprarBoleto.classList.add('hidden'); // Ocultar compra durante el giro
    resultadoTexto.textContent = '¡Girando... Mucha Suerte!';

    const indiceGanador = Math.floor(Math.random() * numSectores);
    const anguloCentroSector = (indiceGanador * anguloSector) + (anguloSector / 2);
    
    const vueltas = 10 * 2 * Math.PI;
    const rotacionActualMod = rotacionActual % (2 * Math.PI);
    const rotacionNecesariaParaAlinear = (2 * Math.PI - anguloCentroSector + anguloObjetivo) % (2 * Math.PI);
    const rotacionAdicional = (2 * Math.PI + rotacionNecesariaParaAlinear - rotacionActualMod) % (2 * Math.PI);
    const variacionAleatoria = (Math.random() * anguloSector * 0.8) - (anguloSector * 0.4);
    const rotacionTotal = vueltas + rotacionAdicional + variacionAleatoria;

    rotacionActual += rotacionTotal;
    canvas.style.transform = `rotate(${rotacionActual}rad)`;
    
    // GUARDAR EN LOCALSTORAGE después de girar
    setTimeout(() => {
        const ganador = premios[indiceGanador];
        resultadoTexto.textContent = `¡🎉 Ganaste: ${ganador} 🎉!`;
        
        // Guardar Versión y Ganador
        localStorage.setItem(STORAGE_KEY_VERSION, APP_VERSION.toString()); 
        localStorage.setItem(STORAGE_KEY_WINNER, ganador);
        
        // Bloqueo y habilitar compra
        girarBoton.disabled = true;
        girarBoton.textContent = 'YA HAS GIRADO';
        
        comprarBoleto.classList.remove('hidden'); // Mostrar el botón de compra
        
    }, 5000); 
}

// 4. Inicialización y Persistencia (Lógica de versión)
function inicializar() {
    dibujarRuleta();
    girarBoton.addEventListener('click', girarRuleta);
    
    comprarBoleto.href = WHATSAPP_URL; 

    // Leer la versión guardada como número entero
    const versionGuardada = parseInt(localStorage.getItem(STORAGE_KEY_VERSION));
    const resultadoGuardado = localStorage.getItem(STORAGE_KEY_WINNER);
    
    // LÓGICA DE RESETEO
    if (resultadoGuardado && versionGuardada < APP_VERSION) {
        
        // ¡Forzar reseteo!
        localStorage.removeItem(STORAGE_KEY_WINNER);
        localStorage.removeItem(STORAGE_KEY_VERSION);
        
        // Mostrar mensaje de nueva promoción y salir
        resultadoTexto.textContent = `🎉 ¡Nueva Ruleta! (Versión ${APP_VERSION}) ¡Gira para ganar!`;
        return; 
    }
    
    // LÓGICA DE BLOQUEO
    if (resultadoGuardado) {
        // Bloqueo permanente del botón
        girarBoton.disabled = true;
        girarBoton.textContent = 'YA HAS GIRADO';
        
        // Mostrar el premio y el botón de compra
        resultadoTexto.textContent = `🎉 Resultado Guardado: ${resultadoGuardado} 🎉`;
        comprarBoleto.classList.remove('hidden'); 
    } else {
        // Si no ha girado, asegurarse de que el botón de compra esté oculto
        comprarBoleto.classList.add('hidden');
    }
}

inicializar();
