import React from 'react';
import {
    Button,
    Card,
    Menu,
    Grid,
    Header,
    Divider,
    Form,
    Select,
    Message,
    Segment,
    Dimmer,
    Loader,
    Image,
    Label
} from 'semantic-ui-react';

import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { addressListURL, addressCreateURL, countryListURL, userIDURL, addressUpdateURL, addressDeleteURL } from '../constants';
import { authAxios } from '../utils';

const UPDATE_FORM = 'UPDATE_FORM';
const CREATE_FORM = 'CREATE_FORM';

class AddressForm extends React.Component {
    state = {
        loading: false,
        error: null,
        formData: {
            address_type: "",
            apartment_address: "",
            country: "",
            default: false,
            id: "",
            street_address: "",
            user: 1,
            zip: ""
        },
        saving: false,
        success: false
    };

    componentDidMount() {
        const { address, formType } = this.props;
        if (formType === UPDATE_FORM) {
            this.setState({ formData: address });
        }
    }

    handleChange = e => {
        const { formData } = this.state;
        const updatedFormdata = {
            ...formData,
            [e.target.name]: e.target.value
        };

        this.setState({
            formData: updatedFormdata
        });
    };

    handleToggleDefault = () => {
        const { formData } = this.state;
        const updatedFormdata = {
            ...formData,
            default: !formData.default
        };

        this.setState({
            formData: updatedFormdata
        });
    };

    handleSelectChange = (e, { name, value }) => {
        const { formData } = this.state;
        const updatedFormdata = {
            ...formData,
            [name]: value
        };
        this.setState({
            formData: updatedFormdata
        });
    };

    handleSubmit = e => {
        this.setState({ saving: true })
        e.preventDefault();
        const { formType } = this.props;
        if (formType === UPDATE_FORM) {
            this.handleUpdateAddress()
        } else {
            this.handleCreateAddress()
        }
    }

    handleCreateAddress = () => {
        const { activeItem, userID } = this.props;
        const { formData } = this.state;
        authAxios.post(addressCreateURL, {
            ...formData,
            user: userID,
            address_type: activeItem === 'billingAddress' ? 'B' : 'S'
        })
            .then(res => {
                this.setState({ saving: false, success: true, formData: { default: false } })
                this.props.callback();
            })
            .catch(err => {
                this.setState({ error: err })
            })
    }

    handleUpdateAddress = () => {
        const { activeItem, userID } = this.props;
        const { formData } = this.state;
        authAxios.put(addressUpdateURL(formData.id), {
            ...formData,
            user: userID,
            address_type: activeItem === 'billingAddress' ? 'B' : 'S'
        })
            .then(res => {
                this.setState({ saving: false, success: true, formData: { default: false } })
                this.props.callback();
            })
            .catch(err => {
                this.setState({ error: err })
            })
    }




    render() {
        const { countries, activeItem } = this.props;
        const { saving, success, error, formData } = this.state;
        return (
            <Form onSubmit={this.handleSubmit} success={success} error={error}>

                {activeItem === 'billingAddress' ? <Header color='blue'>Billing Address</Header>

                    : <Header color='blue'>Shipping Address</Header>
                }
                <Divider />
                <Form.Input required name='street_address' placeholder='Street address' onChange={this.handleChange} value={formData.street_address} />
                <Form.Input value={formData.apartment_address} required name='apartment_address' placeholder='Apartment address' onChange={this.handleChange} />
                <Form.Field
                    required
                    control={Select}
                    options={countries}
                    clearable
                    search
                    name='country'
                    placeholder='Country'
                    onChange={this.handleSelectChange}
                    value={formData.country}
                />
                <Form.Input value={formData.zip} required name='zip' placeholder='Zip' onChange={this.handleChange} />
                <Form.Checkbox checked={formData.default} required name='default' label="Make this the defalt address" onChange={this.handleToggleDefault} />
                {success && (
                    <Message
                        success
                        header='Success!'
                        content='Your address was saved!'
                    />
                )}
                {error && (
                    <Message
                        error
                        header='There was some an error'
                        content={JSON.stringify(error)}
                    />
                )}
                <Form.Button disabled={saving} loading={saving} primary>Save</Form.Button>
            </Form>
        )
    }
}


class Profile extends React.Component {
    state = {
        activeItem: 'billingAddress',
        addresses: [],
        countries: [],
        userID: null,
        selectedAddress: null
    };

