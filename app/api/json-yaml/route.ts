import { NextRequest, NextResponse } from 'next/server';
import { dump, load } from 'js-yaml';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { input, direction } = body;

  if (!input?.trim()) return NextResponse.json({ error: 'Entrée manquante' }, { status: 400 });

  try {
    if (direction === 'json-to-yaml') {
      const parsed = JSON.parse(input);
      const result = dump(parsed, { indent: 2, lineWidth: -1 });
      return NextResponse.json({ result });
    } else {
      const parsed = load(input);
      const result = JSON.stringify(parsed, null, 2);
      return NextResponse.json({ result });
    }
  } catch (e) {
    return NextResponse.json({ error: `Format invalide : ${(e as Error).message}` }, { status: 400 });
  }
}
