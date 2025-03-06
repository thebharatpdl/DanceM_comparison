import { Platform } from 'react-native';
import RNFetchBlob from 'react-native-blob-util';

export async function loadModel(modelPath) {
  if (typeof modelPath === 'number') { // React require() case
    const fileUri = `file://${RNFetchBlob.fs.asset(modelPath)}`;
    return await RNFetchBlob.fs.readFile(fileUri, 'base64');
  }
  
  // Handle other cases
  return await (await fetch(modelPath)).arrayBuffer();
}