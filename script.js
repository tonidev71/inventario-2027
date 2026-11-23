/* ===============================
   VARIABLES Y DATOS INICIALES
================================= */

const proveedores = [
  "PROVEEDOR A",
  "PROVEEDOR B",
  "PROVEEDOR C",
  "PROVEEDOR D",
  "PROVEEDOR E"
];

let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let inventario = JSON.parse(localStorage.getItem("inventario")) || {};
let usuarioActual = null;

function crearDatoVacio() {
  return {
    producto: "",
    entradas: 0,
    salidas: 0,
    palletsEntrada: 0,
    palletsSalida: 0
  };
}

/* ===============================
   MENSAJES Y OJO DE CONTRASEÑA
================================= */

function mostrarMensaje(texto, esOk = false) {
  const msg = document.getElementById("mensajeAuth");
  if (!msg) {
    alert(texto);
    return;
  }
  msg.textContent = texto;
  msg.className = esOk ? "mensaje-auth ok" : "mensaje-auth error";
  msg.style.display = "block";
}

function ocultarMensaje() {
  const msg = document.getElementById("mensajeAuth");
  if (!msg) return;
  msg.textContent = "";
  msg.style.display = "none";
}

function activarOjo(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (!input || !btn) return;

  btn.addEventListener("click", function () {
    if (input.type === "password") {
      input.type = "text";
      btn.textContent = "🙈";
    } else {
      input.type = "password";
      btn.textContent = "👁️";
    }
  });
}

function resetearOjo(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (input) input.type = "password";
  if (btn) btn.textContent = "👁️";
}

activarOjo("password", "togglePassword");
activarOjo("resetPassword", "toggleResetPassword");

const inputUsuario = document.getElementById("usuario");
if (inputUsuario) {
  inputUsuario.addEventListener("input", function () {
    this.value = this.value.toUpperCase();
  });
}

const inputResetUsuario = document.getElementById("resetUsuario");
if (inputResetUsuario) {
  inputResetUsuario.addEventListener("input", function () {
    this.value = this.value.toUpperCase();
  });
}

/* ===============================
   REGISTRO
================================= */

const btnRegister = document.getElementById("registerBtn");
if (btnRegister) {
  btnRegister.addEventListener("click", function () {
    ocultarMensaje();

    const uInput = document.getElementById("usuario");
    const pInput = document.getElementById("password");
    if (!uInput || !pInput) return;

    const nombre = uInput.value.trim().toUpperCase();
    const pass = pInput.value.trim();

    if (!nombre || !pass) {
      mostrarMensaje("Escribe un usuario y una contraseña.", false);
      return;
    }

    if (pass.length < 4) {
      mostrarMensaje("La contraseña debe tener al menos 4 caracteres.", false);
      return;
    }

    if (usuarios.some(u => u.usuario === nombre)) {
      mostrarMensaje("Ese usuario ya existe. Inicia sesión o cambia la contraseña.", false);
      return;
    }

    const esAdmin = usuarios.length === 0;

    usuarios.push({
      usuario: nombre,
      password: pass,
      admin: esAdmin
    });

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    uInput.value = "";
    pInput.value = "";
    resetearOjo("password", "togglePassword");

    mostrarMensaje(
      esAdmin
        ? `Registrado ${nombre} como ADMINISTRADOR. Ya puedes entrar.`
        : `Registrado ${nombre}. Ya puedes entrar.`,
      true
    );
  });
}

/* ===============================
   LOGIN
================================= */

function iniciarSesion() {
  ocultarMensaje();

  const uInput = document.getElementById("usuario");
  const pInput = document.getElementById("password");
  if (!uInput || !pInput) return;

  const nombre = uInput.value.trim().toUpperCase();
  const pass = pInput.value.trim();

  if (!nombre || !pass) {
    mostrarMensaje("Introduce usuario y contraseña.", false);
    return;
  }

  const encontrado = usuarios.find(u => u.usuario === nombre && u.password === pass);

  if (!encontrado) {
    mostrarMensaje("Usuario o contraseña incorrectos.", false);
    return;
  }

  usuarioActual = encontrado;

  const loginDiv = document.getElementById("login");
  const panelDiv = document.getElementById("panel");
  const infoUsuario = document.getElementById("usuarioInfo");

  if (loginDiv) loginDiv.style.display = "none";
  if (panelDiv) panelDiv.style.display = "block";
  if (infoUsuario) {
    infoUsuario.textContent = `Usuario: ${usuarioActual.usuario} (${usuarioActual.admin ? "ADMIN" : "LECTURA"})`;
  }

  uInput.value = "";
  pInput.value = "";
  resetearOjo("password", "togglePassword");

  renderTabla();
}

