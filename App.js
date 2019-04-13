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
      db: SQLite.openDatabase('db.db')
    };
  }
  componentDidMount()
  {
    this.state.db.transaction(tx => {
      tx.executeSql(
        'create table if not exists messages (id integer primary key not null, sender text, reciever text, body text, stamp text);'
      );
    });
  }

  updateState = (key, value) => {
    console.log("Set state", key, value);
    let newState = {};
    newState[key] = value;
    this.setState(newState);
  }
  render() {
    return this.state.user.id ? 
      <SiteHandler updateData={this.updateState} user={this.state.user} db={this.state.db}/> 
      : 
      <LoginPage updateData={this.updateState}/>;
  }
}