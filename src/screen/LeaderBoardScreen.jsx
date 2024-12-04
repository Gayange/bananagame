import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LeaderBoardScreen = ({ navigation }) => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [error, setError] = useState(null);
    const [activeButton, setActiveButton] = useState(null); // To track the clicked button

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const token = await AsyncStorage.getItem('jwtToken');
                if (!token) {
                    setError('Token not found. Please log in again.');
                    return;
                }

                const response = await axios.get(
                    'http://192.168.43.54:5161/api/game/leaderboard?top=10',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setLeaderboard(response.data);
            } catch (err) {
                setError('Error fetching leaderboard: ' + err.message);
            }
        };

        fetchLeaderboard().catch(err => {
            setError('Unexpected error: ' + err.message);
        });
    }, []);

    const handleButtonPress = button => {
        setActiveButton(button);
        if (button === 'playAgain') {
            navigation.navigate('LEVELSELECTION');
        } else if (button === 'exit') {
            AsyncStorage.removeItem('jwtToken')
                .then(() => navigation.navigate('Login'))
                .catch(err => setError('Error logging out: ' + err.message));
        }
    };

    if (error) return <Text style={styles.error}>{error}</Text>;

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../assets/bananaback.png')}
                style={styles.leaderboardCardBackground}
                imageStyle={styles.backgroundImage}
            >
                <View style={styles.leaderboardCard}>
                    <Text style={styles.title}>Leaderboard</Text>
                    <ScrollView style={styles.table}>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableHeader}>Rank</Text>
                            <Text style={styles.tableHeader}>Name</Text>
                            <Text style={styles.tableHeader}>Points</Text>
                        </View>
                        {leaderboard.map((entry, index) => (
                            <View
                                key={`${entry.username}-${index}`}
                                style={styles.tableRow}
                            >
                                <Text style={styles.tableData}>{index + 1}</Text>
                                <Text style={styles.tableData}>
                                    {entry.username}
                                </Text>
                                <Text style={styles.tableData}>
                                    {entry.points}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </ImageBackground>

            {/* Footer with glassy effect */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.footerButton,
                        activeButton === 'playAgain' && styles.activeButton,
                    ]}
                    onPress={() => handleButtonPress('playAgain')}
                >
                    <Ionicons name="play-circle-outline" size={28} color="white" />
                    <Text style={styles.footerText}>Play Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.footerButton,
                        activeButton === 'exit' && styles.activeButton,
                    ]}
                    onPress={() => handleButtonPress('exit')}
                >
                    <Ionicons name="exit-outline" size={28} color="white" />
                    <Text style={styles.footerText}>Exit</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#252525',
        padding: 20,
        justifyContent: 'space-between',
    },
    leaderboardCardBackground: {
        flex: 1,
        marginBottom: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    backgroundImage: {
        opacity: 0.3, // Controls glassy background opacity
    },
    leaderboardCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Glassy effect
        padding: 20,
        borderRadius: 12,
        width: '100%',
        height: '100%',
        marginTop: 25

    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
    },
    table: {
        marginTop: 15,
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tableHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        width: '30%',
        textAlign: 'center',
    },
    tableData: {
        fontSize: 14,
        color: '#fff',
        width: '30%',
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Glassy effect
        paddingVertical: 5, // Reduced padding
        borderRadius: 15,
        height: 50, // Smaller height
    },
    footerButton: {
        alignItems: 'center',
        padding: 5, // Reduced padding for buttons
        borderRadius: 10,
        width: '45%',
    },
    footerText: {
        marginTop: -2, // Reduced margin
        color: '#fff',
        fontSize: 10, // Smaller font size
        textAlign: 'center',
    },
    error: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
    },
});

export default LeaderBoardScreen;