const formAuth = document.getElementById("authForm");
if (formAuth) {
  formAuth.addEventListener("submit", function (e) {
    e.preventDefault();
    iniciarSesion();
  });
} else {
  const btnLogin = document.getElementById("loginBtn");
  if (btnLogin) {
    btnLogin.addEventListener("click", function (e) {
      e.preventDefault();
      iniciarSesion();
    });
  }
}

/* ===============================
   RECUPERAR / CAMBIAR CONTRASEÑA
================================= */

const btnForgot = document.getElementById("forgotBtn");
if (btnForgot) {
  btnForgot.addEventListener("click", function () {
    ocultarMensaje();
    const formEl = document.getElementById("authForm");
    const resetEl = document.getElementById("resetBox");
    const uActual = document.getElementById("usuario");
    const uReset = document.getElementById("resetUsuario");

    if (formEl) formEl.style.display = "none";
    if (resetEl) resetEl.style.display = "block";
    if (uReset && uActual) uReset.value = uActual.value.trim().toUpperCase();
  });
}

const btnCancelReset = document.getElementById("cancelResetBtn");
if (btnCancelReset) {
  btnCancelReset.addEventListener("click", function () {
    ocultarMensaje();
    const formEl = document.getElementById("authForm");
    const resetEl = document.getElementById("resetBox");
    resetearOjo("resetPassword", "toggleResetPassword");
    if (resetEl) resetEl.style.display = "none";
    if (formEl) formEl.style.display = "block";
  });
}

