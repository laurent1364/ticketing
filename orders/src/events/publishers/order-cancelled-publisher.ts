import {Publisher, Subjects, OrderCancelledEvent} from "@lftickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    // readonly is final in Java
    readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}

