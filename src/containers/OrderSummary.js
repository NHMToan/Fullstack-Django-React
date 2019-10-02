import React from "react";
import { Button, Container, Icon, Image, Label, Menu, Table, Header, Segment, Dimmer, Loader } from 'semantic-ui-react';
import { authAxios } from "../utils";
import { orderSummaryURL } from "../constants";
import { Link } from 'react-router-dom';


class OrderSummary extends React.Component {
    state = {
        data: null,
        error: null,
        loading: false
    }
    componentDidMount() {
        this.handleFetchOrder();
    }
    handleFetchOrder = () => {
        this.setState({ loading: true })
        authAxios
            .get(orderSummaryURL)
            .then(res => {
                this.setState({ data: res.data, loading: false });
            })
            .catch(err => {
                this.setState({ error: err });
            })
    }

    render() {
        const { data, error, loading } = this.state;
        return (
            <Container>
                <Header as='h2' icon='cart' content='Order Summary' />
                <hr />
                {loading && (
                    <Segment>
                        <Dimmer active inverted>
                            <Loader inverted>Loading...</Loader>
                        </Dimmer>
                        <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
                    </Segment>
                )}
                {data ? (<Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Item #</Table.HeaderCell>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell>Price</Table.HeaderCell>
                            <Table.HeaderCell>Quantity</Table.HeaderCell>
                            <Table.HeaderCell>Total price</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {data.order_items.map((order_item, i) => {
                            return (
                                <Table.Row key={order_item.id}>
                                    <Table.Cell>
                                        {i + 1}
                                    </Table.Cell>
                                    <Table.Cell>{order_item.item.title}</Table.Cell>
                                    <Table.Cell>{order_item.item.price}</Table.Cell>
                                    <Table.Cell>{order_item.quantity}</Table.Cell>
                                    <Table.Cell>
                                        {order_item.item.discount_price &&
                                            (<Label ribbon color='red'>ON DISCOUNT</Label>
                                            )}
                                        {order_item.final_price}
                                    </Table.Cell>
                                </Table.Row>
                            )
                        })}
                        <Table.Row>
                            <Table.Cell colSpan='5' textAlign='right'>
                                <Header as='h3' color='blue'>Total: ${data.total}</Header>
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>

                    <Table.Footer>
                        <Table.Row>
                            <Table.HeaderCell colSpan='5' textAlign='right'>
                                <Link to='/checkout'>
                                    <Button color='green'>Checkout</Button>
                                </Link>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>) : (
                        <Header as='h3' content='No items in your cart' />
                    )}
            </Container>
        )
    }
}

export default OrderSummary;