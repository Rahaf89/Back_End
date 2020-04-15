-- CREATE TABLES AGAIN 
CREATE TABLE services (
id serial primary key,
provider_id   int,
receiver_id   int,
points       int,
content   varchar,
state         varchar,
start_date   timestamp,
end_date     timestamp,
review         int,
comment        varchar
);

CREATE TABLE users (
  "id" SERIAL PRIMARY KEY,
  "name" varchar UNIQUE,
  "email" varchar UNIQUE,
  "points" int,
  "average_rating" decimal,
  "password" varchar(255)
  
);

CREATE TABLE service_tags (
  "id" SERIAL PRIMARY KEY,
  "service_id" int,
  "hashtag_id" int
);

CREATE TABLE hashtags (
  "id" SERIAL PRIMARY KEY,
  "text" varchar UNIQUE
);

-- ADD TABLES RELATIONSHIPS
ALTER TABLE "service_tags" ADD FOREIGN KEY ("service_id") REFERENCES "services" ("id");
ALTER TABLE "service_tags" ADD FOREIGN KEY ("hashtag_id") REFERENCES "hashtags" ("id");
ALTER TABLE "services" ADD FOREIGN KEY ("receiver_id") REFERENCES "users" ("id");
ALTER TABLE "services" ADD FOREIGN KEY ("provider_id") REFERENCES "users" ("id");

-- ADD USERS
INSERT INTO users (name, email, points, average_rating, password) VALUES
('ward', 'ward@gmail.com', 22, 2, 123456);
INSERT INTO users (name, email, points, average_rating, password) VALUES
('housni', 'housni@gmail.com', 12, 4, 123456789);
INSERT INTO users (name, email, points, average_rating, password) VALUES
('eduard', 'eduard@gmail.com', 52, 5, 0123456789);
INSERT INTO users (name, email, points, average_rating, password) VALUES
('rahaf', 'rahaf@gmail.com', 32, 3.5, 'rahaf89');

-- INSERT SERVICE 1
INSERT INTO services (content,points, receiver_id, provider_id, state, start_date, end_date, review, comment) 
VALUES ('I need someone to take care of my h:dogs during my h:vacations', 50, 1, 2, 'accepted', '2016-06-22 19:10:25-07','2016-06-29 12:10:25-07', 0, '');
-- CREATE HASHTAG 'dogs' AND ASSIGN IT TO SERVICE 1
INSERT INTO hashtags (text) VALUES ('dogs');
INSERT INTO service_tags (service_id, hashtag_id) VALUES (1, 1);
-- CREATE HASHTAG 'vacations' AND ASSIGN IT TO SERVICE 1 
INSERT INTO hashtags (text) VALUES ('vacations');
INSERT INTO service_tags (service_id, hashtag_id) VALUES (1, 2);

-- INSERT SERVICE 2
INSERT INTO services (content,points, receiver_id, provider_id, state, start_date, end_date, review, comment) 
VALUES ('I need someone to give me h:english h:classes ', 30, 4, 1, 'accepted', '2016-06-23 17:10:25-07','2016-06-23 18:15:25-07', 3, '');
-- CREATE HASHTAG 'english' AND ASSIGN IT TO SERVICE 2
INSERT INTO hashtags (text) VALUES ('english');
INSERT INTO service_tags (service_id, hashtag_id) VALUES (2, 3);
-- CREATE HASHTAG 'classes' AND ASSIGN IT TO SERVICE 2
INSERT INTO hashtags (text) VALUES ('classes');
INSERT INTO service_tags (service_id, hashtag_id) VALUES (2, 4);

-- SERVICE 3
INSERT INTO services (content,points, receiver_id, provider_id, state, start_date, end_date, review, comment) 
VALUES ('I need someone to give me h:math h:classes ', 40, 4, 3, 'accepted', '2016-06-23 17:10:25-07','2016-06-23 18:15:25-07', 3, '');
-- CREATE HASHTAG 'math' AND ASSIGN IT TO SERVICE 3
INSERT INTO hashtags (text) VALUES ('math');
INSERT INTO service_tags (service_id, hashtag_id) VALUES (3, 5);
-- ASSIGN HASHTAG 'classes' TO SERVICE 3. DO NOT CREATE IT AGAIN! WE CREATED BEFORE :)
INSERT INTO service_tags (service_id, hashtag_id) VALUES (3, 4);

-- SERVICE 4
INSERT INTO services (content,points, receiver_id, provider_id, state, start_date, end_date, review, comment) 
VALUES ('I need someone for h:painting my h:house ', 50, 3, 2, 'accepted', '2016-06-23 18:10:25-07','2016-06-23 19:15:25-07', 1, '');
-- CREATE HASHTAG 'painting' AND ASSIGN IT TO SERVICE 4
INSERT INTO hashtags (text) VALUES ('painting');
INSERT INTO service_tags (service_id, hashtag_id) VALUES (4, 6);
-- ASSIGN HASHTAG 'house' TO SERVICE 4. 
INSERT INTO hashtags (text) VALUES ('house');
INSERT INTO service_tags (service_id, hashtag_id) VALUES (3, 7);
