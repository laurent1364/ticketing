import request from 'supertest';
import {app} from "../../app";
import {Ticket} from "../../models/ticket";
import {natsWrapper} from "../../nats-wrapper";



it('has a route handle listening to /api/tickets for a POST requests', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});

    expect(response.status).not.toEqual(404);
});
it('can only be accessed if the user is signed in', async () => {
    await request(app)
        .post('/api/tickets')
        .send({})
        .expect(401);

});

it('returns something else than 401 when user is logged in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.getAuthCookie())
        .send({});

    expect(response.status).not.toEqual(401);

});

it('returns an error if an invalid title is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.getAuthCookie())
        .send({})
        .expect(400);
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.getAuthCookie())
        .send({price: 123})
        .expect(400);
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.getAuthCookie())
        .send({title: '', price: 123})
        .expect(400);

});
it('returns an error if an invalid price is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.getAuthCookie())
        .send({title: 'Valid title'})
        .expect(400);
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.getAuthCookie())
        .send({title: 'Valid title', price: 'azezzez'})
        .expect(400);
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.getAuthCookie())
        .send({title: 'Valid title', price: -10})
        .expect(400);
});
it('creates a ticket with valid inputs', async () => {

    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);
    const title = 'Valid title';
    const price = 123;
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.getAuthCookie())
        .send({title, price})
        .expect(201);
    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].id).toBeDefined();
    expect(tickets[0].title).toEqual(title);
    expect(tickets[0].price).toEqual(price);

});

it('publishes an event', async () => {

    const title = 'Valid title';
    const price = 123;
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.getAuthCookie())
        .send({title, price})
        .expect(201);


    expect(natsWrapper.client.publish).toHaveBeenCalled()
});
