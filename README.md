# Media Controller

Une application Next.js full-stack pour créer et gérer des **playlists audio**, des **projets vidéo** avec transitions professionnelles, et un **convertisseur universel** couvrant multimédia, PDF, images, IA, cryptographie et outils développeur.

## Cas d'utilisation

| Besoin | Outil |
|---|---|
| Télécharger une vidéo YouTube en MP3 ou MP4 | Convertisseur → Audio converti |
| Créer une playlist mixée depuis YouTube / SoundCloud | Playlists → Nouvelle playlist |
| Monter une vidéo avec transitions à partir de clips ou d'images | Vidéos → Nouveau projet |
| Convertir des images en PDF ou fusionner des PDFs | Convertisseur → Images → PDF / Fusionner PDFs |
| Extraire chaque page d'un PDF en image PNG | Convertisseur → PDF → Images |
| Convertir une image PNG/JPEG/WebP, créer un favicon ICO | Convertisseur → Convertir image |
| Compresser une image pour le web | Convertisseur → Compresser image |
| Créer un GIF animé depuis une vidéo | Convertisseur → Vidéo → GIF |
| Convertir une page web ou du HTML en PDF | Convertisseur → HTML/URL → PDF |
| Extraire la piste audio d'une vidéo | Convertisseur → Vidéo → Audio |
| Redimensionner ou compresser une vidéo | Convertisseur → Redimensionner vidéo |
| Découper un extrait d'un fichier audio | Convertisseur → Découper audio |
| Générer un QR code PNG ou SVG | Convertisseur → QR Code |
| Signer un PDF avec une image de signature | Convertisseur → Signer PDF |
| Isoler la voix humaine d'une chanson ou d'une vidéo | Convertisseur → Isoler la voix |
| Compresser un PDF | Convertisseur → Compresser PDF |
| Convertir du code entre langages (Python → TS, etc.) | Convertisseur → Convertir code |
| Hacher un texte (SHA-256, bcrypt…) ou encoder en Base64 | Convertisseur → Cryptage |
| Convertir JSON ↔ YAML | Convertisseur → JSON ↔ YAML |
| Décoder et inspecter un token JWT | Convertisseur → JWT Decoder |
| Extraire les sous-titres d'une vidéo YouTube | Convertisseur → Sous-titres YT |
| Raccourcir une URL longue | Convertisseur → Raccourcir URL |
| Supprimer l'arrière-plan d'une image | Convertisseur → Supprimer fond |
| Transcrire un fichier audio en texte (Whisper) | Convertisseur → Transcription |
| Extraire le texte d'un PDF vers Word ou Excel | Convertisseur → PDF → Word/Excel |

## Fonctionnalités

### Audio (Playlists)
- Upload de fichiers MP3 locaux
- Téléchargement depuis YouTube et SoundCloud
- Playlists personnalisées avec mixage automatique (crossfade 3s)
- Lecteur audio intégré
- Découpe audio interactive avec prévisualisation

### Vidéo (Projets)
- Upload de vidéos locales ou depuis YouTube
- Ajout d'images pour diaporamas
- Transitions : Fade, Dissolve, Wipe, Slide
- Compilation en vidéo unique (720p, 1080p, 4K)
- Lecteur vidéo intégré

### Convertisseur universel

**Multimédia**
- Images → PDF, Fusionner PDFs, Découper PDF, PDF → Images, Compresser PDF
- Convertir image (PNG / JPEG / WebP / ICO favicon), Compresser image
- Vidéo → GIF, Vidéo → Audio (MP3, WAV, AAC), Redimensionner vidéo
- Découper audio avec sliders dual-range
- HTML/URL → PDF, Générateur QR Code (PNG / SVG)
- Signature PDF par glisser-déposer
- Isolation vocale par IA (Demucs)

**IA & traitement automatique**
- Convertisseur de code entre langages via Claude AI (Python, TypeScript, Go, Rust, SQL…)
- Transcription audio/vidéo → texte via Whisper (formats txt, srt, vtt)
- Suppression d'arrière-plan d'image via rembg (IA locale)
- Extraction de sous-titres YouTube (SRT / VTT, multilingue)

**PDF avancé**
- PDF → Word (.docx) : extraction de texte en document Word structuré
- PDF → Excel (.xlsx) : extraction de texte ligne par ligne

**Outils développeur**
- Cryptage : hachage (MD5, SHA-256, SHA-512), encodage (Base64, Hex, URL), HMAC, bcrypt
- JWT Decoder : décodage et inspection de tokens JWT (header, payload, expiration)
- JSON ↔ YAML : conversion bidirectionnelle de formats de configuration
- Raccourcisseur d'URL : liens courts avec compteur de clics et historique

## Installation locale

### Prérequis

- Node.js 20+
- Python 3.10+
- ffmpeg
- yt-dlp : `brew install yt-dlp` ou `pip3 install yt-dlp`
- demucs (isolation vocale) : `pip3 install demucs`
- rembg (suppression de fond) : `pip3 install "rembg[cpu]"`
- whisper (transcription) : `pip3 install openai-whisper`

> Les outils Python marqués sont optionnels — les onglets correspondants affichent un message d'installation si la commande est absente.

### Variables d'environnement

Créez un fichier `.env.local` à la racine :

```env
# Requis pour le convertisseur de code (onglet "Convertir code")
ANTHROPIC_API_KEY=sk-ant-...
```

