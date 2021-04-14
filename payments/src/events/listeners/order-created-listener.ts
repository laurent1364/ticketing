import {Listener, OrderCreatedEvent, Subjects} from "@lftickets/common";

import {queueGroupName} from "./queue-group-name";
import {Message} from "node-nats-streaming";
import {Order} from "../../models/order";


export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    // readonly is final in Java
    readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
    readonly queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
        const order = Order.build({
            id: data.orderId,
            price: data.ticket.price,
            status: data.status,
            userId: data.userId,
            version: data.version
        });

        await order.save();
        msg.ack();

    }

}
