/* 
===============================================================================
 KANBAN BOARD INTERACTIVO
-------------------------------------------------------------------------------
 Este archivo contiene toda la lógica del tablero Kanban.
 Funcionalidades principales:
 - Creación y eliminación de tickets
 - Drag & Drop entre columnas
 - Reglas de flujo (restricciones de movimiento)
 - Límite de tickets en "In Progress"
 - Filtro por prioridad
 - Contadores automáticos por columna
 - Persistencia de datos con LocalStorage
 - Modo oscuro persistente
===============================================================================
*/

/* ==========================================================================
   VARIABLES GLOBALES Y CONFIGURACIÓN INICIAL
   ========================================================================== */

// Contador incremental para asignar IDs únicos a los tickets
let contador = 1;

// Referencia temporal al ticket que está siendo arrastrado
let draggedTicket = null;

// Al cargar el DOM, se restauran los tickets guardados previamente
window.addEventListener("DOMContentLoaded", cargarDesdeLocalStorage);

/* ==========================================================================
   CREACIÓN DE TICKETS
   ========================================================================== */

function crearTicket() 
{
  // Obtiene los valores del formulario
  const titulo = document.getElementById("titulo").value;
  const prioridad = document.getElementById("prioridad").value;

  // Validación: no permitir títulos vacíos
  if (!titulo.trim()) 
  {
    mostrarAdvertencia("⚠️ Ingresa un título para el ticket");
    return;
  }

  // Crea el elemento visual del ticket
  const ticket = document.createElement("div");
  ticket.classList.add("ticket");
  ticket.setAttribute("draggable", "true");
  ticket.id = "ticket" + contador++;

  // Asigna clase CSS según la prioridad
  let prioridadClase = "";
  if (prioridad === "Alta") prioridadClase = "priority-alta";
  if (prioridad === "Media") prioridadClase = "priority-media";
  if (prioridad === "Baja") prioridadClase = "priority-baja";

  // Estructura interna del ticket
  ticket.innerHTML = 
  `
    <p><strong>#${contador - 1}</strong> – ${titulo}</p>
    <p class="priority ${prioridadClase}">Prioridad: ${prioridad}</p>
    <button class="delete-btn" onclick="eliminarTicket('${ticket.id}')">×</button>
  `;

  // Eventos necesarios para Drag & Drop
  ticket.addEventListener("dragstart", dragStart);
  ticket.addEventListener("dragend", dragEnd);

  // Inserta el ticket en la columna "To Do"
  document.getElementById("todo").appendChild(ticket);

  // Limpia el campo de texto
  document.getElementById("titulo").value = "";

  // Actualiza UI y persistencia
  actualizarContadores();
  guardarEnLocalStorage();
}

/* ==========================================================================
   ELIMINACIÓN DE TICKETS
   ========================================================================== */

function eliminarTicket(id) 
{
  const ticket = document.getElementById(id);
  if (ticket) ticket.remove();

  actualizarContadores();
  guardarEnLocalStorage();
}

/* ==========================================================================
   DRAG & DROP – EVENTOS DEL TICKET
   ========================================================================== */

// Se ejecuta cuando comienza el arrastre
function dragStart() 
{
  draggedTicket = this;

  // Se oculta temporalmente para mejorar la experiencia visual
  setTimeout(() => this.style.display = "none", 0);
}

// Se ejecuta cuando termina el arrastre
function dragEnd() 
{
  draggedTicket.style.display = "block";
  draggedTicket = null;

  // Limpia efectos visuales en columnas
  document.querySelectorAll(".column")
    .forEach(col => col.classList.remove("highlight"));

  actualizarContadores();
  guardarEnLocalStorage();
}

/* ==========================================================================
   DRAG & DROP – EVENTOS DE LAS COLUMNAS
   ========================================================================== */

// Permite que la columna acepte elementos
function dragOver(e) {
  e.preventDefault(); 
}

// Resalta la columna al entrar
function dragEnter() {
  this.classList.add("highlight");
}

// Quita el resaltado al salir
function dragLeave() {
  this.classList.remove("highlight");
}

/* ==========================================================================
   LÓGICA DE DROP Y REGLAS DEL FLUJO KANBAN
   ========================================================================== */

