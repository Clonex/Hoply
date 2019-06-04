import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { Container, Header, Content, Form, Item, Input, Button } from 'native-base';
import {api, syncMessages, transaction, syncUsers} from "./baseFunctions";

import uuid from "uuid/v4";

export default class LoginPage extends React.Component {
  
  /*
   *
   */
  constructor()
  {
    super();
    this.state = {
      username: "Eyo",
      loading: false,
    };
  }

  /*
   *
   */
  componentWillMount()
  {
    //syncUsers(this.props.db);
  }

  /*
   * Checks whenever a user exists in the remote database, and adds if it dosent exist.
   */
  createUser = async () => {
    let userCheck = await api("users", {name: {t: "=", v: this.state.username}});
    if(userCheck.length === 0)
    {
      let id = uuid();
      let data = await api("users", {}, "POST", {id, name: this.state.username});
      if(data === 200 || data === 201)
      {
        this.checkLogin();
      }
    }else{
      alert("Username is already in use!");
    }
  }

  /*
   * Checks whenever a user exists in the remote database, and saves the info if its correct.
   */
  checkLogin = async () => {
    let data = await api("users", {name: {t: "=", v: this.state.username}});
    if(data.length > 0)
    {
     //await this.props.ViewModel.sync("messages");
      this.props.updateData("user", data[0]);
      //syncMessages(this.props.db);
    }else{
      alert("User not found!");
    }
  }

  /*
   *
   */
  render() {
    return (<Container>
        <Content contentContainerStyle={styles.content}>
          <Form>
            <Item>
              <Input placeholder="Username" onChangeText={(text) => this.setState({username: text})} onSubmitEditing={this.checkLogin}/>
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
