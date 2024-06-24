export interface Ticket {
  id: string;
  number: number;
  createdAt: Date;
  handleAtDesk?: string;
  handledAt?: Date;
  done: boolean;
}
