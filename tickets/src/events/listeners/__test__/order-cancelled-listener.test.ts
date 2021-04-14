import {natsWrapper} from "../../../nats-wrapper";
import {OrderCancelledEvent} from "@lftickets/common";
import mongoose from "mongoose";
import {Ticket} from "../../../models/ticket";
import {OrderCancelledListener} from "../order-cancelled-listener";


const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    // create a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString(),
        orderId: new mongoose.Types.ObjectId().toHexString()
    });

    await ticket.save();
    // create a fake data event
    const data: OrderCancelledEvent['data'] = {
        orderId: ticket.orderId!,
        version: ticket.version,
        ticketId: ticket.id
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, data, ticket, msg};
}

it('removes orderId for the provided ticketId', async () => {
    const {listener, data, ticket, msg} = await setup();
    await listener.onMessage(data, msg);

    const cancelledTicket = await Ticket.findById(ticket.id);

    expect(cancelledTicket).toBeDefined();
    expect(cancelledTicket!.orderId).not.toBeDefined()
})

it('acks the message', async () => {

    const {listener, data, msg} = await setup();
    // write assertions to make sur a ticket was created
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})

it('publishes a ticket updated event', async () => {

    const {listener, data, msg} = await setup();
    // write assertions to make sur a ticket was created
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(ticketUpdatedData.orderId).not.toBeDefined();
})
