import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './screen/Home';
import Capture from './screen/Capture';
import Compare from './screen/Compare';
const Stack = createStackNavigator();
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Capture" component={Capture} />
        <Stack.Screen name="Compare" component={Compare} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};



export default App;