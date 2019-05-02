import React from 'react';
import { NavigationEvents } from "react-navigation";
import { StyleSheet, View, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Container, Card, CardItem, Body, Text, List, ListItem, Left, Right, Icon, Button , Input, Item, Grid, Row} from 'native-base';
import {ImagePicker, Permissions} from "expo";

import Header from "./UI/Header";
import Message from "./UI/Message";
import UserSelectorModal from "./UI/UserSelectorModal";
import {api, navigate, syncMessages, transaction, ISOparser, CMDbuilder} from "./baseFunctions";


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
		let data = await transaction(this.props.db, `SELECT 
																											*, 
																											(SELECT name FROM users WHERE id = messages.sender LIMIT 1) as senderName, 
																											(SELECT name FROM users WHERE id = messages.receiver LIMIT 1) as receiverName
																									FROM messages 
																									ORDER BY id DESC`);
		this.setState({
			messages: data._array
		});
	}
	askPermissionsAsync = async () => {
		const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
    return status === "granted";
	}
	takePicture = async () => {
		let hasPerm = await this.askPermissionsAsync();
		if(hasPerm)
		{
			let pickerResult = await ImagePicker.launchCameraAsync({
        base64: true,
        exif: false,
        quality: 0.3,
        allowsEditing: true,
        aspect: [4, 3],
      });
      if(!pickerResult.cancelled)
      {
      	let data = await api("messages", {}, "POST", {
					sender: this.props.user.id,
					body: CMDbuilder("BIN", "data:image/jpeg;base64," + pickerResult.base64),
					receiver: this.state.selectedMessage
				});
				if(data === 200 || data === 201)
				{
					await syncMessages(this.props.db);
					await this.dbMessages();
				}
      }
		}
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
	senderOrRecieverName = (uID, message) => {
		return message.sender === uID ? message.senderName : message.receiverName;
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
		let userMessages = this.getMessages(this.state.selectedMessage, this.props.user.id);
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
		let userTitle = userMessages.length > 0 ? this.senderOrRecieverName(this.state.selectedMessage, userMessages[0]) : this.state.selectedMessage;
		console.log(userMessages);
		return (<Container>
						<NavigationEvents onWillFocus={this.mounted} onWillBlur={this.blurred}/>
						<Header
							leftContent={this.state.selectedMessage ? 
							<Button transparent onPress={() => this.focusChat(false)} style={{width: 50}}>
								<Icon name="chevron-left" type="FontAwesome" style={{fontSize: 18}}/>
							</Button> : false}
							middleContent={this.state.selectedMessage ? 
															<Text onPress={() => navigate("Profile", this, {id: this.state.selectedMessage})}>
																{userTitle}
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
									userMessages.map((message, key) =>  <Message key={key} data={message} user={this.props.user}/>)
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
										<Icon onPress={this.sendMessage} active name="map-marker" type="FontAwesome" />
										<Icon onPress={this.takePicture} active name="camera" type="FontAwesome" />
										<Icon onPress={this.sendMessage} active name="paper-plane" type="FontAwesome" />
									</Item>
							</View>
						</KeyboardAvoidingView>
        		: <ScrollView>
								<List>
									{
										unique.map((chat, key) => {
											let latestMsg = this.getMessages(chat, this.props.user.id);
											return (<ListItem onPress={() => this.focusChat(chat)} key={key}>
												<Left>
													<Grid>
														<Row>
															<Left>
																<Text style={{height: 20}}>{this.senderOrRecieverName(chat, latestMsg[0])}</Text>
															</Left>
															<Right style={{alignSelf: 'stretch'}}>
																<Text style={{height: 20, fontSize: 10, textAlign: "center", flex: 1}} textAlign="right">{ISOparser(latestMsg[latestMsg.length - 1].stamp)}</Text>
															</Right>
														</Row>
														<Row style={{marginTop: 5}}>
															<Text style={{fontSize: 10}}>{latestMsg[latestMsg.length - 1].body.length > 40 ? (latestMsg[latestMsg.length - 1].body.substring(0, 40) + "..") : latestMsg[latestMsg.length - 1].body}</Text>
														</Row>
													</Grid>
													
													
												</Left>
												<Right>
													<Icon name="arrow-forward" />
												</Right>
											</ListItem>);
										})
									}
		          	</List>
							</ScrollView>
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
