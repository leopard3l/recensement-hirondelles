# Recensement Hirondelles de fenêtre — Parc Naturel de Gaume
## Guide administrateur complet

---

## Architecture du projet

```
GitHub Pages (site public)          Supabase (base de données)
├── index.html                      └── table: observations
├── protocole.html                       ├── id (auto)
├── guide.html                           ├── created_at (auto)
├── resultats.html                       ├── annee
├── dashboard.html                       ├── date_recensement
├── import.html                          ├── observateur
├── recensement_hirondelles.html         ├── village
├── hirondelles_terrain_mobile.html      ├── adresse
├── style.css                            ├── type_batiment
├── sw.js                                ├── nnentiers / nnoccupes / nncasses
├── manifest.json                        ├── nainstalles / naoccupes
├── cartes/                              ├── emplacement
│   ├── carte_heatmap_gaume_2025.html    ├── remarque
│   ├── carte_choropleth_gaume_2025.html ├── latitude / longitude
│   └── carte_heatmap_gaume_2026.html
└── archives/
    └── (CSV par village, par date)
```

---

## 1. GitHub Pages — Gestion du site

**URL du site :** https://leopard3l.github.io/recensement-hirondelles/

**Mettre à jour un fichier :**
1. Aller sur github.com → dépôt `recensement-hirondelles`
2. Cliquer sur le fichier → icône crayon (modifier)
3. Faire les changements → **Commit changes**
4. Le site se met à jour en 1-2 minutes automatiquement

**Uploader de nouveaux fichiers :**
- Bouton **Add file → Upload files**
- Glisser-déposer les fichiers
- **Commit changes**

**Restaurer une version précédente :**
- Onglet **Commits** (horloge en haut de la liste de fichiers)
- Trouver le commit voulu → **Browse files**
- Cliquer sur le fichier → **Raw** → copier → coller dans le fichier actuel

**Dossier archives/ :**
- Uploader les CSV reçus des bénévoles dans `archives/`
- Nommer les fichiers : `Village_YYYY-MM-DD.csv`
- GitHub garde l'historique de toutes les versions

---

## 2. Supabase — Base de données

**URL :** https://supabase.com → projet Gaume

**Accès rapide aux données :**
- Menu gauche → **Table Editor** → **observations**
- Toutes les observations apparaissent en temps réel

**Exporter toutes les données :**
- Table Editor → observations → bouton **Export** (CSV)
- Ou via le Dashboard : https://leopard3l.github.io/recensement-hirondelles/dashboard.html

**Supprimer des doublons :**
```sql
-- Vérifier d'abord ce qui sera supprimé
SELECT o1.id, o1.adresse, o1.village, o1.created_at,
       ROUND(EXTRACT(EPOCH FROM (o1.created_at - o2.created_at))/60) as minutes_ecart
FROM observations o1
JOIN observations o2 ON o2.id != o1.id
  AND ROUND(o2.latitude::numeric,4) = ROUND(o1.latitude::numeric,4)
  AND ROUND(o2.longitude::numeric,4) = ROUND(o1.longitude::numeric,4)
  AND o2.date_recensement = o1.date_recensement
  AND o2.adresse = o1.adresse
  AND o2.created_at < o1.created_at
  AND EXTRACT(EPOCH FROM (o1.created_at - o2.created_at)) <= 300;

-- Puis supprimer
DELETE FROM observations o1
WHERE EXISTS (
  SELECT 1 FROM observations o2
  WHERE o2.id != o1.id
  AND ROUND(o2.latitude::numeric,4) = ROUND(o1.latitude::numeric,4)
  AND ROUND(o2.longitude::numeric,4) = ROUND(o1.longitude::numeric,4)
  AND o2.date_recensement = o1.date_recensement
  AND o2.adresse = o1.adresse
  AND o2.created_at < o1.created_at
  AND EXTRACT(EPOCH FROM (o1.created_at - o2.created_at)) <= 300
);
```

