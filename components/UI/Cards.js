import React from 'react';
import { StyleSheet } from 'react-native';

import { Image } from 'react-native';
import { Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, Right } from 'native-base';


export default class Cards extends React.Component {

  render() {
    return (<Card>
        <CardItem>
          <Left>
            <Thumbnail source={{uri: 'https://i.imgur.com/NjbrJAr.png?1'}} />
            <Body>
              <Text>NAME</Text>
              <Text note>ID</Text>
            </Body>
          </Left>
        </CardItem>
        <CardItem cardBody>
          <Image source={{uri: 'https://assets.saatchiart.com/saatchi/315283/art/2701261/additional_bbb7245f37ac6539278837e140fd2804fd94a8b7-8.jpg'}} style={{height: 200, width: null, flex: 1}}/>
        </CardItem>
        <CardItem>
          <Left>
            <Button transparent>
              <Icon active name="thumbs-up" />
              <Text>12</Text>
            </Button>
          </Left>
          <Body>
            <Button transparent>
              <Icon active name="chatbubbles" />
              <Text>4</Text>
            </Button>
          </Body>
          <Right>
            <Text>11h ago</Text>
          </Right>
        </CardItem>
      </Card>);
  }
}

const styles = StyleSheet.create({

});
