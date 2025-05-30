import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import ImageResizer from "react-native-image-resizer";

export const getImage = async (setImage: any, multiple = false) => {
  try {
    let result: any = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: multiple ? true : false,
      allowsEditing: false,
      // aspect: [4, 4],
      quality: 0.1,
      selectionLimit: 2,
    });
    if (!result.canceled) {
      if (multiple) {
        setImage(result.assets);
      } else {
        let variable: any = 1;
        let imagePath: any = result.assets[0];

        while (variable !== 0) {
          if (imagePath.fileSize < 1024 * 384 || imagePath.size < 1024 * 384) {
            variable = 0;
          } else {
            const resizedImage = await ImageResizer.createResizedImage(
              imagePath.uri,
              800, // Set the maximum width here
              400, // Set the maximum height here
              "JPEG", // Image format
              90
            );
            imagePath = resizedImage;
          }
        }

        await setImage(imagePath.uri);
      }
    }
  } catch (err) {
    console.log(err, "err");
  }
};

export const createPostFromGallery = async (
  setImage: any,
  multiple = false
) => {
  try {
    let result: any = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: multiple ? true : false,
      allowsEditing: false,
      // aspect: [4, 4],
      quality: 0.1,
      selectionLimit: 2,
    });
    if (!result.canceled) {
      if (multiple) {
        setImage(result.assets);
      } else {
        await setImage(result.assets[0].uri);
      }
    }
  } catch (err) {
    console.log(err, "err");
  }
};

export const takePicture = async (setImage: any) => {
  try {
    let permiss: any = await ImagePicker.getCameraPermissionsAsync();
    if (permiss.canAskAgain === false) {
      Alert.alert("Camera permissions has been denied.");
    } else {
      if (permiss.granted === false) {
        let result: any = await ImagePicker.requestCameraPermissionsAsync();
      }
      ImagePicker.launchCameraAsync().then((res: any) => {
        setImage(res.assets[0].uri);
      });
    }
  } catch (err) {
    console.log(err, "error");
  }
};

// export const takePicture = async (setImage: any) => {
//   try {
//     const permiss = await ImagePicker.getCameraPermissionsAsync();
//     if (!permiss.canAskAgain) {
//       Alert.alert("Camera permissions have been denied.");
//     } else {
//       if (!permiss.granted) {
//         const result = await ImagePicker.requestCameraPermissionsAsync();
//       }
//       const res = await ImagePicker.launchCameraAsync();
//       if (!res.cancelled) {
//         setImage(res.uri);
//       }
//     }
//   } catch (err) {
//     console.log(err, "error");
//   }
// };

export const getfileobj: any = (file: any) => {
  let localUri = file;
  let filename = localUri?.split("/").pop();
  let match = /\.(\w+)$/.exec(filename);
  let type = match ? `image/${match[1]}` : `image`;
  return {
    type,
    name: filename,
    uri: localUri,
  };
};
