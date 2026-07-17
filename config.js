// ── CONFIGURATION CAMPAGNE ───────────────────────────────────
// Pour changer d'année : modifiez uniquement cette valeur
// puis uploadez ce fichier sur GitHub.
const ANNEE = 2026;

// Filtre Supabase automatique (ne pas modifier)
const ANNEE_FILTER = 'annee=eq.' + ANNEE;
const ANNEE_PRECEDENTE = ANNEE - 1;
const ANNEE_PREC_FILTER = 'annee=eq.' + ANNEE_PRECEDENTE;
