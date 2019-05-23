import React from 'react';
import { StyleSheet, ScrollView, TouchableHighlight } from 'react-native';

import Header from "./Header";
import { Container, Text, List, ListItem, Left, Right, Icon, Button, CheckBox } from 'native-base';

import { ViewModel, syncUsers, transaction, syncBasic } from "../baseFunctions";
export default class UserSelectorModal extends React.Component {
  constructor()
  {
    super();
    this.state = {
      users: [],
      selected: [],
    };
    this.ViewModel = new ViewModel(this.props.db);
  }
  componentWillMount()
  {
    this.ViewModel.get("listUsers", (data) => {
      this.setState({
        users: data,
      });
    }, [this.props.user.id]);
    //this.userCheck();
  }
  /*userCheck = async () => {
    await this.listUsers();
    await syncBasic(this.props.db, "users");
    await syncBasic(this.props.db, "follows", "stamp");
    await this.listUsers();
  }*/
  /*listUsers = async () => {
    let users = await transaction(this.props.db, "SELECT * FROM users WHERE id != ?", [this.props.user.id]);
    console.log(users);
    this.setState({
      users: users._array,
    });
  }*/
  selectUsr = (uID) => {
    let selected = [...this.state.selected];
    if(selected.indexOf(uID) !== -1)
    {
      selected = selected.filter(ID => uID !== ID);
    }else{
      selected.push(uID);
    }
    this.state({selected});
  }
  render() {
    return (<Container>
      <Header
        leftContent={<Button transparent onPress={() => this.props.select(false)} style={{width: 50}}>
          <Icon name="chevron-left" type="FontAwesome" style={{fontSize: 18}}/>
        </Button>}
        middleTitle={"Users"}
        rightContent={<Button transparent style={{width: 60}} onPress={() => this.props.select(this.state.selected)}>
                        <Text style={styles.header}>Start chat!</Text>
                      </Button>}
        />
        <ScrollView>
          <List>
            {
              this.state.users.map((user, key) => <ListItem key={key} onPress={() => this.select(user.id)}>
          
                  <Left>
                    <Text>{user.name}</Text>
                  </Left>
                  <Right>
                    <CheckBox checked={this.state.selected.indexOf(user.id) !== -1} color="blue"/>
                  </Right>
                  
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
