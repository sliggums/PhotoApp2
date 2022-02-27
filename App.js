import * as React from "react";
import { ActivityIndicator, Button, StatusBar, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import PhotoBrowser from "./components/lib";

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this._toggleCameraBar = this._toggleCameraBar.bind(this);
  }

  state = {
    images: [],
    uploading: false,
    topBarVisible: true
  };

  // todo: hide the top bar
  render() {
    return (
      <View style={{ flex: 2 }}>
        {this._maybeRenderControls()}
        {this._maybeRenderUploadingIndicator()}
        {this._maybeRenderImage()}
        <StatusBar barStyle="default" />
      </View>
    );
  }

  _maybeRenderControls = () => {
    if (!this.state.uploading && this.state.topBarVisible) {
      return (
        <View style={{
          flexDirection:'row',
          justifyContent: "top",
          paddingTop: 25,
          alignItems: 'center'
        }}>
          <Text
            style={{
              flex: 1,
              flexDirection:'row',
              paddingLeft: 20,
              fontSize: 20,
              textAlign: "left"
            }}
          >
            Upload
          </Text>
          <View style={{
            flexDirection:'row',
            justifyContent: 'space-evenly',
            marginVertical: 10
          }}>
            <View>
              <Button
                onPress={this._pickImage}
                title="Roll"
              />
            </View>
            <View style={{ }}>
              <Button onPress={this._takePhoto} title="Take" />
            </View>
          </View>
        </View >
      );
    }
  };

  _toggleCameraBar = (newVal) => {
    this.setState({
      topBarVisible: newVal,
    })
  }

  _maybeRenderUploadingIndicator = () => {
    if (this.state.uploading) {
      return <ActivityIndicator animating size="large" color="#0000ee" />;
    }
  };

  _maybeRenderImage = () => {
    if (this.state.images) {
      return (
        <PhotoBrowser
          mediaList={this.state.images.map(image => ({
            photo: image
          }))}
          displayTopBar={true}
          startOnGrid={true}
          initialIndex={0}
          gridOffset={10}
          toggleCameraBar={this._toggleCameraBar}
        />  
      );
    }
  };

  _askPermission = async (failureMessage) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status === "denied") {
      alert(failureMessage);
    }
  };
  _askCameraPermission = async (failureMessage) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status === "denied") {
      alert(failureMessage);
    }
  };

  _takePhoto = async () => {
    await this._askCameraPermission(
      "We need the camera permission to take a picture..."
    );
    let pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    this._handleImagePicked(pickerResult);
  };

  _pickImage = async () => {
    await this._askPermission(
      "We need the camera-roll permission to read pictures from your phone..."
    );

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      presentationStyle: 0,
    });

    this._handleImagePicked(pickerResult);
  };

  _handleImagePicked = async (pickerResult) => {
    let uploadResponse, uploadResult;

    try {
      this.setState({ uploading: true });

      if (!pickerResult.cancelled) {

        this.setState({
          images: [...this.state.images, pickerResult.uri]
        });
      }
    } catch (e) {
      console.log({ uploadResponse });
      console.log({ uploadResult });
      console.log({ e });
      alert("Upload failed, sorry :(");
    } finally {
      this.setState({ uploading: false });
    }
  };
}