# 🎬 Guide Complet - Montage Vidéo

## Vue d'ensemble

Music Mixer inclut maintenant un éditeur vidéo complet qui vous permet de créer des montages professionnels en fusionnant vidéos et images avec des transitions fluides.

## ✨ Fonctionnalités

### Support des médias
- **Vidéos** : Upload local, YouTube
- **Images** : Upload local, URL directe
- **Formats supportés** :
  - Vidéos : MP4, AVI, MOV, MKV, WebM
  - Images : JPG, PNG, GIF, WebP

### Paramètres de compilation
- **Résolution** : 720p, 1080p, 4K
- **Transitions** : Fade, Dissolve, Wipe, Slide
- **Durée des transitions** : 0.5s à 3s (réglable)
- **Durée d'affichage des images** : 2s à 10s
- **Audio** : Conservation ou suppression de l'audio des vidéos sources

## 🎯 Workflow complet

### 1. Créer un projet

```
Page d'accueil → Nouveau Projet → Remplir les informations
```

**Informations requises :**
- Nom du projet (requis)
- Description (optionnel)
- Paramètres de compilation

### 2. Ajouter des médias

**Options disponibles :**

**🎥 Vidéo locale**
- Cliquez sur "Vidéo locale"
- Sélectionnez un fichier vidéo depuis votre ordinateur
- Donnez-lui un titre

**▶️ YouTube**
- Cliquez sur "YouTube"
- Collez l'URL d'une vidéo YouTube
- Donnez-lui un titre
- La vidéo sera téléchargée automatiquement

**📷 Image**
- Cliquez sur "Image"
- Sélectionnez une image ou donnez une URL
- Donnez-lui un titre
- L'image sera affichée pendant la durée configurée

### 3. Configurer les paramètres

**Résolution de sortie**
- **720p (1280×720)** : Bonne qualité, fichier léger
- **1080p (1920×1080)** : Full HD, recommandé (par défaut)
- **4K (3840×2160)** : Très haute qualité, fichier lourd

**Type de transition**
- **Fade** : Fondu classique, le plus fluide (recommandé)
- **Dissolve** : Dissolution progressive
- **Wipe** : Balayage d'un côté à l'autre
- **Slide** : Glissement entre les clips

**Durée des transitions** (0.5s - 3s)
- Court (0.5-1s) : Rythmique, dynamique
- Moyen (1-2s) : Équilibré, professionnel
- Long (2-3s) : Contemplatif, artistique

**Durée des images** (2s - 10s)
- 3-5s : Standard pour diaporamas
- 7-10s : Pour laisser le temps de lire du texte

**Audio**
- ✅ Conserver l'audio : Garde le son des vidéos sources
- ❌ Sans audio : Vidéo muette (pour ajouter une musique après)

### 4. Créer le projet

Cliquez sur "Créer le projet". Les médias sont uploadés automatiquement.

### 5. Compiler la vidéo

Sur la page des projets :
1. Trouvez votre projet
2. Cliquez sur **"🎬 Compiler la Vidéo"**
3. Attendez la compilation (peut prendre quelques minutes)
4. Un lecteur vidéo apparaît avec le résultat final

## 🎨 Exemples d'utilisation

### Diaporama de photos
```
- Images : 10 photos de vacances
- Transition : Fade (1s)
- Durée image : 5s
- Résolution : 1080p
- Audio : Désactivé (ajoutez une musique après)
```

### Montage vidéo YouTube
```
- Médias : 5 clips YouTube
- Transition : Wipe (1.5s)
- Résolution : 1080p
- Audio : Activé
```

### Mix vidéos + photos
```
- Médias : 3 vidéos + 5 photos
- Transition : Dissolve (2s)
- Durée image : 4s
- Résolution : 1080p
- Audio : Activé
```

### Trailer / Teaser
```
- Médias : 10-15 clips courts
- Transition : Slide (0.5s)
- Résolution : 1080p
- Audio : Activé
- Effet : Dynamique et rapide
```

## ⚙️ Détails techniques

### Processus de compilation

1. **Prétraitement** : Chaque média est normalisé
   - Vidéos : Redimensionnées à la résolution cible
   - Images : Converties en clips vidéo de durée fixe

2. **Transition** : Application des filtres FFmpeg
   - Utilisation de `xfade` pour les fondus
   - Calcul précis des points de transition

3. **Rendu final** : Compilation en MP4
   - Codec : H.264 (compatibilité maximale)
   - Format : MP4
   - Audio : AAC (si conservé)

### Algorithme de transition

