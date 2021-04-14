import request from 'supertest';
import {app} from "../../app";
import mongoose from "mongoose";
import {natsWrapper} from "../../nats-wrapper";
import {Ticket} from "../../models/ticket";


const createTicket = (cookie?: string[]) => {
    return request(app)
        .post('/api/tickets')
        .set('Cookie', cookie ? cookie : global.getAuthCookie())
        .send({title: 'title', price: 20})
        .expect(201);
}

it('return 401 unauthorized if the user is not logged in', async () => {
    const fakeId = new mongoose.Types.ObjectId().toHexString();

    const response = await request(app)
        .put(`/api/tickets/${fakeId}`)
        .send({title: 'title', price: 20})
        .expect(401);

});
it('return 404 if the ticket does not exists', async () => {
    const fakeId = new mongoose.Types.ObjectId().toHexString();
    const response = await request(app)
        .put(`/api/tickets/${fakeId}`)
        .set('Cookie', global.getAuthCookie())
        .send({title: 'title', price: 20})
        .expect(404);

});
it('return 401 if the ticket is not updated by its owner', async () => {

    const response = await createTicket();
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.getAuthCookie('sdhqdkhsqd', 'test2@test.com'))
        .send({title: 'title', price: 20})
        .expect(401);

});
it('returns 400 if user provides a bad input (title, price)', async () => {

    const response = await createTicket();
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.getAuthCookie())
        .send({})
        .expect(400);
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.getAuthCookie())
        .send({title: '', price: 20})
        .expect(400);
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.getAuthCookie())
        .send({title: 'title', price: -10})
        .expect(400);

});
it('publishes an event', async () => {

    const response = await createTicket();
    const newTitle = 'New Title';
    const newPrice = 1000;
    const updateResponse = await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.getAuthCookie())
        .send({
            title: newTitle,
            price: newPrice
        })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

});

it('rejects edit if ticket is reserved', async () => {
    const response = await createTicket();
    const ticket = await Ticket.findById(response.body.id);

    ticket!.set({orderId: mongoose.Types.ObjectId().toHexString()});

    ticket!.save();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.getAuthCookie())
        .send({
            title: 'new title',
            price: 402
        })
        .expect(400);
})
