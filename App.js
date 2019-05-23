import React from 'react';
import SiteHandler from "./components/SiteHandler";

import { SQLite } from 'expo';

import LoginPage from "./components/LoginPage";


export default class App extends React.Component {
  constructor()
  {
    super();
    this.state = {
      user: {
        id: false,
        name: false
      },
      db: SQLite.openDatabase('databas.db')
    };
  }
  componentDidMount()
  {
    this.state.db.transaction(tx => {
      tx.executeSql('create table if not exists messages (id integer primary key not null, sender text, receiver text, body text, stamp text);');
      tx.executeSql('create table if not exists users (id text primary key not null, name text, stamp text);');
      tx.executeSql('create table if not exists follows (follower text, followee text, stamp text);');

      tx.executeSql('CREATE TABLE IF NOT EXISTS posts (postID TEXT, userID INTEGER, stamp TEXT, stamp TEXT);');
      tx.executeSql('CREATE TABLE IF NOT EXISTS likes (postID TEXT, userID INTEGER, stamp TEXT, stamp TEXT);');
      tx.executeSql('CREATE TABLE IF NOT EXISTS comments (postID TEXT, userID INTEGER, commment TEXT, stamp TEXT);');
    });

    /*this.state.db.transaction(tx => {
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
      <SiteHandler updateData={this.updateState} user={this.state.user} db={this.state.db} signOut={this.signOut}/> 
      : 
      <LoginPage updateData={this.updateState} db={this.state.db}/>;
  }
}