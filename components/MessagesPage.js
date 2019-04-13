import React from 'react';
import { StyleSheet } from 'react-native';
import { Container, Header, Content, Card, CardItem, Body, Text, List, ListItem, Left, Right, Icon } from 'native-base';


export default class MessagesPage extends React.Component {
	constructor()
	{
		super();
		this.state = {
			myID: "Eyo",
			selectedMessage: false,
			messages: [{
				from: "martin",
				text: "Hej m8"
			},{
				from: "Eyo",
				text: "Hva så dood"
			},{
				from: "martin",
				text: "Fis af med dig!"
			}]
		}
	}

  render() {
    return (<Container>
        <Header />
        <Content>
        	{
        		this.state.selectedMessage ? 
        			this.state.messages.map(message => <Card style={[styles.messageCard, styles[message.from === this.state.myID ? "meCard" : "otherCard"]]}>
		            <CardItem bordered>
		              <Body>
		                <Text>
		                   {message.text}
		                </Text>
		              </Body>
		            </CardItem>
		            <CardItem footer>
		              <Text>{message.from}</Text>
		            </CardItem>
		          </Card>)
        		: <List>
		            <ListItem selected>
		              <Left>
		                <Text>Simon Mignolet</Text>
		              </Left>
		              <Right>
		                <Icon name="arrow-forward" />
		              </Right>
		            </ListItem>
		            <ListItem>
		             <Left>
		                <Text>Nathaniel Clyne</Text>
		              </Left>
		              <Right>
		                <Icon name="arrow-forward" />
		              </Right>
		            </ListItem>
		            <ListItem>
		              <Left>
		                <Text>Dejan Lovren</Text>
		              </Left>
		              <Right>
		                <Icon name="arrow-forward" />
		              </Right>
		            </ListItem>
		          </List>
        	}
        </Content>
      </Container>);
  }
}

const styles = StyleSheet.create({
	messageCard: {
		width: "90%"
	},
	meCard: {
		marginRight: "8%"
	},
	otherCard: {
		marginLeft: "8%"
	}
});
