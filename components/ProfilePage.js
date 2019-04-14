import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationEvents } from "react-navigation";
import { Container, Content, Text, Icon, Button, Grid, Col } from 'native-base';
import { def, transaction, api, syncBasic, navigate } from "./baseFunctions";
import Header from "./UI/Header";
export default class ProfilePage extends React.Component {
  constructor(props)
  {
    super(props);
    this.state = {
      userID: props.navigation.state.params ? props.navigation.state.params.id : props.user.id,
      userData: {},
      liked: false,
    };
  }
  componentFocus = (payload) => {
    this.setState({
      userID: payload.action.params ? payload.action.params.id : this.props.user.id,
      userData: {},
      liked: false
    });
    requestAnimationFrame(async () => {
      this.findUser();

      await this.didLike();
      await syncBasic(this.props.db, "follows", "stamp");
      await this.didLike();
    });
  }
  like = async (doLike) => {
    if(doLike)
    {
      await api("follows", {}, "POST", {
        follower: this.props.user.id,
        followee: this.state.userID
      });
    }else{
      await api("follows", {
        follower: {
          t: "=",
          v: this.props.user.id
        },
        followee: {
          t: "=",
          v: this.state.userID
        },
      }, "DELETE");
    }
    await syncBasic(this.props.db, "follows", "stamp");
    await this.didLike();
  }
  didLike = async () => {
    let data = await transaction(this.props.db, "SELECT stamp FROM follows WHERE follower = ? AND followee = ?", [this.props.user.id, this.state.userID]);
    this.setState({liked: data.length > 0});
  }
  findUser = async () => {
    let data = await transaction(this.props.db, "SELECT * FROM users WHERE id = ?", [this.state.userID]);
    if(data.length > 0)
    {
      this.setState({
        userData: data._array[0]
      });
    }else{
      await syncBasic(this.props.db, "users");
      this.findUser();
    }
  }
  render() {
    
    return (<Container>
              <NavigationEvents onWillFocus={this.componentFocus}/>
             <Header 
              leftContent={this.state.userID === this.props.user.id ? <Button transparent onPress={this.props.signOut} style={{width: 50}}>
                      <Icon name="sign-out" type="FontAwesome" style={{fontSize: 20}}/>
                    </Button> : false}
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
            <Grid style={styles.infoContainer}>
              <Col style={styles.flex} onPress={() => navigate("Messages", this, {id: this.state.userData.id})}>
                <Icon name="envelope" type="FontAwesome"/>
                <Text>Message</Text>
              </Col>
              <Col style={styles.flex}>
                <Text style={styles.bigText}>0</Text>
                <Text>Posts</Text>
              </Col>
              <Col style={styles.flex}>
                <Text style={styles.bigText}>0</Text>
                <Text>Likes</Text>
              </Col>
              <Col style={styles.flex} onPress={() => this.like(!this.state.liked)}>
                <Icon name={this.state.liked ? "heart" : "heart-o"} type="FontAwesome"/>
                <Text>{this.state.liked ? "Unlike" : "Like"}</Text>
              </Col>
            </Grid>
            <Text>
                Posts here..
            </Text>
        </Content>
      </Container>);
  }
}

const styles = StyleSheet.create({
  infoContainer: {
    height: 75,
    backgroundColor: "rgba(238, 238, 238, 0.3)",
  },
  flex: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bigText: {
    fontSize: 28,
  },
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
