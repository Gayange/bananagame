import { StyleSheet } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './src/screen/HomeScreen';
import LoginScreen from './src/screen/LoginScreen';
import SignupScreen from './src/screen/SignUpScreen';
import LevelScreen from './src/screen/LevelScreen';
import GameScreen from './src/screen/GameScreen';
import ResultScreen from './src/screen/ResultScreen';
import BoardScreen from './src/screen/LeaderBoardScreen';
import ProfileScreen from './src/screen/ProfileScreen';
import { UserProvider } from '../Frontend/contexts/UserContext'; // Import the context provider

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <UserProvider> 
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="HOME" component={HomeScreen} />
          <Stack.Screen name="LOGIN" component={LoginScreen} />
          <Stack.Screen name="SIGNUP" component={SignupScreen} />
          <Stack.Screen name="LEVELSELECTION" component={LevelScreen} />
          <Stack.Screen name="GAME" component={GameScreen} />
          <Stack.Screen name="RESULTSCREEN" component={ResultScreen} />
          <Stack.Screen name="BOARDSCREEN" component={BoardScreen} />
          <Stack.Screen name="PROFILESCREEN" component={ProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
};

export default App;

const styles = StyleSheet.create({});
