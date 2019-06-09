import React from 'react';
import { StyleSheet, Text, ActivityIndicator, AsyncStorage } from 'react-native';
import { Container, Content, Form, Item, Input, Button, View, ActionSheet } from 'native-base';
import uuid from "uuid/v4";

import { api } from "./baseFunctions";

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

  componentDidMount()
  {
    this.loginCheck();
  }

  loginCheck = async () => {
    const data = await AsyncStorage.getItem('login');
    if(data !== null)
    {
      this.setState({
        loading: true,
        loadingText: "Checking login..",
      });
      requestAnimationFrame(() => this.setUser(JSON.parse(data)));
    }
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
   * Sets the current user as the one given in @param data.
   */
  setUser = async (data) => {
    AsyncStorage.setItem('login', JSON.stringify(data));

    this.props.ViewModel.setUserID(data.id);
    await this.props.ViewModel.get("users");
    await this.props.ViewModel.get("follows");
    
    this.setState({
      loadingText: "Syncing data..",
    });

    await this.props.ViewModel.get("messages");

    setInterval(async () => {
      await this.props.ViewModel.get("messages");
    }, 3000);
    
    this.props.updateData("user", data);
  }

  /*
   * Checks whenever a user exists in the remote database, and saves the info if its correct.
   */
  checkLogin = async () => {
    this.setState({
      loading: true,
      loadingText: "Checking credentials..",
    });
    let data = await api("users", {name: {t: "=", v: this.state.username}});
    if(data.length > 0)
    {
     if(data.length > 1)
     {
        ActionSheet.show({
          options: [
            ...data.map(d => d.id + "#" + d.name),
            "Cancel",
          ],
          cancelButtonIndex: data.length,
          title: "Multiple accounts found!"
        }, buttonIndex => {
          if(buttonIndex === data.length)
          {
            this.setState({
                loading: false,
                loadingText: false,
              });
          }else{
            this.setUser(data[buttonIndex]);
          }
        });
     }else{
       this.setUser(data[0]);
     }
    }else{
      alert("User not found!");
      this.setState({
        loading: false,
        loadingText: false,
      });
    }
  }

  /*
   *
   */
  render() {
    return (<Container>
        {
          this.state.loading ?
            <View style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.75)", zIndex: 999999, flex: 1, alignItems: "center", justifyContent: "center"}}>
              <ActivityIndicator size="large" color="#FFF" />
              {
                this.state.loadingText ?
                  <Text style={{color: "#FFF"}}>{this.state.loadingText}</Text>
                : null
              }
            </View>
          : null
        }
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
