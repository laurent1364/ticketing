import {Message} from "node-nats-streaming";
import {Listener} from "./base-listener";
import {Subjects} from "./subjects";
import {TicketCreatedEvent} from "./ticket-created-event";

export class TicketCreatedListener extends Listener<TicketCreatedEvent>{
    // readonly is final in Java
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
    queueGroupName = 'payment-system';

    onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
        console.log('Event data', data);

        msg.ack();
    }

}
