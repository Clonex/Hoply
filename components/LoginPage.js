import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { Container, Header, Content, Form, Item, Input, Button } from 'native-base';
import {api} from "./baseFunctions";
import uuid from "uuid/v4";

export default class LoginPage extends React.Component {
  constructor()
  {
    super();
    this.state = {
      username: "Eyo",
      loading: false,
    };
  }
  syncData = async () => {
    let messages = await api("messages");
    
    try {

      this.props.db.transaction(tx => {
        console.log("inserting", messages);
        let message = messages[0];
        tx.executeSql('INSERT INTO messages (sender, receiver, body, stamp) VALUES (?, ?, ?, ?)', [message.sender, message.receiver, message.body, message.body]);
        //messages.map(message => );
        setTimeout(() => {
          tx.executeSql('SELECT * FROM messages', [], (_, { rows }) => console.log("Data", rows));
          
        }, 500);
      });
    } catch(e)
    {
      console.log(e);
    }
  }
  createUser = async () => {
    let id = uuid();
    let data = await api("users", {}, "POST", {id, name: this.state.username});
    if(data === 200)
    {
      this.checkLogin();
    }else{
      alert("Username is already in use!");
    }
    console.log(data);
  }
  checkLogin = async () => {
    let data = await api("users", {name: {t: "=", v: this.state.username}});
    if(data.length > 0)
    {
      this.props.updateData("user", data[0]);
      this.syncData();
    }else{
      alert("User not found!");
    }
  }
  render() {
    return (<Container>
        <Content contentContainerStyle={styles.content}>
          <Form>
            <Item>
              <Input placeholder="Username" onChangeText={(text) => this.setState({username: text})}/>
            </Item>
            {/*<Item last>
              <Input placeholder="Password" />
            </Item>*/}
          </Form>
          <Button full light rounded style={styles.loginBtn} disabled={this.state.username.length === 0} onPress={this.checkLogin}>
          	<Text>Login</Text>
          </Button>
          <Button full light transparent  rounded style={styles.loginBtn} disabled={this.state.username.length === 0} onPress={this.createUser}>
          	<Text>Create account</Text>
          </Button>
        </Content>
      </Container>);
  }
}

const styles = StyleSheet.create({
	content: {flex: 1, justifyContent: 'center', width: "80%", marginLeft: "10%"},
	loginBtn: {marginTop: 10}
});
