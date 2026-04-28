# Media Controller

Une application Next.js full-stack pour créer et gérer des **playlists audio**, des **projets vidéo** avec transitions professionnelles, et un **convertisseur universel de fichiers multimédia**.

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
- Images → PDF, Fusionner PDFs, Découper PDF, PDF → Images
- Convertir image (PNG / JPEG / WebP / ICO favicon)
- Compresser image, Vidéo → GIF, HTML/URL → PDF
- Vidéo → Audio (MP3, WAV, AAC), Redimensionner vidéo
- Découper audio avec sliders dual-range
- Générateur QR Code (PNG / SVG)
- Signature PDF par glisser-déposer
- Isolation vocale par IA (Demucs — sépare voix et musique)

## Installation locale

### Prérequis

- Node.js 20+
- Python 3.10+
- ffmpeg
- yt-dlp (`pip install yt-dlp`)
- demucs (`pip install demucs`) — requis pour l'isolation vocale

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

| Outil | Rôle |
|---|---|
| Next.js 15 | Framework React (App Router, Server Actions) |
| TypeScript | Typage statique |
| Tailwind CSS | Styles |
| ffmpeg | Conversion et manipulation audio/vidéo |
| yt-dlp | Téléchargement YouTube / SoundCloud |
| pdf-lib | Manipulation PDF (fusion, découpe, signature) |
| mupdf | Rendu PDF → images (WASM) |
| sharp | Traitement d'images |
| puppeteer | HTML/URL → PDF (Chromium headless) |
| qrcode | Génération de QR codes |
| Demucs | Isolation vocale par réseau neuronal (Meta) |

## Dépannage

**`yt-dlp` introuvable**
```bash
yt-dlp --version
# Si absent : pip install yt-dlp
```

**ffmpeg manquant**
```bash
ffmpeg -version
# macOS : brew install ffmpeg
# Linux : apt install ffmpeg
```

**Demucs non installé**
```bash
pip install demucs
```

**Puppeteer échoue dans Docker**  
Vérifiez que `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium` est défini (déjà configuré dans le Dockerfile).

**Uploads échoués**  
Vérifiez que `public/audio`, `public/videos` et `public/converted` existent et sont accessibles en écriture.

## Licence

MIT
