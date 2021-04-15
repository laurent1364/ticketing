import express from 'express'
import 'express-async-errors';
import {json} from 'body-parser'
import cookieSession from "cookie-session";
import {currentUser, errorHandler, NotFoundError} from "@lftickets/common";
import {listOrdersRouter} from "./routes/list-orders-for-user";
import {createOrdersRouter} from "./routes/create-order";
import {cancelOrdersRouter} from "./routes/cancel-order";
import {getOrderDetailsRouter} from "./routes/get-order-details";

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
    signed: false,
    secure: false
}));

app.use(currentUser);

app.use(listOrdersRouter);
app.use(createOrdersRouter);
app.use(cancelOrdersRouter);
app.use(getOrderDetailsRouter);

app.all('*', async () => {
    throw new NotFoundError();
})

app.use(errorHandler);

export {app} ;
