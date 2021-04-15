import express from 'express'
import 'express-async-errors';
import {json} from 'body-parser'
import cookieSession from "cookie-session";
import {currentUser, errorHandler, NotFoundError} from "@lftickets/common";
import {createTicketRouter} from "./routes/create-ticket";
import {getTicketDetailRouter} from "./routes/get-ticket-detail";
import {listTicketsRouter} from "./routes/list-tickets";
import {updateTicketRouter} from "./routes/update-ticket";

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
    signed: false,
    secure: false
}));

app.use(currentUser)

app.use(createTicketRouter);
app.use(getTicketDetailRouter);
app.use(listTicketsRouter);
app.use(updateTicketRouter);


app.all('*', async () => {
    throw new NotFoundError();
})

app.use(errorHandler);

export {app} ;
