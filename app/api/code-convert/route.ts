import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const SUPPORTED_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
  'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'r',
  'bash', 'sql', 'html', 'css', 'json', 'yaml', 'xml',
];

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'sk-ant-VOTRE_CLE_ICI') {
    return NextResponse.json(
      { error: 'Clé API Anthropic non configurée. Ajoutez ANTHROPIC_API_KEY dans .env.local' },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { code, fromLang, toLang, instructions } = body;

  if (!code?.trim()) {
    return NextResponse.json({ error: 'Code source manquant' }, { status: 400 });
  }
  if (!fromLang || !toLang) {
    return NextResponse.json({ error: 'Langages source et cible requis' }, { status: 400 });
  }
  if (fromLang === toLang) {
    return NextResponse.json({ error: 'Les langages source et cible sont identiques' }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const systemPrompt = `Tu es un expert en conversion de code entre langages de programmation.
Règles strictes :
- Réponds UNIQUEMENT avec le code converti, sans explication ni markdown.
- Pas de blocs \`\`\` ni de texte avant/après le code.
- Preserve la logique, les noms de variables et la structure autant que possible.
- Adapte les idiomes au langage cible (ex: list comprehension Python → map/filter JS).
- Si la conversion est impossible, réponds avec un commentaire dans le langage cible.`;

  const userPrompt = `Convertis ce code ${fromLang} en ${toLang}${instructions ? `. Instructions supplémentaires : ${instructions}` : ''}.

Code source :
${code}`;

  const stream = client.messages.stream({
    model: 'claude-opus-4-8',
    max_tokens: 8192,
    thinking: { type: 'adaptive' },
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const message = await stream.finalMessage();

  const textBlock = message.content.find(b => b.type === 'text');
  const convertedCode = textBlock?.type === 'text' ? textBlock.text.trim() : '';

  return NextResponse.json({
    convertedCode,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
  });
}

export { SUPPORTED_LANGUAGES };
