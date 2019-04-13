import React from 'react';
import { StyleSheet, TextInput, View, KeyboardAvoidingView } from 'react-native';
import { Container, Header, Content, Card, CardItem, Body, Text, List, ListItem, Left, Right, Icon, Button } from 'native-base';
import {api} from "./baseFunctions";
class MessagesPage extends React.Component {
	constructor()
	{
		super();
		this.state = {
			myID: "Eyo",
			selectedMessage: false,
			messages: [],
			currMsg: "",
		}
	}
	componentWillMount()
	{
		this.syncMessages();
	}
	syncMessages = async () => {
		let messages = await api("messages");
		this.setState({messages});
	}
	getMessages = (to, senderID) => {
		let ret = this.state.messages.filter(message => (message.receiver === senderID && message.sender === to) || (message.receiver === to && message.sender === senderID));
		console.log("Messages", ret);
		return ret;
	}
	sendMessage = async () => {
		let data = await api("messages", {}, "POST", {
			sender: this.props.user.id,
			body: this.state.currMsg,
			receiver: this.state.selectedMessage
		});
		
		if(typeof data === "string")
		{
			this.setState({currMsg: ""});
			this.syncMessages();
		}
	}
  render() {
		let myMessages = this.state.messages.filter(message => message.sender === this.props.user.id || message.receiver === this.props.user.id);
		let unique = [];
		myMessages.forEach(message => {
			let id = message.sender === this.props.user.id ? message.receiver : message.sender;
			if(unique.indexOf(id) === -1)
			{
				unique.push(id);
			}
		});

		return (<Container>
        <Header />
        <Content>
        	{
        		this.state.selectedMessage ? 
						<View>
							{
								this.getMessages(this.state.selectedMessage, this.props.user.id).map((message, key) => <Card style={[styles.messageCard, styles[message.sender === this.props.user.id ? "meCard" : "otherCard"]]} key={key}>
									<CardItem bordered>
										<Body>
											<Text>
												{message.body}
											</Text>
										</Body>
									</CardItem>
									<CardItem footer>
										<Text>{message.sender}</Text>
									</CardItem>
								</Card>)
							}
							<View>
								<TextInput
											style={{height: 40, borderColor: 'gray', borderWidth: 1,}}
											onChangeText={(text) => this.setState({currMsg: text})}
											value={this.state.currMsg}
										/>
								<Button onPress={() => this.sendMessage()}>
									<Text> >> </Text>
								</Button>
							</View>
						</View>
        		: <List>
								{
									unique.map((chat, key) => <ListItem onPress={() => this.setState({selectedMessage: chat})} key={key}>
											<Left>
												<Text>{chat}</Text>
											</Left>
											<Right>
												<Icon name="arrow-forward" />
											</Right>
										</ListItem>)
								}
		            
		            
		          </List>
        	}
        </Content>
      </Container>);
  }
}

export default MessagesPage;//autoMap(MessagesPage);

const styles = StyleSheet.create({
	messageCard: {
		width: "90%"
	},
	meCard: {
		marginLeft: "8%"
	},
	otherCard: {
		marginRight: "8%"
	},
	bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 36
	},
	container: {
    flex: 1,
    alignItems: 'center'
  },
	
});
