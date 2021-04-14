import {Publisher, Subjects, TicketUpdatedEvent} from "@lftickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    // readonly is final in Java
    readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}

