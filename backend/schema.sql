-- SQLite schema for Mie Ayam Ceker Jali-Jali HPP system
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  unit TEXT,
  net_weight REAL DEFAULT 0,
  gross_weight REAL DEFAULT 0,
  price REAL DEFAULT 0,
  type TEXT DEFAULT 'raw', -- raw | pre_recipe
  createdAt DATETIME,
  updatedAt DATETIME
);

CREATE TABLE IF NOT EXISTS Recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  total_cost REAL DEFAULT 0,
  createdAt DATETIME,
  updatedAt DATETIME
);

CREATE TABLE IF NOT EXISTS RecipeDetails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipeId INTEGER REFERENCES Recipes(id) ON DELETE CASCADE,
  ingredientId INTEGER REFERENCES Ingredients(id),
  name TEXT,
  usage REAL DEFAULT 0,
  unit TEXT,
  net_weight REAL DEFAULT 0,
  gross_weight REAL DEFAULT 0,
  price REAL DEFAULT 0,
  cost_price REAL DEFAULT 0,
  createdAt DATETIME,
  updatedAt DATETIME
);

CREATE TABLE IF NOT EXISTS Products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price_sell REAL DEFAULT 0,
  total_food_cost REAL DEFAULT 0,
  createdAt DATETIME,
  updatedAt DATETIME
);

CREATE TABLE IF NOT EXISTS ProductDetails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  productId INTEGER REFERENCES Products(id) ON DELETE CASCADE,
  ingredientId INTEGER REFERENCES Ingredients(id),
  name TEXT,
  usage REAL DEFAULT 0,
  unit TEXT,
  net_weight REAL DEFAULT 0,
  gross_weight REAL DEFAULT 0,
  price REAL DEFAULT 0,
  cost_price REAL DEFAULT 0,
  createdAt DATETIME,
  updatedAt DATETIME
);

CREATE TABLE IF NOT EXISTS Labors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_name TEXT,
  salary REAL DEFAULT 0,
  work_days INTEGER DEFAULT 1,
  cost_per_day REAL DEFAULT 0,
  createdAt DATETIME,
  updatedAt DATETIME
);

CREATE TABLE IF NOT EXISTS Overheads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  total_cost REAL DEFAULT 0,
  duration_days INTEGER DEFAULT 1,
  cost_per_day REAL DEFAULT 0,
  createdAt DATETIME,
  updatedAt DATETIME
);
