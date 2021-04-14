import {OrderCreatedListener} from "../order-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {OrderCreatedEvent, OrderStatus} from "@lftickets/common";
import mongoose from "mongoose";
import {Ticket} from "../../../models/ticket";


const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // create a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString()
    });

    await ticket.save();
    // create a fake data event
    const data: OrderCreatedEvent['data'] = {
        orderId: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: new Date().toISOString(),
        ticket:{
            id: ticket.id,
            price: ticket.price
        }
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, data, ticket, msg};
}

it('updates ticket with the provide orderId', async ()=> {
    const {listener, data, ticket, msg} = await setup();
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.orderId).toEqual(data.orderId);
})

it('acks the message', async ()=> {

    const {listener, data, msg} = await setup();
    // write assertions to make sur a ticket was created
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})

it('publishes a ticket updated event', async ()=> {

    const {listener, data, msg} = await setup();
    // write assertions to make sur a ticket was created
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(ticketUpdatedData.orderId).toEqual(data.orderId);
})
