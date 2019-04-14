import React from 'react';
import { StyleSheet, ScrollView, TouchableHighlight } from 'react-native';

import Header from "./Header";
import { Container, Text, List, ListItem, Left, Right, Icon, Button, CheckBox } from 'native-base';

import { syncUsers, transaction, syncBasic } from "../baseFunctions";
export default class UserSelectorModal extends React.Component {
  constructor()
  {
    super();
    this.state = {
      users: []
    };
  }
  componentWillMount()
  {
    this.userCheck();
  }
  userCheck = async () => {
    await this.listUsers();
    await syncBasic(this.props.db, "users");
    await syncBasic(this.props.db, "follows", "stamp");
    //await syncUsers(this.props.db);
    await this.listUsers();
  }
  listUsers = async () => {
    let users = await transaction(this.props.db, "SELECT * FROM users WHERE id != ?", [this.props.user.id]);
    console.log(users);
    this.setState({
      users: users._array,
    });
  }
  render() {
    return (<Container>
      <Header
        leftContent={<Button transparent onPress={() => this.props.select(false)}>
          <Icon name="chevron-left" type="FontAwesome" style={{fontSize: 18}}/>
        </Button>}
        middleTitle={"Users"}
        rightContent={<Button transparent><Text style={styles.header}>Select</Text></Button>}
        />
        <ScrollView>
          <List>
            {
              this.state.users.map((user, key) => <ListItem key={key} onPress={() => this.props.select(user.id)}>
                 {/*
                  <Left>
                    <Text>{user.name}</Text>
                  </Left>
                  <Right>
                    <CheckBox checked={false} color="blue"/>
                  </Right>
                  */}
                    <Text>{user.name}</Text>
                </ListItem>)
            }
            </List>
          </ScrollView>
        </Container>
        );
  }
}

const styles = StyleSheet.create({
  header: {

  },
  touchable: {
    height: "100%", 
    width: "100%",
    flex: 1,
    alignItems: 'center',
    justifyContent: "flex-start",
  }
});
