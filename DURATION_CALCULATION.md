# 📐 Calcul des Durées et Transitions - Documentation Technique

## Problème identifié et corrigé

### ❌ Problème initial

Le code original avait plusieurs bugs critiques :

1. **Offsets incorrects pour xfade** : `offset=${i * 10}` était une valeur arbitraire
2. **Conversion d'images incorrecte** : Utilisation de `.loop()` et `.size()` non supportés
3. **Pas de calcul réel des durées** : Les transitions ne tenaient pas compte des durées réelles

### ✅ Solution implémentée

Maintenant, le système :
1. Calcule la durée réelle de chaque clip
2. Calcule les offsets corrects pour les transitions
3. Produit une vidéo finale de la bonne durée

## Formule de calcul de durée

### Durée finale

```
Durée finale = Σ(durées des clips) - (nombre de clips - 1) × durée de transition
```

**Exemple :**
- 3 clips de 5 secondes
- Transition de 1 seconde
- Durée finale = (5 + 5 + 5) - (3 - 1) × 1 = 15 - 2 = **13 secondes**

### Pourquoi cette formule ?

Chaque transition **chevauche** la fin d'un clip avec le début du suivant :

```
Clip 1 (5s)  : |--------|
                      ~~~~ (1s transition)
Clip 2 (5s)  :      |--------|
                          ~~~~ (1s transition)
Clip 3 (5s)  :          |--------|

Timeline    : |-----|-----|-----| = 13s au total
               0s    4s    8s   13s
```

## Calcul des offsets xfade

### Formule des offsets

Pour chaque transition `i` (entre clip `i` et clip `i+1`) :

```
offset[i] = position_cumulative + durée[i] - durée_transition
```

Où `position_cumulative` est la position temporelle actuelle dans la timeline.

### Exemple détaillé

**Configuration :**
- Clip 1 : 5s
- Clip 2 : 5s  
- Clip 3 : 5s
- Transition : 1s

**Calcul :**

```
Transition 0 (entre Clip 1 et Clip 2) :
  offset[0] = 0 + 5 - 1 = 4s
  → La transition commence à 4s (1s avant la fin du Clip 1)

Transition 1 (entre Clip 2 et Clip 3) :
  offset[1] = 4 + 5 - 1 = 8s
  → La transition commence à 8s (1s avant la fin du Clip 2)
```

**Timeline complète :**
```
0s        4s   5s        8s   9s       13s
|    Clip 1    |    Clip 2    |   Clip 3    |
          [fade]         [fade]
```

## Conversion des images

### Image → Vidéo

Les images sont converties en clips vidéo de durée fixe :

```bash
ffmpeg -loop 1 -i image.jpg \
  -t 5 \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,
       pad=1920:1080:(ow-iw)/2:(oh-ih)/2,
       setsar=1" \
  -r 30 \
  -pix_fmt yuv420p \
  -c:v libx264 \
  output.mp4
```

**Paramètres :**
- `-loop 1` : Boucle sur l'image
- `-t 5` : Durée de 5 secondes
- `scale` : Redimensionne en conservant le ratio
- `pad` : Ajoute des bandes noires si nécessaire
- `setsar=1` : Définit le SAR (Sample Aspect Ratio) à 1:1
- `-r 30` : 30 FPS
- `-pix_fmt yuv420p` : Format de pixel compatible

## Normalisation des vidéos

### Vidéo → Vidéo normalisée

```bash
ffmpeg -i input.mp4 \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,
       pad=1920:1080:(ow-iw)/2:(oh-ih)/2,
       setsar=1" \
  -r 30 \
  -pix_fmt yuv420p \
  -c:v libx264 \
  -c:a aac -b:a 128k \
  output.mp4
```

**Pourquoi normaliser ?**
- Toutes les vidéos doivent avoir la même résolution pour xfade
- Le FPS doit être identique
- Le codec doit être compatible

## Filtres xfade

### Syntaxe

```
[0:v][1:v]xfade=transition=fade:duration=1:offset=4[v0]
[v0][2:v]xfade=transition=fade:duration=1:offset=8[outv]
```

