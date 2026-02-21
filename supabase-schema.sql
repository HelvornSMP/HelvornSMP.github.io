-- HelvornSMP Database Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  minecraft_username TEXT UNIQUE NOT NULL,
  uuid TEXT UNIQUE,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_playtime INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Server status table
CREATE TABLE IF NOT EXISTS server_status (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  is_online BOOLEAN DEFAULT FALSE,
  players_online INTEGER DEFAULT 0,
  max_players INTEGER DEFAULT 0,
  version TEXT,
  motd TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game modes table
CREATE TABLE IF NOT EXISTS game_modes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default game modes
INSERT INTO game_modes (name, display_name, description, is_active, status) VALUES
  ('anarchy', 'Anarchy', 'Total freedom. 1 rule no hacking, no protection. Survive in a world where anything goes.', TRUE, 'active'),
  ('survival', 'Survival', 'Classic Minecraft survival with light rules to keep the experience fair and fun.', TRUE, 'active'),
  ('creative', 'Creative', 'Unlimited resources and flight. Perfect for building your dream creations.', FALSE, 'inactive'),
  ('lifesteal', 'Lifesteal', 'Steal hearts from your enemies in combat. High-stakes PvP action.', FALSE, 'coming_soon')
ON CONFLICT (name) DO NOTHING;

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_username ON players(minecraft_username);
CREATE INDEX IF NOT EXISTS idx_players_last_seen ON players(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_server_status_updated ON server_status(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date DESC);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to players" ON players
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to server_status" ON server_status
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to game_modes" ON game_modes
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to active announcements" ON announcements
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to active events" ON events
  FOR SELECT USING (is_active = true);
