import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Calendar } from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { generateDailyLesson } from '../services/aiService';

export default function HomeScreen({ navigation }: any) {
    const [loading, setLoading] = useState(false);

    const { apiKey, userProfile, lessons, addLesson, markLessonDone, streakCalendar } = useStore();
    const today = new Date().toISOString().split('T')[0];

    const todaysLesson = lessons.find(l => l.date === today);
    const isDone = streakCalendar.includes(today);

    useEffect(() => {
        const fetchLesson = async () => {
            if (!todaysLesson && apiKey && userProfile) {
                setLoading(true);
                try {
                    const result = await generateDailyLesson(apiKey, userProfile);
                    addLesson({
                        id: Date.now().toString(),
                        date: today,
                        title: result.title || 'Daily Mentor',
                        content: result.content || 'A moment of reflection.',
                        category: userProfile.focus
                    });
                } catch (error) {
                    console.error('Failed to generate lesson:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchLesson();
    }, [todaysLesson]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Good Morning, {userProfile?.name}</Text>
                <View style={styles.headerIcons}>
                    <TouchableOpacity onPress={() => navigation.navigate('Calendar')} style={styles.iconBtn}>
                        <Calendar color="#fff" size={24} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Chat')} style={styles.iconBtn}>
                        <MessageCircle color="#fff" size={24} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.loadingText}>Your mentor is writing today's lesson...</Text>
                    </View>
                ) : todaysLesson ? (
                    <View style={styles.lessonCard}>
                        <Text style={styles.lessonTitle}>{todaysLesson.title}</Text>
                        <View style={styles.divider} />
                        <Text style={styles.lessonContent}>{todaysLesson.content}</Text>
                    </View>
                ) : (
                    <View style={styles.center}>
                        <Text style={styles.loadingText}>Couldn't load today's lesson. Check your internet or API key.</Text>
                    </View>
                )}
            </ScrollView>

            {todaysLesson && !isDone && (
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.doneBtn} onPress={() => markLessonDone(today)}>
                        <Text style={styles.doneBtnText}>Mark as Done</Text>
                    </TouchableOpacity>
                </View>
            )}

            {isDone && (
                <View style={styles.footer}>
                    <Text style={styles.streakText}>🔥 You have grown today.</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050505',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
    },
    greeting: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 16,
    },
    iconBtn: {
        padding: 8,
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
    },
    scroll: {
        padding: 24,
        paddingBottom: 100,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    loadingText: {
        color: '#888',
        marginTop: 16,
        fontSize: 16,
    },
    lessonCard: {
        backgroundColor: '#111',
        borderRadius: 24,
        padding: 32,
        borderWidth: 1,
        borderColor: '#222',
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    lessonTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f0f0f0',
        marginBottom: 20,
        lineHeight: 36,
    },
    divider: {
        height: 1,
        backgroundColor: '#333',
        marginBottom: 24,
    },
    lessonContent: {
        fontSize: 18,
        color: '#ccc',
        lineHeight: 28,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 24,
        backgroundColor: 'rgba(5, 5, 5, 0.9)',
    },
    doneBtn: {
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 30,
        alignItems: 'center',
    },
    doneBtnText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    streakText: {
        color: '#4DA8DA',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
    }
});
