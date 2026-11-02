CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS students (
    user_id INTEGER PRIMARY KEY REFERENCES users (user_id)
);

CREATE TABLE IF NOT EXISTS categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS interests (
    interest_id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories (category_id),
    interest_name VARCHAR NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS student_interests (
    student_id INTEGER NOT NULL REFERENCES students (user_id),
    interest_id INTEGER NOT NULL REFERENCES interests (interest_id),
    score DOUBLE PRECISION NOT NULL DEFAULT 0,
    PRIMARY KEY (student_id, interest_id)
);

CREATE TABLE IF NOT EXISTS events (
    event_id SERIAL PRIMARY KEY,
    organizer_id INTEGER REFERENCES users (user_id),
    category_id INTEGER NOT NULL REFERENCES categories (category_id),
    title VARCHAR NOT NULL,
    description VARCHAR NOT NULL,
    start_datetime TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITHOUT TIME ZONE,
    location VARCHAR,
    capacity INTEGER,
    status VARCHAR NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS event_interests (
    event_id INTEGER NOT NULL REFERENCES events (event_id),
    interest_id INTEGER NOT NULL REFERENCES interests (interest_id),
    PRIMARY KEY (event_id, interest_id)
);

CREATE TABLE IF NOT EXISTS searches (
    search_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students (user_id),
    keyword VARCHAR,
    searched_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_views (
    student_id INTEGER NOT NULL REFERENCES students (user_id),
    event_id INTEGER NOT NULL REFERENCES events (event_id),
    view_count INTEGER NOT NULL DEFAULT 1,
    last_viewed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, event_id)
);

CREATE TABLE IF NOT EXISTS recommendations (
    student_id INTEGER NOT NULL REFERENCES students (user_id),
    event_id INTEGER NOT NULL REFERENCES events (event_id),
    relevance_score DOUBLE PRECISION NOT NULL,
    generated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, event_id)
);

CREATE TABLE IF NOT EXISTS saved_events (
    student_id INTEGER NOT NULL REFERENCES students (user_id),
    event_id INTEGER NOT NULL REFERENCES events (event_id),
    saved_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, event_id)
);

CREATE TABLE IF NOT EXISTS rsvps (
    rsvp_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students (user_id),
    event_id INTEGER NOT NULL REFERENCES events (event_id),
    status VARCHAR NOT NULL DEFAULT 'active',
    attended BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