**Paramètres :**
- `transition` : Type (fade, dissolve, wipe, slide, etc.)
- `duration` : Durée de la transition en secondes
- `offset` : Moment où la transition commence (en secondes)

### Transitions en chaîne

Pour n clips, il faut n-1 transitions :

```
Clip 0 + Clip 1 → v0
v0 + Clip 2 → v1
v1 + Clip 3 → v2
...
vN-2 + Clip N → outv
```

## Audio avec transitions

### Crossfade audio

Similaire au xfade vidéo, mais pour l'audio :

```
[0:a][1:a]acrossfade=d=1[a0]
[a0][2:a]acrossfade=d=1[outa]
```

**Synchronisation :**
Le crossfade audio doit correspondre au xfade vidéo pour éviter les décalages.

## Exemples de calculs

### Exemple 1 : Diaporama simple

**Configuration :**
- 5 images
- Durée par image : 4s
- Transition : 0.5s

**Calcul :**
```
Durée totale = (4 × 5) - (5 - 1) × 0.5
             = 20 - 2
             = 18 secondes
```

**Offsets :**
```
offset[0] = 0 + 4 - 0.5 = 3.5s
offset[1] = 3.5 + 4 - 0.5 = 7.0s
offset[2] = 7.0 + 4 - 0.5 = 10.5s
offset[3] = 10.5 + 4 - 0.5 = 14.0s
```

### Exemple 2 : Mix vidéos et images

**Configuration :**
- Vidéo 1 : 8s
- Image 1 : 5s
- Vidéo 2 : 12s
- Transition : 1.5s

**Calcul :**
```
Durée totale = (8 + 5 + 12) - (3 - 1) × 1.5
             = 25 - 3
             = 22 secondes
```

**Offsets :**
```
offset[0] = 0 + 8 - 1.5 = 6.5s  (Vidéo 1 → Image 1)
offset[1] = 6.5 + 5 - 1.5 = 10.0s  (Image 1 → Vidéo 2)
```

## Validation

### Tests à effectuer

1. **Test de durée** : Vérifier avec `ffprobe` que la durée finale correspond
2. **Test visuel** : Vérifier que les transitions sont fluides
3. **Test audio** : Vérifier qu'il n'y a pas de coupures

### Commande de vérification

```bash
ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 \
  output.mp4
```

## Dépannage

### Durée incorrecte

**Symptôme :** La durée finale ne correspond pas au calcul

**Causes possibles :**
1. Les durées des clips sources sont incorrectes
2. Les offsets xfade sont mal calculés
3. Un clip est trop court pour la transition

**Solution :**
- Vérifier les durées avec `ffprobe`
- Ajouter des logs pour afficher les offsets calculés
- S'assurer que `durée_clip > durée_transition`

### Transitions saccadées

**Symptôme :** Les transitions ne sont pas fluides

**Causes possibles :**
1. FPS différents entre les clips
2. Résolutions non normalisées
3. Pix_fmt incompatibles

**Solution :**
- Toujours normaliser à 30 FPS
- Utiliser `yuv420p` pour tous les clips
- Vérifier avec `ffprobe -show_streams`

### Audio désynchronisé

**Symptôme :** L'audio ne correspond pas à la vidéo

**Causes possibles :**
1. Les offsets audio ne correspondent pas aux offsets vidéo
2. Certains clips n'ont pas d'audio

**Solution :**
- Utiliser les mêmes offsets pour acrossfade que pour xfade
- Ajouter un silence pour les clips sans audio
- Vérifier avec `ffplay`

## Ressources

- [Documentation xfade](https://ffmpeg.org/ffmpeg-filters.html#xfade)
- [Documentation acrossfade](https://ffmpeg.org/ffmpeg-filters.html#acrossfade)
- [Guide des filtres FFmpeg](https://trac.ffmpeg.org/wiki/FilteringGuide)

---

**Le système est maintenant mathématiquement correct et produit des vidéos de la bonne durée ! ✅**
