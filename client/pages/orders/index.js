const ShowOrders = ({orders}) => {

    let orderList = (<tr><td colSpan="3" className="text-center">No Order</td></tr>)

    if(orders.length > 0){
        orderList = orders.map(order => {
            return (
                <tr key={order.id}>
                    <td>{order.ticket.title}</td>
                    <td>{order.ticket.price}</td>
                    <td>{order.status}</td>
                </tr>
            )
        });
    }
    return (
        <div>
            <h1>Orders</h1>
            <table className="table">
                <thead>
                <tr>
                    <th>Ticket title</th>
                    <th>Ticket price</th>
                    <th>Order status</th>
                </tr>
                </thead>
                <tbody>
                {orderList}
                </tbody>
            </table>
        </div>
    )
};

ShowOrders.getInitialProps = async (context, client, currentUser) => {

    const {data} = await client.get('/api/orders');
    return {orders: data};
}
export default ShowOrders;
