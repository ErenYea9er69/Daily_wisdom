import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';

export default function ApiKeyScreen() {
    const [keyInput, setKeyInput] = useState('');
    const [provider, setProvider] = useState<'gemini' | 'longcat'>('gemini');
    const setApiKey = useStore(state => state.setApiKey);

    const handleSave = () => {
        if (keyInput.trim().length > 10) {
            setApiKey(keyInput.trim(), provider);
        }
    };

    const getProviderLink = () => {
        return provider === 'gemini'
            ? 'https://aistudio.google.com/app/apikey'
            : 'https://longcat.chat/';
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.inner}>
                <Text style={styles.title}>Connect Your Engine</Text>
                <Text style={styles.description}>
                    This app runs 100% locally to protect your privacy.
                    Select your AI provider and paste your API key below.
                </Text>

                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, provider === 'gemini' && styles.toggleBtnActive]}
                        onPress={() => setProvider('gemini')}
                    >
                        <Text style={[styles.toggleText, provider === 'gemini' && styles.toggleTextActive]}>Gemini</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, provider === 'longcat' && styles.toggleBtnActive]}
                        onPress={() => setProvider('longcat')}
                    >
                        <Text style={[styles.toggleText, provider === 'longcat' && styles.toggleTextActive]}>LongCat</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => Linking.openURL(getProviderLink())}>
                    <Text style={styles.linkText}>Get a free {provider === 'gemini' ? 'Gemini' : 'LongCat'} API key</Text>
                </TouchableOpacity>

                <TextInput
                    style={styles.input}
                    placeholder={`Paste ${provider === 'gemini' ? 'Gemini' : 'LongCat'} API Key...`}
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
        marginBottom: 24,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#111',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 24,
        padding: 4,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    toggleBtnActive: {
        backgroundColor: '#333',
    },
    toggleText: {
        color: '#888',
        fontSize: 14,
        fontWeight: 'bold',
    },
    toggleTextActive: {
        color: '#fff',
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
