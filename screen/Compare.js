import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import Video from 'react-native-video';
import DocumentPicker from 'react-native-document-picker';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import 'react-native-url-polyfill/auto'; // Ensure it's at the top

import { comparePoses } from '../utils/comparePoses'; // Ensure this function exists
import BottomNavBar from '../components/BottomNavBar';

const Compare = () => {
    const [userVideo, setUserVideo] = useState(null);
    const [detector, setDetector] = useState(null);
    const [accuracy, setAccuracy] = useState(null);
    const [showUserVideo, setShowUserVideo] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false); // New state to manage loading state
    const [isModelReady, setIsModelReady] = useState(false); // State to track if the model is ready

    const originalVideo = require('../asset/original_dance.mp4'); // Ensure this path is correct

    useEffect(() => {
        const loadModel = async () => {
            console.log("Loading TensorFlow.js model...");
            await tf.ready();
            const poseDetector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
            setDetector(poseDetector);
            setIsModelReady(true); // Mark the model as ready once it's loaded
            console.log("Model loaded successfully.");
        };
        loadModel();
    }, []);

    const pickVideo = async () => {
        try {
            console.log("Opening document picker...");
            const result = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.video] });
            console.log("User selected video:", result.uri);
            setUserVideo(result.uri);
            setShowUserVideo(true);
        } catch (error) {
            console.log("Video selection cancelled", error);
        }
    };

    const extractPoseFromVideo = async (videoUri) => {
        if (!detector) {
            console.log("Pose detector is not initialized.");
            return null;
        }

        console.log("Extracting pose from video:", videoUri);
        try {
            const videoElement = document.createElement('video');
            videoElement.src = videoUri;
            await videoElement.play();

            const poses = await detector.estimatePoses(videoElement);
            if (poses.length > 0) {
                console.log("Pose extracted successfully.");
                return poses[0]; // Return first detected pose
            } else {
                console.log("No pose detected.");
            }
        } catch (error) {
            console.error("Error extracting pose:", error);
        }
        return null;
    };

    const compareVideos = async () => {
        console.log("Going Well......");

        if (!isModelReady) {
            console.log("Error: Pose detector is not ready yet.");
            return;
        }

        if (!userVideo) {
            console.log("No user video selected.");
            return;
        }

        setIsProcessing(true); // Start processing (show loading animation)

        console.log("Extracting user pose...");
        const userPose = await extractPoseFromVideo(userVideo);
        console.log("User Pose:", userPose);

        console.log("Extracting original pose...");
        const originalPose = await extractPoseFromVideo(originalVideo);
        console.log("Original Pose:", originalPose);

        if (!userPose || !originalPose) {
            console.log("Pose extraction failed.");
            setIsProcessing(false); // Stop processing (hide loading animation)
            return;
        }

        const score = comparePoses(userPose, originalPose);
        console.log("Comparison score:", score);

        setAccuracy(score);
        setShowModal(true);
        setIsProcessing(false); // Stop processing (hide loading animation)
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

            {/* Show loading spinner when processing */}
            {isProcessing && (
                <ActivityIndicator size="large" color="#0000ff" style={styles.spinner} />
            )}

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
    spinner: { position: 'absolute', top: '50%', left: '50%', marginLeft: -25, marginTop: -25 }, // Adjust position of the spinner
});

export default Compare;
