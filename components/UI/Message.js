import React from 'react';
import { StyleSheet } from 'react-native';

import { Image } from 'react-native';
import { Card, CardItem, Text, Body } from 'native-base';

import {ISOparser, CMDparser} from "../baseFunctions";

export default class Message extends React.Component {

  render() {
    let message = this.props.data;
    let check = CMDparser(message.body);
    console.log(check);
    return (<Card style={[styles.messageCard, styles[(message.sender === this.props.user.id ? "meCard" : "otherCard")]]}>
              {
                check.cmd === "BIN" ?
                  <Image source={{uri: check.data}} style={{width: 100, height: 100, borderRadius: 30}} />
                : null
              }
              {
                !check.cmd ?
                  <CardItem bordered>
                    <Body>
                      <Text>
                        {message.body}
                      </Text>
                    </Body>
                  </CardItem>
                : null
              }
              
              <CardItem footer>
                <Text>{message.sender} - {ISOparser(message.stamp)}</Text>
              </CardItem>
            </Card>);
  }
}

const styles = StyleSheet.create({
	messageCard: {
		width: "90%"
	},
	meCard: {
		marginLeft: "8%"
	},
	otherCard: {
		marginRight: "8%"
	},
	bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 36
	},
	container: {
    flex: 1,
    alignItems: 'center'
  },

  header: {fontSize: 20}
	
});