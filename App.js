import React from 'react';
import { SQLite } from 'expo';

import SiteHandler from "./components/SiteHandler";
import LoginPage from "./components/LoginPage";
import {ViewModel} from "./components/baseFunctions";
const db = SQLite.openDatabase('databa12.db');

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
      tx.executeSql('CREATE TABLE IF NOT EXISTS follows (follower TEXT, followee TEXT, stamp TEXT, unixStamp INTEGER);');

      // Group message tables.
      tx.executeSql('CREATE TABLE IF NOT EXISTS groups (name TEXT, id TEXT);');
      tx.executeSql('CREATE TABLE IF NOT EXISTS groupUsers (groupID TEXT, userID TEXT);');
      tx.executeSql('CREATE TABLE IF NOT EXISTS groupMessages (name TEXT, groupID TEXT, msgID TEXT, unixStamp INTEGER);');

      tx.executeSql('CREATE TABLE IF NOT EXISTS post (userID TEXT, text TEXT);');
      tx.executeSql('CREATE TABLE IF NOT EXISTS profilePicture (userID TEXT, img TEXT);');

    });

    /*db.transaction(tx => {
      tx.executeSql(
        'create table if not exists items (id integer PRIMARY KEY NOT NULL, done int, value text);'
      );
    });*/
  }
  signOut = () => {
    this.setState({
      user: {
        id: false,
        name: false
      }
    });
  }
  updateState = (key, value) => {
    let newState = {};
    newState[key] = value;
    this.setState(newState);
  }
  render() {
    return this.state.user.id ? 
      <SiteHandler updateData={this.updateState} user={this.state.user} db={db} signOut={this.signOut} ViewModel={this.ViewModel}/> 
      : 
      <LoginPage updateData={this.updateState} db={db} ViewModel={this.ViewModel}/>;
  }
}