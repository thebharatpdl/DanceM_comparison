import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

const BottomNavBar = ({ onPickVideo, onCompare, showCompareButton }) => {
    return (
        <View style={styles.bottomBar}>
            <TouchableOpacity onPress={() => {}} style={styles.button}>
                <Ionicons name="home-outline" size={30} color="black" />
            </TouchableOpacity>

            <TouchableOpacity onPress={onPickVideo} style={styles.centerButton}>
                <AntDesign name="plussquare" size={30} color="#fff" />
            </TouchableOpacity>

            {showCompareButton && (
                <TouchableOpacity onPress={onCompare} style={styles.compareButton}>
                    <Text style={styles.compareText}>Compare</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => {}} style={styles.button}>
                <Ionicons name="person-outline" size={30} color="black" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#ddd' },
    button: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center' },
    centerButton: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1b2a', borderRadius: 30 },
    compareButton: { padding: 10, height: 40, backgroundColor: '#0d1b2a', borderRadius: 10 },
    compareText: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
});

export default BottomNavBar;
