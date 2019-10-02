import React, { Component } from 'react';
import { CardElement, injectStripe, Elements, StripeProvider } from 'react-stripe-elements';
import { Container, Button, Select, Header, Message, Item, Divider, Segment, Dimmer, Loader, Image, Label, Form } from 'semantic-ui-react';
import { authAxios } from '../utils';
import { Link, withRouter } from 'react-router-dom';
import { checkoutURL, orderSummaryURL, addCouponURL, addressListURL } from '../constants';


const OrderPreview = props => {


    const { data } = props;
    return (
        <React.Fragment>

            {data && (
                <React.Fragment>
                    <Item.Group relaxed>
                        {data.order_items.map((order_item, i) => {
                            return (
                                <Item key={i}>
                                    <Item.Image size='tiny' src={`http://127.0.0.1:8000${order_item.item.image}`} />
                                    <Item.Content verticalAlign='middle'>
                                        <Item.Header as='a'>{order_item.quantity}x{order_item.item.title}</Item.Header>
                                        <Item.Extra>
                                            <Label>${order_item.final_price}</Label>
                                        </Item.Extra>
                                    </Item.Content>
                                </Item>

                            );
                        })}
                    </Item.Group>

                    <Item.Group>
                        <Item.Content>
                            <Item.Header>
                                <Header as='h3' color='green'>
                                    {data.coupon && (
                                        <Label as='a' color='red' style={{ marginRight: '10px' }} tag>
                                            Coupon : {data.coupon.code} for ${data.coupon.amount}
                                        </Label>
                                    )}
                                    Total: ${data.total}

                                </Header>
                            </Item.Header>
                        </Item.Content>
                    </Item.Group>
                </React.Fragment>
            )
            }
        </React.Fragment>
    )
}

class CouponForm extends Component {
    state = {
        code: ""
    };

    handleChange = e => {
        this.setState({ code: e.target.value });
    };

    handleSubmit = e => {
        const { code } = this.state;
        this.props.handleAddCoupon(e, code);
        this.setState({ code: "" });
    }

    render() {
        const { code } = this.state;
        return (
            <React.Fragment>

                <Form onSubmit={this.handleSubmit}>
                    <Form.Field>
                        <label>Coupon Adding</label>
                        <input placeholder='Enter a coupon .. ' value={code} onChange={this.handleChange} />
                    </Form.Field>
                    <Button type='submit'>Enter</Button>
                </Form>
            </React.Fragment>
        )
    }
}

class CheckoutForm extends Component {
    state = {
        data: null,
        loading: false,
        error: null,
        success: false,
        billingAddress: [],
        shippingAddress: [],
        selectedBillingAddress: "",
        selectedShippingAddress: ""
    };
    componentDidMount() {
        this.handleFetchOrder();
        this.handleFetchShippingAddresses();
        this.handleFetchBillingAddresses();
    }

    handleDefaultAddress = addresses => {
        const filteredAddresses = addresses.filter(ad => ad.default === true);
        if (filteredAddresses.length > 0) {
            return filteredAddresses[0].id;
        }
        return "";
    }

    handleSelectChange = (e, { name, value }) => {
        this.setState({ [name]: value })
        console.log(name)
        console.log(value)
    }

    handleFetchBillingAddresses = () => {
        this.setState({ loading: true })
        authAxios
            .get(addressListURL('B'))
            .then(res => {
                this.setState({
                    billingAddress: res.data.map(a => {
                        return {
                            key: a.id,
                            text: `${a.street_address},${a.apartment_address}-${a.country},${a.zip}`,
                            value: a.id
                        }
                    }),
                    selectedBillingAddress: this.handleDefaultAddress(res.data),
                    loading: false
                });
            })
            .catch(err => {
                this.setState({ error: err, loading: false });

            })
    }

