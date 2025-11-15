# Configuration SonarCloud

Ce projet utilise **SonarCloud** pour l'analyse automatique de la qualité du code sur les Pull Requests.

## Configuration actuelle

L'analyse est effectuée **automatiquement par SonarCloud** lors de la création ou mise à jour d'une Pull Request. Aucune action manuelle ou workflow GitHub Actions n'est nécessaire.

### Automatic Analysis

SonarCloud est configuré en mode **Automatic Analysis** pour surveiller automatiquement :

- Les nouvelles Pull Requests
- Les commits sur les PR existantes
- Les branches principales (main/develop)

Les résultats sont affichés directement dans l'interface de la PR GitHub avec :

- Quality Gate status (pass/fail)
- Nouveaux problèmes de code détectés
- Coverage et code smells
- Liens vers les rapports détaillés sur SonarCloud

## Accès aux résultats

Les rapports d'analyse sont disponibles sur :

- **Dashboard SonarCloud** : https://sonarcloud.io/project/overview?id=zeffyr-000_suiviseries
- **Dans les PR GitHub** : Vérification "SonarCloud Code Analysis" avec lien vers le rapport détaillé

## Configuration du projet

### Informations du projet

- **Organization** : zeffyr-000
- **Project Key** : zeffyr-000_suiviseries
- **Project Name** : suiviseries

### Fichiers exclus de l'analyse

```
node_modules/**
dist/**
coverage/**
**/*.spec.ts
src/environments/**
```

### Couverture de code

La couverture est calculée à partir de : `coverage/suiviseries/lcov.info`

## Notes

- Aucune configuration locale ou CI/CD n'est nécessaire
- Les tokens et secrets ne sont pas requis pour l'Automatic Analysis
- SonarCloud analyse automatiquement chaque commit sur les PR
