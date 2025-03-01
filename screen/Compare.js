import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Camera, useCameraDevice, useCameraFormat, useFrameProcessor } from 'react-native-vision-camera';
import { runAtTargetFps } from 'react-native-vision-camera';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import Svg, { Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const CompareScreen = () => {
  const camera = useRef(null);
  const [model, setModel] = useState(null);
  const [poses, setPoses] = useState([]);
  const device = useCameraDevice('front');
  const format = useCameraFormat(device, [
    { fps: 30 },
    { videoResolution: 'max' }
  ]);

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER }
      );
      setModel(detector);
    };

    loadModel();
  }, []);

  const detectPose = async (frame) => {
    if (model) {
      const imageTensor = tf.browser.fromPixels(frame);
      const pose = await model.estimatePoses(imageTensor);
      if (pose.length > 0) {
        const scaledKeypoints = pose[0].keypoints.map(point => ({
          ...point,
          x: point.x * width,
          y: point.y * height,
        }));
        setPoses(scaledKeypoints);
      }
      tf.dispose(imageTensor);
    }
  };

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    runAtTargetFps(10, () => {
      detectPose(frame);
    });
  }, [model]);

  return (
    <View style={styles.container}>
      {device && (
        <Camera
          ref={camera}
          style={styles.camera}
          device={device}
          isActive={true}
          format={format}
          frameProcessor={frameProcessor}
        />
      )}

      {/* Display keypoints */}
      <Svg style={styles.overlay}>
        {poses.map((point, index) => (
          <Circle key={index} cx={point.x} cy={point.y} r="5" fill="red" />
        ))}
      </Svg>

      <Text style={styles.info}>MoveNet Keypoints</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 1 },
  overlay: { position: 'absolute', width: '100%', height: '100%' },
  info: { position: 'absolute', top: 40, color: 'white', fontSize: 18, textAlign: 'center' },
});

export default CompareScreen;