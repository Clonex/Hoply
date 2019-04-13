import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { Container, Header, Content, Form, Item, Input, Button } from 'native-base';

export default class LoginPage extends React.Component {

  render() {
    return (<Container>
        <Content contentContainerStyle={styles.content}>
          <Form>
            <Item>
              <Input placeholder="Username" />
            </Item>
            <Item last>
              <Input placeholder="Password" />
            </Item>
          </Form>
          <Button full light rounded style={styles.loginBtn}>
          	<Text>Login</Text>
          </Button>
        </Content>
      </Container>);
  }
}

const styles = StyleSheet.create({
	content: {flex: 1, justifyContent: 'center', width: "80%", marginLeft: "10%"},
	loginBtn: {marginTop: 10}
});
