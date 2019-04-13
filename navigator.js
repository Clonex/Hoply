import { createBottomTabNavigator } from 'react-navigation';

import MessagesPage from "./components/MessagesPage";


export default createBottomTabNavigator({
    Home: { screen: MessagesPage },
    Messages: { screen: MessagesPage },
    Profile: { screen: MessagesPage },
});