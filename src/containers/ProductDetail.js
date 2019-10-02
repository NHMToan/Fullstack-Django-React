import React from 'react';
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux';
import { Button, Icon, Image, Item, Label, Container, Form, Segment, Loader, Dimmer, Message, Card, Grid, Header, Divider, Select } from 'semantic-ui-react';
import axios from 'axios';
import { productDetailURL, addToCartURL } from "../constants";
import { authAxios } from "../utils";

import { fetchCart } from "../store/actions/cart";


class ProductDetail extends React.Component {

    state = {
        loading: false,
        error: null,
        formvisible: false,
        data: [],
        formData: {}
    };

    handleToggleForm = () => {
        const { formvisible } = this.state
        this.setState({ formvisible: !formvisible })
    }

    componentDidMount() {
        this.handleFetchItem();
    }

    handleFetchItem = () => {
        const { match: { params } } = this.props;
        this.setState({ loading: true });
        axios
            .get(productDetailURL(params.productID))
            .then(res => {
                this.setState({ data: res.data, loading: false });
            })
            .catch(err => {
                this.setState({ error: err });
            });
    };



    handleAddToCart = slug => {
        this.setState({ loading: true });
        const { formData } = this.state;
        console.log(formData);
        const variations = this.handleFormatData(formData);
        console.log(variations);
        authAxios
            .post(addToCartURL, { slug, variations })
            .then(res => {
                console.log(res.data);
                this.props.refreshCart();
                this.setState({ loading: false });
            })
            .catch(err => {
                this.setState({ error: err, loading: false });
            });
    };

    handleFormatData = formData => {
        return Object.keys(formData).map(key => {
            return formData[key];
        })
    }

    handleChange = (e, { name, value }) => {
        const { formData } = this.state;
        const updateFormData = {
            ...formData,
            [name]: value
        }
        this.setState({ formData: updateFormData });

    };

    render() {
        const { data, formvisible, formData, error, loading } = this.state;
        const item = data;
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
                <Grid columns={2} divided>
                    <Grid.Row>
                        <Grid.Column width={10}>
                            <Card fluid>
                                <Image src={item.image} size="medium" centered />
                                <Card.Content>
                                    <Card.Header>
                                        <Label ribbon color={item.label === 'primary' ? 'blue' : item.label === 'secondary' ? 'olive' : 'red'}>
                                            ${item.price}
                                        </Label>
                                        {item.title}
                                    </Card.Header>
                                    <Card.Meta>

                                        {item.category}
                                    </Card.Meta>
                                    <Card.Description>
                                        {item.description}
                                    </Card.Description>
                                </Card.Content>
                                <Card.Content extra>
                                    <React.Fragment>
                                        <Item.Extra>
                                            <Button fluid color='green' floated='right' icon labelPosition='right' onClick={this.handleToggleForm}>
                                                Add to cart
                                        <Icon name='cart plus' />
                                            </Button>
                                        </Item.Extra>
                                    </React.Fragment>
                                </Card.Content>
                            </Card>

                            {formvisible && (
                                <React.Fragment>
                                    <Divider />
                                    {data.variations.map(v => {
                                        const name = v.name.toLowerCase();
                                        return (
                                            <Form.Field key={v.id}>
                                                <Select
                                                    fluid
                                                    name={name}
                                                    placeholder={`Select ${v.name}`}
                                                    onChange={this.handleChange}
                                                    value={formData[name]}
                                                    selection
                                                    options={v.item_variations.map(item => {
                                                        return {
                                                            key: item.id,
                                                            text: item.value,
                                                            value: item.id
                                                        }

                                                    })} />
                                                <Divider hidden />
                                            </Form.Field>
                                        );
                                    })}

                                    <Form.Button primary onClick={() => this.handleAddToCart(item.slug)}>Submit</Form.Button>
                                </React.Fragment>
                            )}
                        </Grid.Column>


                        <Grid.Column width={6}>
                            <Header as='h2' color='blue'>Variations</Header>
                            {data.variations && (
                                data.variations.map(v => {
                                    return (
                                        <React.Fragment key={v.id}>

                                            <Item.Group divided>
                                                <Header as='h3'>{v.name}</Header>
                                                {v.item_variations.map(iv => {
                                                    return (
                                                        <Item key={iv.id}>
                                                            {iv.attachment && (
                                                                <Item.Image size='tiny' src={`http://127.0.0.1:8000${iv.attachment}`} />
                                                            )}
                                                            <Item.Content verticalAlign='middle'>{iv.value}</Item.Content>
                                                        </Item>
                                                    )
                                                })}

                                            </Item.Group>

                                        </React.Fragment>
                                    )
                                })
                            )}
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container >
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        refreshCart: () => dispatch(fetchCart())
    }
}

export default withRouter(connect(null, mapDispatchToProps)(ProductDetail));