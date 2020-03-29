import React, {useState} from 'react';
import { StyleSheet, Text, View, Button, Alert, Image} from 'react-native';

import * as ImagePicker from 'expo-image-picker'
import * as firebase from 'firebase';
import ApiKeys from './apiKeys';
import * as Random from 'expo-random';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';


if ( !firebase.apps.length ) {
  firebase.initializeApp(ApiKeys.FirebaseConfig);  
}


export default function App() {
const [img, setImg] = useState('');



async function handleImage(){

 
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    if(status  !== 'granted'){
      alert("Nós precisamos da permissão para públicar uma foto!");
      return;
    }
  

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images
  });


  if(result.cancelled){
    return;
  }

  if(!result.uri){
    return;
  }


  if(!result.cancelled){

    const name = await Random.getRandomBytesAsync(3);

    uploadImage(result.uri, name)
      .then( async ()=>{
        Alert.alert("Success");
        try {
          const response = await fetch(`https://firebasestorage.googleapis.com/v0/b/photos-app-emocionario.appspot.com/o/${name}`);
          const responseJson = await response.json();
           console.log(responseJson);
           setImg(`https://firebasestorage.googleapis.com/v0/b/photos-app-emocionario.appspot.com/o/${responseJson.name}?alt=media&token=${responseJson.downloadTokens}`)
        } catch (error) {
          console.error(error);
        }

      }).catch((error) => {
        console.log("ERROR => ", error)
        Alert.alert("Error");
      });
      
    }
}

async function uploadImage(uri, imageName){
  const response = await fetch(uri);
  const blob = await response.blob();


  var ref = firebase.storage().ref().child("/" + imageName);
 
  return ref.put(blob);
}


  return (
    <View style={styles.container}>
      <Text>Expo Firebase Image Upload Expo</Text>
      <Image source={{uri: img}} style={{margin:25, width: 200, height: 200, borderRadius: 20}} />

      <Button title="Escolha uma imagem..." onPress={handleImage}></Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
