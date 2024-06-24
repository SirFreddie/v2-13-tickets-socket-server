// Referencias HTML
const lblPending = document.querySelector("#lbl-pending");
const deskHeader = document.querySelector("h1");
const noMoreAlert = document.querySelector(".alert");
const btnDraw = document.querySelector("#btn-draw");
const btnDone = document.querySelector("#btn-done");
const lblCurrentTicket = document.querySelector("small");

const searchParams = new URLSearchParams(window.location.search);

if (!searchParams.has("escritorio")) {
  window.location = "index.html";
  throw new Error("El escritorio es obligatorio");
}

const deskNumber = searchParams.get("escritorio");
let workingTicket = null;
deskHeader.innerText = `Escritorio: ${deskNumber}`;

function checkTicketCounter(initialCount = 0) {
  if (initialCount === 0) {
    noMoreAlert.classList.remove("d-none");
  } else {
    noMoreAlert.classList.add("d-none");
  }
  lblPending.innerHTML = initialCount;
}

async function loadInitialCount() {
  const pendingTickets = await fetch("/api/tickets/pending").then((res) =>
    res.json()
  );
  this.checkTicketCounter(pendingTickets.length);
}

async function attendTicket() {
  await finishTicket();

  const { status, ticket, message } = await fetch(
    `/api/tickets/draw/${deskNumber}`
  ).then((res) => res.json());

  if (status === "error") {
    lblCurrentTicket.innerText = message;
    return;
  }

  workingTicket = ticket;
  lblCurrentTicket.innerText = `Ticket ${ticket.number}`;
}

async function finishTicket() {
  if (!workingTicket) return;

  const { status, message } = await fetch(
    `/api/tickets/done/${workingTicket.id}`,
    {
      method: "PUT",
    }
  ).then((res) => res.json());

  if (status === "error") {
    lblCurrentTicket.innerText = message;
    return;
  }

  workingTicket = null;
  lblCurrentTicket.innerText = "Sin atender";
}

function connectToWebSockets() {
  const socket = new WebSocket("ws://localhost:3000/ws");

  socket.onmessage = (event) => {
    const { type, payload } = JSON.parse(event.data);

    if (type === "on-ticket-number-changed") {
      this.checkTicketCounter(payload);
    }
  };

  socket.onclose = (event) => {
    console.log("Connection closed");
    setTimeout(() => {
      console.log("retrying to connect");
      connectToWebSockets();
    }, 1500);
  };

  socket.onopen = (event) => {
    console.log("Connected");
  };
}

btnDraw.addEventListener("click", attendTicket);
btnDone.addEventListener("click", finishTicket);

connectToWebSockets();
loadInitialCount();
