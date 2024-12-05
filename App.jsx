import { StyleSheet, ActivityIndicator, View } from 'react-native';
import React, { useState, useEffect } from 'react';
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
import * as Font from 'expo-font';
import { UserProvider } from '../Frontend/contexts/UserContext'; // Import the context provider

const Stack = createNativeStackNavigator();

const loadFonts = async () => {
  await Font.loadAsync({
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Light': require('./assets/fonts/Poppins-Light.ttf'),
    'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
  });
};

const App = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      await loadFonts();
      setFontsLoaded(true);
    })();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

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

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
