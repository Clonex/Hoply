import React from 'react';
import { StyleSheet } from 'react-native';
import { Container, Content, Text, Icon, Button, Textarea } from 'native-base';

import Header from "./UI/Header";
import Cards from "./UI/Cards";
import { navigate, WALL_ID, api } from "./baseFunctions";

export default class FeedPage extends React.Component {

  /*
   * Initiates the needed states and instance variables needed in the component.
   */
  constructor(){
    super();
    this.sending = false;
    this.state = {
      currMsg: "",
      posts: [],
    };
  }

  /*
   * This is a ifecycle hook, which is being called when the component has been mounted.
   */
  componentWillMount() {
    this.getData();
  }

  /*
   * Updates the wall data.
   */
  getData = async () => {
    this.props.ViewModel.get("getWall", (data) => {
      this.setState({
        posts: data
      });
    });
  }

  /*
   * Posts a message to the wall.
   */
  wallPost = async () => {
    if(!this.sending)
    {
      this.sending = true;
      await this.props.ViewModel.do("message", {
        sender: this.props.user.id,
        body: this.state.currMsg,
        receiver: WALL_ID
      });
      
      this.setState({
        currMsg: ""
      });
      requestAnimationFrame(() => this.getData());
      this.sending = false;
    }
  }

  /*
   * @returns the components which needs to be rendered in this component.
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
            <Text style={styles.centerText}>No posts! Go 'like' some friends..</Text>
          }
        </Content>
      </Container>);
  }
}

const styles = StyleSheet.create({
 btn: {
   marginTop: 5
 },
 centerText: {width: "100%", textAlign: "center"}
});
