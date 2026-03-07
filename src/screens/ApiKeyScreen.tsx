import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';

export default function ApiKeyScreen() {
    const [keyInput, setKeyInput] = useState('');
    const setApiKey = useStore(state => state.setApiKey);

    const handleSave = () => {
        if (keyInput.trim().length > 10) {
            setApiKey(keyInput.trim());
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.inner}>
                <Text style={styles.title}>Connect Your Engine</Text>
                <Text style={styles.description}>
                    This app runs 100% locally on your device to protect your privacy.
                    It costs $0 to run, but requires your own Google Gemini API Key.
                </Text>

                <TouchableOpacity onPress={() => Linking.openURL('https://aistudio.google.com/app/apikey')}>
                    <Text style={styles.linkText}>Get a free API key here</Text>
                </TouchableOpacity>

                <TextInput
                    style={styles.input}
                    placeholder="Paste Gemini API Key..."
                    placeholderTextColor="#666"
                    value={keyInput}
                    onChangeText={setKeyInput}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <TouchableOpacity
                    style={[styles.btn, keyInput.length < 10 && styles.btnDisabled]}
                    onPress={handleSave}
                    disabled={keyInput.length < 10}
                >
                    <Text style={styles.btnText}>Connect & Start</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    inner: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    },
    description: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    linkText: {
        color: '#4DA8DA',
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 40,
        textDecorationLine: 'underline',
    },
    input: {
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        marginBottom: 24,
    },
    btn: {
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 30,
        alignItems: 'center',
    },
    btnDisabled: {
        opacity: 0.4,
    },
    btnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
