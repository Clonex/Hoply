import React from 'react';
import { NavigationEvents } from "react-navigation";
import { StyleSheet, TextInput, View, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Container, Content, Card, CardItem, Body, Text, List, ListItem, Left, Right, Icon, Button , Input, Item} from 'native-base';
import Header from "./UI/Header";
import UserSelectorModal from "./UI/UserSelectorModal";
import {api, navigate, syncMessages, transaction} from "./baseFunctions";
class MessagesPage extends React.Component {
	constructor()
	{
		super();
		this.interval = false;
		this.blankState = {
			selectedMessage: false,
			messages: [],
			currMsg: "",
			selectingUser: false,
		};
		this.state = {...this.blankState};
	}
	blurred = async (payload) => {
		clearInterval(this.interval);
	}
	mounted = async (payload) =>
	{
		console.log("Mounted", payload);
		let state = {...this.blankState};
		if(payload.action.params)
		{
			state.selectedMessage = payload.action.params.id;
		}
		this.setState(state);
		await this.dbMessages();
		await syncMessages(this.props.db);
		await this.dbMessages();

		this.interval = setInterval(() => syncMessages(this.props.db), 1500);
	}

	dbMessages = async () => {
		let data = await transaction(this.props.db, "SELECT * FROM messages ORDER BY id DESC");
		this.setState({
			messages: data._array
		});
	}

	getMessages = (to, senderID) => {
		let ret = this.state.messages.filter(message => (message.receiver === senderID && message.sender === to) || (message.receiver === to && message.sender === senderID));
		return ret.reverse();
	}
	sendMessage = async () => {
		if(this.state.currMsg.length > 0)
		{
			let data = await api("messages", {}, "POST", {
				sender: this.props.user.id,
				body: this.state.currMsg,
				receiver: this.state.selectedMessage
			});
			if(data === 200 || data === 201)
			{
				this.setState({currMsg: ""});
				await syncMessages(this.props.db);
				await this.dbMessages();
			}
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
		if(this.state.selectingUser)
		{
			return <UserSelectorModal 
								db={this.props.db}
								user={this.props.user}
								select={(selected) => {
									if(!selected)
									{
										this.setState({selectingUser: false});
									}else{
										this.setState({selectingUser: false, selectedMessage: selected});
									}
								}}
							/>;
		}
		return (<Container>
						<NavigationEvents onWillFocus={this.mounted} onWillBlur={this.blurred}/>
						<Header
							leftContent={this.state.selectedMessage ? 
							<Button transparent onPress={() => this.focusChat(false)} style={{width: 50}}>
								<Icon name="chevron-left" type="FontAwesome" style={{fontSize: 18}}/>
							</Button> : false}
							middleContent={this.state.selectedMessage ? 
															<Text onPress={() => navigate("Profile", this, {id: this.state.selectedMessage})}>
																{this.state.selectedMessage}
															</Text>
															:
															<Text>Messages</Text>
														}
							middleTitle={this.state.selectedMessage ? this.state.selectedMessage : "Messages"}
							rightContent={this.state.selectedMessage ? 
							<Button transparent style={{width: 50}}>
								<Text style={styles.header}>Invite</Text>
							</Button>
							 : 
							<Button transparent onPress={() => this.setState({selectingUser: true})} style={{width: 60}}>
								<Text style={styles.header}>+</Text>
							</Button>}
							/>
        	{
        		this.state.selectedMessage ? 
						<KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={30} enabled>
							<View style={{height: "90%", overflow: "scroll"}}>
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
									{/*<Input
											style={{height: 40, width: "85%",}}
											onChangeText={(text) => this.setState({currMsg: text})}
											value={this.state.currMsg}
											onSubmitEditing={this.sendMessage}
									/>
									<Button light onPress={this.sendMessage} style={{height: 40, width: "15%", flex: 1, justifyContent: "center", alignContent: "center"}}>
										<Icon name="paper-plane" type="FontAwesome"/>
									</Button>*/}
									<Item rounded style={{width: "100%", height: 40}}>
										<Input 
											placeholder='Message..'
											onChangeText={(text) => this.setState({currMsg: text})}
											value={this.state.currMsg}
											onSubmitEditing={this.sendMessage}
											/>
										<Icon onPress={this.sendMessage} active name="paper-plane" type="FontAwesome" />
									</Item>
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
