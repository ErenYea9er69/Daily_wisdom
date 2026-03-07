import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useStore } from '../store/useStore';

export default function CalendarScreen() {
    const { streakCalendar } = useStore();

    const markedDates = streakCalendar.reduce((acc, dateString) => {
        acc[dateString] = { selected: true, selectedColor: '#fff', selectedTextColor: '#000' };
        return acc;
    }, {} as any);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Journey So Far</Text>
            <Text style={styles.subtitle}>Every highlighted day is a day you chose to grow over comfort.</Text>

            <View style={styles.calendarContainer}>
                <Calendar
                    theme={{
                        backgroundColor: '#0a0a0a',
                        calendarBackground: '#111',
                        textSectionTitleColor: '#666',
                        selectedDayBackgroundColor: '#fff',
                        selectedDayTextColor: '#000',
                        todayTextColor: '#4DA8DA',
                        dayTextColor: '#fff',
                        textDisabledColor: '#333',
                        monthTextColor: '#fff',
                        arrowColor: '#fff',
                        textDayFontWeight: '500',
                        textMonthFontWeight: 'bold',
                        textDayHeaderFontWeight: '600',
                    }}
                    markedDates={markedDates}
                />
            </View>

            <View style={styles.stats}>
                <Text style={styles.statLabel}>Total Days: </Text>
                <Text style={styles.statValue}>{streakCalendar.length}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 40,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        marginBottom: 40,
        lineHeight: 24,
    },
    calendarContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333',
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        padding: 24,
        backgroundColor: '#111',
        borderRadius: 20,
        borderColor: '#222',
        borderWidth: 1,
    },
    statLabel: {
        color: '#888',
        fontSize: 18,
    },
    statValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    }
});
