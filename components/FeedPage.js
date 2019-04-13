import React from 'react';
import { StyleSheet } from 'react-native';
import { Container, Content, Text, Header} from 'native-base';


export default class FeedPage extends React.Component {
  render() {
    return (<Container>
             <Header />
        <Content>
            <Text>Feed here..</Text>
        </Content>
      </Container>);
  }
}

const styles = StyleSheet.create({

});
