import { createClient } from '@supabase/supabase-js';
import {
  sampleCourses,
  sampleFacilities,
  sampleTrainers,
  sampleStudents,
  sampleBlogs,
  sampleGallery,
  homeContent,
  siteSettings,
  sampleAdmissions,
  sampleMessages,
} from '../src/data/sampleData';

const url = process.env.SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_EMAIL = 'admin@pratappunja.com';
const ADMIN_PASSWORD = 'JalgpalSinghRathore32';

async function seedCollection(
  table: string,
  items: any[],
  toRow: (item: any, index: number) => Record<string, unknown>
) {
  const rows = items.map(toRow);
  const { error } = await admin.from(table).upsert(rows);
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`Seeded ${rows.length} rows into ${table}`);
}

async function main() {
  await seedCollection('courses', sampleCourses, (c, i) => ({
    id: c.id, published: c.published, sort_order: c.order ?? i, data: c,
  }));
  await seedCollection('facilities', sampleFacilities, (f, i) => ({
    id: f.id, published: f.published, sort_order: f.order ?? i, data: f,
  }));
  await seedCollection('trainers', sampleTrainers, (t, i) => ({
    id: t.id, published: t.published, sort_order: i, data: t,
  }));
  await seedCollection('students', sampleStudents, (s, i) => ({
    id: s.id, published: s.published, sort_order: i, data: s,
  }));
  await seedCollection('blogs', sampleBlogs, (b, i) => ({
    id: b.id, published: b.published, sort_order: i, data: b,
  }));
  await seedCollection('gallery', sampleGallery, (g, i) => ({
    id: g.id, published: g.published, sort_order: g.order ?? i, data: g,
  }));

  const { error: homeErr } = await admin
    .from('home_content')
    .upsert({ id: 'main', data: homeContent });
  if (homeErr) throw new Error(`home_content: ${homeErr.message}`);
  console.log('Seeded home_content');

  const { error: settingsErr } = await admin
    .from('site_settings')
    .upsert({ id: 'main', data: siteSettings });
  if (settingsErr) throw new Error(`site_settings: ${settingsErr.message}`);
  console.log('Seeded site_settings');

  await seedCollection('admissions', sampleAdmissions, (a) => ({ id: a.id, data: a }));
  await seedCollection('messages', sampleMessages, (m) => ({ id: m.id, data: m }));

  // Create (or update) the admin auth user.
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list?.users.find((u) => u.email === ADMIN_EMAIL);
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    console.log(`Updated admin user ${ADMIN_EMAIL}`);
  } else {
    const { error } = await admin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (error) throw new Error(`create admin: ${error.message}`);
    console.log(`Created admin user ${ADMIN_EMAIL}`);
  }

  console.log('\nSeed complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