Obtenez une clé API sur [console.anthropic.com](https://console.anthropic.com). Les autres outils fonctionnent sans clé.

### Démarrage

```bash
npm install
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

## Déploiement Docker

### Prérequis

- Docker 24+
- Docker Compose v2

### Construction et lancement

```bash
# Cloner le projet
git clone <repo-url>
cd MediaControllerApp

# Construire et démarrer
docker compose up -d --build
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000).

> **Note :** Le premier lancement de l'outil "Isoler la voix" télécharge les poids du modèle Demucs (~80 Mo). Ils sont mis en cache dans le volume `demucs-cache` et ne sont plus retéléchargés ensuite.

### Commandes utiles
```bash
# just run 
docker run -d \
  --name media-controller \
  -p 3000:3000 \
  media-controller

# Voir les logs en temps réel
docker compose logs -f

# Arrêter
docker compose down

# Rebuild après modification du code
docker compose up -d --build

# Supprimer aussi les volumes (efface toutes les données)
docker compose down -v
```

### Données persistantes

Les fichiers utilisateur sont montés via des volumes Docker définis dans `docker-compose.yml` :

| Volume | Contenu |
|---|---|
| `./data` | Playlists et métadonnées (JSON) |
| `./public/audio` | Fichiers audio uploadés et convertis |
| `./public/videos` | Fichiers vidéo |
| `./public/converted` | Résultats des conversions |
| `demucs-cache` | Poids du modèle Demucs (cache) |

### Reverse proxy Nginx (optionnel)

Pour exposer l'application sur un domaine avec HTTPS :

```nginx
server {
    listen 80;
    server_name media.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name media.example.com;

    ssl_certificate /etc/letsencrypt/live/media.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/media.example.com/privkey.pem;

    client_max_body_size 500M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Structure du projet

```
MediaControllerApp/
├── app/
│   ├── page.tsx                  # Page d'accueil
│   ├── playlists/                # Gestion des playlists audio
│   ├── videos/                   # Gestion des projets vidéo
│   ├── converter/                # Convertisseur universel
│   ├── components/               # Composants React partagés
│   └── api/                      # Routes API Next.js
├── lib/
│   ├── file-converter.ts         # Fonctions de conversion (ffmpeg, pdf-lib, sharp…)
│   ├── audio-mixer.ts            # Mixage audio
│   ├── video-compiler.ts         # Compilation vidéo
│   └── *-storage.ts              # Stockage JSON
├── types/                        # Types TypeScript
├── public/
│   ├── audio/                    # Fichiers audio
│   ├── videos/                   # Fichiers vidéo
│   ├── converted/                # Fichiers convertis
│   └── autograph.png             # Signature par défaut (outil Signer PDF)
├── data/                         # Base de données JSON
├── Dockerfile
├── docker-compose.yml
└── .dockerignore
```

## Technologies

### Stack principale

| Outil | Rôle |
|---|---|
| Next.js 15 | Framework React (App Router) |
| TypeScript | Typage statique |
| Tailwind CSS | Styles |
| React 19 | UI |

### Dépendances npm

| Package | Rôle |
|---|---|
| `fluent-ffmpeg` | Conversion et manipulation audio/vidéo |
| `pdf-lib` | Manipulation PDF (fusion, découpe, signature) |
| `mupdf` | Rendu PDF → images (WebAssembly) |
| `sharp` | Traitement et compression d'images |
| `puppeteer` | HTML/URL → PDF (Chromium headless) |
| `qrcode` | Génération de QR codes PNG / SVG |
| `docx` | Génération de fichiers Word (.docx) |
| `xlsx` | Génération de fichiers Excel (.xlsx) |
| `pdf-parse` | Extraction de texte depuis un PDF |
| `js-yaml` | Conversion JSON ↔ YAML |
| `bcryptjs` | Hachage bcrypt (outil cryptage) |
| `@anthropic-ai/sdk` | API Claude AI (convertisseur de code) |
| `uuid` | Génération d'identifiants uniques |
| `formidable` | Gestion des uploads multipart |
| `demucs` (npm wrapper) | Isolation vocale |

### Outils système (CLI)

| Outil | Rôle | Installation |
|---|---|---|
| `ffmpeg` | Encodage audio/vidéo | `brew install ffmpeg` |
| `yt-dlp` | Téléchargement YouTube/SoundCloud | `brew install yt-dlp` |
| `whisper` | Transcription audio → texte (OpenAI) | `pip3 install openai-whisper` |
| `rembg` | Suppression de fond d'image (IA) | `pip3 install "rembg[cpu]"` |
| `demucs` | Séparation voix/musique (Meta) | `pip3 install demucs` |

## Dépannage

**`yt-dlp` introuvable**
```bash
yt-dlp --version
# macOS : brew install yt-dlp
# Mise à jour : yt-dlp -U
```

**ffmpeg manquant**
```bash
ffmpeg -version
# macOS : brew install ffmpeg
# Linux : apt install ffmpeg
```

**Demucs non installé**
```bash
pip3 install demucs
```

**rembg — "No onnxruntime backend found"**
```bash
pip3 install "rembg[cpu]"
# Ne pas faire : pip3 install rembg (sans [cpu])
```

**Whisper non installé**
```bash
pip3 install openai-whisper
whisper --help  # vérification
```

**Convertisseur de code ne fonctionne pas**  
Vérifiez que `ANTHROPIC_API_KEY` est défini dans `.env.local` et que la clé est valide sur [console.anthropic.com](https://console.anthropic.com).

**Puppeteer échoue dans Docker**  
Vérifiez que `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium` est défini (déjà configuré dans le Dockerfile).

**Uploads échoués**  
Vérifiez que `public/audio`, `public/videos` et `public/converted` existent et sont accessibles en écriture.

## Licence

MIT
