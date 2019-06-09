import React from 'react';
import { StyleSheet, TouchableWithoutFeedback } from 'react-native';

import { Image } from 'react-native';
import { Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, Right, Row, Col } from 'native-base';

import { ISOparser, CMDparser, navigate } from "../baseFunctions";

export default class Cards extends React.Component {

  /*
   *
   */
  render() {
    let data = this.props.data;
    let cmd = CMDparser(data.text);
    let pb = CMDparser(data.pb);
    return (<Card>
        <CardItem>
          <Left>
            <TouchableWithoutFeedback onPress={() => navigate("Profile", this, {id: data.userID})}>
              <Thumbnail source={{uri: pb.cmd === "BIN" ?  ("data:image/jpeg;base64," + pb.data) : 'https://i.imgur.com/NjbrJAr.png?1'}}/>
            </TouchableWithoutFeedback>
            <Body>
              <Text onPress={() => navigate("Profile", this, {id: data.userID})}>{data.name}</Text>
              <Text note>
                {data.userID}
              </Text>
            </Body>
          </Left>
        </CardItem>
        <CardItem cardBody>
          <Text style={styles.text}>
            {
              cmd.data ? cmd.data.message : data.text
            }
          </Text>
        </CardItem>
        <CardItem>
          
          <Left>
            <Text style={styles.date}>{ISOparser(data.stamp)}</Text>
          </Left>
        </CardItem>
      </Card>);
  }
}

const styles = StyleSheet.create({
  btn: {
    width: 10,
  },
  text: {
    marginLeft: 10,
    marginRight: 10,
  }, 
  date: {
    fontSize: 10,
  },
  notActive: {
    color: "#000"
  }
});
