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
      tx.executeSql('create table if not exists messages (id integer primary key not null, sender text, receiver text, body text, stamp text, unixStamp integer);');
      tx.executeSql('create table if not exists users (id text primary key not null, name text, stamp text, unixStamp integer);');
      tx.executeSql('create table if not exists follows (follower text, followee text, stamp text, unixStamp integer);');

  /* tx.executeSql('CREATE TABLE IF NOT EXISTS posts (postID TEXT, userID INTEGER, stamp TEXT, stamp TEXT);');
      tx.executeSql('CREATE TABLE IF NOT EXISTS likes (postID TEXT, userID INTEGER, stamp TEXT, stamp TEXT);');
      tx.executeSql('CREATE TABLE IF NOT EXISTS comments (postID TEXT, userID INTEGER, commment TEXT, stamp TEXT);');*/
    });

    /*db.transaction(tx => {
      tx.executeSql(
        'create table if not exists items (id integer primary key not null, done int, value text);'
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