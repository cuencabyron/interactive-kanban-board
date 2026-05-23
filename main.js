let contador = 1;

let draggedTicket = null;

window.addEventListener("DOMContentLoaded", () => {
  cargarDesdeLocalStorage();
  actualizarBotonBorrar();
});

function crearTicket() 
{
  const titulo = document.getElementById("titulo").value;
  const prioridad = document.getElementById("prioridad").value;

  if (!titulo.trim()) 
  {
    mostrarAdvertencia("Ingresa un título para el ticket");
    return;
  }

  const ticket = document.createElement("div");
  ticket.classList.add("ticket");
  ticket.setAttribute("draggable", "true");
  ticket.id = "ticket" + contador++;

  let prioridadClase = "";
  if (prioridad === "High") prioridadClase = "priority-alta";
  if (prioridad === "Medium") prioridadClase = "priority-media";
  if (prioridad === "Low") prioridadClase = "priority-baja";

  ticket.innerHTML = 
  `
    <p><strong>#${contador - 1}</strong> – ${titulo}</p>
    <p class="priority ${prioridadClase}">Priority: ${prioridad}</p>
    <button class="delete-btn" onclick="eliminarTicket('${ticket.id}')">×</button>
  `;

  ticket.addEventListener("dragstart", dragStart);
  ticket.addEventListener("dragend", dragEnd);

  document.getElementById("todo").appendChild(ticket);

  document.getElementById("titulo").value = "";

  actualizarContadores();
  guardarEnLocalStorage();
  actualizarBotonBorrar();
}

function eliminarTicket(id) 
{
  const ticket = document.getElementById(id);
  if (ticket) ticket.remove();

  actualizarContadores();
  guardarEnLocalStorage();
  actualizarBotonBorrar();
}

function dragStart() 
{
  draggedTicket = this;

  setTimeout(() => this.style.display = "none", 0);
}

function dragEnd() 
{
  draggedTicket.style.display = "block";
  draggedTicket = null;

  document.querySelectorAll(".column")
    .forEach(col => col.classList.remove("highlight"));

  actualizarContadores();
  guardarEnLocalStorage();
}

function dragOver(e) {
  e.preventDefault(); 
}

function dragEnter() {
  this.classList.add("highlight");
}

function dragLeave() {
  this.classList.remove("highlight");
}

function drop() 
{
  const sourceColumn = draggedTicket.parentElement.id;
  const targetColumn = this.id;

  if (sourceColumn === "todo" && targetColumn === "done") 
  {
    mostrarAdvertencia(
      "No puedes mover directamente de 'To Do' a 'Done'. Pásalo primero por 'In Progress'."
    );
    this.classList.remove("highlight");
    return;
  }

  if (sourceColumn === "done" && targetColumn === "todo") 
  {
    mostrarAdvertencia("No puedes regresar un ticket de 'Done' a 'To Do'.");
    this.classList.remove("highlight");
    return;
  }

  if (targetColumn === "inprogress") 
  {
    const inProgressCount = this.querySelectorAll(".ticket").length;
    if (inProgressCount >= 5) {
      mostrarMensajeLimite();
      this.classList.remove("highlight");
      return;
    }
  }

  if (sourceColumn === "done" && targetColumn === "inprogress") 
  {
    mostrarAdvertencia(
      "Un ticket finalizado no puede volver a 'In Progress'. Crea un nuevo ticket si es necesario."
    );
    this.classList.remove("highlight");
    return;
  }

  this.appendChild(draggedTicket);
  this.classList.remove("highlight");

  actualizarContadores();
  guardarEnLocalStorage();
}

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

function actualizarContadores() 
{
  const columnas = ["todo", "inprogress", "done"];

  columnas.forEach(col => {
    const columna = document.getElementById(col);
    const cantidad = columna.querySelectorAll(".ticket").length;
    const titulo = columna.querySelector("h2");

    const baseTexto = titulo.textContent.split("(")[0].trim();
    titulo.textContent = `${baseTexto} (${cantidad})`;
  });
}

function actualizarBotonBorrar() 
{
  const tickets = document.querySelectorAll(".ticket");
  const boton = document.getElementById("clearBoardBtn");

  if (!boton) return;

  if (tickets.length > 0) {
    boton.style.opacity = "1";
    boton.style.pointerEvents = "auto";
  } else {
    boton.style.opacity = "0";
    boton.style.pointerEvents = "none";
  }
}

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

  if (!advertencia) {
    advertencia = document.createElement("div");
    advertencia.id = "customWarning";
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
      .textContent.replace("Priority: ", "")
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
    if (item.prioridad === "High") prioridadClase = "priority-alta";
    if (item.prioridad === "Medium") prioridadClase = "priority-media";
    if (item.prioridad === "Low") prioridadClase = "priority-baja";

    ticket.innerHTML = `
      <p><strong>#${item.id.replace("ticket", "")}</strong> – ${item.titulo}</p>
      <p class="priority ${prioridadClase}">Priority: ${item.prioridad}</p>
      <button class="delete-btn" onclick="eliminarTicket('${item.id}')">×</button>
    `;

    ticket.addEventListener("dragstart", dragStart);
    ticket.addEventListener("dragend", dragEnd);

    const columna = document.getElementById(item.columna);
    if (columna) columna.appendChild(ticket);
  });

  actualizarContadores();
  actualizarBotonBorrar();
}

const columns = document.querySelectorAll(".column");

columns.forEach(col => {
  col.addEventListener("dragover", dragOver);
  col.addEventListener("dragenter", dragEnter);
  col.addEventListener("dragleave", dragLeave);
  col.addEventListener("drop", drop);
});


function borrarTodo() 
{
  const totalTickets = document.querySelectorAll(".ticket").length;

  if (totalTickets === 0) 
  {
    mostrarAdvertencia("No hay tickets en el tablero. Crea uno primero.");
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
      mostrarAdvertencia("Tablero limpiado con éxito");
      actualizarBotonBorrar();
    }
  );
}


function mostrarConfirmacionPersonalizada(mensaje, onConfirm) 
{
  const existente = document.getElementById("customConfirm");
  if (existente) existente.remove();

  const contenedor = document.createElement("div");
  contenedor.id = "customConfirm";


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


const darkModeToggle = document.getElementById("darkModeToggle");

if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark");
  darkModeToggle.checked = true;
}

darkModeToggle.addEventListener("change", () => {
  const isDark = darkModeToggle.checked;

  document.body.classList.toggle("dark", isDark);

  localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
});