const btnSaveReset = document.getElementById("saveResetBtn");
if (btnSaveReset) {
  btnSaveReset.addEventListener("click", function () {
    const uReset = document.getElementById("resetUsuario");
    const pReset = document.getElementById("resetPassword");
    if (!uReset || !pReset) return;

    const nombre = uReset.value.trim().toUpperCase();
    const nuevaPass = pReset.value.trim();

    if (!nombre || !nuevaPass) {
      alert("Escribe el usuario y la nueva contraseña.");
      return;
    }

    if (nuevaPass.length < 4) {
      alert("La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    const idx = usuarios.findIndex(u => u.usuario === nombre);
    if (idx === -1) {
      alert("Ese usuario no existe.");
      return;
    }

    usuarios[idx].password = nuevaPass;
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    uReset.value = "";
    pReset.value = "";
    resetearOjo("resetPassword", "toggleResetPassword");

    const formEl = document.getElementById("authForm");
    const resetEl = document.getElementById("resetBox");
    const uLogin = document.getElementById("usuario");

    if (resetEl) resetEl.style.display = "none";
    if (formEl) formEl.style.display = "block";
    if (uLogin) uLogin.value = nombre;

    mostrarMensaje(`Contraseña cambiada para ${nombre}. Ya puedes entrar.`, true);
  });
}

const btnClearUsers = document.getElementById("clearUsersBtn");
if (btnClearUsers) {
  btnClearUsers.addEventListener("click", function () {
    if (!confirm("¿Borrar todos los usuarios y empezar de cero?")) return;

    usuarios = [];
    localStorage.removeItem("usuarios");

    const formEl = document.getElementById("authForm");
    const resetEl = document.getElementById("resetBox");
    if (resetEl) resetEl.style.display = "none";
    if (formEl) formEl.style.display = "block";

    mostrarMensaje("Usuarios borrados. Registra tu usuario ahora.", true);
  });
}

/* ===============================
   LOGOUT
================================= */

const btnLogout = document.getElementById("logoutBtn");
if (btnLogout) {
  btnLogout.addEventListener("click", function () {
    usuarioActual = null;
    const panelDiv = document.getElementById("panel");
    const loginDiv = document.getElementById("login");
    if (panelDiv) panelDiv.style.display = "none";
    if (loginDiv) loginDiv.style.display = "block";
    ocultarMensaje();
  });
}

/* ===============================
   TABLA INVENTARIO (SIN PERDER FOCO)
================================= */

function renderTabla() {
  const tabla = document.getElementById("tabla");
  if (!tabla || !usuarioActual) return;

  tabla.innerHTML = "";

  const esAdmin = Boolean(usuarioActual.admin);
  const soloLectura = esAdmin ? "" : "readonly";

  proveedores.forEach(function (proveedor) {
    const base = crearDatoVacio();
    const guardado = inventario[proveedor] || {};
    const datos = {
      producto: guardado.producto ?? base.producto,
      entradas: Number(guardado.entradas) || 0,
      salidas: Number(guardado.salidas) || 0,
      palletsEntrada: Number(guardado.palletsEntrada) || 0,
      palletsSalida: Number(guardado.palletsSalida) || 0
    };

    const stock = datos.entradas - datos.salidas;
    const stockPallets = datos.palletsEntrada - datos.palletsSalida;

    const fila = document.createElement("tr");
    fila.dataset.proveedor = proveedor;

    fila.innerHTML = `
      <td></td>
      <td><input ${soloLectura} class="producto" type="text"></td>
      <td><input ${soloLectura} class="entradas" type="number"></td>
      <td><input ${soloLectura} class="salidas" type="number"></td>
      <td><input readonly class="stock-calc" type="number"></td>
      <td><input ${soloLectura} class="palletsEntrada" type="number"></td>
      <td><input ${soloLectura} class="palletsSalida" type="number"></td>
      <td><input readonly class="stock-pallets-calc" type="number"></td>
      <td>${esAdmin ? `<button type="button" class="btn-borrar">Borrar</button>` : ""}</td>
    `;

    fila.children[0].textContent = proveedor;
    fila.querySelector(".producto").value = datos.producto;
    fila.querySelector(".entradas").value = datos.entradas;
    fila.querySelector(".salidas").value = datos.salidas;
    fila.querySelector(".stock-calc").value = stock;
    fila.querySelector(".palletsEntrada").value = datos.palletsEntrada;
    fila.querySelector(".palletsSalida").value = datos.palletsSalida;
    fila.querySelector(".stock-pallets-calc").value = stockPallets;

    if (esAdmin) {
      fila.querySelectorAll("input:not([readonly])").forEach(function (input) {
        input.addEventListener("input", function () {
          actualizarFila(fila);
        });
      });

      const btnBorrar = fila.querySelector(".btn-borrar");
      if (btnBorrar) {
        btnBorrar.addEventListener("click", function () {
          borrarFila(proveedor);
        });
      }
    }

    tabla.appendChild(fila);
  });
}

function actualizarFila(fila) {
  const proveedor = fila.dataset.proveedor;
  if (!proveedor) return;

  const producto = fila.querySelector(".producto").value;
  const entradas = parseInt(fila.querySelector(".entradas").value, 10) || 0;
  const salidas = parseInt(fila.querySelector(".salidas").value, 10) || 0;
  const palletsEntrada = parseInt(fila.querySelector(".palletsEntrada").value, 10) || 0;
  const palletsSalida = parseInt(fila.querySelector(".palletsSalida").value, 10) || 0;

  fila.querySelector(".stock-calc").value = entradas - salidas;
  fila.querySelector(".stock-pallets-calc").value = palletsEntrada - palletsSalida;

  inventario[proveedor] = {
    producto: producto,
    entradas: entradas,
    salidas: salidas,
    palletsEntrada: palletsEntrada,
    palletsSalida: palletsSalida
  };

  localStorage.setItem("inventario", JSON.stringify(inventario));
}

function borrarFila(proveedor) {
  if (!confirm("¿Seguro que quieres borrar los datos?")) return;

  inventario[proveedor] = crearDatoVacio();
  localStorage.setItem("inventario", JSON.stringify(inventario));
  renderTabla();
}

/* ===============================
   RELOJ EN TIEMPO REAL
================================= */

function actualizarReloj() {
  const ahora = new Date();
  const relojEl = document.getElementById("reloj");
  const fechaEl = document.getElementById("fecha");

  if (relojEl) {
    relojEl.innerText = ahora.toLocaleTimeString("es-ES", { hour12: false });
  }

  if (fechaEl) {
    fechaEl.innerText = ahora.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).toUpperCase();
  }
}

setInterval(actualizarReloj, 1000);
actualizarReloj();