import { NextRequest, NextResponse } from 'next/server';

function csvToJson(csv: string): unknown[] {
  const lines = csv.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseCsvLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ''; });
    return obj;
  });
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function jsonToCsv(data: unknown[]): string {
  if (!Array.isArray(data) || data.length === 0) return '';
  const headers = Object.keys(data[0] as Record<string, unknown>);
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = data.map(row =>
    headers.map(h => escape((row as Record<string, unknown>)[h])).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const { direction, input } = await request.json() as { direction: 'csv-to-json' | 'json-to-csv'; input: string };
    if (!input?.trim()) return NextResponse.json({ error: 'Entrée vide.' }, { status: 400 });

    if (direction === 'csv-to-json') {
      const result = csvToJson(input);
      return NextResponse.json({ output: JSON.stringify(result, null, 2) });
    }

    if (direction === 'json-to-csv') {
      let parsed: unknown;
      try { parsed = JSON.parse(input); } catch { return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 }); }
      if (!Array.isArray(parsed)) return NextResponse.json({ error: 'Le JSON doit être un tableau d\'objets.' }, { status: 400 });
      return NextResponse.json({ output: jsonToCsv(parsed) });
    }

    return NextResponse.json({ error: 'Direction inconnue.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Erreur de traitement.' }, { status: 500 });
  }
}
