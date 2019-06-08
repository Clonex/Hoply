import React from 'react';
import {ImagePicker} from "expo";
import { StyleSheet, View, Alert, Image } from 'react-native';
import { NavigationEvents } from "react-navigation";
import { ActionSheet, Container, Content, Text, Icon, Button, Grid, Col  } from 'native-base';
import { ViewModel, def, transaction, api, navigate, getWall, askPermissionsAsync, CMDbuilder } from "./baseFunctions";
import Header from "./UI/Header";
import Cards from "./UI/Cards";

export default class ProfilePage extends React.Component {
  
  /*
   *
   */
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
      pb: false,
      postedData: [],
      loading: false,
    };
    this.state = {...this.blankState};
    this.ViewModel = new ViewModel(props.db);
  }

  /*
   * This function runs when the component is rendered. It find the profile info in the database, and checks for updates.
   */
  componentFocus = (payload) => {
    let state = {...this.blankState};
    state.userID = payload.action.params ? payload.action.params.id : this.props.user.id;
    this.setState(state);
    requestAnimationFrame(async () => {
      this.findUser();
      await this.getDBinfo();
      /*await this.props.ViewModel.sync("follows");
      await this.getDBinfo();*/
    });
  }

  /*
   * Used to follow/unfollow a user.
   */
  like = async (doLike) => {
    await this.props.ViewModel.do(doLike ? "like" : "unlike", {
      id: this.props.user.id,
      userID: this.state.userID
    });
    await this.getDBinfo();
  }

  /*
   *
   */
  getDBinfo = async () => {
    let data = await transaction(this.props.db, "SELECT stamp FROM follows WHERE follower = ? AND followee = ?", [this.props.user.id, this.state.userID]);
    let test = await transaction(this.props.db, "SELECT * FROM follows");
    console.log("Follwo data", test);
    
    let likes = await transaction(this.props.db, "SELECT COUNT(stamp) as count FROM follows WHERE followee = ?", [this.state.userID]);
    let liked = await transaction(this.props.db, "SELECT COUNT(stamp) as count FROM follows WHERE follower = ?", [this.state.userID]);
    let postedData = await getWall(this.props.db, this.state.userID);

    let pb = await transaction(this.props.db, "SELECT img FROM profilePicture WHERE userID = ? ORDER BY unixStamp DESC LIMIT 1", [this.state.userID]);
    console.log("PB", pb);
    this.setState({
      liked: data.length > 0,
      follows: likes._array[0].count,
      following: liked._array[0].count,
      pb: pb.length > 0 ? pb._array[0].img : false,
      postedData
    });
  }

  takePicture = async () => {
		this.setState({
			loading: true
		});
		let hasPerm = await askPermissionsAsync();
		if(hasPerm)
		{
			let pickerResult = await ImagePicker.launchCameraAsync({
        base64: true,
        exif: false,
        quality: 0.03,
        allowsEditing: true,
        aspect: [4, 3],
			});
			
      if(!pickerResult.cancelled)
      {
        let body = CMDbuilder("BIN", pickerResult.base64);
				this.props.ViewModel.do("pb", {
				 body
				}, () => {
          this.setState({
            pb: body
          });
        });
        
      }else{
				this.setState({
					loading: false
				});
			}
		}
	}


  /*
   * Gets the current profile info, from the ViewModel.
   */
  findUser = async () => {
    this.props.ViewModel.get("getUser", (data) => {
      if(data.length > 0)
      {
        this.setState({
          userData: data[0]
        });
      }
    }, [this.state.userID]);
  }

  /*
   *
   */
  removeAccount = async () => {
    await api("follows", {
      followee: {
        t: "=",
        v: this.props.user.id
      },
    }, "DELETE");
    await api("follows", {
      follower: {
        t: "=",
        v: this.props.user.id
      },
    }, "DELETE");
    await api("messages", {
      sender: {
        t: "=",
        v: this.props.user.id
      },
    }, "DELETE");
    await api("messages", {
      receiver: {
        t: "=",
        v: this.props.user.id
      },
    }, "DELETE");
    await api("users", {
      id: {
        t: "=",
        v: this.props.user.id
      },
    }, "DELETE");
    this.props.signOut();
  }

  showSettings = () =>
  {
    ActionSheet.show(
      {
        options: [
          "Change profile picture",
          "Remove account",
          "Sign out",
          "Cancel",
        ],
        cancelButtonIndex: 1,
        destructiveButtonIndex: 1,
        title: "Settings"
      },
      buttonIndex => {
        switch(buttonIndex)
        {
          case 0:
            this.takePicture();
          break;
          case 1:
              Alert.alert(
                'Hoply',
                'Do you really want to delete your account?',
                [
                  {text: 'Cancel', onPress: () => {}, style: 'cancel'},
                  {text: 'OK', onPress: this.removeAccount},
                ],
                { cancelable: false }
              );
          break;
          case 2:
              this.props.signOut();
          break;
        }
        /**/
      }
    );
  }

  /*
   *
   */
  render() {
    return (<Container>
              <NavigationEvents onWillFocus={this.componentFocus}/>
              <View style={{width: "100%", height: 250}}>

             <Header 
							middleTitle={def(this.state.userData.name, "Profile")}
							rightContent={this.state.userID === this.props.user.id ? 
                            <Button transparent onPress={() => requestAnimationFrame(() => this.showSettings())}>
															<Icon name="cog" type="FontAwesome" style={{fontSize: 20, color: "black"}}/>
														</Button> : 
                            <Button transparent onPress={() => navigate("Profile", this, {id: this.props.user.id})}>
															<Icon name="user" type="FontAwesome" style={{fontSize: 20}}/>
														</Button>}
                
              db={this.props.db}
              navigation={this.props.navigation}
              ViewModel={this.props.ViewModel}
							/>
            <View style={styles.topBG}>
              {
                this.state.pb ?
                  <Image source={{uri: "data:image/jpeg;base64," + this.state.pb.split(" ")[1]}} style={{width: "100%", height: 92, position: "absolute", top: 0}} />
                : null
              }
              <Text style={styles.bigTitle}>
                  {def(this.state.userData.name)}
              </Text>
              <Text style={styles.subTitle}>
                  {def(this.state.userData.id)}
              </Text>
            </View>
            <Grid style={styles.infoContainer}>
              {
                this.state.userID !== this.props.user.id ?
                  <Col style={styles.flex} onPress={() => navigate("Messages", this, {id: this.state.userData.id})}>
                    <Icon name="envelope" type="FontAwesome" style={styles.infoText}/>
                    <Text style={styles.infoSubText}>Message</Text>
                  </Col>
                : null 
              }
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
              {
                this.state.userID !== this.props.user.id ?
                  <Col style={styles.flex} onPress={() => this.like(!this.state.liked)}>
                    <Icon name={this.state.liked ? "heart" : "heart-o"} type="FontAwesome" style={styles.infoText}/>
                    <Text style={styles.infoSubText}>{this.state.liked ? "Unlike" : "Like"}</Text>
                  </Col>
                : null
              }
            </Grid>
              </View>
        <Content>
            {
              this.state.postedData.length > 0 ?
                this.state.postedData.map((post, key) => <Cards key={key} data={post} navigation={this.props.navigation}/>)
              : 
              <Text>
                  No posts..
              </Text>
            }
            
        </Content>
      </Container>);
  }
}

  /*
   *
   */
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
