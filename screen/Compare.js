import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Video from 'react-native-video';
import DocumentPicker from 'react-native-document-picker';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { comparePoses } from './comparePoses';
import AntDesign  from 'react-native-vector-icons/AntDesign';




const Compare = () => {
    const [userVideo, setUserVideo] = useState(null);
    const [detector, setDetector] = useState(null);
    const [accuracy, setAccuracy] = useState(null);
    const [showUserVideo, setShowUserVideo] = useState(false);

    // Original dance video (stored locally)
    const originalVideo = require('../assets/original_dance.mp4');

    useEffect(() => {
        const loadModel = async () => {
            await tf.ready();
            const model = poseDetection.SupportedModels.MoveNet;
            const poseDetector = await poseDetection.createDetector(model);
            setDetector(poseDetector);
        };
        loadModel();
    }, []);

    // Function to pick a video
    const pickVideo = async () => {
        try {
            const result = await DocumentPicker.pickSingle({
                type: [DocumentPicker.types.video],
            });
            setUserVideo(result.uri);
            setShowUserVideo(true); // Hide original and show user video
        } catch (error) {
            console.log('Video selection cancelled', error);
        }
    };

    const compareVideos = async () => {
        if (!userVideo) return;

        const userPose = await extractPoseFromVideo(userVideo);
        const originalPose = await extractPoseFromVideo(originalVideo);

        if (userPose && originalPose) {
            const score = comparePoses(userPose, originalPose);
            setAccuracy(score);
        }
    };

    return (
        <View style={styles.container}>
            {/* Show Original Video Only If No User Video is Selected */}
            {!showUserVideo && (
                <>
                    <Video source={originalVideo} style={styles.video} controls />
                    <Text style={styles.label}>Original Dance</Text>
                </>
            )}

            {/* User Uploaded Video (Only Shows After Clicking "Try") */}
            {showUserVideo && userVideo && (
                <Video source={{ uri: userVideo }} style={styles.video} controls />
            )}

           {/* Try and Compare Buttons Side by Side */}
           <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={pickVideo} style={styles.tryButton}>
                    <AntDesign name="plussquareo" size={30} color="#fff" />
                    {/* <Text style={styles.tryText}>Try</Text> */}
                </TouchableOpacity>

                {showUserVideo && (
                    <TouchableOpacity onPress={compareVideos} style={styles.compareButton}>
                        <Text style={styles.compareText}>Compare</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Accuracy Score */}
            {accuracy !== null && <Text style={styles.score}>Accuracy: {accuracy}%</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
    video: { width: '100%', height: 700,marginTop: -10 },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
    
    buttonContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginTop: 10 
    },
    
    tryButton: { 
        flexDirection: 'row', 
        width: 50,
        height: 50,
        marginBottom: 20,
        alignItems: 'center', 
        padding: 10, 
        backgroundColor: '#3498db', 
        borderRadius: 10, 
        marginRight: 10 
    },
    
    tryIcon: { width: 30, height: 30, marginRight: 5 },
    tryText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },

    compareButton: { 
        padding: 10, 
        height: 50,
        marginBottom: 20,
        backgroundColor: '#e74c3c', 
        borderRadius: 10 
    },

    compareText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },

    score: { fontSize: 20, fontWeight: 'bold', marginTop: 20, color: 'green' },
});

export default Compare;
