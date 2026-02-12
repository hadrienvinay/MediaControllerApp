# ✏️ Guide d'Édition - Playlists et Projets Vidéo

## Vue d'ensemble

Music Mixer permet maintenant de **modifier** et **supprimer** vos playlists audio et projets vidéo après leur création.

## 🎵 Édition de Playlists Audio

### Accéder à l'édition

**Sur la page d'accueil** :
1. Trouvez votre playlist
2. Cliquez sur le bouton **"✏️ Modifier"**
3. Vous êtes redirigé vers `/edit/[id]`

### Fonctionnalités disponibles

#### 1. Modifier les informations
- ✏️ **Nom** : Renommer votre playlist
- ✏️ **Description** : Modifier ou ajouter une description

#### 2. Gérer les titres existants
- **🗑️ Supprimer** : Retirer un titre de la playlist
- **▲ Monter** : Déplacer un titre vers le haut
- **▼ Descendre** : Déplacer un titre vers le bas
- **Réorganiser** : Changer l'ordre de lecture

#### 3. Ajouter de nouveaux titres
- **📁 Fichier MP3** : Upload depuis votre ordinateur
- **▶️ YouTube** : Télécharger l'audio d'une vidéo
- **☁️ SoundCloud** : Importer une piste

#### 4. Supprimer la playlist
- **🗑️ Supprimer** : Bouton en haut à droite
- Confirmation requise avant suppression
- ⚠️ **Action irréversible**

### Workflow d'édition

```
1. Modifier les infos (nom, description)
2. Réorganiser les titres existants
3. Supprimer les titres indésirables
4. Ajouter de nouveaux titres
5. Cliquer sur "Sauvegarder"
```

### Important : Re-mixage requis

⚠️ **Après modification, le mix précédent est invalidé.**

Vous devrez re-cliquer sur **"🎛️ Créer le Mix"** pour :
- Générer un nouveau fichier mixé
- Prendre en compte l'ordre modifié
- Inclure les nouveaux titres

---

## 🎬 Édition de Projets Vidéo

### Accéder à l'édition

**Sur la page Vidéos** :
1. Trouvez votre projet
2. Cliquez sur le bouton **"✏️ Modifier"**
3. Vous êtes redirigé vers `/videos/edit/[id]`

### Fonctionnalités disponibles

#### 1. Modifier les informations
- ✏️ **Nom du projet** : Renommer
- ✏️ **Description** : Modifier ou ajouter

#### 2. Modifier les paramètres de compilation
- **📐 Résolution** : 720p, 1080p, 4K
- **🎨 Type de transition** : Fade, Dissolve, Wipe, Slide
- **⏱️ Durée des transitions** : 0.5s à 3s
- **🖼️ Durée d'affichage des images** : 2s à 10s
- **🔊 Audio** : Activer/désactiver

#### 3. Gérer les médias existants
- **🗑️ Supprimer** : Retirer un média du projet
- **▲ Monter** : Déplacer vers le haut
- **▼ Descendre** : Déplacer vers le bas
- **Réorganiser** : Changer la séquence

#### 4. Ajouter de nouveaux médias
- **🎥 Vidéo locale** : Upload MP4, AVI, MOV, etc.
- **▶️ YouTube** : Télécharger une vidéo
- **📷 Image** : Upload JPG, PNG, GIF, etc.

#### 5. Supprimer le projet
- **🗑️ Supprimer** : Bouton en haut à droite
- Confirmation requise
- ⚠️ **Action irréversible**

### Workflow d'édition

```
1. Modifier les infos (nom, description)
2. Ajuster les paramètres de compilation
3. Réorganiser les médias existants
4. Supprimer les médias indésirables
5. Ajouter de nouveaux médias
6. Cliquer sur "Sauvegarder"
```

### Important : Re-compilation requise

⚠️ **Après modification, la vidéo compilée précédente est invalidée.**

Vous devrez re-cliquer sur **"🎬 Compiler la Vidéo"** pour :
- Générer une nouvelle vidéo finale
- Prendre en compte l'ordre modifié
- Appliquer les nouveaux paramètres
- Inclure les nouveaux médias

---

## 📋 Exemples d'utilisation

### Exemple 1 : Réorganiser une playlist

**Scénario** : Vous voulez mettre votre chanson préférée en premier

```
1. Cliquer sur "Modifier"
2. Utiliser ▲ pour faire monter le titre désiré
3. Répéter jusqu'à ce qu'il soit en première position
4. Cliquer sur "Sauvegarder"
5. Re-mixer la playlist
```

### Exemple 2 : Ajouter une vidéo à un projet existant

**Scénario** : Vous voulez ajouter une nouvelle scène

