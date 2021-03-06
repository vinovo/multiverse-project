import React, {Component} from 'react'
import {
    Animated,
    Dimensions,
    Image,
    Keyboard,
    ScrollView,
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity,
    TouchableWithoutFeedback
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';

import {Block, Input, Text} from '../components';
import {theme} from '../constants';
import {withFirebase} from "../components/Firebase"
import BottomBar from "./BottomBar";
import Post from "./Post/Post";

const {width, height} = Dimensions.get('window');

class SearchBase extends Component {
    state = {
        searchFocus: new Animated.Value(0.6),
        searchString: null,
        items: [],
        viewSearch: false
    };

    async handleSearchPost(e) {
        const keywords = e.split(' ');
        console.log(keywords);
        let temp = [];
        let that = this;
        for (let keyword of keywords) {
            temp.push(keyword.toLowerCase());
        }
        // chain '==' queries in a loop to effectively obtain the intersection
        let partialQueryResult = this.props.firebase.get_posts(); // after the loop finish this will contain results
        for (let keyword of temp) {
            partialQueryResult = partialQueryResult.where(`keyword.${keyword}`, '==', true);
        } // type of partialQueryResult: Query
        // use get() which returns Promise<QuerySnapshot>
        let results = await partialQueryResult.get().catch(e => {
            console.log('Error thrown at get() in searchWithMultipleKeywords(): ');
            console.log(e);
        }); // now results should be a QuerySnapshot

        if (results.empty) {
            console.log('Did not find any results when searching for keywords:');
        }
        for (let doc of results.docs) {
            console.log('The document id is: ' + doc.id);
            console.log('The post description is: ' + doc.get('description'));
            let res = {};
            let user_res = {};
            let value = doc.data();

            // uid has to be ready before this line get called. so don't move it outside
            this.props.firebase.avatar(value.uid).child("avatar").getDownloadURL().then(uri => {
                console.log('load avatar success');
                user_res['avatar'] = {uri: uri};
            }).catch(error => user_res['avatar'] = require('../assets/images/default_avatar.jpg'));

            const user_ref = that.props.firebase.user(value.uid);
            user_ref.once('value', function (snap) {
                const user = snap.val();
                try {
                    user_res['username'] = user.email;
                    user_res['displayname'] = user.displayname;
                    user_res['uid'] = value.uid;
                } catch (e) {}

                res['id'] = value.pid;
                res['summary'] = value.summary;
                res['description'] = value.description;
                res['select_1'] = value.select_1;
                res['select_2'] = value.select_2;
                res['service_type'] = value.service_type;
                res['service_date'] = value.service_date;
                res['service_price'] = value.service_price;
                res['user_info'] = user_res;
                let temp = that.state.items;
                temp.push(res);
                that.setState({items: temp});
            })
        }
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
        const {searchString, searchFocus} = this.state;
        const isEditing = searchFocus && searchString;

        return (
            <Block animated middle flex={searchFocus} style={styles.search}>
                <Input
                    placeholder="Search"
                    placeholderTextColor={theme.colors.gray}
                    style={styles.searchInput}
                    onFocus={() => this.handleSearchFocus(true)}
                    onBlur={() => this.handleSearchFocus(false)}
                    onChangeText={text => this.setState({searchString: text})}
                    value={searchString}
                    onRightPress={() => isEditing ? (this.setState({searchString: null}),
                        this.setState({viewSearch: false}), this.setState({items: []})) : null}
                    onSubmitEditing={() => isEditing ? (this.handleSearchPost(searchString), this.setState({viewSearch: true}), this.setState({items: []})) : null}
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

    renderSearchCategory() {
        const {searchString, viewSearch} = this.state;
        const inSearch = viewSearch && searchString;
        if (!inSearch) {
            return (
                <Block>
                    <Block style={styles.category}>
                    <Text bold lightBlue style={{ marginBottom: theme.sizes.base * 1.5}} >CATEGORY</Text>
                    <TouchableOpacity onPress={() =>(this.setState({searchString: 'CSE Course Tutoring',viewSearch:true}), this.handleSearchPost('CSE Course Tutoring'),this.setState({items:[]}))}>
                        <Text bold secondary style={{ marginBottom: theme.sizes.base * 1.5}} >CSE Course Tutoring </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() =>(this.setState({searchString: 'Language Tutoring',viewSearch:true}), this.handleSearchPost('Language Tutoring'),this.setState({items:[]}))}>
                        <Text bold secondary style={{ marginBottom: theme.sizes.base * 1.5}}>Language Tutoring</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() =>(this.setState({searchString: 'Interview Preparation',viewSearch:true}), this.handleSearchPost('Interview Preparation'),this.setState({items:[]}))}>
                        <Text bold secondary style={{ marginBottom: theme.sizes.base * 1.5}}>Interview Preparation</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() =>(this.setState({searchString: 'Java',viewSearch:true}), this.handleSearchPost('Java'),this.setState({items:[]}))}>
                        <Text bold secondary style={{ marginBottom: theme.sizes.base * 1.5}}>Java</Text>
                    </TouchableOpacity>
                    </Block>
                </Block>
            );
        }
    }

    renderSearchPost() {
        const {items, searchString, viewSearch} = this.state;
        const inSearch = viewSearch && searchString;
        const {navigation} = this.props;
        if (inSearch)
            return (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{paddingVertical: theme.sizes.base * 2}}
                >
                    <Block flex={false} row space="between" style={styles.items}>
                        {items.map(item => (
                            <Post item={item} navigation={this.props.navigation} />
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
                <BottomBar navigation={this.props.navigation} active='Search'/>
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
    textContainer: {},
    messaging: {
        color: theme.colors.lightBlue,
    },
    avatar: {
        height: theme.sizes.base * 2.2,
        width: theme.sizes.base * 2.2,
    },
    messagingContainer: {
        position: 'absolute',
        bottom: theme.sizes.base * 2,
        right: theme.sizes.base * 2,
    },
});
