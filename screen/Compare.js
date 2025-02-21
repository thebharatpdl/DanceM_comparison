import React, { useState, useEffect } from 'react'; 
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Video from 'react-native-video';
import DocumentPicker from 'react-native-document-picker';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { loadPoseModel, extractPoseFromVideo, comparePoses } from '../utils/comparePoses';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomNavBar from '../components/BottomNavBar';

const Compare = () => {
  const [userVideo, setUserVideo] = useState(null);
  const [detector, setDetector] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [showUserVideo, setShowUserVideo] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const originalVideo = require('../asset/original_dance.mp4');

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      const poseDetector = await loadPoseModel();
      setDetector(poseDetector);
    };
    loadModel();
  }, []);

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.video] });
      setUserVideo(result.uri);
      setShowUserVideo(true);
    } catch (error) {
      console.log('Video selection cancelled', error);
    }
  };

  const compareVideos = async () => {
    if (!userVideo || !detector) return;

    const userPose = await extractPoseFromVideo(userVideo, detector);
    const originalPose = await extractPoseFromVideo(originalVideo, detector);

    if (userPose && originalPose) {
      const score = comparePoses(userPose, originalPose);
      setAccuracy(score);
      setShowModal(true);
    } else {
      console.log('Pose not detected in one or both videos');
    }
  };

  return (
    <View style={styles.container}>
      {!showUserVideo && <Video source={originalVideo} style={styles.video} controls />}
      {showUserVideo && userVideo && <Video source={{ uri: userVideo }} style={styles.video} controls />}

      <Modal animationType="slide" transparent={true} visible={showModal} onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Comparison Result</Text>
            <Text style={styles.modalAccuracy}>Accuracy: {accuracy}%</Text>
            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNavBar onPickVideo={pickVideo} onCompare={compareVideos} showCompareButton={showUserVideo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  video: { width: '100%', height: 700, marginTop: -10 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10, alignItems: 'center' },
  modalText: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalAccuracy: { fontSize: 18, color: 'green', marginBottom: 20 },
  closeButton: { padding: 10, backgroundColor: '#e74c3c', borderRadius: 5 },
  closeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default Compare;
