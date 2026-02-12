# 🎵 Music Mixer

Une application Next.js full-stack pour créer et gérer des **playlists audio** et des **projets vidéo** avec transitions professionnelles.

## ✨ Fonctionnalités

### 🎵 Audio (Playlists)
- 📁 **Upload de fichiers MP3** : Ajoutez vos fichiers audio locaux
- ▶️ **YouTube** : Téléchargez l'audio de vidéos YouTube
- ☁️ **SoundCloud** : Importez des pistes depuis SoundCloud
- 🎵 **Playlists personnalisées** : Créez et organisez vos playlists
- 🎛️ **Mixage automatique** : Fusionnez vos titres avec des transitions douces (crossfade de 3 secondes)
- 🎧 **Lecteur audio intégré** : Écoutez directement vos playlists mixées
- ✏️ **Édition complète** : Modifiez, réorganisez, ajoutez/supprimez des titres
- 🗑️ **Suppression** : Supprimez des playlists

### 🎬 Vidéo (Projets)
- 🎥 **Upload de vidéos** : Importez vos vidéos locales (MP4, AVI, MOV, etc.)
- ▶️ **YouTube** : Téléchargez des vidéos depuis YouTube
- 📷 **Images** : Ajoutez des photos pour créer des diaporamas
- ✨ **Transitions professionnelles** : Fade, Dissolve, Wipe, Slide
- 🎬 **Compilation automatique** : Assemblez vos médias en une vidéo unique
- 📐 **Multi-résolution** : 720p, 1080p, 4K
- ⚙️ **Paramètres personnalisables** : Durée des transitions, durée d'affichage des images, FPS
- 🎞️ **Lecteur vidéo intégré** : Regardez directement vos créations
- ✏️ **Édition complète** : Modifiez paramètres, réorganisez, ajoutez/supprimez des médias
- 🗑️ **Suppression** : Supprimez des projets

### 🎨 Interface
- Design moderne et responsive avec Tailwind CSS
- Navigation intuitive entre Audio et Vidéo
- Indicateurs de progression en temps réel
- Gestion des erreurs avec messages clairs

## 🚀 Installation

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Python 3.7+ (pour yt-dlp)

### Étapes d'installation

1. **Cloner le projet** (ou le télécharger)

```bash
cd music-mixer
```

2. **Installer les dépendances Node.js**

```bash
npm install
```

3. **Installer yt-dlp** (pour YouTube/SoundCloud)

```bash
pip install yt-dlp
```

Ou avec pip3 :
```bash
pip3 install yt-dlp
```

4. **Installer ffmpeg** (requis pour la conversion audio)

**Sur Ubuntu/Debian :**
```bash
sudo apt-get install ffmpeg
```

**Sur macOS :**
```bash
brew install ffmpeg
```

