import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useStore, UserProfile } from '../store/useStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen({ navigation }: any) {
    const [step, setStep] = useState(0);
    const [profile, setProfileState] = useState<Partial<UserProfile>>({});

    const finishOnboarding = useStore(state => state.completeOnboarding);
    const saveProfile = useStore(state => state.setProfile);

    const handleNext = () => {
        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            saveProfile({
                name: profile.name || 'Friend',
                focus: profile.focus || 'philosophy',
                struggle: profile.struggle || 'General growth',
                admires: profile.admires || 'Marcus Aurelius',
            } as UserProfile);
            finishOnboarding();
        }
    };

    const questions = [
        {
            title: 'Welcome.',
            subtitle: 'What shall I call you?',
            type: 'input',
            field: 'name',
            placeholder: 'Your name...'
        },
        {
            title: 'What brings you here today?',
            type: 'choice',
            field: 'struggle',
            options: [
                { label: 'I want to be more disciplined.', value: 'Discipline and focus' },
                { label: 'I feel lost and need guidance.', value: 'Finding purpose' },
                { label: 'To stop caring about what others think.', value: 'Social anxiety and confidence' },
                { label: 'I just love learning history/philosophy.', value: 'Curiosity and learning' },
            ]
        },
        {
            title: 'How do you prefer to learn?',
            type: 'choice',
            field: 'focus',
            options: [
                { label: 'Tough love. Tell it to me straight.', value: 'tough_love' },
                { label: 'Gentle and empathetic guidance.', value: 'empathy' },
                { label: 'Purely historical facts and stories.', value: 'history' },
                { label: 'Deep philosophical concepts.', value: 'philosophy' },
            ]
        },
        {
            title: 'Lastly, who is a thinker you admire?',
            subtitle: 'This helps me shape your mentor.',
            type: 'input',
            field: 'admires',
            placeholder: 'E.g., Marcus Aurelius, Buddha, Tesla'
        }
    ];

    const currentQ = questions[step];

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scroll}>
                    <Text style={styles.title}>{currentQ.title}</Text>
                    {currentQ.subtitle && <Text style={styles.subtitle}>{currentQ.subtitle}</Text>}

                    <View style={styles.contentArea}>
                        {currentQ.type === 'input' ? (
                            <TextInput
                                style={styles.input}
                                placeholder={currentQ.placeholder}
                                placeholderTextColor="#666"
                                value={(profile as any)[currentQ.field] || ''}
                                onChangeText={(text) => setProfileState({ ...profile, [currentQ.field]: text })}
                                autoFocus
                            />
                        ) : (
                            <View style={styles.optionsContainer}>
                                {currentQ.options?.map((opt, i) => {
                                    const isSelected = (profile as any)[currentQ.field] === opt.value;
                                    return (
                                        <TouchableOpacity
                                            key={i}
                                            style={[styles.optionCard, isSelected && styles.selectedCard]}
                                            onPress={() => setProfileState({ ...profile, [currentQ.field]: opt.value })}
                                        >
                                            <Text style={[styles.optionText, isSelected && styles.selectedText]}>{opt.label}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.btn,
                            (!(profile as any)[currentQ.field] && currentQ.field !== 'admires') && styles.btnDisabled
                        ]}
                        onPress={handleNext}
                        disabled={!(profile as any)[currentQ.field] && currentQ.field !== 'admires'}
                    >
                        <Text style={styles.btnText}>{step === questions.length - 1 ? 'Start Journey' : 'Next'}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    scroll: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        marginBottom: 32,
        textAlign: 'center',
    },
    contentArea: {
        marginVertical: 40,
        minHeight: 200,
    },
    input: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 20,
        color: '#fff',
        fontSize: 20,
        borderWidth: 1,
        borderColor: '#333',
        textAlign: 'center',
    },
    optionsContainer: {
        gap: 16,
    },
    optionCard: {
        backgroundColor: '#111',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#222',
    },
    selectedCard: {
        backgroundColor: '#222',
        borderColor: '#fff',
    },
    optionText: {
        color: '#aaa',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
    selectedText: {
        color: '#fff',
    },
    btn: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 'auto',
    },
    btnDisabled: {
        opacity: 0.3,
    },
    btnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    }
});
