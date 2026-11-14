INSERT INTO users (user_id)
VALUES (1)
ON CONFLICT (user_id) DO NOTHING;

SELECT setval(
    pg_get_serial_sequence('users', 'user_id'),
    GREATEST((SELECT COALESCE(MAX(user_id), 1) FROM users), 1),
    TRUE
);

INSERT INTO students (user_id)
VALUES (1)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO categories (category_name)
VALUES ('Technology'), ('Career'), ('Sports')
ON CONFLICT (category_name) DO NOTHING;

INSERT INTO interests (category_id, interest_name)
SELECT categories.category_id, sample.interest_name
FROM (
    VALUES
        ('Technology', 'Cybersecurity'),
        ('Technology', 'Cloud'),
        ('Career', 'Career'),
        ('Sports', 'Sports')
) AS sample(category_name, interest_name)
JOIN categories ON categories.category_name = sample.category_name
ON CONFLICT (interest_name) DO NOTHING;

WITH sample_events (title, category_name, description, start_datetime, location) AS (
    VALUES
        (
            'AWS Security Workshop',
            'Technology',
            'A hands-on workshop covering AWS cloud security fundamentals.',
            TIMESTAMP '2026-12-01 18:00:00',
            'Engineering Hall'
        ),
        (
            'AI Career Panel',
            'Career',
            'Hear from professionals building careers in artificial intelligence.',
            TIMESTAMP '2026-12-02 18:00:00',
            'Student Center'
        ),
        (
            'Basketball Tournament',
            'Sports',
            'A campus basketball tournament open to students.',
            TIMESTAMP '2026-12-03 18:00:00',
            'Campus Gym'
        ),
        (
            'Cybersecurity Club Meeting',
            'Technology',
            'A student meeting to discuss cybersecurity and security careers.',
            TIMESTAMP '2026-12-04 18:00:00',
            'Computer Lab'
        )
)
INSERT INTO events (
    category_id,
    title,
    description,
    start_datetime,
    location,
    status
)
SELECT
    categories.category_id,
    sample_events.title,
    sample_events.description,
    sample_events.start_datetime,
    sample_events.location,
    'active'
FROM sample_events
JOIN categories ON categories.category_name = sample_events.category_name
WHERE NOT EXISTS (
    SELECT 1
    FROM events
    WHERE events.title = sample_events.title
);

INSERT INTO student_interests (student_id, interest_id, score)
SELECT 1, interests.interest_id, sample.score
FROM (
    VALUES
        ('Cybersecurity', 90.0),
        ('Cloud', 80.0),
        ('Career', 70.0),
        ('Sports', 20.0)
) AS sample(interest_name, score)
JOIN interests ON interests.interest_name = sample.interest_name
WHERE EXISTS (SELECT 1 FROM students WHERE user_id = 1)
ON CONFLICT (student_id, interest_id) DO NOTHING;

INSERT INTO event_interests (event_id, interest_id)
SELECT events.event_id, interests.interest_id
FROM (
    VALUES
        ('AWS Security Workshop', 'Cybersecurity'),
        ('AWS Security Workshop', 'Cloud'),
        ('AWS Security Workshop', 'Career'),
        ('AI Career Panel', 'Career'),
        ('Basketball Tournament', 'Sports'),
        ('Cybersecurity Club Meeting', 'Cybersecurity'),
        ('Cybersecurity Club Meeting', 'Career')
) AS sample(event_title, interest_name)
JOIN events ON events.title = sample.event_title
JOIN interests ON interests.interest_name = sample.interest_name
ON CONFLICT (event_id, interest_id) DO NOTHING;
