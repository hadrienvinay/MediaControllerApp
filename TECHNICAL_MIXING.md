# 🎛️ Guide Technique - Mixage Audio

## Comment fonctionne le mixage ?

### Architecture du mixage

Le système de mixage utilise **FFmpeg** pour fusionner plusieurs fichiers MP3 avec des transitions douces (crossfade).

### Processus étape par étape

1. **Déclenchement** : L'utilisateur clique sur "Créer le Mix"
2. **API Call** : Requête POST vers `/api/mix` avec l'ID de la playlist
3. **Validation** : Vérification de la playlist et des fichiers
4. **Mixage FFmpeg** : Fusion avec filtres complexes
5. **Sauvegarde** : Enregistrement du fichier mixé
6. **Mise à jour** : Ajout des métadonnées à la playlist

### Algorithme de crossfade

```typescript
// Pour chaque paire de pistes consécutives
for (let i = 0; i < tracks.length - 1; i++) {
  const track1 = tracks[i];
  const track2 = tracks[i + 1];
  
  // Appliquer un crossfade de 3 secondes
  // La fin de track1 se mélange avec le début de track2
  applyAcrossfade(track1, track2, duration: 3);
}
```

### Filtre FFmpeg utilisé

```bash
ffmpeg -i track1.mp3 -i track2.mp3 -i track3.mp3 \
  -filter_complex \
  "[0:a][1:a]acrossfade=d=3:c1=tri:c2=tri[a0]; \
   [a0][2:a]acrossfade=d=3:c1=tri:c2=tri[out]" \
  -map "[out]" output.mp3
```

**Paramètres du filtre `acrossfade` :**
- `d=3` : Durée du crossfade en secondes
- `c1=tri` : Courbe de fade-out triangulaire
- `c2=tri` : Courbe de fade-in triangulaire

### Courbes de transition disponibles

FFmpeg propose plusieurs courbes de transition :

- **tri** (triangulaire) : Transition linéaire, la plus naturelle
- **qsin** (quarter sine) : Transition douce, idéale pour la musique
- **esin** (exponential sine) : Transition très douce
- **hsin** (half sine) : Demi-sinus
- **log** : Logarithmique
- **exp** : Exponentielle

Pour modifier la courbe, changez `c1` et `c2` dans `/lib/audio-mixer.ts`.

## Performance

### Temps de mixage estimé

| Nombre de pistes | Durée totale | Temps de mixage |
|------------------|--------------|-----------------|
| 2-3 titres       | ~10 minutes  | 5-10 secondes   |
| 5-10 titres      | ~30 minutes  | 15-30 secondes  |
| 15+ titres       | ~60 minutes  | 1-2 minutes     |

### Optimisations possibles

1. **Traitement en arrière-plan** : Utiliser une queue de jobs (Bull, BullMQ)
2. **Streaming** : Ne pas charger tout en mémoire
3. **Cache** : Ne pas re-mixer si les pistes n'ont pas changé
4. **Compression** : Réduire le bitrate du fichier final

## Personnalisation

### Modifier la durée du crossfade

Dans `/lib/audio-mixer.ts`, ligne ~15 :

```typescript
const crossfadeDuration = options.crossfadeDuration || 3; // Changer la valeur ici
```

Ou passez-le lors de l'appel :

```typescript
await mixTracks(files, output, { crossfadeDuration: 5 }); // 5 secondes
```

### Ajouter des effets audio

Vous pouvez ajouter d'autres filtres FFmpeg :

```typescript
// Exemple : Normalisation audio
filters.push('loudnorm=I=-16:TP=-1.5:LRA=11');

// Exemple : Égaliseur
filters.push('equalizer=f=1000:width_type=h:width=200:g=-10');

// Exemple : Réverbération
filters.push('aecho=0.8:0.88:60:0.4');
```

### Formats de sortie

Actuellement en MP3, mais vous pouvez changer :

```typescript
// Dans /app/api/mix/route.ts
const outputFilename = `mix_${playlistId}_${Date.now()}.wav`; // WAV
const outputFilename = `mix_${playlistId}_${Date.now()}.m4a`; // AAC
```

## Gestion des erreurs

### Erreurs courantes

1. **FFmpeg non installé**
   ```
   Error: spawn ffmpeg ENOENT
   ```
   → Installez FFmpeg : `brew install ffmpeg` ou `apt-get install ffmpeg`

2. **Fichier corrompu**
   ```
   Error: Invalid data found when processing input
   ```
   → Vérifiez que tous les MP3 sont valides

3. **Mémoire insuffisante**
   ```
   Error: Cannot allocate memory
   ```
   → Réduisez le nombre de pistes ou optimisez les fichiers

### Debug

Activez les logs FFmpeg dans `/lib/audio-mixer.ts` :

```typescript
.on('start', (commandLine) => {
  console.log('FFmpeg command:', commandLine);
})
.on('progress', (progress) => {
  console.log(`Processing: ${progress.percent}% done`);
})
.on('stderr', (stderrLine) => {
  console.log('FFmpeg stderr:', stderrLine);
})
```

## Alternatives à FFmpeg

Si FFmpeg pose problème, voici des alternatives :

### 1. Web Audio API (client-side)

```javascript
// Mixer côté navigateur (sans serveur)
const audioContext = new AudioContext();
const tracks = await Promise.all(urls.map(url => fetch(url).then(r => r.arrayBuffer())));
// ... mélanger avec gainNode et délais
```

**Avantages** : Pas de dépendance serveur
**Inconvénients** : Limité par le navigateur, pas de sauvegarde automatique

### 2. SoX (Sound eXchange)

```bash
sox -m track1.mp3 track2.mp3 output.mp3 fade t 0 0 3
```

**Avantages** : Léger, rapide
**Inconvénients** : Moins de fonctionnalités que FFmpeg

### 3. Pydub (Python)

```python
from pydub import AudioSegment
track1 = AudioSegment.from_mp3("track1.mp3")
track2 = AudioSegment.from_mp3("track2.mp3")
mixed = track1.append(track2, crossfade=3000)
```

**Avantages** : Simple, pythonique
**Inconvénients** : Nécessite Python dans le projet

## Ressources

- [Documentation FFmpeg](https://ffmpeg.org/documentation.html)
- [FFmpeg Filters Documentation](https://ffmpeg.org/ffmpeg-filters.html#acrossfade)
- [Fluent-ffmpeg (Node.js)](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)
- [Guide audio crossfading](https://trac.ffmpeg.org/wiki/AudioChannelManipulation)

---

**Note** : Pour des transitions encore plus professionnelles, vous pourriez ajouter :
- Détection automatique du BPM pour synchroniser les transitions
- Beat matching entre les pistes
- Analyse des silences pour couper les blancs
- Égalisation automatique pour uniformiser le volume
