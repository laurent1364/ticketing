import {PaymentCreatedEvent, Publisher, Subjects} from "@lftickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    // readonly is final in Java
    readonly subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
