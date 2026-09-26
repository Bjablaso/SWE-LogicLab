
# Project Git Instructions

## Table of Contents

1. [How Do I Pull (Clone) the Repository?](#1-how-do-i-pull-clone-the-repository)
2. [How Do I Navigate Between Branches?](#2-how-do-i-navigate-between-branches)
3. [Branch Structure](#3-branch-structure)
4. [Git Flow: What Is Expected](#4-git-flow-what-is-expected)
5. [Rules](#5-rules)

---

## 1. How Do I Pull (Clone) the Repository?

Before you start, accept the GitHub invitation sent to your email or GitHub notifications.

Clone the repository to your computer:

```bash
git clone https://github.com/<username>/<repo-name>.git
cd <repo-name>
```

Download all remote branches:

```bash
git fetch --all
```

To get the latest changes later:

```bash
git switch dev
git pull origin dev
```

---

## 2. How Do I Navigate Between Branches?

| Action | Command |
|--------|---------|
| See your current branch and list local branches | `git branch` |
| List all branches, including remote ones | `git branch -a` |
| Switch to an existing branch | `git switch dev` |
| Create a new branch and switch to it | `git switch -c feature/<your-name>-<task>` |
| Check the status of your current branch | `git status` |

> **Tip:** Commit or stash your changes before switching branches, or Git may block the switch.

---

## 3. Branch Structure

```text
  main     ---------------------*------------------*------
  (stable)                      ^                  ^
                                |  Git Master      |
                                |  merges dev      |
                                |  into main       |
  dev      ---*---------*-------*--------*---------*------
  (testing)    \        ^        \       ^
                \       | PR      \      | PR
  feature/      *---*---*          *--*--*
  (your branch)
```

### `main`
- Stable, working version of the project.
- **Protected.** No one pushes to `main` directly.
- Only the **Git Master** merges `dev` into `main`.

### `dev`
- Where everyone's completed work is combined and tested.
- **Protected.** Work gets into `dev` only through a pull request (PR) that the Git Master approves.

### `feature/<your-name>-<task>`
- Your personal branch, created from `dev`.
- This is your **control branch**. Build and test your work here until it runs correctly.
- Naming examples:
  - `feature/jsmith-login-page`
  - `feature/adoe-recommendation-engine`
  - `fix/jsmith-search-bug`

---

## 4. Git Flow: What Is Expected

**Step 1.** Start from the latest `dev` branch.

```bash
git switch dev
git pull origin dev
```

**Step 2.** Create your own branch from `dev`.

```bash
git switch -c feature/<your-name>-<task>
```

**Step 3.** Do your work and commit often with clear messages.

```bash
git add .
git commit -m "Add event search filter"
```

**Step 4.** Test your work in your branch. Do not move on until everything works.

**Step 5.** Update your branch with the latest `dev` changes and fix any conflicts.

```bash
git pull origin dev
```

**Step 6.** Push your branch to GitHub.

```bash
git push -u origin feature/<your-name>-<task>
```

**Step 7.** Open a pull request on GitHub from your branch into `dev` (**NOT** `main`). Describe what you did and link the related task/issue.

**Step 8.** The Git Master reviews your pull request.
- If approved, the Git Master merges it into `dev`.
- If changes are requested, fix them in your branch and push again. The pull request updates automatically.

**Step 9.** Once `dev` is tested and confirmed working, the Git Master merges `dev` into `main`.

---

## 5. Rules

- [ ] Never push directly to `main` or `dev`.
- [ ] Always create your branch from `dev`, not `main`.
- [ ] Only the Git Master merges into `dev` and `main`.
- [ ] Pull the latest `dev` before starting new work.
- [ ] Use clear commit messages that say what changed.
- [ ] Delete your branch after it has been merged.
- [ ] Ask the Git Master if you are unsure about anything.
