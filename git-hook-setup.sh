#!/usr/bin/env sh
#
# Easy setting up of commit-msg and pre-push git hook
#
# Author: aKuad
#

if [ -e .git/hooks/commit-msg ] || [ -e .git/hooks/pre-push ]; then
  echo "commit-msg or pre-push hook is already exist."
  echo -n "Overwrite? [Y/n]: "
  read user_in

  if [ "$user_in" != "Y" ] && [ "$user_in" != "y" ]; then
    echo "Aborted"
    exit 1
  fi
fi

cp assets/commit-msg assets/pre-push .git/hooks/
chmod +x .git/hooks/commit-msg
chmod +x .git/hooks/pre-push

echo "Hook setting up successfully."
