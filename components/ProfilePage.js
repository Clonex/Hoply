import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationEvents } from "react-navigation";
import { Container, Content, Text, Icon, Button } from 'native-base';
import { def, transaction, api, syncUsers } from "./baseFunctions";
import Header from "./UI/Header";
export default class ProfilePage extends React.Component {
  constructor(props)
  {
    super(props);
    this.state = {
      userID: props.navigation.state.params ? props.navigation.state.params.id : props.user.id,
      userData: {}
    };
  }
  componentFocus = (payload) => {
    this.setState({
      userID: payload.action.params ? payload.action.params.id : this.props.user.id,
      userData: {}
    });
    requestAnimationFrame(() => this.findUser());
  }
  findUser = async () => {
    let data = await transaction(this.props.db, "SELECT * FROM users WHERE id = ?", [this.state.userID]);
    if(data.length > 0)
    {
      this.setState({
        userData: data._array[0]
      });
    }else{
      await syncUsers(this.props.db);
      this.findUser();
    }
  }
  render() {
    return (<Container>
              <NavigationEvents onWillFocus={this.componentFocus}/>
             <Header 
							middleTitle={def(this.state.userData.name, "Profile")}
							rightContent={<Button transparent>
															<Icon name="user" type="FontAwesome" style={{fontSize: 20}}/>
														</Button>}
                
              db={this.props.db}
              navigation={this.props.navigation}
							/>
        <Content>
            <View style={styles.topBG}>
              <Text style={styles.bigTitle}>
                  {def(this.state.userData.name)}
              </Text>
              <Text style={styles.subTitle}>
                  {def(this.state.userData.id)}
              </Text>
            </View>
            <Text>
                Posts here..
            </Text>
        </Content>
      </Container>);
  }
}

const styles = StyleSheet.create({
  topBG: {
    backgroundColor: "#efefef",
    height: 120,
    width: "100%",

    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchItem: {
    height: 30,
    width: 250,
    backgroundColor: "#FFF",
  },
  bigTitle: {
    fontWeight: "bold",
    fontSize: 32,
  },
  subTitle: {
    fontSize: 12,
  }
});
