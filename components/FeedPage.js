import React from 'react';
import { StyleSheet } from 'react-native';
import { Container, Content, Text, Icon, Button} from 'native-base';

import Header from "./UI/Header";
export default class FeedPage extends React.Component {
  render() {
    return (<Container>
             <Header 
							middleTitle={"Feed"}
							rightContent={<Button transparent>
															<Icon name="search" type="FontAwesome" style={{fontSize: 18}}/>
														</Button>}
							/>
        <Content>
            <Text>Feed here..</Text>
        </Content>
      </Container>);
  }
}

const styles = StyleSheet.create({

});
