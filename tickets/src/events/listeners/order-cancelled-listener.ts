import {Listener, OrderCancelledEvent, Subjects} from "@lftickets/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from './queue-group-name'
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    // readonly is final in Java
    readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    readonly queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
        // Find associate ticket
        const ticket = await Ticket.findById(data.ticketId);
        if (!ticket) {
            throw new Error('Could not find the ticket');
        }

        ticket.set({
            orderId: undefined
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

