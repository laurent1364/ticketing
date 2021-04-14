import request from 'supertest';
import {app} from "../../app";
import {Ticket, TicketDoc} from "../../models/ticket";
import mongoose from "mongoose";
import {Order, OrderStatus} from "../../models/order";
import {natsWrapper} from "../../nats-wrapper";

const createTicket = async () => {
    const ticket = Ticket.build({
        title: 'ticket title',
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString()
    });
    return await ticket.save();
}

const createOrder = async (ticket: TicketDoc) => {
    const order = Order.build({
        ticket,
        userId: 'dfkhsdfkjh',
        status: OrderStatus.Created,
        expiresAt: new Date(),
        version: 0
    });
    return order.save();
}
it('has a route handle listening to /api/orders for a POST requests', async () => {
    const response = await request(app)
        .post('/api/orders')
        .send({});

    expect(response.status).not.toEqual(404);
});

it('returns an error if the ticket does not exist', async ()=> {
    const ticketId= mongoose.Types.ObjectId();
    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', global.getAuthCookie())
        .send({
            ticketId
        });

    expect(response.status).toEqual(404);
})
it('returns an error if the ticket is already reserved', async ()=> {

    const ticket = await createTicket();
    await createOrder(ticket);

    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', global.getAuthCookie())
        .send({
            ticketId:ticket._id
        });

    expect(response.status).toEqual(400);
})
it('reserves a ticket', async ()=> {
    const ticket = await createTicket();

    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', global.getAuthCookie())
        .send({
            ticketId:ticket._id
        });

    expect(response.status).toEqual(201);
});


it('publishes an event', async () => {

    const ticket = await createTicket();

    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', global.getAuthCookie())
        .send({
            ticketId:ticket._id
        });

    expect(natsWrapper.client.publish).toHaveBeenCalled()
});
