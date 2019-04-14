import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { Container, Header, Content, Form, Item, Input, Button } from 'native-base';
import {api, query, transaction, syncUsers} from "./baseFunctions";
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
  componentWillMount()
  {
    syncUsers(this.props.db);
    //this.updateUsers();
  }
  

  syncData = async () => {
    let messages = await api("messages");
    
    try {

      this.props.db.transaction(tx => {
        tx.executeSql('insert into items (done, value) values (0, ?)', ["Hejsa"]);
        tx.executeSql('select * from items', [], (_, { rows }) =>
          console.log("Haaaalloooew", JSON.stringify(rows))
        );
        
        console.log("inserting", messages, tx, this.props.db);
        //let message = messages[0];
        messages.map(message => tx.executeSql('insert into messages (sender, reciever, body, stamp) values (?, ?, ?, ?)', [message.sender, message.reciever, message.body, message.stamp]));
        //tx.executeSql('insert into messages (sender, reciever, body, stamp) values (?, ?, ?, ?)', [message.sender, message.reciever, message.body, message.stamp]);
        //tx.executeSql('INSERT INTO messages (sender, receiver, body, stamp) VALUES ("Test", "Test", "Test", "Test")', [], (a, b) => console.log("Insert result", a, b));
        tx.executeSql('select * from messages', [], (_, { rows }) =>
          console.log("22Haaaalloooew", JSON.stringify(rows))
        );
        /*let message = messages[0];
        tx.executeSql('INSERT INTO messages (sender, receiver, body, stamp) VALUES (?, ?, ?, ?)', [message.sender, message.receiver, message.body, message.body], (a, b) => console.log("Insert result", a, b));
        //messages.map(message => );
        setTimeout(() => {
          tx.executeSql('SELECT * FROM messages', [], (_, { rows }) => console.log("Data", rows));
          
        }, 500);*/
      });
    } catch(e)
    {
      console.log(e);
    }
  }
  createUser = async () => {
    let id = uuid();
    let data = await api("users", {}, "POST", {id, name: this.state.username});
    if(data === 200 || data === 201)
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
