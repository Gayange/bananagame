import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { colors } from '../utils/colors';
import { fonts } from '../utils/fonts';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {

  const navigation = useNavigation();

  const handleLogin = () => {
    navigation.navigate("LOGIN");
  };

  return (
    <View style={styles.container}>
      <Image source={require("../assets/logo.png")} style={styles.logo} />
      <Image source={require("../assets/man.png")} style={styles.bannerImage} />
      <Text style={styles.title}>Welcome to Banana Game</Text>
      <Text style={styles.subtitle}>
        A simple, yet challenging game where you need to collect and store bananas while avoiding obstacles.
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.loginButtonWrapper, { backgroundColor: colors.primary }]}
        onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signupButtonWrapper}>
          <Text style={styles.signupButtonText}>Sign-up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  logo: {
    height: 40,
    width: 150,
    marginVertical: 50,
  },
  bannerImage: {
    marginVertical: 30,
    height: 250,
    width: 231,
  },
  title: {
    fontSize: 36,
    fontFamily: fonts.SemiBold,
    paddingHorizontal: 20,
    textAlign: 'center',
    color: colors.primary,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    paddingHorizontal: 20,
    textAlign: 'center',
    color: colors.secondary,
    fontFamily: fonts.Medium,
    marginVertical: 20,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "row",
    borderWidth: 2,
    borderColor: colors.primary,
    width: "80%",
    height: 60,
    borderRadius: 100,
  },
  loginButtonWrapper: {
    justifyContent: 'center',
    alignItems: "center",
    width: "50%",
    borderRadius: 98,
  },
  signupButtonWrapper: {
    justifyContent: 'center',
    alignItems: "center",
    width: "50%",
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fonts.SemiBold,
  },
  signupButtonText: {
    fontSize: 18,
    fontFamily: fonts.SemiBold,
  },
});