```typescript
Pour chaque paire de clips (A, B):
  - Normaliser A et B à la même résolution
  - Appliquer xfade:
    * Durée: paramètre utilisateur
    * Type: fade/dissolve/wipe/slide
    * Point de transition: fin de A - durée de transition
  - Résultat: Clip fusionné
```

### Filtre FFmpeg utilisé

```bash
ffmpeg \
  -i video1.mp4 -i video2.mp4 \
  -filter_complex \
  "[0:v][1:v]xfade=transition=fade:duration=1:offset=10[v]" \
  -map "[v]" output.mp4
```

## 🚀 Performance

### Temps de compilation estimé

| Configuration | Temps approximatif |
|--------------|-------------------|
| 3 clips (720p, fade) | 30-60 secondes |
| 5 clips (1080p, fade) | 1-2 minutes |
| 10 clips (1080p, dissolve) | 3-5 minutes |
| 5 clips (4K, fade) | 5-10 minutes |

**Facteurs impactant la performance :**
- Nombre de clips
- Résolution de sortie
- Durée totale du projet
- Type de transition (fade est le plus rapide)
- Puissance CPU du serveur

### Optimisations possibles

1. **Prétraitement asynchrone** : Normaliser les médias en arrière-plan
2. **Rendu GPU** : Utiliser l'accélération matérielle (NVENC, Quick Sync)
3. **Parallélisation** : Compiler plusieurs projets simultanément
4. **Cache** : Réutiliser les clips déjà normalisés
5. **Preview** : Générer une version basse résolution pour prévisualisation

## 🎓 Astuces et bonnes pratiques

### Pour de meilleures transitions
- Utilisez des clips d'au moins 3 secondes
- Les transitions fade sont universelles
- Évitez des transitions trop longues (>2s) sauf effet artistique

### Pour optimiser la compilation
- Utilisez 1080p par défaut (bon compromis qualité/taille)
- Normalisez vos médias à la même résolution avant upload
- Limitez le nombre de clips à 20-30 pour des temps raisonnables

### Pour un résultat professionnel
- Alternez vidéos et images pour du dynamisme
- Synchronisez les durées d'images avec le rythme désiré
- Conservez l'audio si les vidéos sources sont cohérentes

## 🐛 Dépannage

### "Erreur lors de la compilation"

**Causes possibles :**
1. FFmpeg non installé → `brew install ffmpeg`
2. Fichier média corrompu → Vérifiez les fichiers sources
3. Mémoire insuffisante → Réduisez la résolution ou le nombre de clips
4. Format vidéo non supporté → Convertissez en MP4

### Compilation très lente

**Solutions :**
1. Réduisez la résolution (4K → 1080p)
2. Utilisez moins de clips
3. Choisissez "fade" plutôt que "dissolve"
4. Activez l'accélération GPU si disponible

### Vidéo YouTube ne se télécharge pas

**Solutions :**
1. Vérifiez que yt-dlp est installé : `yt-dlp --version`
2. Mettez à jour yt-dlp : `pip install -U yt-dlp`
3. Vérifiez que l'URL est valide
4. Certaines vidéos peuvent être protégées

### Transitions saccadées

**Causes :**
- Clips sources avec différents FPS
- Solution : FFmpeg normalise automatiquement à 30 FPS

## 📊 Formats de sortie

### Actuellement supporté
- **Format** : MP4
- **Codec vidéo** : H.264
- **Codec audio** : AAC
- **Compatibilité** : Tous navigateurs modernes, YouTube, réseaux sociaux

### Futurs formats possibles
- WebM (codec VP9)
- MOV (pour édition dans Final Cut Pro)
- AVI (compatibilité ancienne)

## 🔮 Fonctionnalités futures

- [ ] Ajout de musique de fond
- [ ] Textes et titres animés
- [ ] Effets de transition avancés (3D, zoom)
- [ ] Timeline interactive pour réorganiser les clips
- [ ] Filtres et corrections (luminosité, contraste, saturation)
- [ ] Sous-titres automatiques
- [ ] Export multi-résolution simultané
- [ ] Partage direct sur YouTube/Vimeo
- [ ] Templates de montage prédéfinis

## 📚 Ressources

- [Documentation FFmpeg xfade](https://ffmpeg.org/ffmpeg-filters.html#xfade)
- [Guide des transitions vidéo](https://trac.ffmpeg.org/wiki/Xfade)
- [Optimisation H.264](https://trac.ffmpeg.org/wiki/Encode/H.264)

---

**Bon montage ! 🎬**
