import React from 'react';
import { SafeAreaView, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Capture = () => {
  const navigation = useNavigation(); // Hook to access navigation

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Let's compare video.</Text>
      <Button 
        title="Go for the dance" 
        onPress={() => navigation.navigate('Compare')} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 40,
    marginRight: 20, // Corrected typo: `marginright` to `marginRight`
  },
});

export default Capture;
