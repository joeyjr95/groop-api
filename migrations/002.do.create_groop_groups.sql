CREATE TABLE groop_groups (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  name TEXT NOT NULL,
  owner_id INTEGER 
    REFERENCES groop_users(id) ON DELETE CASCADE NOT NULL
 );
