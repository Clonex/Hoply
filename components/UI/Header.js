import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';

import {Header as Head, Body, Title, Right, Left, Input, Item, Icon, Button, List, ListItem, Text} from 'native-base';

import {transaction, navigate, maxString} from "../baseFunctions";

export default class Header extends React.Component {

    /*
     * Initiates the needed states needed in the component.
     */
    constructor()
    {
        super();
        this.state = {
            searching: false,
            results: [],
            currSearch: false,
        };
    }

    /*
     * Resets the search state, when the route is not active.
     */
    blurLogic = () => {
        if(this.state.results.length === 0)
        {
            this.setState({
                searching: false,
                currSearch: false,
                results: [],
            });
        }
    }

    /*
     * Resets the search state, when the route is active.
     */
    focusChecker = () => {
        this.setState({searching: true});
    }

    /*
     * Searches the database for a user matching the given keyword.
     */
    searchr = async (text) => {
		  this.setState({currSearch: text});
		  this.props.ViewModel.get("searchUsers", (users) => {
			if(text === this.state.currSearch)
			{
				console.log(users);
				this.setState({
					results: users
				});
			}
		  }, ["%" + text + "%"]);
    }

    /*
     * @returns the components which needs to be rendered in this component.
     */
    render() {
      let leftContent = this.props.leftContent;
      let middleContent = <Title>{this.props.middleTitle}</Title>;
      if(this.props.middleContent)
      {
        middleContent = this.props.middleContent;
      }else if(this.props.middleSearch)
      {
        middleContent = (<Item rounded style={styles.searchItem}>
                            <Input placeholder='Search' ref="searchInp" onChangeText={this.searchr} onFocus={this.focusChecker} onBlur={this.blurLogic}/>
                            <Text onPress={() => this.setState({currSearch: "", searching: false})} style={{fontSize: 25, width: 30, height: 32, display: "none"}}>×</Text>
                        </Item>);
        if(this.state.searching)
        {
            leftContent = <Button transparent onPress={() => {
                this.setState({searching: false, currSearch: false, results: []});
                this.refs.searchInp._root.blur();
            }}>
                <Icon name="chevron-left" type="FontAwesome" style={{fontSize: 18}}/>
            </Button>;
        }
      }
        return (
        <React.Fragment>
            <Head>
                <Left>
                    {
                        leftContent ? leftContent : null
                    }
                </Left>
                <Body>
                    {
                        middleContent
                    }
                </Body>
                <Right>
                    {
                        this.props.rightContent ? this.props.rightContent : null
                    }
                </Right>
            </Head>
            {
                this.state.searching ?
                    <View style={{width: "100%", "height": "90%", position: "absolute", top: 64, left: 0, zIndex: 99999, backgroundColor: "#FFF"}}>
                                        <ScrollView>
                                        <List>
                                            {
                                                this.state.results.map((result, key) => <ListItem onPress={() => navigate("Profile", this, {id: result.id})} key={key}>
                                                    <Left>
                                                            <Text style={{color: "#969696"}}>
                                                                {maxString(result.id)}#
                                                            </Text>
                                                            <Text>{maxString(result.name, 20)}</Text>
                                                    </Left>
                                                    <Right>
                                                            <Icon name="arrow-forward" />
                                                    </Right>
                                                </ListItem>)
                                            }
                                        </List>
                                        </ScrollView>
                    </View>
                : null
            }
        </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    searchItem: {
        height: 30,
        width: 250,
        backgroundColor: "#FFF",
      }
});
