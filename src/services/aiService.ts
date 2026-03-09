import { UserProfile, Lesson, ChatMessage, useStore } from '../store/useStore';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const LONGCAT_API_URL = 'https://api.longcat.chat/openai/v1/chat/completions';

const proxyFetch = async (url: string, headers: Record<string, string>, body: any) => {
  return await fetch('/api/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url, headers, body })
  });
};

export const generateDailyLesson = async (apiKey: string, profile: UserProfile): Promise<Omit<Lesson, 'id' | 'date'>> => {
  const provider = useStore.getState().apiProvider;
  
  const prompt = `
    You are NOT a traditional robotic mentor. You do not use cliches. You do not talk about mountains, journeys, or stepping stones. 
    You are a brutally honest, highly intellectual confidant. 
    Your personality is a strict 50/50 split:
    - 50% Hardcore Discipline: Zero sugar-coating. Real talk ONLY. You point out excuses immediately.
    - 50% Fun-Maxing (Alysa Liu mindset): You find immense joy in the grind. You don't let pressure break you; you treat the struggle like a game. You are highly energetic and somewhat playful, while remaining an absolute killer.

    User Profile:
    - Name: ${profile.name}
    - They are currently struggling with: ${profile.struggle}
    - Their preferred style: ${profile.focus}
    - They admire: ${profile.admires}
    
    You must generate today's Daily Transmission.
    Focus on hardcore reality blended with aggressive optimism and fun. 
    
    Return pure JSON with EXACTLY these three keys: 
    1. "quote" (a raw, unconventional quote from ${profile.admires} or someone similar that isn't a generic cliche)
    2. "insight" (1-2 very short punching paragraphs analyzing the quote against their struggle. Speak like a real human who is extremely dialed in. NO corporate or robotic tone)
    3. "action" (One specific, highly actionable, borderline weird or intense micro-task they must do today to overcome their struggle)
    
    Do not wrap in markdown loops, just output raw valid JSON.
  `;

  if (provider === 'longcat') {
    const response = await proxyFetch(LONGCAT_API_URL, {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }, {
        model: 'longcat-flash-chat',
        response_format: { type: "json_object" },
        messages: [
          {
            role: 'system',
            content: 'You output pure JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      });

    if (!response.ok) throw new Error('Failed to fetch from LongCat');
    const data = await response.json();
    const rawJson = data.choices[0].message.content;
    return JSON.parse(rawJson);
  }

  // GEMINI FALLBACK
  const response = await proxyFetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      'Content-Type': 'application/json' 
    }, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

  if (!response.ok) {
    throw new Error('Failed to fetch from Gemini');
  }

  const data = await response.json();
  const rawJson = data.candidates[0].content.parts[0].text;
  return JSON.parse(rawJson);
};

export const chatWithMentor = async (apiKey: string, profile: UserProfile, history: ChatMessage[], newMessage: string): Promise<string> => {
  const provider = useStore.getState().apiProvider;

  const systemPrompt = `
    You are the user's personal mentor. 
    Their name is ${profile.name}, they admire ${profile.admires}, and their current focus is ${profile.focus} related to ${profile.struggle}.
    Respond as the mentor in less than 100 words. Keep it conversational.
  `;

  if (provider === 'longcat') {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: newMessage }
    ];

    const response = await proxyFetch(LONGCAT_API_URL, {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }, {
        model: 'longcat-flash-chat',
        messages: messages
      });

    if (!response.ok) throw new Error('Failed to fetch chat from LongCat');
    const data = await response.json();
    return data.choices[0].message.content;
  }

  // GEMINI FALLBACK
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  formattedHistory.push({
    role: 'user',
    parts: [{ text: newMessage }]
  });

  const response = await proxyFetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      'Content-Type': 'application/json'
    }, {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: formattedHistory
    });

  if (!response.ok) {
    throw new Error('Failed to fetch chat from Gemini');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

export const analyzeScreenTime = async (apiKey: string, profile: UserProfile, usageData: { appName: string, durationMinutes: number, category: string }[]): Promise<string> => {
  const provider = useStore.getState().apiProvider;

  // Format data for prompt
  const usageString = usageData.map(d => `- ${d.appName}: ${Math.floor(d.durationMinutes / 60)}h ${d.durationMinutes % 60}m (${d.category})`).join('\n');

  const systemPrompt = `
    You are a premium, highly intellectual mentor modeling ${profile.admires}.
    The user is named ${profile.name} and is struggling with: ${profile.struggle}.
    Their learning style is: ${profile.focus}.
  `;

  const userPrompt = `
    Here is my screen time data and application usage today:
    
    ${usageString}

    Provide a brief (max 150 words), incisive analysis of how my time allocation aligns with my goal of overcoming '${profile.struggle}'. 
    If my style is 'tough_love', be absolutely brutal about wasted time. 
    If it is 'empathy', be understanding but constructive.
    Do not use generic formatting, just write directly to me as a mentor evaluating my habits.
  `;

  if (provider === 'longcat') {
    const response = await proxyFetch(LONGCAT_API_URL, {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }, {
        model: 'longcat-flash-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      });

    if (!response.ok) throw new Error('Failed to fetch analysis from LongCat');
    const data = await response.json();
    return data.choices[0].message.content;
  }

  // GEMINI FALLBACK
  const response = await proxyFetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      'Content-Type': 'application/json'
    }, {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
    });

  if (!response.ok) {
    throw new Error('Failed to analyze via Gemini');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

export const reflectOnLesson = async (apiKey: string, profile: UserProfile, lesson: Omit<Lesson, 'id' | 'date'>, reflection: string): Promise<string> => {
  const provider = useStore.getState().apiProvider;

  const systemPrompt = `
    You are the user's 50% fun / 50% hardcore discipline mentor.
    They are reacting to today's lesson:
    Quote: "${lesson.quote}"
    Insight: "${lesson.insight}"
    Action: "${lesson.action}"

    The user's reaction/critique is: "${reflection}"

    If they are making excuses, destroy their excuses entirely. 
    If they had a genuine insight, validate it and push them harder.
    Keep it strictly under 100 words. No robotic metaphors. NO cliches. Speak like a real human.
  `;

  if (provider === 'longcat') {
    const response = await proxyFetch(LONGCAT_API_URL, {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }, {
        model: 'longcat-flash-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: reflection }
        ]
      });

    if (!response.ok) throw new Error('Failed to fetch reflection from LongCat');
    const data = await response.json();
    return data.choices[0].message.content;
  }

  // GEMINI FALLBACK
  const response = await proxyFetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      'Content-Type': 'application/json'
    }, {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: reflection }] }]
    });

  if (!response.ok) {
    throw new Error('Failed to fetch reflection from Gemini');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};
