import React from 'react';
import { StyleSheet, Image } from 'react-native';
import { MapView } from "expo";
import { Card, CardItem, Text, Body } from 'native-base';

import {ISOparser, CMDparser} from "../baseFunctions";

export default class Message extends React.Component {

  /*
   * Parses the message commands, and @returns the correct data.
   */
  messageContent = (check, message) => {
    let data = check.data;
    switch(check.cmd)
    {
      case "BIN":
        return <Image source={{uri: "data:image/jpeg;base64," + data}} style={{width: "100%", height: 300}} />;
      break;
      case "GPS":
        const GPS = data.indexOf(",") !== -1 ? data.split(",") : data.split(" ");
        return (<MapView
          style={{ height: 300, width: "90%" }}
          initialRegion={{
          latitude: Number(GPS[0]),
          longitude: Number(GPS[1]),
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
          }}
        >
          <MapView.Marker
            coordinate={{ latitude: Number(GPS[0]), longitude: Number(GPS[1])}}
            title="Location"
          />
        </MapView>);
      break;

      default: 
        return (<CardItem bordered>
          <Body>
            <Text>
              {message.body}
            </Text>
          </Body>
        </CardItem>);
      break;
    }
    
  }

  /*
   * @returns the components which needs to be rendered in this component.
   */
  render() {
    let message = this.props.data;
    let check = CMDparser(message.body);
    return (<Card style={[styles.messageCard, styles[(message.sender === this.props.user.id ? "meCard" : "otherCard")]]}>
             {this.messageContent(check, message)} 
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