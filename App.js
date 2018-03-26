import React, {Component} from 'react';
//noinspection JSUnresolvedVariable
import {Platform, Text, View, StyleSheet,Alert, TouchableOpacity, Share ,Button,BackHandler } from 'react-native';
import {Constants, Location, Permissions, MapView} from 'expo';
import Geocoder from './components/Geocoder';

export default class App extends Component {

    constructor (props){
        super(props);
        this.state = {
            location: null,
            errorMessage: null,
            gps:false
        };
        this.shareMessage = this.shareMessage.bind(this);
    }


    componentWillMount() {
        // Geocoder.setApiKey('AIzaSyBzzeS9iThOQxbaMxtZ7fV59YPkX2AHct4');
        Geocoder.setApiKey('AIzaSyAVA8zvqKCgRS5MGJjo5-SoQKybAR2Ybd4');
        if (Platform.OS === 'android' && !Constants.isDevice) {
            this.setState({
                errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
            });
        } else {
            this._getLocationAsync();
        }
    }

    // componentWillUpdate(nextProps, nextState) {
    //     console.log('componentWillUpdate' , nextState);
    //     if (nextState.gps != this.state.gps) {
    //         this._getLocationAsync()
    //     }
    // }

    askingForLocationPermissionAlert = (confirmCallback) => {
        Alert.alert(
            'Permission',
            'Please enable your location',
            [
                { text: 'Cancel', onPress: ()=>BackHandler.exitApp()},
                { text: 'OK', onPress: confirmCallback }
            ],
            { cancelable: false }
        );
    };

    _getLocationAsync = async() => {
        let {status} = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            console.log('is not granted');
            this.setState({
                errorMessage: 'Permission to access location was denied',
            });
        }
        else {
            let gpsStatus =await this.checkGpsIsOn();
            console.log('gpsStatus',gpsStatus);

            if(gpsStatus.gpsAvailable){
                await this.setCurrentPostion();
                this.setState({gps:true})
            }else{
                await this.askingForLocationPermissionAlert(this.checkAgainGpsStatus);
            }
        }

        //noinspection JSCheckFunctionSignatures
        // Geocoder.getFromLatLng(this.state.location.coords.latitude, this.state.location.coords.longitude).then(
        //  Geocoder.getFromLatLng(3.110518, 101.665660).then(
        //      json => {
        //          console.log(json);
        //          var address_component = json.results[0].address_components[0];
        //          alert(address_component.long_name);
        //      },
        //      error => {
        //          alert(error);
        //      }
        //  );
    };

    checkAgainGpsStatus = async () =>{
       let location = await this.checkGpsIsOn();
        console.log('asdasdad',location);
        if(location.gpsAvailable){
             await this.setCurrentPostion();
       }else {
           this.askingForLocationPermissionAlert(this.checkAgainGpsStatus)
       }
    };


    checkGpsIsOn = async () =>{
        let locationStatus = await Location.getProviderStatusAsync();
        console.log('location status' , locationStatus);
        return locationStatus;
    };

    setCurrentPostion =async () =>{
     //   if(this.state.gps){
            let location = await Location.getCurrentPositionAsync({});
            console.log('setCurrentPostion',location);
            this.setState({location});
            return location
        // }else {
        //     await this.askingForLocationPermissionAlert(this.setCurrentPostion);
        // }
    };

    shareMessage(location) {
        console.log(location, 'msg');

        Share.share({message: `latitude : ${this.state.location.coords.latitude.toString()} , longitude : ${this.state.location.coords.longitude.toString()}` , title:'adaaa'})
            .then(res => console.log(res))
            .catch(e => console.log(e));
    };

    render() {
        let text = 'Waiting..';
        if (this.state.errorMessage) {
            text = this.state.errorMessage;
        } else if (this.state.location) {
            text = JSON.stringify(this.state.location);
        }

        console.log(this.state.location, 'nima location');
        return (
            this.state.location != null ?
                <View style={styles.container}>
                    <MapView
                        style={{width: '100%', height: '80%'}}
                        zoomEnabled={true}
                        initialRegion={{
                            latitude: this.state.location.coords.latitude,
                            longitude: this.state.location.coords.longitude,
                            latitudeDelta: 0.009,
                            longitudeDelta: 0.009
                        }}
                    >
                        <MapView.Marker
                            key={1}
                            coordinate={{
                                latitude: this.state.location.coords.latitude,
                                longitude: this.state.location.coords.longitude,
                           //     latitudeDelta: 0.5,
                            //    longitudeDelta: 0.5
                            }}
                            title={"Some Title"}
                            description={"Hello world"}
                            z
                        />
                    </MapView>
                    <TouchableOpacity activeOpacity={0.8} onPress={()=>this.shareMessage(text)}>
                        <Text style={styles.paragraph}>Latitude : {this.state.location.coords.latitude}</Text>
                        <Text style={styles.paragraph}>Longitude : {this.state.location.coords.longitude}</Text>
                        <Button title='SHARE YOUR LOCATION' onPress={()=>this.shareMessage(text)}/>
                    </TouchableOpacity>
                </View> : <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>loading</Text></View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        // paddingTop: Constants.statusBarHeight,
        backgroundColor: '#ecf0f1',
    },
    paragraph: {
        margin: 4,
        fontSize: 18,
        textAlign: 'center',
    },
});