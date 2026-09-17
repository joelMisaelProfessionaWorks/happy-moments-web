// IMPORTANTE: Reemplaza esto con la URL que te dio Cloudflare al hacer 'wrangler deploy'
let API_URL = "https://admin-backend.joelmisaelleija19.workers.dev/productos";
const IMGBB_API_KEY = "5576f77a29f1d71f86ac8a56cee7a560"; 

// Pedimos y guardamos temporalmente la contraseña al abrir la página
let password = sessionStorage.getItem("admin_password");
if (!password) {
    password = prompt("🔒 Por favor, ingresa la contraseña de administrador:");
    if(password) {
        sessionStorage.setItem("admin_password", password);
    } else {
        alert("⚠️ Sin contraseña solo podrás ver los productos, pero no modificarlos.");
    }
}

document.addEventListener("DOMContentLoaded", cargarProductos);

// Referencias a elementos
const modal = document.getElementById("productoModal");
const form = document.getElementById("productoForm");
const tablaBody = document.getElementById("tabla-productos");
const imgInput = document.getElementById("prod-img-file");
const imgStatus = document.getElementById("img-status");

// Cargar productos de la base de datos
async function cargarProductos() {
    try {
        const respuesta = await fetch(API_URL);
        if(!respuesta.ok) throw new Error("No se pudo conectar al API");
        const productos = await respuesta.json();
        
        tablaBody.innerHTML = "";
        
        productos.forEach(prod => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><b>${prod.id}</b></td>
                <td><img src="${prod.imagen_url}" alt="img" style="width:50px; height:50px; object-fit:cover; border-radius:5px;"></td>
                <td>${prod.nombre}</td>
                <td>${prod.categoria || 'Mobiliario'}</td>
                <td>$${prod.precio}</td>
                <td>
                    <button class="action-btn btn-edit" onclick="editarProducto(${prod.id}, '${prod.nombre}', '${(prod.descripcion || '').replace(/\\n|\n/g, '\\n')}', '${prod.precio}', '${prod.imagen_url}', '${prod.categoria || 'Mobiliario'}')">Editar</button>
                    <button class="action-btn btn-delete" onclick="eliminarProducto(${prod.id})">Eliminar</button>
                </td>
            `;
            tablaBody.appendChild(tr);
        });
    } catch (error) {
        console.warn("Usando backend de prueba o no disponible: " + error.message);
        tablaBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">El backend no está conectado aún.</td></tr>`;
    }
}

// Función para subir imagen a ImgBB
async function subirImagenAImgBB(archivo) {
    const formData = new FormData();
    formData.append("image", archivo);

    imgStatus.innerText = "⏳ Subiendo imagen a la nube, por favor espera...";

    const respuesta = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData
    });

    const datos = await respuesta.json();
    
    if(datos.success) {
        imgStatus.innerText = "✅ Imagen subida con éxito.";
        return datos.data.url; // Retorna el enlace directo a la imagen
    } else {
        throw new Error("No se pudo subir la imagen a ImgBB.");
    }
}

// Abrir el modal para agregar
function abrirModal() {
    form.reset();
    document.getElementById("prod-id").value = "";
    document.getElementById("prod-img-url").value = "";
    imgStatus.innerText = "";
    document.getElementById("modal-title").innerText = "Agregar Producto";
    modal.style.display = "flex";
}

// Cerrar el modal
function cerrarModal() {
    modal.style.display = "none";
}

// Abrir el modal para editar (llena los campos)
function editarProducto(id, nombre, descripcion, precio, imagen_url, categoria) {
    document.getElementById("prod-id").value = id;
    document.getElementById("prod-nombre").value = nombre;
    document.getElementById("prod-desc").value = descripcion;
    document.getElementById("prod-precio").value = precio;
    document.getElementById("prod-categoria").value = categoria;
    document.getElementById("prod-img-url").value = imagen_url;
    
    // Limpiamos el input file por si quieren subir una nueva
    imgInput.value = ""; 
    imgStatus.innerText = "Imagen actual: " + imagen_url.substring(0, 30) + "...";
    
    document.getElementById("modal-title").innerText = "Editar Producto";
    modal.style.display = "flex";
}

// Guardar producto (Agregar o Editar)
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const id = document.getElementById("prod-id").value;
    const metodo = id ? "PUT" : "POST";
    
    let imagenFinalUrl = document.getElementById("prod-img-url").value;

    // Si el usuario seleccionó una imagen nueva, la subimos primero
    if (imgInput.files.length > 0) {
        try {
            imagenFinalUrl = await subirImagenAImgBB(imgInput.files[0]);
        } catch (error) {
            alert(error.message);
            return; // Detener guardado si la imagen falla
        }
    } else if (!imagenFinalUrl) {
        alert("Por favor selecciona una imagen.");
        return;
    }
    
    const producto = {
        id: id ? parseInt(id) : null,
        nombre: document.getElementById("prod-nombre").value,
        descripcion: document.getElementById("prod-desc").value,
        precio: document.getElementById("prod-precio").value,
        categoria: document.getElementById("prod-categoria").value,
        imagen_url: imagenFinalUrl
    };

    try {
        const btnSave = document.querySelector(".btn-save");
        btnSave.disabled = true;
        btnSave.innerText = "Guardando...";

        const respuesta = await fetch(API_URL, {
            method: metodo,
            headers: { 
                "Content-Type": "application/json",
                "x-admin-password": password || ""
            },
            body: JSON.stringify(producto)
        });

        if(!respuesta.ok) {
            const err = await respuesta.json();
            throw new Error(err.error || "Fallo al conectar con el servidor.");
        }
        
        cerrarModal();
        cargarProductos(); // Recargar la tabla
    } catch (error) {
        alert("Error al guardar: " + error.message);
    } finally {
        const btnSave = document.querySelector(".btn-save");
        btnSave.disabled = false;
        btnSave.innerText = "Guardar";
    }
});