function drop() 
{
  // Identifica columnas de origen y destino
  const sourceColumn = draggedTicket.parentElement.id;
  const targetColumn = this.id;

  // Regla: No permitir To Do → Done directamente
  if (sourceColumn === "todo" && targetColumn === "done") 
  {
    mostrarAdvertencia(
      "⚠️ No puedes mover directamente de 'To Do' a 'Done'. Pásalo primero por 'In Progress'."
    );
    this.classList.remove("highlight");
    return;
  }

  // Regla: No permitir Done → To Do
  if (sourceColumn === "done" && targetColumn === "todo") 
  {
    mostrarAdvertencia("⚠️ No puedes regresar un ticket de 'Done' a 'To Do'.");
    this.classList.remove("highlight");
    return;
  }

  // Regla: Límite máximo de 5 tickets en In Progress
  if (targetColumn === "inprogress") 
  {
    const inProgressCount = this.querySelectorAll(".ticket").length;
    if (inProgressCount >= 5) {
      mostrarMensajeLimite();
      this.classList.remove("highlight");
      return;
    }
  }

  // Regla: No permitir regresar de Done → In Progress
  if (sourceColumn === "done" && targetColumn === "inprogress") 
  {
    mostrarAdvertencia(
      "⚠️ Un ticket finalizado no puede volver a 'In Progress'. Crea un nuevo ticket si es necesario."
    );
    this.classList.remove("highlight");
    return;
  }

  // Movimiento permitido
  this.appendChild(draggedTicket);
  this.classList.remove("highlight");

  actualizarContadores();
  guardarEnLocalStorage();
}

/* ==========================================================================
   FILTRADO DE TICKETS POR PRIORIDAD
   ========================================================================== */

function aplicarFiltro() 
{
  const filtro = document.getElementById("filtro").value;
  const tickets = document.querySelectorAll(".ticket");

  tickets.forEach(ticket => {
    const prioridadTexto = ticket.querySelector(".priority").textContent;

    if (filtro === "Todos" || prioridadTexto.includes(filtro)) {
      ticket.style.display = "block";
    } else {
      ticket.style.display = "none";
    }
  });

  actualizarContadores();
}

/* ==========================================================================
   CONTADORES DE TICKETS POR COLUMNA
   ========================================================================== */

function actualizarContadores() 
{
  const columnas = ["todo", "inprogress", "done"];

  columnas.forEach(col => {
    const columna = document.getElementById(col);
    const cantidad = columna.querySelectorAll(".ticket").length;
    const titulo = columna.querySelector("h2");

    // Mantiene el emoji y texto original del encabezado
    const baseTexto = titulo.textContent.split("(")[0].trim();
    titulo.textContent = `${baseTexto} (${cantidad})`;
  });
}

/* ==========================================================================
   MENSAJES Y ADVERTENCIAS PERSONALIZADAS
   ========================================================================== */

function mostrarMensajeLimite() 
{
  const limitMessage = document.getElementById("limitMessage");
  limitMessage.style.display = "block";
  limitMessage.style.zIndex = "10";

  setTimeout(() => {
    limitMessage.style.display = "none";
  }, 2000);
}

function mostrarAdvertencia(texto) 
{
  let advertencia = document.getElementById("customWarning");

  // Crea el elemento solo si no existe
  if (!advertencia) {
    advertencia = document.createElement("div");
    advertencia.id = "customWarning";

    // Estilos inline para mensaje flotante
    advertencia.style.position = "fixed";
    advertencia.style.top = "20px";
    advertencia.style.left = "50%";
    advertencia.style.transform = "translateX(-50%)";
    advertencia.style.background = "#f8d7da";
    advertencia.style.color = "#721c24";
    advertencia.style.padding = "10px 20px";
    advertencia.style.border = "1px solid #f5c6cb";
    advertencia.style.borderRadius = "6px";
    advertencia.style.fontWeight = "bold";
    advertencia.style.zIndex = "1000";
    advertencia.style.opacity = "0";
    advertencia.style.transition = "opacity 0.5s ease";

    document.body.appendChild(advertencia);
  }

  advertencia.textContent = texto;
  advertencia.style.display = "block";

  // Fade in
  requestAnimationFrame(() => {
    advertencia.style.opacity = "1";
  });

  // Fade out automático
  setTimeout(() => {
    advertencia.style.opacity = "0";
    setTimeout(() => {
      advertencia.style.display = "none";
    }, 500);
  }, 2500);
}

/* ==========================================================================
   LOCAL STORAGE – GUARDADO Y CARGA DE ESTADO
   ========================================================================== */

function guardarEnLocalStorage() 
{
  const data = [];

  document.querySelectorAll(".ticket").forEach(ticket => {
    const id = ticket.id;
    const titulo = ticket
      .querySelector("p strong")
      .parentNode.textContent.split("–")[1].trim();

    const prioridad = ticket
      .querySelector(".priority")
      .textContent.replace("Prioridad: ", "")
      .trim();

    const columna = ticket.parentElement.id;

    data.push({ id, titulo, prioridad, columna });
  });

  localStorage.setItem("kanbanTickets", JSON.stringify(data));
  localStorage.setItem("kanbanContador", contador);
}

