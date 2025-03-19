-- Create the posts table for community sharing
CREATE TABLE IF NOT EXISTS posts (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uuid UUID NOT NULL,
  habit_uuid UUID REFERENCES habits(uuid),
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key to the auth.users table
  CONSTRAINT fk_user_uuid
    FOREIGN KEY (user_uuid)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_posts_user_uuid ON posts(user_uuid);
CREATE INDEX IF NOT EXISTS idx_posts_habit_uuid ON posts(habit_uuid);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);

-- Create the post_likes table for tracking likes
CREATE TABLE IF NOT EXISTS post_likes (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_uuid UUID NOT NULL REFERENCES posts(uuid) ON DELETE CASCADE,
  user_uuid UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can only like a post once
  UNIQUE(post_uuid, user_uuid),
  
  -- Foreign key to the auth.users table
  CONSTRAINT fk_user_uuid
    FOREIGN KEY (user_uuid)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_post_likes_post_uuid ON post_likes(post_uuid);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_uuid ON post_likes(user_uuid);

-- Create the post_comments table for discussions
CREATE TABLE IF NOT EXISTS post_comments (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_uuid UUID NOT NULL REFERENCES posts(uuid) ON DELETE CASCADE,
  user_uuid UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key to the auth.users table
  CONSTRAINT fk_user_uuid
    FOREIGN KEY (user_uuid)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_post_comments_post_uuid ON post_comments(post_uuid);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_uuid ON post_comments(user_uuid);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at);

-- Update the profiles table to include additional user stats if not already present
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at
BEFORE UPDATE ON post_comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 