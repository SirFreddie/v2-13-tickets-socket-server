const currentTicketLbl = document.querySelector("span");
const createTicketBtn = document.querySelector("button");

async function getLastTicket() {
  try {
    const lastTicket = await fetch("/api/tickets/last").then((res) =>
      res.json()
    );
    currentTicketLbl.innerText = lastTicket;
  } catch (error) {
    console.log(error);
  }
}

async function createTicket() {
  const newTicket = await fetch("/api/tickets", {
    method: "POST",
  }).then((res) => res.json());
  currentTicketLbl.innerText = newTicket.number;
}

createTicketBtn.addEventListener("click", createTicket);

getLastTicket();
