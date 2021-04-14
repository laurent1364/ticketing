import express, {Request, Response} from 'express';
import {BadRequestError, NotFoundError, requireAuth, UnauthorizedError, validateRequest} from "@lftickets/common";
import {body} from "express-validator";
import {Ticket} from "../models/ticket";
import {natsWrapper} from "../nats-wrapper";
import {TicketUpdatedPublisher} from "../events/publishers/ticket-updated-publisher";


const router = express.Router();

router.put('/api/tickets/:id',
    requireAuth,
    [
        body('title').not().isEmpty().withMessage('Title is required'),
        body('price').isFloat({gt: 0}).withMessage('Price must be valid and greater that 0')
    ],
    validateRequest,
    async (req: Request, res: Response) => {

        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            throw new NotFoundError()
        }
        if(ticket.orderId){
            throw new BadRequestError('Ticket reserved: it cannot be edited')
        }
        if (ticket.userId !== req.currentUser!.id) {
            throw new UnauthorizedError();
        }

        const {title, price} = req.body;

        ticket.set({
            title: title,
            price: price
        });
        await ticket.save();

        new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version
        });
        res.status(200).send(ticket);

    });


export {router as updateTicketRouter};
