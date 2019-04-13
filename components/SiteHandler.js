import React from 'react';
import { createBottomTabNavigator, createAppContainer } from 'react-navigation';
import { Icon } from 'native-base';

import MessagesPage from "./MessagesPage";
import FeedPage from "./FeedPage";

let iconHandler = (focused, tintColor, iconName, iconType) => <Icon name={iconName} style={focused ? {color: tintColor} : {}} type={iconType}/>;

let tabBar = createBottomTabNavigator({
    Timeline: {
        screen: FeedPage,
        navigationOptions: {
            tabBarIcon: ({ focused, tintColor }) => iconHandler(focused, tintColor, "timeline", "MaterialIcons")
        }
    },
    Messages: {
        screen: MessagesPage,
        navigationOptions: {
            tabBarIcon: ({ focused, tintColor }) => iconHandler(focused, tintColor, "comments", "FontAwesome")
        }
    },
    Profile: {
        screen: MessagesPage,
        navigationOptions: {
            tabBarIcon: ({ focused, tintColor }) => iconHandler(focused, tintColor, "person")
        }
    },
});

export default createAppContainer(tabBar);

