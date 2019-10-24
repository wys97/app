
import React from 'react';
import { StyleSheet, Image, TouchableOpacity, Text, View } from 'react-native';



type Props = {};
export default class CustomNavHeaderLeftView extends React.Component<Props> {

    render() {
        return (
            <TouchableOpacity
                onPress={()=>{
                    this.props.nav.pop()
                }}
            >
                <View style={styles.navView}>
                    <Image style={styles.image} source={require('../../images/MineImg/icon_whiteBack.png')} >

                    </Image>
                </View>

            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    navView: {
        // backgroundColor:'#fff',
        width: 50,
        height: 44,
    },

    image: {
        marginTop: 13,
        marginLeft: 18,
        width: 9,
        height: 17,
    },
});
