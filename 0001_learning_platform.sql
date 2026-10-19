create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  experience_level text not null default 'Just getting started',
  learning_goal text not null default 'Build my foundations',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_modules (
  module_id text primary key,
  sort_order integer not null unique,
  title text not null,
  difficulty text not null check (difficulty in ('Beginner', 'Intermediate', 'Advanced', 'Specialization')),
  description text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  topics jsonb not null default '[]'::jsonb
);

create table if not exists public.lessons (
  lesson_id text primary key,
  module_id text not null references public.course_modules (module_id) on delete cascade,
  sort_order integer not null,
  title text not null,
  difficulty text not null check (difficulty in ('Beginner', 'Intermediate', 'Advanced', 'Specialization')),
  duration_minutes integer not null check (duration_minutes > 0),
  content jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  unique (module_id, sort_order)
);

create table if not exists public.lesson_completions (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null references public.lessons (lesson_id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.exercises (
  exercise_id text primary key,
  lesson_id text not null references public.lessons (lesson_id) on delete cascade,
  title text not null,
  prompt text not null,
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  starter_code text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.exercise_test_cases (
  test_case_id uuid primary key default gen_random_uuid(),
  exercise_id text not null references public.exercises (exercise_id) on delete cascade,
  ordinal integer not null check (ordinal >= 0),
  input jsonb not null default '[]'::jsonb,
  expected_output text not null,
  hidden boolean not null default false,
  unique (exercise_id, ordinal)
);

create table if not exists public.quiz_questions (
  question_id text primary key,
  module_id text references public.course_modules (module_id) on delete cascade,
  topic text not null,
  prompt text not null,
  options jsonb not null,
  explanation text not null,
  sort_order integer not null
);

create table if not exists public.quiz_answer_keys (
  question_id text primary key references public.quiz_questions (question_id) on delete cascade,
  answer_index integer not null check (answer_index >= 0)
);

create table if not exists public.quiz_attempts (
  attempt_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  module_id text references public.course_modules (module_id) on delete set null,
  score integer not null check (score >= 0),
  total_questions integer not null check (total_questions > 0),
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  check (score <= total_questions)
);

create table if not exists public.exercise_submissions (
  submission_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id text not null references public.exercises (exercise_id) on delete cascade,
  source_code text not null,
  status text not null check (status in ('passed', 'failed', 'error')),
  passed_tests integer not null default 0 check (passed_tests >= 0),
  total_tests integer not null check (total_tests >= 0),
  submitted_at timestamptz not null default now(),
  check (passed_tests <= total_tests)
);

create table if not exists public.saved_snippets (
  snippet_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (length(title) between 1 and 120),
  source_code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookmarks (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null references public.lessons (lesson_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.personal_notes (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null references public.lessons (lesson_id) on delete cascade,
  note text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.project_submissions (
  submission_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id text not null,
  status text not null check (status in ('in_progress', 'completed')),
  notes text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, project_id)
);

create table if not exists public.learning_activity_events (
  event_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null check (event_type in ('lesson_started', 'lesson_completed', 'project_completed', 'quiz_submitted', 'exercise_run', 'snippet_saved')),
  item_id text not null,
  occurred_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  daily_goal_minutes integer not null default 20 check (daily_goal_minutes between 5 and 240),
  theme text not null default 'light' check (theme in ('light', 'dark')),
  updated_at timestamptz not null default now()
);

create index if not exists lessons_module_sort_idx on public.lessons (module_id, sort_order);
create index if not exists quiz_attempts_user_submitted_idx on public.quiz_attempts (user_id, submitted_at desc);
create index if not exists exercise_submissions_user_submitted_idx on public.exercise_submissions (user_id, submitted_at desc);
create index if not exists learning_activity_user_occurred_idx on public.learning_activity_events (user_id, occurred_at desc);
create index if not exists personal_notes_user_updated_idx on public.personal_notes (user_id, updated_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.user_profiles enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_completions enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_test_cases enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_answer_keys enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.exercise_submissions enable row level security;
alter table public.saved_snippets enable row level security;
alter table public.bookmarks enable row level security;
alter table public.personal_notes enable row level security;
alter table public.project_submissions enable row level security;
alter table public.learning_activity_events enable row level security;
alter table public.user_preferences enable row level security;

drop policy if exists "Published modules are readable" on public.course_modules;
create policy "Published modules are readable" on public.course_modules for select using (true);
drop policy if exists "Published lessons are readable" on public.lessons;
create policy "Published lessons are readable" on public.lessons for select using (published);
drop policy if exists "Exercises are readable" on public.exercises;
create policy "Exercises are readable" on public.exercises for select using (true);
drop policy if exists "Quiz questions are readable" on public.quiz_questions;
create policy "Quiz questions are readable" on public.quiz_questions for select using (true);

drop policy if exists "Learners manage their profile" on public.user_profiles;
create policy "Learners manage their profile" on public.user_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Learners manage their completions" on public.lesson_completions;
create policy "Learners manage their completions" on public.lesson_completions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Learners manage their quiz attempts" on public.quiz_attempts;
create policy "Learners manage their quiz attempts" on public.quiz_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Learners manage their exercise submissions" on public.exercise_submissions;
create policy "Learners manage their exercise submissions" on public.exercise_submissions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Learners manage their snippets" on public.saved_snippets;
create policy "Learners manage their snippets" on public.saved_snippets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Learners manage their bookmarks" on public.bookmarks;
create policy "Learners manage their bookmarks" on public.bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Learners manage their notes" on public.personal_notes;
create policy "Learners manage their notes" on public.personal_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Learners manage their projects" on public.project_submissions;
create policy "Learners manage their projects" on public.project_submissions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Learners manage their activity" on public.learning_activity_events;
create policy "Learners manage their activity" on public.learning_activity_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Learners manage their preferences" on public.user_preferences;
create policy "Learners manage their preferences" on public.user_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into public.course_modules (module_id, sort_order, title, difficulty, description, duration_minutes, topics)
values
  ('module-00', 0, 'Introduction to Python', 'Beginner', 'Meet Python, understand how programs run, and write your first readable script.', 35, '["What programming is","Python and its uses","Running a script","Errors and PEP 8"]'::jsonb),
  ('module-01', 1, 'Variables, Objects, and Data Types', 'Beginner', 'Understand names, values, object references, built-in types, and mutability.', 55, '["Names and objects","Numbers and strings","Collections","Identity and equality"]'::jsonb),
  ('module-02', 2, 'Operators in Python', 'Beginner', 'Use arithmetic, comparison, logical, membership, identity, and bitwise operators.', 40, '["Arithmetic","Comparisons","Boolean logic","Membership and identity"]'::jsonb),
  ('module-03', 3, 'Input, Output, and Formatting', 'Beginner', 'Read user input, display useful messages, and format values clearly.', 35, '["print and input","f-strings","Formatting values","Input validation"]'::jsonb),
  ('module-04', 4, 'Conditional Statements', 'Beginner', 'Guide program flow with clear conditions, branches, and guard clauses.', 40, '["if, elif, else","Truthiness","Nested decisions","Conditional expressions"]'::jsonb),
  ('module-05', 5, 'Loops and Iteration', 'Beginner', 'Repeat work safely and read collections with for and while loops.', 50, '["for and while","range","break and continue","enumerate and zip"]'::jsonb),
  ('module-06', 6, 'Strings in Depth', 'Beginner', 'Work with immutable text using indexing, slicing, methods, and formatting.', 45, '["Indexing and slicing","String methods","Splitting and joining","Unicode"]'::jsonb),
  ('module-07', 7, 'Lists', 'Beginner', 'Store ordered, changeable collections and choose safe ways to copy them.', 45, '["Indexing and slicing","List methods","Aliasing and copies","Comprehensions"]'::jsonb),
  ('module-08', 8, 'Tuples, Sets, and Frozensets', 'Beginner', 'Select collection types based on ordering, uniqueness, and mutability.', 40, '["Tuple packing","Set operations","Frozensets","Choosing a collection"]'::jsonb),
  ('module-09', 9, 'Dictionaries', 'Beginner', 'Represent labeled data with key-value pairs and build useful lookup patterns.', 45, '["Creating mappings","Methods and iteration","Comprehensions","Hashable keys"]'::jsonb),
  ('module-10', 10, 'Functions from Basic to Advanced', 'Beginner', 'Package logic into reusable functions with explicit inputs, outputs, and contracts.', 60, '["Parameters and returns","Arguments","*args and **kwargs","Scope and closures"]'::jsonb),
  ('module-11', 11, 'Comprehensions and Functional Tools', 'Intermediate', 'Transform data concisely and decide when lazy or eager iteration is clearest.', 45, '["List and dict comprehensions","Generator expressions","map and filter","any and all"]'::jsonb),
  ('module-12', 12, 'Modules, Packages, and Imports', 'Intermediate', 'Organize Python code into reusable modules and understand Python import behavior.', 40, '["import statements","Packages","__name__","Circular imports"]'::jsonb),
  ('module-13', 13, 'File Handling and Data Serialization', 'Intermediate', 'Read and write files safely, then exchange structured data with standard formats.', 50, '["with and file modes","Paths","JSON and CSV","Encoding and errors"]'::jsonb),
  ('module-14', 14, 'Exception Handling and Debugging', 'Intermediate', 'Handle expected failures deliberately and debug problems with evidence.', 45, '["try and except","Exception types","raise and finally","Debugging tools"]'::jsonb),
  ('module-15', 15, 'Object-Oriented Programming', 'Intermediate', 'Model state and behavior with classes, composition, inheritance, and clear interfaces.', 75, '["Classes and instances","Encapsulation","Inheritance and composition","Special methods"]'::jsonb),
  ('module-16', 16, 'Iterators, Generators, and Lazy Evaluation', 'Advanced', 'Process sequences one item at a time and build memory-aware iteration pipelines.', 55, '["Iterable protocol","Iterator protocol","yield","Lazy evaluation"]'::jsonb),
  ('module-17', 17, 'Decorators and Advanced Function Behavior', 'Advanced', 'Wrap callables to add reusable behavior while preserving their metadata and intent.', 50, '["First-class functions","Closures","Decorator syntax","functools.wraps"]'::jsonb),
  ('module-18', 18, 'Advanced Python Language Features', 'Advanced', 'Explore context managers, pattern matching, annotations, and other modern language tools.', 55, '["Context managers","Structural pattern matching","Annotations","Descriptors overview"]'::jsonb),
  ('module-19', 19, 'Scope, Namespaces, and Memory Concepts', 'Advanced', 'Reason about name binding, object lifetimes, references, and Python memory behavior.', 45, '["LEGB lookup","Namespaces","References and identity","Garbage collection overview"]'::jsonb),
  ('module-20', 20, 'Algorithms and Data Structures', 'Intermediate', 'Choose basic structures and analyze algorithmic cost before optimizing.', 65, '["Big O intuition","Stacks and queues","Searching and sorting","Trees and graphs overview"]'::jsonb),
  ('module-21', 21, 'Dates, Time, and Mathematics', 'Intermediate', 'Handle dates, durations, numeric precision, and reproducible calculations.', 45, '["datetime and timedelta","Time zones","Decimal","Randomness"]'::jsonb),
  ('module-22', 22, 'Regular Expressions and Text Processing', 'Advanced', 'Use regular expressions carefully for structured text and know when simpler tools fit better.', 45, '["Patterns and groups","re.search and re.sub","Validation limits","Text pipelines"]'::jsonb),
  ('module-23', 23, 'Operating System and APIs', 'Intermediate', 'Work with paths, environment settings, processes, and responsible HTTP clients.', 55, '["pathlib and os","Environment variables","HTTP requests","Timeouts and API errors"]'::jsonb),
  ('module-24', 24, 'Virtual Environments, pip, and Packaging', 'Intermediate', 'Isolate dependencies, install packages, and prepare a Python project for reuse.', 40, '["venv","pip","Requirements","Project packaging"]'::jsonb),
  ('module-25', 25, 'Testing and Code Quality', 'Intermediate', 'Write repeatable tests and use formatting, linting, and type hints to improve confidence.', 55, '["unittest and pytest","Assertions","Fixtures and mocks","Formatting and linting"]'::jsonb),
  ('module-26', 26, 'Concurrency, Parallelism, and Async Python', 'Advanced', 'Choose threads, processes, or async I/O based on the work and its bottleneck.', 65, '["I/O-bound and CPU-bound work","threading and multiprocessing","asyncio","Cancellation"]'::jsonb),
  ('module-27', 27, 'Python Database Programming', 'Intermediate', 'Persist structured data safely and use parameterized queries and transactions.', 60, '["SQL concepts","sqlite3","Transactions","Parameterized queries"]'::jsonb),
  ('module-28', 28, 'Web Development with Python', 'Intermediate', 'Understand HTTP and build a responsible foundation for Python web applications and APIs.', 60, '["HTTP fundamentals","Flask and Django overview","REST APIs","Validation and security"]'::jsonb),
  ('module-29', 29, 'Professional Python Development', 'Advanced', 'Bring together maintainability, collaboration, observability, and deployment practices.', 55, '["PEP 8 and clean code","Logging","Git and code review","Configuration and deployment"]'::jsonb),
  ('module-30', 30, 'Python Specializations', 'Specialization', 'Explore optional paths in automation, data analysis, machine learning, and backend engineering.', 70, '["Automation","NumPy and Pandas","Machine learning foundations","Backend frameworks"]'::jsonb),
  ('module-31', 31, 'Capstone Projects and Portfolio', 'Specialization', 'Turn skills into documented, tested applications with milestones and a portfolio-ready README.', 90, '["Project planning","Milestones and tests","Documentation","Portfolio review"]'::jsonb)
on conflict (module_id) do update set
  sort_order = excluded.sort_order,
  title = excluded.title,
  difficulty = excluded.difficulty,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  topics = excluded.topics;

insert into public.lessons (lesson_id, module_id, sort_order, title, difficulty, duration_minutes, content, published)
select
  module_id || '-foundations',
  module_id,
  0,
  title || ': core concepts',
  difficulty,
  duration_minutes,
  jsonb_build_object('summary', description, 'topics', topics),
  true
from public.course_modules
on conflict (lesson_id) do update set
  title = excluded.title,
  difficulty = excluded.difficulty,
  duration_minutes = excluded.duration_minutes,
  content = excluded.content,
  published = true;