```
1. Cliquer sur "Modifier"
2. Cliquer sur "🎥 Vidéo locale" ou "▶️ YouTube"
3. Remplir le titre et choisir le fichier/URL
4. Utiliser ▲▼ pour positionner la nouvelle vidéo
5. Cliquer sur "Sauvegarder"
6. Re-compiler le projet
```

### Exemple 3 : Changer la durée des transitions

**Scénario** : Les transitions sont trop rapides

```
1. Cliquer sur "Modifier"
2. Dans "Paramètres de compilation"
3. Déplacer le slider "Durée des transitions" vers 2s
4. Cliquer sur "Sauvegarder"
5. Re-compiler avec les nouveaux paramètres
```

### Exemple 4 : Supprimer un titre en trop

**Scénario** : Vous avez ajouté un mauvais titre

```
1. Cliquer sur "Modifier"
2. Trouver le titre indésirable
3. Cliquer sur le ✕ rouge à droite
4. Confirmer la suppression
5. Cliquer sur "Sauvegarder"
6. Re-mixer pour mettre à jour
```

---

## 🔐 Sécurité

### Confirmations

Les actions destructives nécessitent une confirmation :

- **Supprimer un titre/média** : Confirmation par clic
- **Supprimer une playlist/projet** : Fenêtre de confirmation
- **Actions irréversibles** : Message d'avertissement

### Sauvegarde

- ✅ Toutes les modifications sont sauvegardées instantanément
- ✅ Les fichiers médias originaux sont préservés
- ✅ Historique non disponible (pas de "Annuler")

⚠️ **Recommandation** : Si vous testez des changements importants, créez une copie de votre playlist/projet d'abord.

---

## 🎯 Bonnes pratiques

### Pour les playlists audio

1. **Testez l'ordre** : Écoutez le mix avant de partager
2. **Groupez par genre** : Facilitez la navigation
3. **Nommez clairement** : "Road Trip 2026" plutôt que "Playlist 1"
4. **Ajoutez une description** : Utile pour retrouver vos playlists

### Pour les projets vidéo

1. **Planifiez la séquence** : Pensez au storytelling avant
2. **Testez les paramètres** : Commencez avec 3-4 clips pour valider
3. **Nommez les médias** : "Intro logo" plutôt que "video1"
4. **Attention à la résolution** : 4K = temps de compilation long

---

## ⚙️ Limitations actuelles

### Ce qui n'est PAS possible (pour l'instant)

- ❌ Modifier le titre d'un média existant (seulement le retirer et re-ajouter)
- ❌ Dupliquer une playlist/projet
- ❌ Historique des versions / Annuler
- ❌ Édition collaborative (multi-utilisateurs)
- ❌ Aperçu en temps réel des modifications

### Fonctionnalités prévues

- [ ] Drag & drop pour réorganiser (au lieu de ▲▼)
- [ ] Édition inline des titres
- [ ] Duplication de playlists/projets
- [ ] Partage avec permissions
- [ ] Historique des versions

---

## 🐛 Problèmes connus

### "Erreur lors de la sauvegarde"

**Causes possibles :**
1. Connexion réseau interrompue
2. Fichier trop volumineux (>100 MB)
3. Format de fichier non supporté

**Solutions :**
1. Vérifiez votre connexion
2. Compressez les vidéos avant upload
3. Utilisez les formats supportés (MP4, MP3, JPG, PNG)

### Les modifications ne s'affichent pas

**Solution :**
1. Actualisez la page (F5)
2. Vérifiez que vous avez cliqué sur "Sauvegarder"
3. Rechargez complètement (Ctrl+Shift+R)

### Le mix/compilation ne prend pas en compte les changements

**Solution :**
⚠️ Après modification, vous DEVEZ re-mixer/re-compiler manuellement.

Les fichiers mixés/compilés précédents sont automatiquement invalidés mais pas régénérés.

---

## 📚 API Routes créées

### Playlists

```
PUT /api/playlists/[id]
```
- Mise à jour des métadonnées et tracks
- Invalide le mixage précédent
- Retourne la playlist mise à jour

### Projets Vidéo

```
PUT /api/video-projects/[id]
```
- Mise à jour des métadonnées, médias et paramètres
- Invalide la compilation précédente
- Retourne le projet mis à jour

---

## 💡 Astuces

### Réorganisation rapide

Plutôt que de cliquer 10 fois sur ▲ :
1. Supprimez le titre
2. Notez son nom
3. Re-ajoutez-le à la position désirée

### Tester des variantes

Pour tester différents ordres :
1. Créez plusieurs playlists similaires
2. Modifiez l'ordre dans chacune
3. Comparez les résultats
4. Gardez la meilleure

### Gagner du temps

- Préparez vos fichiers/URLs dans un document avant
- Ajoutez tous les nouveaux médias d'un coup
- Réorganisez ensuite

---

**Bonnes modifications ! ✏️**
