import React from 'react';
import { StyleSheet, TextInput, View, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Container, Content, Card, CardItem, Body, Text, List, ListItem, Left, Right, Icon, Button } from 'native-base';
import Header from "./UI/Header";
import {api} from "./baseFunctions";
class MessagesPage extends React.Component {
	constructor()
	{
		super();
		this.state = {
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
		console.log("SendtMSG", data);
		if(data === 200 || data === 201)
		{
			this.setState({currMsg: ""});
			this.syncMessages();
		}
	}
	focusChat = (id) => {
		this.setState({
			selectedMessage: id,
			currMsg: "",
		});
	};
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
						<Header
							leftContent={this.state.selectedMessage ? 
							<Button transparent onPress={() => this.focusChat(false)}>
								<Icon name="chevron-left" type="FontAwesome" style={{fontSize: 18}}/>
							</Button> : false}
							middleTitle={this.state.selectedMessage ? this.state.selectedMessage : "Messages"}
							rightContent={this.state.selectedMessage ? <Button transparent><Text style={styles.header}>Invite</Text></Button> : <Button transparent><Text style={styles.header}>+</Text></Button>}
							/>
        	{
        		this.state.selectedMessage ? 
						<KeyboardAvoidingView behavior="position" keyboardVerticalOffset={-28} enabled>
							<View style={{height: "92%", overflow: "scroll"}}>
								<ScrollView ref="scrollr" onContentSizeChange={(contentWidth, contentHeight)=>{        
										this.refs.scrollr.scrollToEnd({animated: false});
								}}>
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
								</ScrollView>
							</View>
							<View style={{ flexDirection: "row", flex: 1, justifyContent: 'space-between', padding: 5 }}>
									<TextInput
											style={{height: 40, width: "85%", borderColor: 'rgba(6, 6, 6, 0.29)', borderWidth: 1,}}
											onChangeText={(text) => this.setState({currMsg: text})}
											value={this.state.currMsg}
									/>
									<Button light onPress={() => this.sendMessage()} style={{height: 40, width: "15%", flex: 1, justifyContent: "center", alignContent: "center"}}>
										<Icon name="paper-plane" type="FontAwesome"/>
									</Button>
							</View>
						</KeyboardAvoidingView>
        		: <List>
								{
									unique.map((chat, key) => <ListItem onPress={() => this.focusChat(chat)} key={key}>
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

  header: {fontSize: 20}
	
});
