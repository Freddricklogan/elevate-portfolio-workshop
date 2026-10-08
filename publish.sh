#!/usr/bin/env bash
# One-time publish of this folder to GitHub Pages on the Freddricklogan account.
# Run from inside this folder in Terminal:  bash publish.sh
# Needs: git, and either the GitHub CLI (gh auth login) or a repo you created at github.com/new named elevate-portfolio-workshop.
set -e
REPO=elevate-portfolio-workshop
USER=Freddricklogan
git add -A
git commit -m "Update workshop site" >/dev/null 2>&1 || true
if command -v gh >/dev/null 2>&1; then
  gh repo create "$USER/$REPO" --public --source=. --remote=origin --push 2>/dev/null || git push -u origin main
  gh api -X POST "repos/$USER/$REPO/pages" -f "source[branch]=main" -f "source[path]=/" >/dev/null 2>&1 || true
else
  git remote add origin "https://github.com/$USER/$REPO.git" 2>/dev/null || true
  git push -u origin main
  echo "Now open https://github.com/$USER/$REPO/settings/pages and set Source: Deploy from a branch, main, / (root)."
fi
echo "Site: https://$USER.github.io/$REPO/"
