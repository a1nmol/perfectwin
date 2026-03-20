import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://elhntbaewqsypeblvpok.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaG50YmFld3FzeXBlYmx2cG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5ODcxMTYsImV4cCI6MjA4OTU2MzExNn0.8sWeu3TwTBUNKAIcEuOCvYCcYcsNgcB9iSyfnckBno8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
