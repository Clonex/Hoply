import React from 'react';
import { StyleSheet, Text, View, Button, FlatList, TextInput, TouchableHighlight  } from 'react-native';

import {api} from "./components/baseFunctions";
import LoginPage from "./components/LoginPage";
import MessagesPage from "./components/MessagesPage";

export default class App extends React.Component {
  constructor()
  {
    super();
    this.state = {
      users: [],
      userName: false,
    };
  }
  componentWillMount()
  {
    this.test();
  }
  test = async () => {
    let data = await api();
    console.log(data);
    this.setState({
      users: data.reverse(),
      userName: false
    });
  }
  addUser = async () => {
    //{"id": "n", "name": "1"}
    let addRequest = await api("users", "POST", {"id": this.state.userName, "name": this.state.userName});
    console.log("Resp", addRequest);
    this.test();
  }
  removeUser = async (data) => {
    //http://caracal.imada.sdu.dk:80/app2019/follows?followee=&follower=&stamp=
    //http://caracal.imada.sdu.dk:80/app2019/users?id=&name=&stamp=
    let resp = await api("users?id=" + data.id + "&name=" + data.id + "&stamp=" + data.stamp, "DELETE");
    console.log("users?id=" + data.id + "&name=" + data.id + "&stamp=" + data.stamp, resp);
    this.test();
  }

  render() {
    return (<MessagesPage/>);
    return (<LoginPage/>);
    return (
      <View style={styles.container}>
        <TextInput 
          style={{height: 40}}
          placeholder="User name"
          value={this.state.userName}
          onChangeText={(text) => this.setState({userName: text})}
        />
        <Button onPress={this.addUser} title="Add user"/>
        <FlatList
          data={this.state.users.map(user => {
            return {
              key: user.name,
              user: user,
            }
          })}
          renderItem={({item}) => <View style={{flex: 1}}>
            <Text style={styles.item}>{item.key}</Text>
            <TouchableHighlight onPress={() => this.removeUser(item.user)}>
              <View style={{width: 150, height: 30, backgroundColor: "rgba(128, 128, 128, 0.4)"}}>
                <Text style={{marginLeft: 15, marginTop: 5}}>Remove me bby</Text>
              </View>
            </TouchableHighlight>
          </View>}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
   flex: 1,
   paddingTop: 22
  },
  item: {
    padding: 10,
    fontSize: 12,
    height: 44,
  },
});
