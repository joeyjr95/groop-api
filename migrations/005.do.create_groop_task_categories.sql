CREATE TABLE groop_task_categories (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  category_name VARCHAR(60),
  group_id INTEGER 
    REFERENCES groop_groups(id) ON DELETE CASCADE NOT NULL 
);

ALTER TABLE groop_tasks 
ADD
  category_id INTEGER REFERENCES groop_task_categories(id) ON DELETE CASCADE;