**Sur Windows :**
Téléchargez depuis [ffmpeg.org](https://ffmpeg.org/download.html) et ajoutez au PATH

5. **Lancer l'application**

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
music-mixer/
├── app/
│   ├── page.tsx              # Page d'accueil - Playlists audio
│   ├── videos/
│   │   ├── page.tsx          # Page des projets vidéo
│   │   └── create/
│   │       └── page.tsx      # Création de projet vidéo
│   ├── create/
│   │   └── page.tsx          # Formulaire création playlist
│   ├── api/
│   │   ├── playlists/
│   │   │   └── route.ts      # CRUD playlists audio
│   │   ├── upload/
│   │   │   └── route.ts      # Upload MP3
│   │   ├── download/
│   │   │   └── route.ts      # YouTube/SoundCloud audio
│   │   ├── mix/
│   │   │   └── route.ts      # Mixage audio avec transitions
│   │   ├── video-projects/
│   │   │   └── route.ts      # CRUD projets vidéo
│   │   ├── upload-media/
│   │   │   └── route.ts      # Upload vidéos/images
│   │   ├── download-media/
│   │   │   └── route.ts      # YouTube vidéo
│   │   └── compile-video/
│   │       └── route.ts      # Compilation vidéo
│   ├── layout.tsx            # Layout principal avec navigation
│   └── globals.css           # Styles globaux
├── lib/
│   ├── storage.ts            # Stockage playlists audio (JSON)
│   ├── audio-mixer.ts        # Fusion audio avec FFmpeg
│   ├── video-storage.ts      # Stockage projets vidéo (JSON)
│   └── video-compiler.ts     # Compilation vidéo avec FFmpeg
├── types/
│   ├── playlist.ts           # Types playlists audio
│   └── video.ts              # Types projets vidéo
├── public/
│   ├── audio/                # Fichiers audio (MP3)
│   ├── videos/               # Fichiers vidéo (MP4)
│   ├── images/               # Images uploadées
│   └── thumbnails/           # Miniatures des vidéos
└── data/
    ├── playlists.json        # Base de données playlists
    └── video-projects.json   # Base de données projets vidéo
```

## 🎯 Utilisation

### Créer une nouvelle playlist

1. Cliquez sur "Nouvelle Playlist" sur la page d'accueil
2. Remplissez le nom et la description
3. Ajoutez des titres :
   - **Fichier MP3** : Uploadez un fichier depuis votre ordinateur
   - **YouTube** : Collez l'URL d'une vidéo YouTube
   - **SoundCloud** : Collez l'URL d'une piste SoundCloud
4. Cliquez sur "Créer la playlist"

### Voir vos playlists

Toutes vos playlists sont affichées sur la page d'accueil avec :
- Le nombre de titres
- La date de création
- Les 3 premiers titres

### Mixer une playlist

Une fois votre playlist créée :
1. Cliquez sur le bouton **"🎛️ Créer le Mix"** sur la page d'accueil
2. L'application fusionne automatiquement tous vos titres avec des transitions douces (crossfade de 3 secondes)
3. Un lecteur audio s'affiche avec votre playlist mixée
4. Vous pouvez la réécouter à tout moment ou re-mixer si vous modifiez la playlist

### Créer un projet vidéo

Pour créer un montage vidéo :
1. Allez dans **🎬 Vidéos** → **+ Nouveau Projet**
2. Remplissez le nom et la description
3. Configurez les paramètres (résolution, transitions, durée d'affichage images)
4. Ajoutez vos médias :
   - **🎥 Vidéo locale** : Uploadez depuis votre ordinateur
   - **▶️ YouTube** : Collez l'URL d'une vidéo YouTube
   - **📷 Image** : Uploadez des photos pour un diaporama
5. Cliquez sur **"Créer le projet"**

### Compiler une vidéo

Une fois votre projet créé :
1. Sur la page **Vidéos**, trouvez votre projet
2. Cliquez sur **"🎬 Compiler la Vidéo"**
3. Attendez la compilation (quelques minutes selon la complexité)
4. Un lecteur vidéo s'affiche avec votre montage final
5. Téléchargez ou partagez votre création !

**📖 Consultez `VIDEO_GUIDE.md` pour un guide complet sur le montage vidéo.**

## 🛠️ Technologies utilisées

- **Next.js 15** : Framework React avec App Router
- **TypeScript** : Typage statique
- **Tailwind CSS** : Framework CSS utility-first
- **yt-dlp** : Téléchargement audio depuis YouTube/SoundCloud
- **ffmpeg** : Conversion et manipulation audio

## 📝 Notes importantes

### Stockage des données

- Les playlists sont stockées dans `data/playlists.json`
- Les fichiers audio sont dans `public/audio/`
- Aucune base de données externe nécessaire pour commencer

### Limitations actuelles

- Pas d'authentification utilisateur
- Pas de drag & drop pour réorganiser (utilisation de boutons ▲▼)
- Pas d'historique des versions

## 🔧 Développement futur

- [ ] Drag & drop pour réorganiser les éléments
- [ ] Duplication de playlists/projets
- [ ] Historique des versions avec restauration
- [ ] Ajustement de la durée du crossfade audio
- [ ] Égaliseur et effets audio
- [ ] Export de playlists
- [ ] Partage de playlists/projets
- [ ] Authentification utilisateur
- [ ] Base de données (PostgreSQL/MongoDB)
- [ ] Métadonnées audio automatiques (artiste, durée, pochette)
- [ ] Visualiseur audio
- [ ] Prévisualisation avant compilation
- [ ] Textes et titres animés pour vidéos

## 🐛 Dépannage

### yt-dlp n'est pas trouvé

Assurez-vous que yt-dlp est bien installé et accessible dans le PATH :
```bash
yt-dlp --version
```

### Erreur lors de l'upload de fichiers

Vérifiez que le dossier `public/audio` existe et est accessible en écriture.

### Erreur ffmpeg

Vérifiez l'installation de ffmpeg :
```bash
ffmpeg -version
```

## 📄 Licence

MIT

---

Développé avec ❤️ et Next.js
