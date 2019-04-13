import React from 'react';
import { createBottomTabNavigator, createAppContainer } from 'react-navigation';
import { Icon } from 'native-base';

import MessagesPage from "./MessagesPage";
import FeedPage from "./FeedPage";

export default class SiteHandler extends React.Component {
    iconHandler = (focused, tintColor, iconName, iconType) => <Icon name={iconName} style={focused ? {color: tintColor} : {}} type={iconType}/>
    render() {
    let TabBar = createAppContainer(createBottomTabNavigator({
        Timeline: {
            screen: props => <FeedPage {...props} {...this.props}/>,
            navigationOptions: {
                tabBarIcon: ({ focused, tintColor }) => this.iconHandler(focused, tintColor, "timeline", "MaterialIcons")
            }
        },
        Messages: {
            screen: props => <MessagesPage {...props} {...this.props}/>,
            navigationOptions: {
                tabBarIcon: ({ focused, tintColor }) => this.iconHandler(focused, tintColor, "comments", "FontAwesome")
            }
        },
        Profile: {
            screen: props => <MessagesPage {...props} {...this.props}/>,
            navigationOptions: {
                tabBarIcon: ({ focused, tintColor }) => this.iconHandler(focused, tintColor, "person")
            }
        },
    }));
    
    return (<TabBar/>);
  }
}
