import {useEffect, useState} from 'react';
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/use-request";
import Router from "next/router";

const OrderShow = ({currentUser, order}) => {
    const [timeLeft, setTimeLeft] = useState('');
    const {doRequest, errors} = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: (order) => {
            Router.push('/orders');
        }
    })
    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000));
        }
        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000);

        return () => {
            clearInterval(timerId);
        };
    }, []);

    if (timeLeft < 0) {
        return <div>Order expires</div>
    }


    return (
        <div>
            <h1>Order for ticket : {order.ticket.title}</h1>
            <p>{timeLeft} second left before expires</p>
            <StripeCheckout
                token={(token) => doRequest({token: token.id})}
                stripeKey="pk_test_51IfhCkKotlVimr8CluHs8g5zOgrkhE7EhNhtvfQK33YAhTx2FgyqyWsxfymaZQCmgQpQH8Z9rT3lMuA3Sbecpo5400qD8AnDmL"
                amount={order.ticket.price * 100}
                currency="USD"
                email={currentUser.email}
            />
            {errors}
        </div>
    );
}

OrderShow.getInitialProps = async (context, client) => {

    const {orderId} = context.query;
    const {data} = await client.get(`/api/orders/${orderId}`);
    return {order: data};
}

export default OrderShow;
