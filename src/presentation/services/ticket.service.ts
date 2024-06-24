import { UuidAdapter } from "../../config/uuid.adapter";
import { Ticket } from "../../domain/interfaces/ticket";
import { WssService } from "./wss.service";

export class TicketService {
  constructor(private readonly wssService = WssService.instance) {}

  public _tickets: Ticket[] = [
    // {
    //   id: UuidAdapter.v4(),
    //   number: 1,
    //   createdAt: new Date(),
    //   done: false,
    // },
    // {
    //   id: UuidAdapter.v4(),
    //   number: 2,
    //   createdAt: new Date(),
    //   done: false,
    // },
    // {
    //   id: UuidAdapter.v4(),
    //   number: 3,
    //   createdAt: new Date(),
    //   done: false,
    // },
    // {
    //   id: UuidAdapter.v4(),
    //   number: 4,
    //   createdAt: new Date(),
    //   done: false,
    // },
    // {
    //   id: UuidAdapter.v4(),
    //   number: 5,
    //   createdAt: new Date(),
    //   done: false,
    // },
  ];

  private readonly workingOnTickets: Ticket[] = [];

  public get pendingTickets(): Ticket[] {
    return this._tickets.filter((ticket) => !ticket.handleAtDesk);
  }

  public get lastWorkingOnTickets(): Ticket[] {
    return this.workingOnTickets.slice(0, 4);
  }

  public get lastTicketNumber(): number {
    return this._tickets.length > 0 ? this._tickets.at(-1)!.number : 0;
  }

  public createTicket(): Ticket {
    const ticket: Ticket = {
      id: UuidAdapter.v4(),
      number: this.lastTicketNumber + 1,
      createdAt: new Date(),
      done: false,
      handledAt: undefined,
      handleAtDesk: undefined,
    };

    this._tickets.push(ticket);
    this.onTicketNumberChanged();

    return ticket;
  }

  public drawTicket(desk: string) {
    const ticket = this._tickets.find((t) => !t.handleAtDesk);

    if (!ticket)
      return { status: "error", message: "No hay tickets pendientes" };

    ticket.handleAtDesk = desk;
    ticket.handledAt = new Date();

    this.workingOnTickets.unshift({ ...ticket });
    this.onTicketNumberChanged();
    this.onWorkingChanged();

    return { status: "ok", ticket };
  }

  public onFinishedTicket(ticketId: string) {
    const ticket = this._tickets.find((t) => t.id === ticketId);

    if (!ticket) return { status: "error", message: "Ticket not found" };

    this._tickets = this._tickets.map((t) => {
      if (t.id === ticketId) {
        t.done = true;
      }
      return t;
    });

    return { status: "ok" };
  }

  private onTicketNumberChanged() {
    this.wssService.send(
      "on-ticket-number-changed",
      this.pendingTickets.length
    );
  }

  private onWorkingChanged() {
    this.wssService.send("on-working-changed", this.lastWorkingOnTickets);
  }
}
