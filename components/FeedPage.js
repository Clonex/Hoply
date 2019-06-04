import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Container, Content, Text, Icon, Button, Textarea } from 'native-base';
import {navigate, getWall, WALL_ID, api, CMDbuilder, syncMessages} from "./baseFunctions";

import Header from "./UI/Header";
import Cards from "./UI/Cards";

export default class FeedPage extends React.Component {

  /*
   *
   */
  constructor(){
    super();
    this.state = {
      currMsg: "",
      posts: [],
    };
  }

  /*
   *
   */
  componentWillMount() {
    this.getData();
  }

  /*
   *
   */
  getData = async (page = 0) => {
    this.props.ViewModel.get("getWall", (data) => {
      this.setState({
        posts: data
      });
    });
  }

  /*
   *
   */
  wallPost = async () => {
    let data = await api("messages", {}, "POST", {
      sender: this.props.user.id,
      body: CMDbuilder("JSON", JSON.stringify({
        message: this.state.currMsg
      })),
      receiver: WALL_ID
    });
    if(data === 200 || data === 201)
    {
      this.setState({
        currMsg: ""
      });
      this.getData();
    }
  }

  /*
   *
   */
  render() {
 
    return (<Container>
             <Header 
              middleSearch={true}
							rightContent={<Button transparent onPress={() => navigate("Profile", this, {id: this.props.user.id})}>
															<Icon name="user" type="FontAwesome" style={{fontSize: 20}}/>
														</Button>}
              db={this.props.db}
              navigation={this.props.navigation}
              ViewModel={this.props.ViewModel}
							/>
        <Content>
          <Content padder>
            <Textarea 
                rowSpan={5} 
                bordered 
                placeholder="What do you have on your mind?" 
                onChangeText={(text) => this.setState({currMsg: text})}
                value={this.state.currMsg}
                />
            <Button onPress={this.wallPost} style={styles.btn}>
              <Text>Share!</Text>
            </Button>
          </Content>
          {
            this.state.posts.length > 0 ? 
              this.state.posts.map((post, key) => <Cards key={key} data={post} navigation={this.props.navigation}/>)
            : 
            <Text style={{width: "100%", textAlign: "center"}}>No posts! Get some friends..</Text>
          }
        </Content>
      </Container>);
  }
}

const styles = StyleSheet.create({
 btn: {
   marginTop: 5
 }
});
