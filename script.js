// =========================================================================
// 0. CARGAR PRODUCTOS DESDE LA BASE DE DATOS
// =========================================================================
const API_URL = "https://admin-backend.joelmisaelleija19.workers.dev/productos";

document.addEventListener("DOMContentLoaded", cargarProductos);

async function cargarProductos() {
    try {
        const respuesta = await fetch(API_URL);
        const productos = await respuesta.json();

        const gridMobiliario = document.getElementById("grid-mobiliario");
        const gridPaquetes = document.getElementById("grid-paquetes");

        if(gridMobiliario) gridMobiliario.innerHTML = "";
        if(gridPaquetes) gridPaquetes.innerHTML = "";

        productos.forEach(prod => {
            const cardHTML = `
                <div class="product-card">
                    <div class="product-img" style="height: auto; overflow: visible;">
                        <img src="${prod.imagen_url}" alt="${prod.nombre}" style="object-fit: contain; width: 100%; height: auto; max-height: 600px; background: transparent; display: block;">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${prod.nombre}</h3>
                        <p class="product-desc">${prod.descripcion.replace(/\\n|\n/g, '<br>')}</p>
                        <div class="product-footer">
                            <div class="product-price">$${prod.precio} MX</div>
                        </div>
                        <button class="btn-select" data-name="${prod.nombre}" data-img="${prod.imagen_url}" onclick="toggleSelect(this)">
                             <i class="fa-regular fa-square"></i> Seleccionar
                        </button>
                    </div>
                </div>
            `;

            // Lógica para dividir entre Paquetes y Mobiliario
            if (prod.categoria === "Paquetes") {
                if(gridPaquetes) gridPaquetes.innerHTML += cardHTML;
            } else {
                if(gridMobiliario) gridMobiliario.innerHTML += cardHTML;
            }
        });
    } catch (error) {
        console.error("Error al cargar los productos:", error);
    }
}

