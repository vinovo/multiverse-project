import React, { Component } from 'react'
import { Animated, Image, Dimensions, StyleSheet, ScrollView, TouchableWithoutFeedback, TouchableOpacity, TouchableHighlight, Keyboard } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';

import { Input, Block, Text, Card } from '../components';
import { theme } from '../constants';
import { withFirebase } from "../components/Firebase"
import BottomBar from "./BottomBar";

const { width, height } = Dimensions.get('window');

class SearchBase extends Component {
  state = { 
    searchFocus: new Animated.Value(0.6),
    searchString: null,
    items: [],
    viewSearch: false
  }

  handleSearchPost(e){
    const a = e;
    let ref = this.props.firebase.selling_posts();
    let that = this;
    console.log(that);
    let userQuery = ref.orderByChild('summary').startAt(a).endAt(a+"\uf8ff");
    userQuery.once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot) {
          let res = {};
          let user_res = {};
          let value = childSnapshot.val();
          res['id'] = childSnapshot.key;
          res['summary'] = value.summary;
          res['description'] = value.description;
          res['select_1'] = value.select_1;
          res['select_2'] = value.select_2;
          res['service_type'] = value.service_type;
          res['service_date'] = value.service_date;
          res['service_price'] = value.service_price;
          res['user_info'] = user_res;
          console.log("here is the"+childSnapshot.key);
          let temp = that.state.items;
          temp.push(res);
          that.setState({items: temp});
          console.log(that.state.items);
        });
  });

}
  handleSearchFocus(status) {
    Animated.timing(
      this.state.searchFocus,
      {
        toValue: status ? 0.8 : 0.6, // increase flex size when status is true
        duration: 150, // ms
      }
    ).start();
  }

  renderSearch() {
    const { searchString, searchFocus } = this.state;
    const isEditing = searchFocus && searchString;

    return (
      <Block animated middle flex={searchFocus} style={styles.search}>
        <Input
          placeholder="Search"
          placeholderTextColor={theme.colors.gray}
          style={styles.searchInput}
          onFocus={() => this.handleSearchFocus(true)}
          onBlur={() => this.handleSearchFocus(false)}
          onChangeText={text => this.setState({ searchString: text })}
          value={searchString}
          onRightPress={() => isEditing ? (this.setState({ searchString: null }),
                        this.setState({viewSearch:false}), this.setState({items :[]})) : null }
          onSubmitEditing={ () => isEditing ? (this.handleSearchPost(searchString),this.setState({viewSearch:true}), this.setState({items:[]})) : null}
          rightStyle={styles.searchRight}
          rightLabel={
            <Icon
              name={isEditing ? "close" : "search"}
              size={theme.sizes.base / 1.6}
              color={theme.colors.gray}
              style={styles.searchIcon}
            />
          }
        />
      </Block>
    )
  }

  renderSearchCategory(){
    const { searchString, viewSearch } = this.state;
    const inSearch = viewSearch && searchString;
    if(!inSearch){
    return (
      <Block>
        <Block style={styles.category}>
          <Text bold lightBlue style={{ marginBottom: theme.sizes.base * 1.5}}>CATEGORY</Text>
          <Text bold secondary style={{ marginBottom: theme.sizes.base * 1.5}}>Learning and Skills</Text>
          <Text bold secondary style={{ marginBottom: theme.sizes.base * 1.5}}>Career</Text>
          <Text bold secondary style={{ marginBottom: theme.sizes.base * 1.5}}>Food Delivery</Text>
          <Text bold secondary style={{ marginBottom: theme.sizes.base * 1.5}}>Transportation</Text>
          <Text bold secondary style={{ marginBottom: theme.sizes.base * 1.5}}>Social</Text>
          <Text bold secondary style={{ marginBottom: theme.sizes.base * 1.5}}>Other</Text>
        </Block>

        <BottomBar navigation={this.props.navigation} active='Search'/>
      </Block>
    );
    }
  }

  renderSearchPost(){
    const { items } = this.state;
    const { searchString, viewSearch } = this.state;
    const inSearch = viewSearch && searchString;
    if(inSearch)
    return (
    <ScrollView
    showsVerticalScrollIndicator={false}
    style={{ paddingVertical: theme.sizes.base * 2}}
  >
    <Block flex={false} row space="between" style={styles.items}>
      {items.map(item => (
          <TouchableOpacity
              key={item.id}
              onPress={() => alert('Hi')}
          >
            <Card shadow style={styles.item}>
              <Block flex={false} row>
                <Block row>
                  <TouchableHighlight
                      onPress={() => alert('Enter screen of person\'s pic')}
                      underlayColor={'purple'}
                      activeOpacity={0.69}
                  >
                     <Image source={item.avi}/>

                  </TouchableHighlight>
                  <Block style={{ margin: theme.sizes.base / 4}}>
                    <TouchableHighlight
                        onPress={() => alert('Enter person\'s profile')}
                        underlayColor={'white'}
                        activeOpacity={0.5}
                        // style={styles.textContainer}
                    >
                      <Text bold caption>Author: {item.user_info.username}</Text>
                    </TouchableHighlight>
                    <Text caption gray>{item.service_date}</Text>
                  </Block>
                </Block>
                <Block>
                  <TouchableHighlight
                      onPress={() => alert('Filter by this category')}
                      underlayColor={'white'}
                      activeOpacity={0.5}
                  >
                    <Text right semibold secondary style={{fontSize: 12}}> {`${item.select_1}\n${item.select_2}`} </Text>
                  </TouchableHighlight>
                  <TouchableHighlight
                      onPress={() => alert('item.price_negotiable ? {alert(\'price non-negotiable\')} : popup counteroffer screen')}
                      underlayColor={'white'}
                      activeOpacity={0.5}
                  >
                    <Text right semibold>${item.service_price}</Text>
                  </TouchableHighlight>
                </Block>
              </Block>
              <Text bold style={{ marginTop: theme.sizes.base}}>{item.summary}</Text>
              <Text style={{ marginTop: theme.sizes.base}}>{item.description}</Text>
              <TouchableOpacity
                  onPress={() => alert('Send message')}
                  style={styles.messagingContainer}
              >
                <Icon
                    name={'comment'}
                    size={theme.sizes.base * 1.7}
                    style={styles.messaging}
                />
              </TouchableOpacity>
            </Card>
          </TouchableOpacity>
      ))}
    </Block>
  </ScrollView>
    );
  }

  render() {
    return (
      <Block>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <Block>
        <Block flex={false} row center space="between" style={styles.header}>
          <Text h1 bold>Search</Text>
          {this.renderSearch()}
        </Block>
           {this.renderSearchCategory()}
           {this.renderSearchPost()}
           </Block>
        </TouchableWithoutFeedback>
      </Block>
    );
  }
}

