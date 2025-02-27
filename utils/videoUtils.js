// videoUtils.js
import { ProcessingManager } from 'react-native-video-processing';

// Extract a frame from the video
export const extractFrameFromVideo = async (videoUri) => {
  const options = {
    width: 360,
    height: 640,
    startTime: 1, // Extract frame at 1 second
    endTime: 1.5, // End at 1.5 seconds
  };

  try {
    const result = await ProcessingManager.getPreviewForSecond(videoUri, options);
    return result.uri; // Return the URI of the extracted frame
  } catch (error) {
    console.error('Error extracting frame:', error);
    return null;
  }
};