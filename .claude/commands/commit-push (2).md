# Commit and Push to GitHub

Commit all current changes and push to GitHub. Follow these steps:

1. Run `git status` to see all changes
2. Run `git diff` to review staged and unstaged changes
3. Run `git log -3 --oneline` to see recent commit message style
4. Stage all changes with `git add -A`
5. Create a descriptive commit message based on the changes:
   - Summarize the nature of changes (new feature, bug fix, refactor, etc.)
   - Keep it concise (1-2 sentences)
   - End with the standard footer
6. Commit with the message ending with:
   ```
   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```
7. Push to the remote repository
8. Report the result to the user

If there are no changes to commit, inform the user.
