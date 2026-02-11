# 🚀 Guide de démarrage rapide - Music Mixer

## 📦 Ce qui a été créé

Votre projet Next.js complet avec :
- ✅ Structure de l'application (App Router)
- ✅ Page d'accueil avec liste des playlists
- ✅ Page de création de playlist avec formulaire
- ✅ API pour gérer les playlists (CRUD)
- ✅ API pour uploader des fichiers MP3
- ✅ API pour télécharger depuis YouTube/SoundCloud
- ✅ Système de stockage en JSON
- ✅ Types TypeScript
- ✅ Styling avec Tailwind CSS
- ✅ Configuration complète

## 🎯 Prochaines étapes

### 1. Installer les dépendances

```bash
cd music-mixer
npm install
```

### 2. Installer les outils système

**yt-dlp** (pour YouTube/SoundCloud) :
```bash
pip install yt-dlp
# ou
pip3 install yt-dlp
```

**ffmpeg** (pour l'audio) :
- Ubuntu/Debian : `sudo apt-get install ffmpeg`
- macOS : `brew install ffmpeg`
- Windows : Télécharger depuis ffmpeg.org

### 3. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez http://localhost:3000 dans votre navigateur.

## 🎨 Fonctionnalités disponibles

### Page d'accueil (/)
- Affiche toutes vos playlists
- Montre le nombre de titres et la date de création
- Liste tous les titres de chaque playlist
- **Bouton "Créer le Mix"** : Lance le mixage automatique avec transitions
- **Lecteur audio intégré** : Lecture directe du mix final
- Indicateur de progression pendant le mixage
- Affichage de la durée totale du mix

### Page de création (/create)
- Formulaire pour nommer et décrire la playlist
- 3 types d'ajout de musique :
  1. **📁 Fichier MP3** : Upload depuis votre ordinateur
  2. **▶️ YouTube** : Coller une URL YouTube
  3. **☁️ SoundCloud** : Coller une URL SoundCloud
- Ajout multiple de titres
- Validation avant création

### Mixage audio
- Fusion automatique de tous les titres avec **transitions douces de 3 secondes** (crossfade)
- Utilisation de FFmpeg pour un résultat professionnel
- Sauvegarde automatique du fichier mixé
- Possibilité de re-mixer à tout moment

## 📁 Fichiers importants

### Frontend
- `app/page.tsx` : Page d'accueil
- `app/create/page.tsx` : Formulaire de création
- `app/layout.tsx` : Navigation et structure

### Backend (API Routes)
- `app/api/playlists/route.ts` : GET, POST, DELETE playlists
- `app/api/upload/route.ts` : Upload de fichiers MP3
- `app/api/download/route.ts` : Téléchargement YouTube/SoundCloud

### Logique métier
- `lib/storage.ts` : Gestion du stockage JSON
- `types/playlist.ts` : Interfaces TypeScript

### Stockage
- `data/playlists.json` : Base de données des playlists (créé automatiquement)
- `public/audio/` : Fichiers audio stockés

## 🔧 Personnalisation

### Ajouter un lecteur audio

Vous pouvez utiliser l'élément HTML5 `<audio>` :
```tsx
<audio controls src={`/audio/${track.filename}`}>
  Votre navigateur ne supporte pas l'audio.
</audio>
```

### Modifier la durée du crossfade

Éditez `/lib/audio-mixer.ts` ligne 15 pour changer la durée des transitions :
```typescript
const crossfadeDuration = options.crossfadeDuration || 5; // 5 secondes au lieu de 3
```

### Modifier les couleurs

Éditez `tailwind.config.ts` pour personnaliser le thème.

### Ajouter une base de données

Pour passer à PostgreSQL ou MongoDB :
1. Installer Prisma ou Mongoose
2. Modifier `lib/storage.ts` pour utiliser la DB
3. Les interfaces TypeScript restent les mêmes

## 🎛️ Fonctionnement du mixage

Le mixage utilise FFmpeg avec le filtre `acrossfade` :
- Chaque transition dure 3 secondes par défaut
- La fin d'un titre se mélange progressivement avec le début du suivant
- Courbes de transition triangulaires pour un résultat naturel

Pour plus de détails techniques, consultez `TECHNICAL_MIXING.md`.

## 🐛 Problèmes courants

### "yt-dlp n'est pas trouvé"
```bash
# Vérifier l'installation
yt-dlp --version

# Si non installé
pip install yt-dlp
```

### "ffmpeg n'est pas trouvé"
```bash
# Vérifier l'installation
ffmpeg -version

# Installer selon votre OS
```

### Erreur de permissions sur public/audio
```bash
chmod 755 public/audio
```

## 📚 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Documentation yt-dlp](https://github.com/yt-dlp/yt-dlp)

## 🎉 C'est parti !

Votre projet est prêt. Lancez `npm run dev` et commencez à créer vos playlists !
