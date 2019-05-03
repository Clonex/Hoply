import React from 'react';
import { StyleSheet } from 'react-native';

import { Image } from 'react-native';
import { Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, Right, Row, Col } from 'native-base';

import { ISOparser, CMDparser, navigate } from "../baseFunctions";

export default class Cards extends React.Component {

  render() {
    console.log(this.props.data);
    let data = this.props.data;
    let cmd = CMDparser(data.body);
    console.log(data, cmd);
    return (<Card>
        <CardItem>
          <Left>
            <Thumbnail source={{uri: 'https://i.imgur.com/NjbrJAr.png?1'}} onPress={() =>  navigate("Profile", this, {id: data.sender})}/>
            <Body>
              <Text onPress={() =>  navigate("Profile", this, {id: data.sender})}>{data.senderName}</Text>
              <Text note>
                {data.sender}
              </Text>
            </Body>
          </Left>
        </CardItem>
        <CardItem cardBody>
          <Text>
          {
            cmd.data.message
          }
          </Text>
          {/*<Image source={{uri: 'https://assets.saatchiart.com/saatchi/315283/art/2701261/additional_bbb7245f37ac6539278837e140fd2804fd94a8b7-8.jpg'}} style={{height: 200, width: null, flex: 1}}/> */}

        </CardItem>
        <CardItem>
          <Row>
            <Col>
              <Button transparent>
                <Icon active name="thumbs-up" />
                <Text>12</Text>
              </Button>
            </Col>
            <Col>
              <Button transparent>
                <Icon name="chatbubbles" style={styles.notActive}/>
                <Text style={styles.notActive}>4</Text>
              </Button>
            </Col>
          </Row>
          
          <Right>
            <Text style={styles.date}>{ISOparser(data.stamp)}</Text>
          </Right>
        </CardItem>
      </Card>);
  }
}

const styles = StyleSheet.create({
  btn: {
    width: 10,
  },
  date: {
    fontSize: 10,
  },
  notActive: {
    color: "#000"
  }
});
