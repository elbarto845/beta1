document.addEventListener("DOMContentLoaded", function() {
    const sala = document.getElementById("sala");
    const socket = io();
  
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
  
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
  
    const filas = 5;
    const columnas = 5;
  
    function crearButacas() {
      for (let fila = 1; fila <= filas; fila++) {
        for (let columna = 1; columna <= columnas; columna++) {
          const butaca = document.createElement("div");
          butaca.classList.add("butaca");
          butaca.setAttribute("data-fila", fila);
          butaca.setAttribute("data-columna", columna);
          sala.appendChild(butaca);
  
          butaca.addEventListener("click", () => {
            seleccionarButaca(butaca);
            const fila = butaca.getAttribute("data-fila");
            const columna = butaca.getAttribute("data-columna");
            socket.emit('seleccion', { fila, columna });
  
            // Guardar la selección en la base de datos
            guardarSeleccionEnFirebase(fila, columna);
          });
        }
      }
    }
  
    function seleccionarButaca(butacaSeleccionada) {
      butacaSeleccionada.classList.toggle("selected");
  
      const seleccionActual = JSON.parse(localStorage.getItem("seleccion")) || [];
      const fila = butacaSeleccionada.getAttribute("data-fila");
      const columna = butacaSeleccionada.getAttribute("data-columna");
  
      const nuevaSeleccion = {
        fila: parseInt(fila),
        columna: parseInt(columna)
      };
  
      const index = seleccionActual.findIndex(item => item.fila === nuevaSeleccion.fila && item.columna === nuevaSeleccion.columna);
  
      if (index === -1) {
        seleccionActual.push(nuevaSeleccion);
      } else {
        seleccionActual.splice(index, 1);
      }
  
      localStorage.setItem("seleccion", JSON.stringify(seleccionActual));
    }
  
    function cargarSeleccionGuardada() {
      const seleccionGuardada = JSON.parse(localStorage.getItem("seleccion")) || [];
  
      seleccionGuardada.forEach(seleccion => {
        const selector = `[data-fila="${seleccion.fila}"][data-columna="${seleccion.columna}"]`;
        const butaca = sala.querySelector(selector);
        if (butaca) {
          butaca.classList.add("selected");
        }
      });
    }
  
    function guardarSeleccionEnFirebase(fila, columna) {
      // Guardar la selección en la base de datos
      const seleccionRef = database.ref('seleccion');
      seleccionRef.child(`${fila}_${columna}`).set(true);
    }
  
    function cargarSeleccionDesdeFirebase() {
      // Cargar la selección desde la base de datos y reflejarla en la sala
      const seleccionRef = database.ref('seleccion');
      seleccionRef.on('value', (snapshot) => {
        const seleccionFirebase = snapshot.val();
        if (seleccionFirebase) {
          for (const key in seleccionFirebase) {
            const [fila, columna] = key.split('_');
            const selector = `[data-fila="${fila}"][data-columna="${columna}"]`;
            const butaca = sala.querySelector(selector);
            if (butaca) {
              butaca.classList.add("selected");
            }
          }
        }
      });
    }
  
    socket.on('seleccion', (data) => {
      const selector = `[data-fila="${data.fila}"][data-columna="${data.columna}"]`;
      const butaca = sala.querySelector(selector);
  
      if (butaca) {
        butaca.classList.add("selected");
      }
    });
  
    crearButacas();
    cargarSeleccionGuardada();
    cargarSeleccionDesdeFirebase();
  });
  