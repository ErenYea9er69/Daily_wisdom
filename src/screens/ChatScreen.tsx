import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useStore } from '../store/useStore';
import { chatWithMentor } from '../services/aiService';
import { Send } from 'lucide-react-native';

export default function ChatScreen() {
    const { apiKey, userProfile, chatHistory, addChatMessage } = useStore();
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleSend = async () => {
        if (!inputText.trim() || !apiKey || !userProfile) return;

        const userMessage = {
            id: Date.now().toString(),
            role: 'user' as const,
            content: inputText.trim(),
            timestamp: new Date().toISOString()
        };

        addChatMessage(userMessage);
        setInputText('');
        setLoading(true);

        try {
            const response = await chatWithMentor(apiKey, userProfile, chatHistory, userMessage.content);

            addChatMessage({
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString()
            });
        } catch (e) {
            console.error(e);
            addChatMessage({
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'I apologize, something went wrong with the connection. Let us try again later.',
                timestamp: new Date().toISOString()
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={styles.scroll}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {chatHistory.length === 0 && (
                    <Text style={styles.emptyText}>
                        This is your private space. Vent, reflect, or ask for guidance. I am here to listen.
                    </Text>
                )}

                {chatHistory.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    return (
                        <View key={index} style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
                            <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
                                {msg.content}
                            </Text>
                        </View>
                    );
                })}
                {loading && (
                    <View style={[styles.messageBubble, styles.aiBubble, { width: 60, alignItems: 'center' }]}>
                        <ActivityIndicator size="small" color="#fff" />
                    </View>
                )}
            </ScrollView>

            <View style={styles.inputArea}>
                <TextInput
                    style={styles.input}
                    placeholder="Type your thoughts..."
                    placeholderTextColor="#666"
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                />
                <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={loading || !inputText.trim()}>
                    <Send color={loading || !inputText.trim() ? '#666' : '#fff'} size={24} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    scroll: {
        padding: 16,
        flexGrow: 1,
        justifyContent: 'flex-end',
        gap: 16,
    },
    emptyText: {
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
        fontStyle: 'italic',
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 16,
        borderRadius: 20,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#fff',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#333',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 24,
    },
    userText: {
        color: '#000',
    },
    aiText: {
        color: '#ddd',
    },
    inputArea: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#111',
        borderTopWidth: 1,
        borderTopColor: '#222',
        alignItems: 'center',
        gap: 12,
    },
    input: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        color: '#fff',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
        fontSize: 16,
        maxHeight: 120,
    },
    sendBtn: {
        padding: 12,
        borderRadius: 20,
        backgroundColor: '#222',
    }
});
