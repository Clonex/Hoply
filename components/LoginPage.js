import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { Container, Header, Content, Form, Item, Input, Button } from 'native-base';
import {api} from "./baseFunctions";

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
    console.log(messages);
  }

  checkLogin = async () => {
    let data = await api("users", {name: {t: "=", v: this.state.username}});
    console.log(data);
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
          <Button full light transparent  rounded style={styles.loginBtn} disabled={this.state.username.length === 0}>
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
