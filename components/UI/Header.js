import React from 'react';
import { StyleSheet } from 'react-native';

import {Header as Head, Body, Title, Right, Left} from 'native-base';


export default class Header extends React.Component {

  render() {
    return (<Head>
        <Left>
            {
                this.props.leftContent ? this.props.leftContent : null
            }
        </Left>
        <Body>
            <Title>{this.props.middleTitle}</Title>
        </Body>
        <Right>
            {
                this.props.rightContent ? this.props.rightContent : null
            }
        </Right>
    </Head>);
  }
}

const styles = StyleSheet.create({

});
