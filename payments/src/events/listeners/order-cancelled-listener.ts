import {Listener, OrderCancelledEvent, OrderStatus, Subjects} from "@lftickets/common";
import {queueGroupName} from "./queue-group-name";
import {Message} from "node-nats-streaming";
import {Order} from "../../models/order";


export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    // readonly is final in Java
    readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    readonly queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {

        const order = await Order.findByEvent({id: data.orderId, version: data.version});
        if(!order){
            throw new Error('Could not find this order');
        }

        order.set({ status: OrderStatus.Cancelled });

        await order.save();
        msg.ack();

    }

}
