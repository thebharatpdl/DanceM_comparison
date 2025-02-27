import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, Platform } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import { normalizePose, calculateSimilarity } from '../utils/poseUtils';
import { extractVideoFrames } from '../utils/videoUtils';
import CameraButton from '../components/CameraButton.js';
import RNFS from 'react-native-blob-util';
import { check, PERMISSIONS, request } from 'react-native-permissions';

const CompareScreen = () => {
  const camera = useRef(null);
  const [cameraDevice, setCameraDevice] = useState('back');
  const device = useCameraDevice(cameraDevice);
  const [model, setModel] = useState(null);
  const [referencePoses, setReferencePoses] = useState([]);
  const [userVideo, setUserVideo] = useState(null);
  const [accuracy, setAccuracy] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [videoError, setVideoError] = useState(false); // For video error handling
  const videoRef = useRef(null); // Ref for video control
  const classifier = useRef(knnClassifier.create());

  // Initialize TensorFlow and Load MoveNet
  useEffect(() => {
    const initializeApp = async () => {
      await checkPermissions();
      await tf.ready();
      await initializeModel();
      await loadReferenceVideo();
    };

    initializeApp();
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      await request(PERMISSIONS.ANDROID.CAMERA);
      await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    } else {
      await request(PERMISSIONS.IOS.CAMERA);
      await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    }
  };

  const initializeModel = async () => {
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
        enableSmoothing: true,
      }
    );
    setModel(detector);
    setIsModelReady(true);
  };

  const loadReferenceVideo = async () => {
    const referenceVideo = 'https://raw.githubusercontent.com/bht1010/video/main/supershy_danielle.mp4';
    const poses = await processVideo(referenceVideo);
    setReferencePoses(poses);
    setIsVideoReady(true);
  };

  const processVideo = async (videoUri) => {
    if (!model) return [];
    const frames = await extractVideoFrames(videoUri);
    const poses = [];
    
    for (const frame of frames) {
      const pose = await model.estimatePoses(frame);
      if (pose[0]) poses.push(normalizePose(pose[0]));
    }
    return poses;
  };

  const handleVideoPick = async () => {
    const result = await launchImageLibrary({ mediaType: 'video' });
    if (result.assets?.[0]?.uri) {
      setUserVideo(result.assets[0].uri);
    }
  };

  const handleCompare = async () => {
    if (!userVideo || !isModelReady) return;
    
    setIsProcessing(true);
    try {
      const userPoses = await processVideo(userVideo);
      const similarity = calculateSimilarity(userPoses, referencePoses);
      setAccuracy(similarity);
    } catch (error) {
      console.error('Comparison failed:', error);
    }
    setIsProcessing(false);
  };

  const switchCamera = () => {
    setCameraDevice(cameraDevice === 'back' ? 'front' : 'back');
  };

  return (
    <View style={styles.container}>
      {/* Camera View */}
      {device && (
        <Camera
          ref={camera}
          style={styles.camera}
          device={device}
          isActive={!isProcessing}
          video={true}
          audio={false}
        />
      )}
      
      {/* Video Overlay */}
      {isVideoReady && (
        <Video 
          ref={videoRef}
          source={{ uri: 'https://raw.githubusercontent.com/bht1010/video/main/supershy_danielle.mp4' }} 
          style={styles.videoOverlay}
          repeat={true}
          resizeMode="cover"
          paused={isVideoPaused}
          onLoad={() => console.log('Video loaded successfully')}
          onError={(error) => {
            console.error('Video error:', error);
            setVideoError(true);
          }}
          onProgress={(data) => console.log('Video progress:', data)}
          onEnd={() => console.log('Video ended')}
        />
      )}

      {/* Video Error Fallback */}
      {videoError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load video</Text>
          <TouchableOpacity onPress={() => setVideoError(false)}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <CameraButton 
          icon="video" 
          onPress={handleVideoPick}
          disabled={isProcessing}
        />
        <CameraButton 
          icon="play" 
          onPress={handleCompare}
          disabled={!userVideo || isProcessing}
        />
        <CameraButton 
          icon="camera-switch" 
          onPress={switchCamera}
          disabled={isProcessing}
        />
        <CameraButton 
          icon={isVideoPaused ? "play" : "pause"} 
          onPress={() => setIsVideoPaused(!isVideoPaused)}
        />
      </View>

      {/* Loading Indicator */}
      {isProcessing && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Analyzing Moves...</Text>
        </View>
      )}

      {/* Accuracy Modal */}
      <Modal visible={accuracy > 0} animationType="slide">
        <View style={styles.result}>
          <Text style={styles.resultText}>
            Accuracy: {accuracy.toFixed(1)}%
          </Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setAccuracy(0)}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  videoOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 150,
    height: 250,
    zIndex: 100,
    borderRadius: 10,
    backgroundColor: 'black',
  },
  errorContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 150,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
  },
  retryText: {
    color: 'blue',
    marginTop: 10,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 20,
    fontSize: 18,
  },
  result: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  resultText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'green',
  },
  closeButton: {
    marginTop: 30,
    padding: 15,
    backgroundColor: 'red',
    borderRadius: 10,
  },
  closeText: {
    color: 'white',
    fontSize: 18,
  },
});

export default CompareScreen;