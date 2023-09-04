-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS posts;
-- DROP TABLE IF EXISTS comments;
-- DROP TABLE IF EXISTS messages;
-- DROP TABLE IF EXISTS sessions;
-- DROP TABLE IF EXISTS user_status;

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    age INTEGER,
    gender TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_status (
    username TEXT PRIMARY KEY,
    status BOOLEAN NOT NULL,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    message TEXT NOT NULL,
    sender TEXT NOT NULL,
    receiver TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (receiver) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT session_unique UNIQUE (user_id) ON CONFLICT REPLACE
);

--  dummy data:
-- INSERT INTO messages (id, message, sender, receiver, sent_at)
-- VALUES ('message_id_1', 'Hey, see message yesterday?', 'Egon', 'Jeff', '2023-08-15 10:00:00');
-- INSERT INTO messages (id, message, sender, receiver, sent_at)
-- VALUES ('message_id_2', 'Yeah, got message. "Hello Jeff!" on Aug 15, 10:00 AM.', 'Jeff', 'Egon', '2023-08-15 10:30:00');
-- INSERT INTO messages (id, message, sender, receiver, sent_at)
-- VALUES ('message_id_3', 'Checking in. How you been?', 'Egon', 'Jeff', '2023-08-15 11:00:00');
-- INSERT INTO messages (id, message, sender, receiver, sent_at)
-- VALUES ('message_id_4', 'I''m well, thanks. Sent two messages on Aug 16th. One at 11:30 AM, saying "How are you?", and another at 11:35 AM. Did you mean to send twice?', 'Jeff', 'Egon', '2023-08-15 11:30:00');
-- INSERT INTO messages (id, message, sender, receiver, sent_at)
-- VALUES ('message_id_5', 'Oops, my bad! That was a mistake. Sorry about that. Second one wasn''t necessary.', 'Egon', 'Jeff', '2023-08-15 12:00:00');
-- INSERT INTO messages (id, message, sender, receiver, sent_at)
-- VALUES ('message_id_6', 'No problem at all. Anything new?', 'Jeff', 'Egon', '2023-08-15 12:30:00');
-- INSERT INTO messages (id, message, sender, receiver, sent_at)
-- VALUES ('message_id_7', 'Not much, working on projects. How about you?', 'Egon', 'Jeff', '2023-08-15 13:00:00');
-- INSERT INTO messages (id, message, sender, receiver, sent_at)
-- VALUES ('message_id_8', 'Same here, work busy. Managed hobbies.', 'Jeff', 'Egon', '2023-08-15 13:30:00');
-- INSERT INTO messages (id, message, sender, receiver, sent_at)
-- VALUES ('message_id_9', 'That''s great! Downtime important. Heard new coffee place downtown?', 'Egon', 'Jeff', '2023-08-15 14:00:00');
-- INSERT INTO messages (id, message, sender, receiver, sent_at)
-- VALUES ('message_id_10', 'Yeah, heard about it. Been there?', 'Jeff', 'Egon', '2023-08-15 14:30:00');
-- INSERT INTO messages (id, message, sender, receiver, sent_at)
-- VALUES ('message_id_11', 'Yeah, checked it out. Good coffee, cozy atmosphere.', 'Egon', 'Jeff', '2023-08-15 15:00:00');
-- INSERT INTO messages (id, message, sender, receiver, sent_at)
-- VALUES ('message_id_12', 'Nice, I''ll try it. Plans for holiday?', 'Jeff', 'Egon', '2023-08-15 15:30:00');
-- INSERT INTO messages (id, message, sender, receiver, sent_at)
-- VALUES ('message_id_13', 'Not yet, figuring out. You?', 'Egon', 'Jeff', '2023-08-16 16:00:00');
-- INSERT INTO messages (id, message, sender, receiver, sent_at)
-- VALUES ('message_id_14', 'Thinking of short trip, countryside change.', 'Jeff', 'Egon', '2023-08-16 16:30:00');
-- INSERT INTO messages (id, message, sender, receiver, sent_at)
-- VALUES ('message_id_15', 'That''s great! Heard new coffee place downtown?', 'Egon', 'Jeff', '2023-08-17 14:00:00');
-- INSERT INTO messages (id, message, sender, receiver, sent_at)
-- VALUES ('message_id_16', 'Yeah, heard about it. Been there?', 'Jeff', 'Egon', '2023-08-17 14:30:00');
-- INSERT INTO messages (id, message, sender, receiver, sent_at)
-- VALUES ('message_id_17', 'Yeah, checked it out. Good coffee, cozy atmosphere.', 'Egon', 'Jeff', '2023-08-17 15:00:00');
-- INSERT INTO messages (id, message, sender, receiver, sent_at)
-- VALUES ('message_id_18', 'Nice, I''ll try it. Plans for holiday?', 'Jeff', 'Egon','2023-08-18 10:00:00')