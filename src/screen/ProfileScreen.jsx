import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const [token, setToken] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch user data from AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Fetching authentication data from AsyncStorage...');
        const storedToken = await AsyncStorage.getItem('jwtToken');
        const storedUserName = await AsyncStorage.getItem('userName');
        const storedUserId = await AsyncStorage.getItem('userId');

        if (storedToken) {
          setToken(storedToken);
          console.log('Token fetched:', storedToken);
        } else {
          console.error('No token found in AsyncStorage');
        }

        if (storedUserName) {
          setUserName(storedUserName);
          console.log('UserName fetched:', storedUserName);
        } else {
          console.error('No userName found in AsyncStorage');
        }

        if (storedUserId) {
          setUserId(storedUserId);
          console.log('UserId fetched:', storedUserId);
        } else {
          console.error('No userId found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching authentication data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateProfile = async () => {
    if (!userId) return;
  
    const updatedData = {
      name: userName,
      email: email,
      password: password,
      phoneNumber: phoneNumber,
    };
  
    console.log('Updating profile with data:', updatedData);
  
    try {
      const response = await fetch(`http://192.168.43.54:5161/api/Auth/User/${userId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData), // Send data in the correct format
      });
  
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
  
      const result = await response.json();
      alert(`Profile successfully updated. Message: ${result.Message}`);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message || 'Error updating profile');
    }
  };
  

  // Handle profile deletion
  const handleDeleteProfile = async () => {
    if (!userId) return;
  
    try {
      const response = await fetch(`http://192.168.43.54:5161/api/Auth/User/${userId}/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete profile');
      }
  
      const result = await response.json();
      alert(`Profile successfully deleted. Message: ${result.Message}`);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message || 'Error deleting profile');
    }
  };
  

  // Show loading state while fetching data
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {token && userName && userId ? (
        <>
          <Text style={styles.text}>Welcome, {userName}!</Text>
          <Text style={styles.text}>Your User ID is:</Text>
          <Text style={styles.userId}>{userId}</Text>

          <Text style={styles.text}>Email:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              console.log('Email:', text); // Log email input
            }}
          />

          <Text style={styles.text}>Phone Number:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              console.log('Phone Number:', text); // Log phone number input
            }}
          />

          <Text style={styles.text}>Password:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your new password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              console.log('Password:', text); // Log password input
            }}
            secureTextEntry // Hide password
          />

          <Button title="Update Profile" onPress={handleUpdateProfile} />
          <Button title="Delete Profile" onPress={handleDeleteProfile} color="red" />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </>
      ) : (
        <Text style={styles.errorText}>Authentication data not found. Please log in.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  userId: {
    fontSize: 16,
    color: 'blue',
    marginTop: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    width: '100%',
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;
