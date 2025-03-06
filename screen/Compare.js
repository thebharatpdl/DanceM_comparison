import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import '@tensorflow/tfjs-react-native'; // Important to initialize TensorFlow.js
import * as tf from '@tensorflow/tfjs';
import { poseDetection } from '@tensorflow-models/pose-detection';
import { drawKeypoints, drawSkeleton } from '@tensorflow/tfjs';

const CompareScreen = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [model, setModel] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const devices = useCameraDevices();
  const device = devices.back;

  useEffect(() => {
    const initializeTfjs = async () => {
      await tf.ready(); // Ensure TensorFlow.js is ready
      console.log('TensorFlow.js initialized');
    };
    
    initializeTfjs();
    
    // Load Pose Detection model
    const loadPoseModel = async () => {
      const poseDetectionModel = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
      setModel(poseDetectionModel);
    };

    loadPoseModel();
  }, []);

  useEffect(() => {
    const checkCameraPermission = async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    };

    checkCameraPermission();
  }, []);

  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  const processPoseDetection = async (imageData) => {
    if (model && isCameraReady && !isDetecting) {
      setIsDetecting(true);
      const poses = await model.estimatePoses(imageData);
      console.log('Detected poses:', poses);

      // Process poses (draw keypoints, skeleton, etc.)
      if (poses.length > 0) {
        const keypoints = poses[0].keypoints;
        drawKeypoints(keypoints, ctx); // Your drawing logic here
        drawSkeleton(keypoints, ctx); // Your drawing logic here
      }

      setIsDetecting(false);
    }
  };

  const onFrame = (imageData) => {
    processPoseDetection(imageData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pose Detection</Text>
      {device && hasPermission && (
        <Camera
          style={styles.camera}
          device={device}
          isActive={true}
          onFrame={onFrame}
          onReady={handleCameraReady}
        />
      )}
      {!hasPermission && <Text style={styles.permissionText}>Camera Permission Denied</Text>}
      {isDetecting && <Text style={styles.detectionText}>Detecting...</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  permissionText: {
    color: 'red',
    fontSize: 18,
  },
  detectionText: {
    color: 'green',
    fontSize: 18,
  },
});

export default CompareScreen;
