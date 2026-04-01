import { Router, Request, Response, NextFunction } from 'express';

export const summaryRouter = Router();

const SYSTEM_PROMPTS = {
  he: `אתה עוזר למחנכים לכתוב סיכומי שנה לתלמידים. קיבלת אוסף הערות שנכתבו לאורך השנה.
כתוב סיכום מקצועי בעברית בגוף שלישי, עם 5 כותרות ברורות ולכל אחת פסקה קצרה:
1. התנהגות כללית
2. השתתפות בשיעורים
3. יחסים חברתיים
4. אחריות ומשימות
5. התפתחות אישית לאורך השנה
הסיכום יהיה חם, מקצועי, מאוזן — יציין חוזקות ותחומים לצמיחה.`,

  en: `You help teachers write end-of-year student summaries. You receive a collection of notes written throughout the year. Write a professional third-person summary in English with 5 clear section headings, each followed by a short paragraph:
1. General Behavior
2. Class Participation
3. Social Relationships
4. Responsibility & Tasks
5. Personal Growth Throughout the Year
The tone should be warm, professional, and balanced — noting strengths and growth areas.`,
};

// POST /api/summary
summaryRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentName, notes, language } = req.body as {
      studentName: string;
      notes: string[];
      language: 'en' | 'he';
    };

    if (!studentName || !Array.isArray(notes) || notes.length === 0) {
      res.status(400).json({ error: 'studentName and notes[] are required' });
      return;
    }

    const lang = language === 'he' ? 'he' : 'en';
    const systemPrompt = SYSTEM_PROMPTS[lang];

    const notesText =
      lang === 'he'
        ? `שם התלמיד: ${studentName}\n\nהערות תצפית:\n${notes.map((n, i) => `${i + 1}. ${n}`).join('\n')}`
        : `Student name: ${studentName}\n\nObservation notes:\n${notes.map((n, i) => `${i + 1}. ${n}`).join('\n')}`;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured' });
      return;
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: notesText }],
      }),
    });

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.text();
      console.error('Anthropic API error:', errBody);
      res.status(502).json({ error: 'Failed to generate summary' });
      return;
    }

    const data = (await anthropicRes.json()) as {
      content: Array<{ type: string; text: string }>;
    };

    const summary = data.content.find((c) => c.type === 'text')?.text ?? '';
    res.json({ summary });
  } catch (err) {
    next(err);
  }
});
