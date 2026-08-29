import re
path = r'c:\Users\AJ TAN\Desktop\igloo-native-main\supabase-schema.sql'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace(
    'dob        text,\n  created_at timestamptz not null default now(),',
    'dob        text,\n  wants_health_sync boolean not null default false,\n  created_at timestamptz not null default now(),'
)
content = content.replace(
    "insert into public.profiles (id, name, dob)\n  values (new.id, '', '');",
    "insert into public.profiles (id, name, dob, wants_health_sync)\n  values (new.id, '', '', false);"
)
with open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)
print('Done')
