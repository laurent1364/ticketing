import {Publisher, Subjects, TicketCreatedEvent} from "@lftickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    // readonly is final in Java
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
}

