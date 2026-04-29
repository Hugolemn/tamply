CREATE TABLE public.faq_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  email TEXT,
  ai_answer TEXT,
  page TEXT NOT NULL DEFAULT 'tarifs',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT question_length CHECK (char_length(question) BETWEEN 5 AND 1000),
  CONSTRAINT email_length CHECK (email IS NULL OR char_length(email) <= 255)
);

ALTER TABLE public.faq_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_faq_question"
ON public.faq_questions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  char_length(trim(question)) BETWEEN 5 AND 1000
  AND (email IS NULL OR char_length(email) <= 255)
);
