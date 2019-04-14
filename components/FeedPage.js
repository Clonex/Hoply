import React from 'react';
import { StyleSheet } from 'react-native';
import { Container, Content, Text, Icon, Button } from 'native-base';
import {navigate} from "./baseFunctions";

import Header from "./UI/Header";
export default class FeedPage extends React.Component {
  render() {
    console.log("Feed page", this.props);
    return (<Container>
             <Header 
              middleSearch={true}
							rightContent={<Button transparent onPress={() => navigate("Profile", this, {id: this.props.user.id})}>
															<Icon name="user" type="FontAwesome" style={{fontSize: 20}}/>
														</Button>}
              db={this.props.db}
              navigation={this.props.navigation}
							/>
        <Content>
            <Text>Feed here..</Text>
        </Content>
      </Container>);
  }
}

const styles = StyleSheet.create({
 
});