// =========================================================================
// 1. DESPLAZAMIENTO SUAVE PARA LOS ENLACES DEL MENÚ
// =========================================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');

        if (targetId !== "#") {
            e.preventDefault();
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// =========================================================================
// 3. SISTEMA DE CARRITO FLOTANTE (ESTILO SHEIN) Y MODAL WHATSAPP
// =========================================================================
let productosSeleccionados = [];
let totalPrecio = 0;

function toggleSelect(button) {
    const nombre = button.getAttribute('data-name');
    const imgSrc = button.getAttribute('data-img');
    const card = button.closest('.product-card');
    
    // Extraer precio
    const priceText = card.querySelector('.product-price').innerText.replace(/[^0-9]/g, '');
    const price = parseInt(priceText) || 0;

    const index = productosSeleccionados.findIndex(p => p.nombre === nombre);

    if (index === -1) {
        productosSeleccionados.push({ nombre, imgSrc, price });
        button.innerHTML = '<i class="fa-solid fa-square-check"></i> Seleccionado';
        button.classList.add('selected');
        card.style.border = '2px solid var(--logo)';
    } else {
        productosSeleccionados.splice(index, 1);
        button.innerHTML = '<i class="fa-regular fa-square"></i> Seleccionar';
        button.classList.remove('selected');
        card.style.border = 'none';
    }

    actualizarCarritoUI();
}

function actualizarCarritoUI() {
    const floatingBtn = document.getElementById('cart-floating-btn');
    const badge = document.getElementById('cart-badge');

    if (productosSeleccionados.length > 0) {
        floatingBtn.style.display = 'flex';
        badge.innerText = productosSeleccionados.length;
    } else {
        floatingBtn.style.display = 'none';
        cerrarModalConfirmacion(); // Cierra el modal si se queda vacío
    }
}

function abrirModalConfirmacion() {
    const previewDiv = document.getElementById('modal-items-preview');
    previewDiv.innerHTML = '';
    totalPrecio = 0;

    productosSeleccionados.forEach(prod => {
        totalPrecio += prod.price;
        // Agregamos un botón de basura para eliminar el producto directamente desde aquí
        previewDiv.innerHTML += `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${prod.imgSrc}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;">
                    <span><b>${prod.nombre}</b> ($${prod.price} MX)</span>
                </div>
                <button onclick="removerDelCarrito('${prod.nombre}')" style="background: none; border: none; color: #ff4d4d; font-size: 18px; cursor: pointer;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    previewDiv.innerHTML += `<div style="text-align: right; font-weight: bold; font-size: 1.1rem; color: var(--logo); margin-top: 10px;">Total Aproximado: $${totalPrecio} MX</div>`;

    document.getElementById('confirm-modal').style.display = 'flex';
}

function removerDelCarrito(nombre) {
    // Buscar el botón original en la página para quitarle el estilo de seleccionado
    const botonesSeleccionar = document.querySelectorAll('.btn-select');
    botonesSeleccionar.forEach(btn => {
        if (btn.getAttribute('data-name') === nombre) {
            btn.innerHTML = '<i class="fa-regular fa-square"></i> Seleccionar';
            btn.classList.remove('selected');
            btn.closest('.product-card').style.border = 'none';
        }
    });

    // Quitar del array
    productosSeleccionados = productosSeleccionados.filter(p => p.nombre !== nombre);
    
    actualizarCarritoUI();
    
    // Volver a renderizar el modal si aún quedan productos, o cerrarlo si se vació
    if (productosSeleccionados.length > 0) {
        abrirModalConfirmacion();
    }
}

function cerrarModalConfirmacion() {
    document.getElementById('confirm-modal').style.display = 'none';
}

// Validación en tiempo real del calendario nativo y bloqueo de días pasados
document.addEventListener('DOMContentLoaded', () => {
    const inputFecha = document.getElementById('evento-fecha');
    if (inputFecha) {
        // Bloquear fechas del pasado estableciendo el atributo 'min' al día de hoy
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        inputFecha.min = `${yyyy}-${mm}-${dd}`;

        // Validación de fines de semana
        inputFecha.addEventListener('change', function() {
            if (!this.value) return;
            const fechaObj = new Date(this.value + "T12:00:00");
            const diaSemana = fechaObj.getDay();
            if (diaSemana >= 1 && diaSemana <= 4) {
                alert("⚠️ Lo sentimos, solo trabajamos Viernes, Sábados y Domingos. Por favor elige otro día.");
                this.value = ""; // Resetea la fecha para que elija otra
            }
        });
    }
});

function confirmarYEnviar() {
    const fechaInput = document.getElementById('evento-fecha').value;
    if (!fechaInput) {
        alert("⚠️ Por favor selecciona la fecha de tu evento.");
        return;
    }
    
    const fechaObj = new Date(fechaInput + "T12:00:00");
    const diaSemana = fechaObj.getDay(); // 0=Dom, 1=Lun, ..., 5=Vie, 6=Sab
    
    if (diaSemana >= 1 && diaSemana <= 4) {
        alert("⚠️ Solo trabajamos Viernes, Sábados y Domingos. Por favor elige otro día.");
        return;
    }
    
    // Formatear la fecha para WhatsApp
    const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = fechaObj.toLocaleDateString('es-MX', opcionesFecha);

    const telefono = "528448804726";
    let texto = "¡Hola! Buenas tardes.\n\nMe gustaría solicitar la cotización y disponibilidad de los siguientes servicios para un evento:\n\n";

    productosSeleccionados.forEach((prod, i) => {
        texto += `${i + 1}. ${prod.nombre} — $${prod.price.toLocaleString('en-US')} MXN\n`;
    });
    
    texto += `\nTotal: $${totalPrecio.toLocaleString('en-US')} MXN\n`;
    texto += `\nFecha del evento: ${fechaFormateada}.\n`;
    let serviciosText = "estos servicios";
    if (productosSeleccionados.length === 1) {
        serviciosText = "este servicio";
    } else if (productosSeleccionados.length === 2) {
        serviciosText = "ambos servicios";
    }

    texto += `\nMe gustaría reservar ${serviciosText} para esa fecha. ¿Podrían confirmarme si tienen disponibilidad y si existe algún inconveniente con realizar la reservación?\n\nQuedo atento. ¡Muchas gracias!`;

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
    cerrarModalConfirmacion();
}

// =========================================================================
// 4. LÓGICA DEL CALENDARIO DE RESERVAS
// =========================================================================
let estadosFechas = {}; // {'2026-09-18': 'pagado'}

async function cargarEstadosCalendario() {
    try {
        const respuesta = await fetch("https://admin-backend.joelmisaelleija19.workers.dev/fechas");
        const fechasDB = await respuesta.json();
        estadosFechas = {};
        fechasDB.forEach(f => {
            estadosFechas[f.fecha] = f.estado;
        });
        generarCalendarios2026();
    } catch(e) {
        console.error("Error cargando fechas:", e);
    }
}

function generarCalendarios2026() {
    const container = document.getElementById("calendar-container");
    if(!container) return;
    container.innerHTML = "";
    
    // Meses de Sep(8) a Dic(11) 2026
    const meses = [
        { nombre: "Septiembre 2026", mes: 8 },
        { nombre: "Octubre 2026", mes: 9 },
        { nombre: "Noviembre 2026", mes: 10 },
        { nombre: "Diciembre 2026", mes: 11 }
    ];
    
    meses.forEach(m => {
        container.innerHTML += crearHTMLMes(2026, m.mes, m.nombre);
    });
}

function crearHTMLMes(anio, mes, nombreMes) {
    let html = `<div class="month-container"><div class="month-name">${nombreMes}</div>`;
    html += `<div class="calendar-grid">`;
    html += `<div class="calendar-day-header">Vie</div>`;
    html += `<div class="calendar-day-header">Sáb</div>`;
    html += `<div class="calendar-day-header">Dom</div>`;
    
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();
    let primerDiaSemana = new Date(anio, mes, 1).getDay(); // 0=Dom, 5=Vie, 6=Sab
    
    // Encontrar el primer viernes, sabado o domingo
    for(let dia = 1; dia <= diasEnMes; dia++) {
        let fecha = new Date(anio, mes, dia);
        let ds = fecha.getDay();
        if (ds === 5 || ds === 6 || ds === 0) {
            // Es fin de semana
            // Rellenar espacios vacíos si el mes empieza en Sábado o Domingo
            if (dia === 1) {
                if (ds === 6) html += `<div></div>`; // Sabado, salta viernes
                if (ds === 0) html += `<div></div><div></div>`; // Domingo, salta vie y sab
            }
            
            // Formatear YYYY-MM-DD
            let mesStr = (mes+1).toString().padStart(2, '0');
            let diaStr = dia.toString().padStart(2, '0');
            let fechaStr = `${anio}-${mesStr}-${diaStr}`;
            
            let estado = estadosFechas[fechaStr] || 'disponible';
            let claseEstado = `day-${estado}`;
            
            html += `<div class="calendar-day ${claseEstado}" data-fecha="${fechaStr}">${dia}</div>`;
        }
    }
    
    html += `</div></div>`;
    return html;
}

function abrirCalendario() {
    cargarEstadosCalendario(); // Recargar datos frescos
    document.getElementById("calendar-modal").style.display = "flex";
}

function cerrarCalendario() {
    document.getElementById("calendar-modal").style.display = "none";
}