const Search = withFirebase(SearchBase);
export default Search;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.sizes.base * 2,
    paddingBottom: theme.sizes.base * 2
  },
  search: {
    height: theme.sizes.base * 2,
    width: width - theme.sizes.base * 1.5,
  },
  searchInput: {
    fontSize: theme.sizes.body,
    height: theme.sizes.base * 2,
    backgroundColor: 'rgba(142, 142, 147, 0.06)',
    borderColor: 'rgba(142, 142, 147, 0.06)',
    paddingLeft: theme.sizes.base / 1.333,
    paddingRight: theme.sizes.base * 1.5,
  },
  searchRight: {
    top: 0,
    marginVertical: 0,
    backgroundColor: 'transparent'
  },
  searchIcon: {
    position: 'absolute',
    right: theme.sizes.base / 1.333,
    top: theme.sizes.base / 1.6,
  },
  category: {
    paddingHorizontal: theme.sizes.base * 2,
  },
  active: {
    borderBottomColor: theme.colors.secondary,
    borderBottomWidth: 3,
  },
  items: {
    flexWrap: 'wrap',
    paddingHorizontal: theme.sizes.base * 2,
    marginBottom: theme.sizes.base * 4,
  },
  item: {
    // this should be dynamic based on screen width
    minWidth: (width - (theme.sizes.padding * 2) - theme.sizes.base),
    maxWidth: (width - (theme.sizes.padding * 2) - theme.sizes.base),
    minHeight: (width - (theme.sizes.padding * 2) - theme.sizes.base) / 1.5,
  },
  item_avi: {
    //justifyContent: ''
  },
  plusCircle: {
    color: theme.colors.lightBlue,
  },
  plusCircleContainer: {
    position: 'absolute',
    bottom: theme.sizes.base,
    right: theme.sizes.base * 2,
    alignItems: 'center',
  },
  textContainer: {
  },
  messaging: {
    color: theme.colors.lightBlue,
  },
  messagingContainer: {
    position: 'absolute',
    bottom: theme.sizes.base * 2,
    right: theme.sizes.base * 2,
  }
})
