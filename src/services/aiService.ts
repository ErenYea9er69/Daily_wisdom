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
    You are a premium, highly intellectual mentor.
    User Profile:
    - Name: ${profile.name}
    - They are currently struggling with: ${profile.struggle}
    - Their preferred learning style/focus: ${profile.focus}
    - They admire: ${profile.admires}
    
    Write a daily lesson (approx 150-250 words) that addresses their exact struggle using the teachings of the person they admire or related historical/philosophical concepts. 
    Make the tone match their learning style (if tough_love: be direct and blunt. If empathy: be gentle and understanding. If history/philosophy: focus on facts and core theories).
    
    Return pure JSON with exactly these two keys: "title" (a bold, catchy title), and "content" (the lesson text, formatting with line breaks if needed). Do not wrap in markdown loops, just raw valid JSON.
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
