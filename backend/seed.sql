-- Run this in your Supabase SQL editor

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  published_at DATE NOT NULL,
  author TEXT NOT NULL
);

-- Daily stats table
CREATE TABLE IF NOT EXISTS daily_stats (
  id SERIAL PRIMARY KEY,
  article_id INT REFERENCES articles(id),
  date DATE NOT NULL,
  views INT DEFAULT 0,
  unique_visitors INT DEFAULT 0
);

-- Seed articles
INSERT INTO articles (title, topic, views, likes, comments, published_at, author) VALUES
('Getting Started with Kubernetes', 'DevOps', 5200, 342, 67, '2024-01-05', 'Arif Shaik'),
('GPT-4 vs Claude: A Deep Dive', 'AI', 9800, 721, 134, '2024-01-10', 'Priya Nair'),
('Terraform Best Practices 2024', 'DevOps', 4100, 289, 52, '2024-01-15', 'Arif Shaik'),
('Zero Trust Security Model', 'Security', 3300, 201, 41, '2024-01-18', 'Rahul Verma'),
('React Server Components Explained', 'Web Dev', 2900, 178, 35, '2024-01-22', 'Sneha Patel'),
('AWS EKS vs GKE vs AKS', 'Cloud', 6700, 455, 89, '2024-02-01', 'Arif Shaik'),
('LLMs in Production: Lessons Learned', 'AI', 11200, 834, 167, '2024-02-05', 'Priya Nair'),
('Docker Security Hardening', 'Security', 3800, 267, 48, '2024-02-10', 'Rahul Verma'),
('Next.js 14 App Router Guide', 'Web Dev', 4500, 312, 61, '2024-02-14', 'Sneha Patel'),
('Multi-Cloud Strategy with Terraform', 'Cloud', 3100, 198, 37, '2024-02-20', 'Arif Shaik'),
('Fine-Tuning Open Source LLMs', 'AI', 8900, 623, 121, '2024-03-01', 'Priya Nair'),
('GitOps with Argo CD', 'DevOps', 4700, 331, 64, '2024-03-05', 'Arif Shaik'),
('Serverless vs Containers', 'Cloud', 5500, 389, 76, '2024-03-10', 'Rahul Verma'),
('OWASP Top 10 for 2024', 'Security', 6200, 441, 88, '2024-03-15', 'Sneha Patel'),
('Building RAG Systems', 'AI', 13400, 967, 198, '2024-03-20', 'Priya Nair'),
('Prometheus & Grafana Setup', 'DevOps', 3900, 274, 53, '2024-03-25', 'Arif Shaik'),
('AWS Cost Optimization Tips', 'Cloud', 7100, 512, 99, '2024-04-01', 'Rahul Verma'),
('TypeScript 5.0 New Features', 'Web Dev', 3400, 231, 44, '2024-04-05', 'Sneha Patel'),
('AI Agents Architecture', 'AI', 15600, 1123, 234, '2024-04-10', 'Priya Nair'),
('Jenkins vs GitHub Actions', 'DevOps', 5800, 412, 80, '2024-04-15', 'Arif Shaik');

-- Seed daily stats (last 30 days for top articles)
INSERT INTO daily_stats (article_id, date, views, unique_visitors)
SELECT
  a.id,
  generate_series(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, '1 day')::date,
  (random() * 200 + 50)::int,
  (random() * 150 + 30)::int
FROM articles a WHERE a.topic = 'AI';

-- Function to allow safe SQL execution via RPC
CREATE OR REPLACE FUNCTION execute_query(query_text TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Only allow SELECT statements
  IF NOT (lower(trim(query_text)) LIKE 'select%') THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed';
  END IF;
  EXECUTE 'SELECT json_agg(t) FROM (' || query_text || ') t' INTO result;
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
