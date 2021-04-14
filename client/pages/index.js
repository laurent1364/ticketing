import Link from "next/link";

const LandingPage = ({currentUser, tickets}) => {

    let ticketList = (<tr>
        <td colSpan="3" className="text-center">No tickets</td>
    </tr>);

    if (tickets.length > 0) {
        ticketList = tickets.map(ticket => {
            return (
                <tr key={ticket.id}>
                    <td>{ticket.title}</td>
                    <td>{ticket.price}</td>
                    <td>
                        <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
                            <a className="page-link">View</a>
                        </Link>
                    </td>
                </tr>
            )
        })
    }

    return (
        <div>
            <h1>Tickets</h1>
            <table className="table">
                <thead>
                <tr>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {ticketList}
                </tbody>
            </table>
        </div>
    )
};

LandingPage.getInitialProps = async (context, client, currentUser) => {

    const {data} = await client.get('/api/tickets');
    return {tickets: data};
}

export default LandingPage;
