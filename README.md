# Macro Calculator (Mifflin–St Jeor)

Hybrid macro calculator with an Advanced manual mode. Computes **only** when **Calculate** is pressed. Fast, client‑side, and GitHub Pages ready.

## Features
- Mifflin–St Jeor → BMR → TDEE → Target kcal (± lbs/week × 3500 ÷ 7)
- **Hybrid** macros: Protein = max(g/kg, % floor); Fat = %; Carbs = remainder
- **Manual** mode: set P/F/C %, must total 100% (auto-balance to carbs optional)
- Advanced panel hidden until toggled; accessible disclosure widget
- Local save (`macroCalc.v4`), copy results (includes active macro mode)
- Compute happens only on **Calculate**; inputs set a dirty flag

## Deploy
Push files to a repo → Settings → Pages → Deploy from a branch → `main` → root.