**Réinitialiser une campagne :**
```sql
DELETE FROM observations WHERE annee = 2026;
```

**Réactiver le projet si en pause :**
- supabase.com → projet → bouton **Restore** (les projets gratuits pausent après 1 semaine sans activité)

---

## 3. Cartes Folium — Jupyter Notebook

**Quand régénérer les cartes :**
- En cours de campagne : toutes les semaines environ
- En fin de campagne : une version définitive

**Workflow :**
1. Ouvrir le notebook Jupyter avec le script Python
2. Connecter à Supabase pour récupérer les données 2026 (ou charger le CSV exporté)
3. Exécuter les cellules de génération de cartes
4. Les fichiers HTML sont créés localement
5. Les uploader sur GitHub dans le dossier `cartes/` :
   - `carte_heatmap_gaume_2026.html`

**Noms de fichiers attendus par le site :**
```
cartes/carte_heatmap_gaume_2025.html      ← heatmap 2025 (définitive)
cartes/carte_choropleth_gaume_2025.html   ← choroplèthe 2025 (définitive)
cartes/carte_heatmap_gaume_2026.html      ← heatmap 2026 (mise à jour régulièrement)
```

---

## 4. Villages prospectés sans hirondelles

Dans le notebook Jupyter, une liste permet d'indiquer les villages visités où aucun nid n'a été trouvé. Ces villages apparaissent en **gris clair** sur la carte choroplèthe, distincts des zones non prospectées (hachures).

**Comment mettre à jour cette liste :**

Trouver dans le notebook la cellule :
```python
villages_vides = [
    'Robelmont',
    'Sommethonne',
    # ajouter ici les villages visités sans nids
]
```

Ajouter les noms exactement comme ils apparaissent dans les données (respecter la casse).

**Légende de la carte choroplèthe :**
- **Couleur dégradée** (vert → rouge) : villages avec nids recensés
- **Gris clair** : villages prospectés, aucun nid trouvé
- **Hachures grises** : zones non prospectées

---

## 5. Workflow coordinateur — début de saison

1. **Réactiver Supabase** si besoin (projet pausé)
2. **Mettre à jour les dates** dans `protocole.html` (année, date limite d'inscription)
3. **Vider les données de l'année précédente** si besoin (attention : irréversible)
4. **Envoyer l'URL du site** aux bénévoles : https://leopard3l.github.io/recensement-hirondelles/
5. **Rappeler d'exporter le CSV** après chaque session terrain

## Workflow coordinateur — en cours de campagne

1. Suivre l'avancement sur `dashboard.html` (lien direct, non publié dans le menu)
2. Répondre aux CSV reçus par email → les uploader dans `archives/`
3. Régénérer `carte_heatmap_gaume_2026.html` depuis Jupyter → uploader dans `cartes/`
4. Vérifier régulièrement les doublons dans Supabase

## Workflow coordinateur — fin de campagne

1. Exporter le CSV complet depuis le dashboard
2. Régénérer toutes les cartes Folium avec les données définitives
3. Uploader les cartes dans `cartes/` (renommer en `_2026.html`)
4. Mettre à jour la liste `villages_vides` dans Jupyter
5. Archiver les données sur GitHub

---

## 6. Accès bénévoles

Les bénévoles reçoivent uniquement l'URL du site :
```
https://leopard3l.github.io/recensement-hirondelles/
```

Ils n'ont pas accès à :
- Supabase (base de données)
- GitHub (code source)
- Dashboard coordinateur (accès direct par URL uniquement)
- Page d'import (accès direct par URL uniquement)

**URL d'accès réservé :**
- Dashboard : `/dashboard.html`
- Import CSV : `/import.html`

---

## 7. Contact technique

- **Site GitHub :** github.com/leopard3l/recensement-hirondelles
- **Base de données :** supabase.com (compte lié à l'email du projet)
- **Coordinatrice :** Marina Rechul — m.rechul@pndg.be
