import { NextRequest, NextResponse } from 'next/server';
import { createHash, createHmac } from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { operation, input, algorithm, key, saltRounds, hashToVerify } = body;

  if (!input && operation !== 'bcrypt-verify') {
    return NextResponse.json({ error: 'Texte source manquant' }, { status: 400 });
  }

  try {
    switch (operation) {
      case 'hash': {
        const validAlgos = ['md5', 'sha1', 'sha256', 'sha384', 'sha512'];
        if (!validAlgos.includes(algorithm)) {
          return NextResponse.json({ error: 'Algorithme non supporté' }, { status: 400 });
        }
        const result = createHash(algorithm).update(input, 'utf8').digest('hex');
        return NextResponse.json({ result });
      }

      case 'hmac': {
        const validAlgos = ['sha256', 'sha512'];
        if (!validAlgos.includes(algorithm)) {
          return NextResponse.json({ error: 'Algorithme HMAC non supporté' }, { status: 400 });
        }
        if (!key) {
          return NextResponse.json({ error: 'Clé secrète manquante' }, { status: 400 });
        }
        const result = createHmac(algorithm, key).update(input, 'utf8').digest('hex');
        return NextResponse.json({ result });
      }

      case 'bcrypt-hash': {
        const rounds = Math.min(Math.max(parseInt(saltRounds) || 10, 4), 14);
        const result = await bcrypt.hash(input, rounds);
        return NextResponse.json({ result });
      }

      case 'bcrypt-verify': {
        if (!input || !hashToVerify) {
          return NextResponse.json({ error: 'Mot de passe et hash requis' }, { status: 400 });
        }
        const match = await bcrypt.compare(input, hashToVerify);
        return NextResponse.json({ result: match ? '✅ Correspond' : '❌ Ne correspond pas', match });
      }

      default:
        return NextResponse.json({ error: 'Opération non reconnue' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Erreur lors du traitement' }, { status: 500 });
  }
}
