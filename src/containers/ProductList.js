import React from 'react';
import { connect } from 'react-redux';
import { Button, Icon, Image, Item, Label, Container, Segment, Loader, Dimmer, Message } from 'semantic-ui-react';
import axios from 'axios';
import { productListURL, addToCartURL } from "../constants";
import { authAxios } from "../utils";

import { fetchCart } from "../store/actions/cart";


class ProductList extends React.Component {

    state = {
        loading: false,
        error: null,
        data: []
    };

    componentDidMount() {
        this.setState({ loading: true });
        axios
            .get(productListURL)
            .then(res => {
                this.setState({ data: res.data, loading: false });
            })
            .catch(err => {
                this.setState({ error: err });
            });
    }

    handleAddToCart = slug => {
        this.setState({ loading: true });
        authAxios
            .post(addToCartURL, { slug })
            .then(res => {
                console.log(res.data);
                this.props.fetchCart();
                this.setState({ loading: false });
            })
            .catch(err => {
                this.setState({ error: err, loading: false });
            });
    }

    render() {
        const { data, error, loading } = this.state
        return (
            <Container>
                {error && (
                    <Message
                        error
                        header='There was some errors with your submission'
                        content={JSON.stringify(error)}
                    />
                )}
                {loading && (<Segment>
                    <Dimmer active inverted>
                        <Loader inverted content='Loading' />
                    </Dimmer>

                    <Image src='/images/wireframe/short-paragraph.png' />
                </Segment>
                )}
                <Item.Group divided>
                    {data.map(item => {
                        return <Item key={item.id}>
                            <Item.Image src={item.image} />

                            <Item.Content>
                                <Item.Header as='a' onClick={() =>
                                    this.props.history.push(`/products/${item.id}`)
                                }>{item.title}</Item.Header>
                                <Item.Meta>
                                    <span className='cinema'>{item.category}</span>
                                </Item.Meta>
                                <Item.Description>{item.description}</Item.Description>
                                <Item.Extra>
                                    <Button primary floated='right' icon labelPosition='right' onClick={() => this.handleAddToCart(item.slug)}>
                                        Add to cart
                            <Icon name='cart plus' />
                                    </Button>
                                    <Label color={item.label === 'primary' ? 'blue' : item.label === 'secondary' ? 'olive' : 'red'}>{item.label}</Label>
                                </Item.Extra>
                            </Item.Content>
                        </Item>
                    })}

                </Item.Group >
            </Container >
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchCart: () => dispatch(fetchCart())
    }
}

export default connect(null, mapDispatchToProps)(ProductList);