// Eliminar producto
async function eliminarProducto(id) {
    if(confirm("¿Estás seguro de que deseas eliminar este producto? El ID #" + id + " quedará disponible para el siguiente.")) {
        try {
            const respuesta = await fetch(API_URL, {
                method: "DELETE",
                headers: { 
                    "Content-Type": "application/json",
                    "x-admin-password": password || ""
                },
                body: JSON.stringify({ id: id })
            });

            if(!respuesta.ok) {
                const err = await respuesta.json();
                throw new Error(err.error || "No se pudo eliminar.");
            }
            cargarProductos();
        } catch (error) {
            alert("Error al eliminar: " + error.message);
        }
    }
}

// =========================================================================
// PESTAÑAS
// =========================================================================
function mostrarPestaña(tab) {
    if (tab === 'productos') {
        document.getElementById('tab-productos').style.display = 'block';
        document.getElementById('tab-calendario').style.display = 'none';
    } else {
        document.getElementById('tab-productos').style.display = 'none';
        document.getElementById('tab-calendario').style.display = 'block';
        cargarEstadosCalendarioAdmin();
    }
}

// =========================================================================
// LÓGICA DEL CALENDARIO DE RESERVAS (ADMIN)
// =========================================================================
let estadosFechasAdmin = {}; // {'2026-09-18': 'pagado'}

async function cargarEstadosCalendarioAdmin() {
    try {
        const respuesta = await fetch(API_URL.replace("/productos", "/fechas"));
        const fechasDB = await respuesta.json();
        estadosFechasAdmin = {};
        fechasDB.forEach(f => {
            estadosFechasAdmin[f.fecha] = f.estado;
        });
        generarCalendariosAdmin2026();
    } catch(e) {
        console.error("Error cargando fechas:", e);
    }
}

function generarCalendariosAdmin2026() {
    const container = document.getElementById("calendar-container");
    if(!container) return;
    container.innerHTML = "";
    
    const meses = [
        { nombre: "Septiembre 2026", mes: 8 },
        { nombre: "Octubre 2026", mes: 9 },
        { nombre: "Noviembre 2026", mes: 10 },
        { nombre: "Diciembre 2026", mes: 11 }
    ];
    
    meses.forEach(m => {
        container.innerHTML += crearHTMLMesAdmin(2026, m.mes, m.nombre);
    });
}

function crearHTMLMesAdmin(anio, mes, nombreMes) {
    let html = `<div class="month-container"><div class="month-name">${nombreMes}</div>`;
    html += `<div class="calendar-grid">`;
    html += `<div class="calendar-day-header">Vie</div>`;
    html += `<div class="calendar-day-header">Sáb</div>`;
    html += `<div class="calendar-day-header">Dom</div>`;
    
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();
    let primerDiaSemana = new Date(anio, mes, 1).getDay(); // 0=Dom, 5=Vie, 6=Sab
    
    for(let dia = 1; dia <= diasEnMes; dia++) {
        let fecha = new Date(anio, mes, dia);
        let ds = fecha.getDay();
        if (ds === 5 || ds === 6 || ds === 0) {
            if (dia === 1) {
                if (ds === 6) html += `<div></div>`;
                if (ds === 0) html += `<div></div><div></div>`;
            }
            
            let mesStr = (mes+1).toString().padStart(2, '0');
            let diaStr = dia.toString().padStart(2, '0');
            let fechaStr = `${anio}-${mesStr}-${diaStr}`;
            
            let estado = estadosFechasAdmin[fechaStr] || 'disponible';
            let claseEstado = `day-${estado}`;
            
            html += `<div class="calendar-day ${claseEstado}" style="cursor:pointer;" onclick="cambiarEstadoFecha('${fechaStr}', this)">${dia}</div>`;
        }
    }
    
    html += `</div></div>`;
    return html;
}

async function cambiarEstadoFecha(fechaStr, el) {
    if(!password) {
        alert("Sin contraseña no puedes modificar el calendario.");
        return;
    }
    
    // Ciclar: disponible -> proceso -> pagado -> disponible
    let estadoActual = estadosFechasAdmin[fechaStr] || 'disponible';
    let nuevoEstado = 'disponible';
    
    if (estadoActual === 'disponible') nuevoEstado = 'proceso';
    else if (estadoActual === 'proceso') nuevoEstado = 'pagado';
    else if (estadoActual === 'pagado') nuevoEstado = 'disponible';
    
    // UI update temporal
    el.className = `calendar-day day-${nuevoEstado}`;
    estadosFechasAdmin[fechaStr] = nuevoEstado;
    
    try {
        const respuesta = await fetch(API_URL.replace("/productos", "/fechas"), {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "x-admin-password": password
            },
            body: JSON.stringify({ fecha: fechaStr, estado: nuevoEstado })
        });
        
        if(!respuesta.ok) {
            const err = await respuesta.json();
            throw new Error(err.error || "No se pudo actualizar");
        }
    } catch (e) {
        alert("Error: " + e.message);
        // Rollback
        estadosFechasAdmin[fechaStr] = estadoActual;
        el.className = `calendar-day day-${estadoActual}`;
    }
}
