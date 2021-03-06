import React from 'react';
import { Image } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';


import Welcome from '../screens/Register_Login/Welcome';
import Login from '../screens/Register_Login/Login';
import SignUp from '../screens/Register_Login/SignUp';
import Forgot from '../screens/Register_Login/Forgot';
import Marketplace from '../screens/Marketplace';
import Search from '../screens/Search';
import Account from '../screens/Account';
import ChatRoom, {ChannelScreen} from '../screens/ChatRoom';
import NewPost from '../screens/Post/NewPost';
import OtherAccount from "../screens/OtherAccount";
import {Drafts, PostHistory, LikedPosts} from "../screens/Post/PostRecord";
import ViewPost from '../screens/Post/ViewPost';

import { theme } from '../constants';

const screens = createStackNavigator({
  Welcome,
  Login,
  SignUp,
  Forgot,
  Marketplace,
  Search,
  Account,
  NewPost,
  ChatRoom,
  ChannelScreen,
  OtherAccount,
  PostHistory,
  Drafts,
  LikedPosts,
  ViewPost,
}, {
  defaultNavigationOptions: {
    headerStyle: {
      height: theme.sizes.base,
      backgroundColor: theme.colors.white, // or 'white
      borderBottomColor: "transparent",
      elevation: 0, // for android
    },
    headerBackImage: <Image source={require('../assets/icons/back.png')} />,
    headerBackTitle: null,
    headerLeftContainerStyle: {
      alignItems: 'center',
      marginLeft: theme.sizes.base * 2,
      paddingRight: theme.sizes.base,
    },
    headerRightContainerStyle: {
      alignItems: 'center',
      paddingRight: theme.sizes.base,
    },
    headerLeft: null,
  },
  // Removed screen transition animation
  transitionConfig : () => {
    return {
      transitionSpec: {
        duration: 0
      },
      screenInterpolator: (sceneProps) => {}
    }
  }
});

export default createAppContainer(screens);