    componentDidMount() {
        this.handleFetchAddresses();
        this.handleFetchCountries();
        this.handleFetchUserID();
    }

    handleItemClick = name => {
        this.setState({ activeItem: name }, () => {
            this.handleFetchAddresses();
        });
    };


    handleFormatCountries = countries => {
        const keys = Object.keys(countries);
        return keys.map(k => {
            return {
                key: k,
                text: countries[k],
                value: k
            }
        })
    }

    handleFetchCountries = () => {
        authAxios.get(countryListURL)
            .then(res => {
                this.setState({ countries: this.handleFormatCountries(res.data) });
            })
            .catch(err => {
                this.setState({ error: err });
            });
    };

    handleFetchUserID = () => {
        authAxios.get(userIDURL)
            .then(res => {
                this.setState({ userID: res.data.userID });
            })
            .catch(err => {
                this.setState({ error: err });
            });
    };

    handleDeleteAddress = userID => {
        authAxios.delete(addressDeleteURL(userID))
            .then(res => {
                this.handleCallBack()
            })
            .catch(err => {
                this.setState({ error: err });
            });
    }

    handleFetchAddresses = () => {
        this.setState({ loading: true })
        const { activeItem } = this.state;
        authAxios.get(addressListURL(activeItem === 'billingAddress' ? 'B' : 'S'))
            .then(res => {
                this.setState({ addresses: res.data, loading: false });
            })
            .catch(err => {
                this.setState({ error: err });
            });
    };

    handleSelectedAddress = address => {
        this.setState({ selectedAddress: address })
    }

    handleCallBack = () => {
        this.handleFetchAddresses();
        this.setState({ selectedAddress: null })
    }


    render() {
        const { activeItem, loading, error, addresses, countries, selectedAddress, userID } = this.state;
        const { isAuthenticated } = this.props;
        if (!isAuthenticated) {
            return <Redirect to="/login" />
        }
        return (

            < Grid container >
                <Grid.Row columns={1}>
                    <Grid.Column>
                        {error && (
                            <Message
                                error
                                header='There was some an error'
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

                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={6}>
                        <Menu pointing vertical fluid>
                            <Menu.Item
                                name='billingAddress'
                                active={activeItem === 'billingAddress'}
                                onClick={() => this.handleItemClick('billingAddress')}
                            />
                            <Menu.Item
                                name='shippingAddress'
                                active={activeItem === 'shippingAddress'}
                                onClick={() => this.handleItemClick('shippingAddress')}
                            />
                            <Menu.Item
                                name='paymentHistory'
                                active={activeItem === 'paymentHistory'}
                                onClick={() => this.handleItemClick('paymentHistory')}
                            />
                        </Menu>
                    </Grid.Column>
                    <Divider />
                    <Grid.Column width={10}>
                        <Header as='h2' color='green'>Profile</Header>
                        <Divider />
                        <Card.Group>
                            {addresses.map(a => {
                                return (<Card key={a.id}>
                                    <Card.Content>
                                        <Label ribbon='right' color='blue'>Default</Label>
                                        <Card.Header>{a.street_address},{a.apartment_address}</Card.Header>
                                        <Card.Meta>{a.country}</Card.Meta>
                                        <Card.Description>
                                            {a.zip}
                                        </Card.Description>
                                        <Divider />
                                        <Button basic color='green' onClick={() => this.handleSelectedAddress(a)}>
                                            Update
                                            </Button>
                                        <Button basic color='red' onClick={() => this.handleDeleteAddress(a.id)}>
                                            Delete
                                        </Button>
                                    </Card.Content>
                                </Card>)
                            })}
                        </Card.Group>
                        {addresses.length > 0 ? <Divider /> : null}
                        {selectedAddress === null ?
                            <AddressForm callback={this.handleCallBack} activeItem={activeItem} userID={userID} countries={countries} formType={CREATE_FORM} />
                            : null}
                        {selectedAddress &&
                            <AddressForm callback={this.handleCallBack} activeItem={activeItem} userID={userID} countries={countries} address={selectedAddress} formType={UPDATE_FORM} />}

                    </Grid.Column>
                </Grid.Row>
            </Grid >
        )
    }
}

const mapStateToProps = state => {
    return {
        isAuthenticated: state.auth.token !== null
    };
};


export default connect(mapStateToProps)(Profile);