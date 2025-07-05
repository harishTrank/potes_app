import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
// Use the official Expo library for image manipulation
import * as ImageManipulator from "expo-image-manipulator";

const MAX_SIZE_BYTES = 1024 * 1024; // 1 MB

/**
 * A helper function that repeatedly compresses an image until it's under the target size.
 * @param uri - The URI of the image to compress.
 * @param maxSize - The maximum desired file size in bytes.
 * @returns The URI of the compressed image.
 */
const compressImageUntilUnderMaxSize = async (
  uri: string,
  maxSize: number
): Promise<string> => {
  let currentUri = uri;
  let currentSize = Number.MAX_SAFE_INTEGER;
  let quality = 90; // Start with high quality (90%)
  let attempts = 0;

  console.log(
    `Starting compression for image. Target size: < ${(
      maxSize /
      1024 /
      1024
    ).toFixed(2)} MB`
  );

  // Loop until the image is small enough, but with safety breaks
  while (currentSize > maxSize && quality > 15 && attempts < 5) {
    attempts++;

    const manipResult = await ImageManipulator.manipulateAsync(
      currentUri,
      // We resize based on width, height will be scaled automatically. 1280 is a good max dimension.
      [{ resize: { width: 1280 } }],
      {
        compress: quality / 100, // Compress quality is a value between 0 and 1
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    // After manipulation, we need to get the file info to check its size
    const fileInfo = await ImageManipulator.manipulateAsync(
      manipResult.uri,
      [],
      {
        base64: false, // Don't need base64, just file info
      }
    );

    currentUri = manipResult.uri;
    // @ts-ignore - fileSize exists on the result but might not be in all TS definitions
    currentSize = fileInfo.size || fileInfo.fileSize;

    console.log(
      `Attempt ${attempts}: Quality=${quality}%, Size=${(
        currentSize / 1024
      ).toFixed(2)} KB`
    );

    // If it's still too big, reduce quality for the next attempt
    if (currentSize > maxSize) {
      quality -= 15; // Reduce quality more aggressively
    }
  }

  console.log(`Final image size: ${(currentSize / 1024).toFixed(2)} KB`);
  return currentUri;
};

/**
 * Picks an image from the gallery and ensures it's compressed under 1MB.
 */
export const getImage = async (setImage: (uri: string) => void) => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1, // Always get the best quality initially
    });

    if (result.canceled) return;

    const originalImage = result.assets[0];
    const originalSize = originalImage.fileSize || 0;

    console.log(
      "Original image selected:",
      (originalSize / 1024 / 1024).toFixed(2),
      "MB"
    );

    // If the image is already small enough, no need to compress
    if (originalSize > 0 && originalSize <= MAX_SIZE_BYTES) {
      console.log("Image is already under 1MB. Using original.");
      setImage(originalImage.uri);
      return;
    }

    // If the image is too large, run it through our robust compressor
    const finalUri = await compressImageUntilUnderMaxSize(
      originalImage.uri,
      MAX_SIZE_BYTES
    );
    setImage(finalUri);
  } catch (err) {
    console.error("Error in getImage:", err);
    Alert.alert("Error", "Could not process image. Please try again.");
  }
};

/**
 * Takes a picture with the camera and ensures it's compressed under 1MB.
 */
export const takePicture = async (setImage: (uri: string) => void) => {
  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Camera permissions are needed.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1, // Always get the best quality initially
    });

    if (result.canceled) return;

    const takenImage = result.assets[0];

    // Camera photos are always large, so we always compress them.
    const finalUri = await compressImageUntilUnderMaxSize(
      takenImage.uri,
      MAX_SIZE_BYTES
    );
    setImage(finalUri);
  } catch (err) {
    console.error("Error in takePicture:", err);
    Alert.alert("Error", "Could not take a picture. Please try again.");
  }
};

export const getfileobj: any = (fileUri: string) => {
  if (!fileUri) return null;
  const filename = fileUri.split("/").pop() || "image.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image`;

  return {
    uri: fileUri,
    name: filename,
    type,
  };
};
