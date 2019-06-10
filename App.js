import React from 'react';
import { AsyncStorage } from "react-native";
import { SQLite } from 'expo';
import { Root } from "native-base";

import SiteHandler from "./components/SiteHandler";
import LoginPage from "./components/LoginPage";
import {ViewModel} from "./components/baseFunctions";

const db = SQLite.openDatabase('localdb.db');

export default class App extends React.Component {
  constructor()
  {
    super();
    this.state = {
      user: {
        id: false,
        name: false
      },
    };
    this.ViewModel = new ViewModel(db);
  }

  componentDidMount()
  {
    db.transaction(tx => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY NOT NULL, sender TEXT, receiver TEXT, body TEXT, stamp TEXT, unixStamp INTEGER);');
      tx.executeSql('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY NOT NULL, name TEXT, stamp TEXT, unixStamp INTEGER);');
      tx.executeSql('CREATE TABLE IF NOT EXISTS follows (follower TEXT, followee TEXT, stamp TEXT, unixStamp INTEGER, PRIMARY KEY (follower, followee));');

      // Group message tables.
      tx.executeSql('CREATE TABLE IF NOT EXISTS groups (name TEXT, id TEXT);');
      /*tx.executeSql('CREATE TABLE IF NOT EXISTS groupUsers (groupID TEXT, userID TEXT);');
      tx.executeSql('CREATE TABLE IF NOT EXISTS groupMessages (name TEXT, groupID TEXT, msgID TEXT, unixStamp INTEGER);');*/

      tx.executeSql('CREATE TABLE IF NOT EXISTS posts (userID TEXT, text TEXT, msgID TEXT, unixStamp INTEGER);');
      tx.executeSql('CREATE TABLE IF NOT EXISTS profilePicture (userID TEXT, img TEXT, stamp TEXT, unixStamp INTEGER, msgID TEXT);');

    });
  }

  /*
   * Resets the local database, and signs the user out.
   */
  signOut = () => {
    AsyncStorage.removeItem("login");
    
    db.transaction(tx => {
      tx.executeSql('DELETE FROM messages');
      tx.executeSql('DELETE FROM users');
      tx.executeSql('DELETE FROM follows');
      tx.executeSql('DELETE FROM groups');
      tx.executeSql('DELETE FROM posts');
      tx.executeSql('DELETE FROM profilePicture');
    });

    this.setState({
      user: {
        id: false,
        name: false
      }
    });
  }

  /*
   * Sets the state @param key to the given @param value.
   */
  updateState = (key, value) => {
    let newState = {};
    if(key === "user")
    {
      if(value.id && value.id !== this.state.user.id)
      {
        this.ViewModel = new ViewModel(db, value.id);
      }
    }
    newState[key] = value;
    this.setState(newState);
  }

  render() {
    return <Root>
      {
        this.state.user.id ? 
          <SiteHandler updateData={this.updateState} user={this.state.user} db={db} signOut={this.signOut} ViewModel={this.ViewModel}/> 
        : 
          <LoginPage updateData={this.updateState} db={db} ViewModel={this.ViewModel}/>
      }
      </Root>;
  }
}