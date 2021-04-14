import {Subjects} from "./subjects";
import {Publisher} from "./base-publisher";
import {TicketCreatedEvent} from "./ticket-created-event";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    // readonly is final in Java
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