function cargarDesdeLocalStorage() 
{
  const data = JSON.parse(localStorage.getItem("kanbanTickets")) || [];
  contador = parseInt(localStorage.getItem("kanbanContador")) || 1;

  data.forEach(item => {
    const ticket = document.createElement("div");
    ticket.classList.add("ticket");
    ticket.setAttribute("draggable", "true");
    ticket.id = item.id;

    let prioridadClase = "";
    if (item.prioridad === "Alta") prioridadClase = "priority-alta";
    if (item.prioridad === "Media") prioridadClase = "priority-media";
    if (item.prioridad === "Baja") prioridadClase = "priority-baja";

    ticket.innerHTML = `
      <p><strong>#${item.id.replace("ticket", "")}</strong> – ${item.titulo}</p>
      <p class="priority ${prioridadClase}">Prioridad: ${item.prioridad}</p>
      <button class="delete-btn" onclick="eliminarTicket('${item.id}')">×</button>
    `;

    ticket.addEventListener("dragstart", dragStart);
    ticket.addEventListener("dragend", dragEnd);

    const columna = document.getElementById(item.columna);
    if (columna) columna.appendChild(ticket);
  });

  actualizarContadores();
}

/* ==========================================================================
   ASIGNACIÓN DE EVENTOS A LAS COLUMNAS
   ========================================================================== */

const columns = document.querySelectorAll(".column");

columns.forEach(col => {
  col.addEventListener("dragover", dragOver);
  col.addEventListener("dragenter", dragEnter);
  col.addEventListener("dragleave", dragLeave);
  col.addEventListener("drop", drop);
});

/* ==========================================================================
   BORRADO TOTAL DEL TABLERO
   ========================================================================== */

function borrarTodo() 
{
  const totalTickets = document.querySelectorAll(".ticket").length;

  if (totalTickets === 0) 
  {
    mostrarAdvertencia("⚠️ No hay tickets en el tablero. Crea uno primero.");
    return;
  }

  mostrarConfirmacionPersonalizada(
    "¿Estás seguro de que quieres borrar todos los tickets?",
    () => {
      document.querySelectorAll(".ticket").forEach(ticket => ticket.remove());
      localStorage.removeItem("kanbanTickets");
      localStorage.removeItem("kanbanContador");
      contador = 1;
      actualizarContadores();
      mostrarAdvertencia("✅ Tablero limpiado con éxito");
    }
  );
}

/* ==========================================================================
   CONFIRMACIÓN PERSONALIZADA
   ========================================================================== */

function mostrarConfirmacionPersonalizada(mensaje, onConfirm) 
{
  const existente = document.getElementById("customConfirm");
  if (existente) existente.remove();

  const contenedor = document.createElement("div");
  contenedor.id = "customConfirm";

  // Estilos del modal
  contenedor.style.position = "fixed";
  contenedor.style.top = "50%";
  contenedor.style.left = "50%";
  contenedor.style.transform = "translate(-50%, -50%)";
  contenedor.style.background = "#ffffff";
  contenedor.style.padding = "20px";
  contenedor.style.border = "1px solid #ccc";
  contenedor.style.borderRadius = "8px";
  contenedor.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
  contenedor.style.zIndex = "2000";
  contenedor.style.maxWidth = "300px";
  contenedor.style.textAlign = "center";

  const texto = document.createElement("p");
  texto.textContent = mensaje;
  texto.style.marginBottom = "15px";
  texto.style.fontWeight = "bold";

  const btnAceptar = document.createElement("button");
  btnAceptar.textContent = "Aceptar";
  btnAceptar.style.background = "#007bff";
  btnAceptar.style.color = "#fff";
  btnAceptar.style.border = "none";
  btnAceptar.style.padding = "8px 12px";
  btnAceptar.style.marginRight = "10px";
  btnAceptar.style.borderRadius = "5px";
  btnAceptar.style.cursor = "pointer";

  const btnCancelar = document.createElement("button");
  btnCancelar.textContent = "Cancelar";
  btnCancelar.style.background = "#6c757d";
  btnCancelar.style.color = "#fff";
  btnCancelar.style.border = "none";
  btnCancelar.style.padding = "8px 12px";
  btnCancelar.style.borderRadius = "5px";
  btnCancelar.style.cursor = "pointer";

  btnAceptar.addEventListener("click", () => {
    contenedor.remove();
    if (onConfirm) onConfirm();
  });

  btnCancelar.addEventListener("click", () => contenedor.remove());

  contenedor.appendChild(texto);
  contenedor.appendChild(btnAceptar);
  contenedor.appendChild(btnCancelar);
  document.body.appendChild(contenedor);
}

/* ==========================================================================
   DARK MODE – PERSISTENTE CON LOCAL STORAGE
   ========================================================================== */

const darkModeBtn = document.getElementById("darkModeToggle");

// Aplica el modo oscuro si fue guardado previamente
if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark");
  darkModeBtn.textContent = "☀️ Modo Claro";
}

// Alterna el modo oscuro
darkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");
  darkModeBtn.textContent = isDark ? "☀️ Modo Claro" : "🌙 Modo Oscuro";

  localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
});