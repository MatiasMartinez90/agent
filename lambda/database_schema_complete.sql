-- Esquema completo para template_app basado en proyecto_cloudacademy
-- Crear extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tabla categories (referenciada por courses)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla courses
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(100) PRIMARY KEY,
    category_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    level VARCHAR(50),
    duration VARCHAR(50),
    cost VARCHAR(50),
    difficulty VARCHAR(100),
    type VARCHAR(100),
    color VARCHAR(255),
    students INTEGER DEFAULT 0,
    rating NUMERIC(2,1) DEFAULT 0.0,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT courses_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Tabla users (exactamente como en el original)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cognito_user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    picture_url TEXT,
    provider VARCHAR(50) DEFAULT 'google',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITHOUT TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    onboarding_completed BOOLEAN DEFAULT false,
    preferences JSONB DEFAULT '{}'::jsonb
);

-- Tabla user_course_progress
CREATE TABLE IF NOT EXISTS user_course_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    course_id VARCHAR(255) NOT NULL,
    progress_percentage INTEGER DEFAULT 0,
    started_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITHOUT TIME ZONE,
    last_accessed TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_course_progress_progress_percentage_check CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    CONSTRAINT user_course_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_course_progress_course_id FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Índices para users
CREATE UNIQUE INDEX IF NOT EXISTS users_cognito_user_id_key ON users(cognito_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cognito_user_id ON users(cognito_user_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Índices para courses
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(featured);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_rating ON courses(rating);
CREATE INDEX IF NOT EXISTS idx_courses_type ON courses(type);

-- Índices para user_course_progress
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_id ON user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_course_id ON user_course_progress(course_id);
CREATE UNIQUE INDEX IF NOT EXISTS user_course_progress_user_id_course_id_key ON user_course_progress(user_id, course_id);

-- Trigger para actualizar updated_at en users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar categoría de ejemplo
INSERT INTO categories (id, name, description, icon, color) 
VALUES (1, 'Cloud & DevOps', 'Cursos de computación en la nube y DevOps', 'cloud', '#10b981')
ON CONFLICT (id) DO NOTHING;

-- Insertar curso de ejemplo
INSERT INTO courses (id, category_id, title, description, icon, level, duration, cost, difficulty, type, color, students, rating, featured)
VALUES (
    'rag-amazon-bedrock',
    1,
    'RAG con Amazon Bedrock',
    'Aprende a construir aplicaciones de Retrieval Augmented Generation usando Amazon Bedrock',
    'brain',
    'Intermedio',
    '8 horas',
    'Gratis',
    'Intermedio',
    'Hands-on',
    '#6366f1',
    150,
    4.8,
    true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO courses (id, category_id, title, description, icon, level, duration, cost, difficulty, type, color, students, rating, featured)
VALUES (
    'aws-vpc-networking',
    1,
    'AWS VPC y Networking',
    'Domina las redes virtuales en AWS, subnets, routing y seguridad',
    'network',
    'Avanzado',
    '12 horas',
    'Gratis',
    'Avanzado',
    'Práctico',
    '#8b5cf6',
    89,
    4.9,
    true
) ON CONFLICT (id) DO NOTHING;