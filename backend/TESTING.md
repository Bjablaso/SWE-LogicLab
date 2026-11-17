# Running the Backend Tests

How to run the Campus Connect backend tests (T1–T11) on your own computer.

The tests use **pytest** and FastAPI's **TestClient**. They run against a **local PostgreSQL database in Docker**, never the real Supabase database.

> ⚠️ **Never point the tests at Supabase.** At the start of every run, `tests/conftest.py` **drops all tables** and reloads `schema.sql` and `seed.sql`. That's what makes every run start from the same data, and it would wipe the real database. `conftest.py` refuses to run if the database URL contains `supabase`.

---

## 1. Install Docker

Docker runs PostgreSQL in an isolated container, so you don't install Postgres on your computer.

| OS | How |
| --- | --- |
| macOS | Download **Docker Desktop** from https://www.docker.com/products/docker-desktop/ (choose Apple Silicon or Intel), open the `.dmg`, drag Docker to Applications, and launch it. |
| Windows | Download **Docker Desktop** from the same page. During install, keep **"Use WSL 2"** checked, and restart if asked. |
| Linux | Follow https://docs.docker.com/engine/install/ for your distribution. |

Open Docker Desktop and wait until it says **Running**. Then check from a terminal:

```bash
docker --version
docker ps
```

`docker ps` should print a table header, possibly empty. If it says `Cannot connect to the Docker daemon`, Docker Desktop isn't running yet.

---

## 2. Start PostgreSQL in Docker

Run this once to create the test database container:

```bash
docker run -d --name cc-test-db -p 5433:5432 \
  -e POSTGRES_USER=test \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_DB=campus_connect_test \
  postgres:16
```

| Part | Meaning |
| --- | --- |
| `--name cc-test-db` | the container's name |
| `-p 5433:5432` | your computer's port **5433** → Postgres inside the container. 5433 avoids clashing with any Postgres already on 5432. |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | the login and database the tests expect |
| `postgres:16` | PostgreSQL version 16, downloaded the first time (about a minute) |

On **Windows PowerShell**, put the command on one line, or replace each `\` with a backtick `` ` ``.

Wait until it's ready:

```bash
docker exec cc-test-db pg_isready -U test
```

Repeat until it prints `accepting connections`.

### Optional: check the SQL files load

From the `backend/` folder:

```bash
docker exec -i cc-test-db psql -U test -d campus_connect_test < schema.sql
docker exec -i cc-test-db psql -U test -d campus_connect_test < seed.sql
```

You should see `CREATE TABLE` and `INSERT` lines and no `ERROR:`. The tests load these files again on every run, so this step only checks that they work.

---

## 3. Set up Python

From the `backend/` folder:

```bash
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\Activate.ps1

pip install -r requirements.txt -r requirements-dev.txt
```

`requirements-dev.txt` contains the test tools (`pytest`, `pytest-cov`, `httpx`).

---

## 4. Run the tests

Always run from the `backend/` folder:

```bash
pytest -v
```

Expected output:

```
collected 11 items

tests/test_uc3_search.py::test_t1_search_keyword_in_title PASSED
tests/test_uc3_search.py::test_t2_search_is_case_insensitive PASSED
...
tests/test_uc4_save_rsvp.py::test_t11_cancel_active_rsvp PASSED
```

### Useful commands

| What | Command |
| --- | --- |
| all tests | `pytest -v` |
| one file | `pytest tests/test_uc4_save_rsvp.py -v` |
| one test | `pytest -k t7 -v` |
| stop at the first failure | `pytest -x` |
| with code coverage | `pytest --cov=app --cov-report=term-missing` |
| use a different database | `TEST_DATABASE_URL=postgresql://user:pass@host:port/db pytest -v` |

---

## 5. Test files

```
backend/
  pytest.ini                  ← pytest settings (test folder, markers)
  schema.sql                  ← tables, loaded fresh each run
  seed.sql                    ← sample data, loaded fresh each run
  tests/
    __init__.py
    conftest.py               ← test DB setup, rollback per test, API client
    test_uc3_search.py        ← T1–T6  (UC-3: browse & search)
    test_uc4_save_rsvp.py     ← T7–T11 (UC-4: save & RSVP)
```

**How a test run works:**

1. `conftest.py` points the app at the test database **before** importing it.
2. Once per run, it drops and recreates the tables, then loads `schema.sql` and `seed.sql`.
3. Each test runs inside a transaction that is **rolled back** afterwards, so tests never affect each other.
4. `TestClient` sends real HTTP requests to the FastAPI app, with no server to start.

---

## 6. Managing the container

| What | Command |
| --- | --- |
| start it again (after a restart) | `docker start cc-test-db` |
| stop it | `docker stop cc-test-db` |
| check it's running | `docker ps --filter name=cc-test-db` |
| see its logs | `docker logs cc-test-db` |
| delete it and start fresh | `docker rm -f cc-test-db`, then step 2 again |

The data inside doesn't matter: every test run resets it.

---

## 7. Troubleshooting

| Problem | Cause | Fix |
| --- | --- | --- |
| `Connection refused` on port 5433 (every test errors) | test database not running | `docker start cc-test-db`, then wait for `pg_isready` |
| `Cannot connect to the Docker daemon` | Docker Desktop not open | open Docker Desktop and wait for **Running** |
| `port is already allocated` | another container or Postgres uses 5433 | stop it (`docker ps`, then `docker stop <name>`), or use `-p 5434:5432` and set `TEST_DATABASE_URL` to port 5434 |
| `name "cc-test-db" is already in use` | container already exists | `docker start cc-test-db` |
| `ModuleNotFoundError: No module named 'tests'` or `'app'` | pytest run from the wrong folder, or `tests/` in the wrong place | run from `backend/`; `tests/` must sit next to `app/`, not inside it |
| `collected 0 items` | file or function names don't start with `test_` | rename them to `test_*.py` / `def test_*` |
| `ERROR` loading `schema.sql` / `seed.sql` | SQL error in those files | run the optional check in step 2 to see the exact line |
| `Refusing to run tests against Supabase` | `DATABASE_URL` / `TEST_DATABASE_URL` points to Supabase | unset it, or point it at the Docker database |
