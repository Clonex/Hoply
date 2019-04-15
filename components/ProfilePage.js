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
    this.blankState = {
      userID: props.navigation.state.params ? props.navigation.state.params.id : props.user.id,
      userData: {},
      liked: false,
      follows: 0,
      following: 0,
      posts: 0,
    };
    this.state = {...this.blankState};
  }
  componentFocus = (payload) => {
    let state = {...this.blankState};
    state.userID = payload.action.params ? payload.action.params.id : this.props.user.id;
    this.setState(state);
    requestAnimationFrame(async () => {
      this.findUser();

      await this.getDBinfo();
      await syncBasic(this.props.db, "follows", "stamp");
      await this.getDBinfo();
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
    await this.getDBinfo();
  }
  getDBinfo = async () => {
    let data = await transaction(this.props.db, "SELECT stamp FROM follows WHERE follower = ? AND followee = ?", [this.props.user.id, this.state.userID]);

    
    let likes = await transaction(this.props.db, "SELECT COUNT(stamp) as count FROM follows WHERE followee = ?", [this.state.userID]);
    let liked = await transaction(this.props.db, "SELECT COUNT(stamp) as count FROM follows WHERE follower = ?", [this.state.userID]);
    
    this.setState({liked: data.length > 0, follows: likes._array[0].count, following: liked._array[0].count});
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
              <View style={{width: "100%", height: 250}}>

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
                <Icon name="envelope" type="FontAwesome" style={styles.infoText}/>
                <Text style={styles.infoSubText}>Message</Text>
              </Col>
              <Col style={styles.flex}>
                <Text style={styles.infoText}>{this.state.posts}</Text>
                <Text style={styles.infoSubText}>Posts</Text>
              </Col>
              <Col style={styles.flex}>
                <Text style={styles.infoText}>{this.state.follows}</Text>
                <Text style={styles.infoSubText}>Likes</Text>
              </Col>
              <Col style={styles.flex}>
                <Text style={styles.infoText}>{this.state.following}</Text>
                <Text style={styles.infoSubText}>Liked</Text>
              </Col>
              <Col style={styles.flex} onPress={() => this.like(!this.state.liked)}>
                <Icon name={this.state.liked ? "heart" : "heart-o"} type="FontAwesome" style={styles.infoText}/>
                <Text style={styles.infoSubText}>{this.state.liked ? "Unlike" : "Like"}</Text>
              </Col>
            </Grid>
              </View>
        <Content>
            <Text>
                Posts here..
            </Text>
        </Content>
      </Container>);
  }
}

const styles = StyleSheet.create({
  infoText: {
    fontSize: 15,
  },
  infoSubText: {
    fontSize: 13,
  },
  infoContainer: {
    height: 48,
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
