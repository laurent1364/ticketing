import {Listener, OrderCreatedEvent, Subjects} from "@lftickets/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from './queue-group-name'
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    // readonly is final in Java
    readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
    readonly queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
        // Find associate ticket
        const ticket = await Ticket.findById(data.ticket.id);
        if (!ticket) {
            throw new Error('Could not find the ticket');
        }

        ticket.set({
            orderId: data.orderId
        });

        await ticket.save();

        // we have to emit update ticket to keep services consistent
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId
        });

        msg.ack();
    }

}

