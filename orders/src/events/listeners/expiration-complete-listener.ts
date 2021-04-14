import {ExpirationCompleteEvent, Listener, OrderStatus, Subjects} from "@lftickets/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import {Order} from "../../models/order";
import {OrderCancelledPublisher} from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    // readonly is final in Java
    readonly subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    readonly queueGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
        const {orderId} = data;
         const order = await Order.findById(orderId).populate('ticket');

         if(!order){
             throw new Error('Order not found');
         }

         if(order.status === OrderStatus.Complete){
             return msg.ack();
         }
         order.set({
             status: OrderStatus.Cancelled
         });
         await order.save();

         await new OrderCancelledPublisher(this.client).publish({
             orderId: order.id,
             ticketId: order.ticket.id,
             version: order.version
         })

        msg.ack();

    }

}

