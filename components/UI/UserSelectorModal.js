import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';

import Header from "./Header";
import { Container, Text, List, ListItem, Left, Right, Icon, Button, CheckBox } from 'native-base';

import { ViewModel } from "../baseFunctions";
export default class UserSelectorModal extends React.Component {

  /*
   *
   */
  constructor(props)
  {
    super(props);
    this.state = {
      users: [],
      selected: [],
    };
    this.ViewModel = new ViewModel(props.db);
  }

  /*
   *
   */
  componentWillMount()
  {
    this.ViewModel.get("listUsers", (data) => {
      this.setState({
        users: data,
      });
    }, [this.props.user.id]);
  }

  /*
   *
   */
  selectUsr = (uID) => {
    let selected = [...this.state.selected];
    if(selected.indexOf(uID) !== -1)
    {
      selected = selected.filter(ID => uID !== ID);
    }else{
      selected.push(uID);
    }
    this.setState({selected});
  }

  /*
   *
   */
  render() {
    return (<Container>
      <Header
        leftContent={<Button transparent onPress={() => this.props.select(false)} style={{width: 50}}>
          <Icon name="chevron-left" type="FontAwesome" style={{fontSize: 18}}/>
        </Button>}
        middleTitle={"Users"}
        rightContent={<Button transparent style={{width: 130}} onPress={() => this.props.select(this.state.selected)}>
                        <Text style={styles.header}>Start chat!</Text>
                      </Button>}
        />
        <ScrollView>
          <List>
            {
              this.state.users.map((user, key) => <ListItem key={key} onPress={() => this.selectUsr(user.id)}>
          
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