    handleFetchShippingAddresses = () => {
        this.setState({ loading: true })
        authAxios
            .get(addressListURL('S'))
            .then(res => {
                this.setState({
                    shippingAddress: res.data.map(a => {
                        return {
                            key: a.id,
                            text: `${a.street_address},${a.apartment_address}-${a.country},${a.zip}`,
                            value: a.id
                        }
                    }),
                    selectedShippingAddress: this.handleDefaultAddress(res.data),
                    loading: false
                });
            })
            .catch(err => {

                this.setState({ error: err, loading: false });

            })
    }


    handleFetchOrder = () => {
        this.setState({ loading: true })
        authAxios
            .get(orderSummaryURL)
            .then(res => {
                this.setState({ data: res.data, loading: false });
            })
            .catch(err => {
                if (err.response.status === 404) {
                    this.props.history.push("/products")
                } else {
                    this.setState({ error: err, loading: false });
                }
            })
    }


    handleAddCoupon = (e, code) => {
        e.preventDefault();
        this.setState({ loading: true })
        authAxios.post(addCouponURL, { code })
            .then(res => {
                this.setState({ loading: false })
                this.handleFetchOrder();
            }).catch(err => {
                this.setState({ error: err, loading: false })
            });
    };

    submit = (ev) => {
        ev.preventDefault();
        this.setState({ loading: true });
        if (this.props.stripe) {
            this.props.stripe.createToken().then(result => {
                if (result.error) {
                    this.setState({ error: result.error.message, loading: false });
                } else {
                    const { selectedBillingAddress, selectedShippingAddress } = this.state;
                    authAxios
                        .post(checkoutURL, { stripeToken: result.token.id, selectedBillingAddress, selectedShippingAddress })
                        .then(res => {
                            this.setState({ loading: false, success: true });
                        }).catch(err => {
                            this.setState({ loading: false, error: err });
                        });
                }

            });
        }
    };

    render() {
        const { data, error, loading, success, billingAddress, shippingAddress, selectedBillingAddress, selectedShippingAddress } = this.state;

        return (

            <Container>
                {error && (<Message negative>
                    <Message.Header>There was an error</Message.Header>
                    <p>
                        {JSON.stringify(error)}
                    </p>
                </Message>
                )
                }
                {loading && (
                    <Segment>
                        <Dimmer active inverted>
                            <Loader inverted>Loading...</Loader>
                        </Dimmer>
                        <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
                    </Segment>
                )}



                <OrderPreview data={data} />

                <Divider />

                <CouponForm handleAddCoupon={(e, code) => this.handleAddCoupon(e, code)} />

                <Divider />

                {billingAddress.length > 0 && shippingAddress.length > 0 ? (
                    <React.Fragment>
                        <Header>Billing Addresses</Header>
                        <Select clearable selection name="selectedBillingAddress" value={selectedBillingAddress} options={billingAddress} onChange={this.handleSelectChange} />
                        <Header>Shipping Addresses</Header>
                        <Select clearable selection name='selectedShippingAddress' value={selectedShippingAddress} options={shippingAddress} onChange={this.handleSelectChange} />
                        <Header>Would you like to complete the purchase?</Header>
                        <CardElement />
                        <br />
                        {success && (<Message positive>
                            <Message.Header>Your purchase was complete successfully!</Message.Header>
                            <p>
                                Go to your <b>Profile</b> to see your order.
                    </p>
                        </Message>)}
                        <Button loading={loading} disabled={loading} primary onClick={this.submit}>Purchase</Button>
                    </React.Fragment>
                ) : (<div>You should <Link to='/profile'>add addresses</Link></div>)}

            </Container>
        );
    }
}

const InjectForm = withRouter(injectStripe(CheckoutForm));

const WrappedForm = () => (
    <Container>
        <StripeProvider apiKey="pk_test_dG1OShLW5n82FVSyUwWVNjDO00WxfP04bd">
            <div>
                <Header as='h2' color='blue'>Complete your order</Header>
                <Elements>
                    <InjectForm />
                </Elements>
            </div>
        </StripeProvider>
    </Container>
);

export default WrappedForm;