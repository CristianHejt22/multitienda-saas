import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vxnhbgjdrajvjvmseegt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bmhiZ2pkcmFqdmp2bXNlZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNjIzMDQsImV4cCI6MjEwNDgzODMwNH0.oAkwvFxxdTrzG4__Shl1nOo-feHh25JYAceavq5Wfko';

export const supabase = createClient(supabaseUrl, supabaseKey);
