import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type {
  Course,
  Facility,
  Trainer,
  Student,
  Blog,
  HomeContent,
  GalleryItem,
  SiteSettings,
  AdmissionRequest,
  ContactMessage,
} from '../types';
import {
  homeContent as defaultHomeContent,
  siteSettings as defaultSiteSettings,
} from '../data/sampleData';

interface DataContextType {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  facilities: Facility[];
  setFacilities: React.Dispatch<React.SetStateAction<Facility[]>>;
  trainers: Trainer[];
  setTrainers: React.Dispatch<React.SetStateAction<Trainer[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  blogs: Blog[];
  setBlogs: React.Dispatch<React.SetStateAction<Blog[]>>;
  gallery: GalleryItem[];
  setGallery: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
  homeContent: HomeContent;
  setHomeContent: React.Dispatch<React.SetStateAction<HomeContent>>;
  siteSettings: SiteSettings;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  admissions: AdmissionRequest[];
  setAdmissions: React.Dispatch<React.SetStateAction<AdmissionRequest[]>>;
  messages: ContactMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ContactMessage[]>>;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

type WithId = { id: string };

/**
 * Diffs the current collection against the last-synced snapshot and applies
 * only the necessary upserts/deletes to Supabase. Keeps the component-facing
 * setState API unchanged while persisting to the database.
 */
async function syncCollection<T extends WithId>(
  table: string,
  items: T[],
  prev: T[],
  toRow: (item: T, index: number) => Record<string, unknown>
) {
  const currIds = new Set(items.map((i) => i.id));
  const toDelete = prev.filter((p) => !currIds.has(p.id)).map((p) => p.id);
  if (toDelete.length) {
    const { error } = await supabase.from(table).delete().in('id', toDelete);
    if (error) console.error(`[v0] delete ${table} failed:`, error.message);
  }

  // Brand-new rows use INSERT (allowed for anonymous public submissions like
  // admissions/messages). Changed existing rows use UPDATE (admin-only via RLS).
  // Note: a plain upsert would run INSERT ... ON CONFLICT DO UPDATE, which the
  // anon role cannot do because it has no UPDATE policy.
  const prevIds = new Set(prev.map((p) => p.id));

  const toInsert = items
    .filter((item) => !prevIds.has(item.id))
    .map((item) => toRow(item, items.indexOf(item)));

  if (toInsert.length) {
    const { error } = await supabase.from(table).insert(toInsert);
    if (error) console.error(`[v0] insert ${table} failed:`, error.message);
  }

  const toUpdate = items
    .filter((item) => {
      const before = prev.find((p) => p.id === item.id);
      return before && JSON.stringify(before) !== JSON.stringify(item);
    })
    .map((item) => toRow(item, items.indexOf(item)));

  for (const row of toUpdate) {
    const { error } = await supabase.from(table).upsert(row);
    if (error) console.error(`[v0] update ${table} failed:`, error.message);
  }
}

async function syncSingleton(table: string, id: string, data: unknown) {
  const { error } = await supabase.from(table).upsert({ id, data });
  if (error) console.error(`[v0] upsert ${table} failed:`, error.message);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [homeContentState, setHomeContent] = useState<HomeContent>(defaultHomeContent);
  const [siteSettingsState, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [admissions, setAdmissions] = useState<AdmissionRequest[]>([]);
  const [messagesState, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Snapshots of the last successfully-synced data, used to compute diffs.
  const prev = useRef({
    courses: [] as Course[],
    facilities: [] as Facility[],
    trainers: [] as Trainer[],
    students: [] as Student[],
    blogs: [] as Blog[],
    gallery: [] as GalleryItem[],
    homeContent: defaultHomeContent as HomeContent,
    siteSettings: defaultSiteSettings as SiteSettings,
    admissions: [] as AdmissionRequest[],
    messages: [] as ContactMessage[],
  });
  const ready = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadAll() {
      const rows = <T,>(res: { data: { data: T }[] | null }): T[] =>
        (res.data || []).map((r) => r.data);

      const ordered = (t: string) =>
        supabase.from(t).select('data').order('sort_order', { ascending: true });
      const byDate = (t: string) =>
        supabase.from(t).select('data').order('created_at', { ascending: false });

      const [
        coursesRes,
        facilitiesRes,
        trainersRes,
        studentsRes,
        blogsRes,
        galleryRes,
        admissionsRes,
        messagesRes,
      ] = await Promise.all([
        ordered('courses'),
        ordered('facilities'),
        ordered('trainers'),
        ordered('students'),
        ordered('blogs'),
        ordered('gallery'),
        byDate('admissions'),
        byDate('messages'),
      ]);

      const homeRes = await supabase
        .from('home_content')
        .select('data')
        .eq('id', 'main')
        .maybeSingle();
      const settingsRes = await supabase
        .from('site_settings')
        .select('data')
        .eq('id', 'main')
        .maybeSingle();

      if (!active) return;

      const nextCourses = rows<Course>(coursesRes);
      const nextFacilities = rows<Facility>(facilitiesRes);
      const nextTrainers = rows<Trainer>(trainersRes);
      const nextStudents = rows<Student>(studentsRes);
      const nextBlogs = rows<Blog>(blogsRes);
      const nextGallery = rows<GalleryItem>(galleryRes);
      
      // Deep merge home content with defaults to ensure structure integrity
      const homeFromDb = (homeRes.data?.data as Partial<HomeContent>) ?? {};
      const nextHome: HomeContent = {
        ...defaultHomeContent,
        ...homeFromDb,
        highlights: Array.isArray(homeFromDb.highlights) ? homeFromDb.highlights : defaultHomeContent.highlights,
      };
      
      const nextSettings = ((settingsRes.data?.data as SiteSettings) ?? defaultSiteSettings);
      const nextAdmissions = rows<AdmissionRequest>(admissionsRes);
      const nextMessages = rows<ContactMessage>(messagesRes);

      // Update snapshots in lockstep with state so the sync effects see no diff.
      prev.current = {
        courses: nextCourses,
        facilities: nextFacilities,
        trainers: nextTrainers,
        students: nextStudents,
        blogs: nextBlogs,
        gallery: nextGallery,
        homeContent: nextHome,
        siteSettings: nextSettings,
        admissions: nextAdmissions,
        messages: nextMessages,
      };

      setCourses(nextCourses);
      setFacilities(nextFacilities);
      setTrainers(nextTrainers);
      setStudents(nextStudents);
      setBlogs(nextBlogs);
      setGallery(nextGallery);
      setHomeContent(nextHome);
      setSiteSettings(nextSettings);
      setAdmissions(nextAdmissions);
      setMessages(nextMessages);

      ready.current = true;
      setLoading(false);
    }

    loadAll();

    // Reload whenever the admin signs in/out so RLS-scoped data (e.g. drafts,
    // admissions, messages) is refreshed for the new permission level.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        ready.current = false;
        loadAll();
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // --- Sync effects: persist changes to Supabase after initial hydration ---

  useEffect(() => {
    if (!ready.current) return;
    syncCollection('courses', courses, prev.current.courses, (c, i) => ({
      id: c.id,
      published: c.published,
      sort_order: c.order ?? i,
      data: c,
    }));
    prev.current.courses = courses;
  }, [courses]);

  useEffect(() => {
    if (!ready.current) return;
    syncCollection('facilities', facilities, prev.current.facilities, (f, i) => ({
      id: f.id,
      published: f.published,
      sort_order: f.order ?? i,
      data: f,
    }));
    prev.current.facilities = facilities;
  }, [facilities]);

  useEffect(() => {
    if (!ready.current) return;
    syncCollection('trainers', trainers, prev.current.trainers, (t, i) => ({
      id: t.id,
      published: t.published,
      sort_order: i,
      data: t,
    }));
    prev.current.trainers = trainers;
  }, [trainers]);

  useEffect(() => {
    if (!ready.current) return;
    syncCollection('students', students, prev.current.students, (s, i) => ({
      id: s.id,
      published: s.published,
      sort_order: i,
      data: s,
    }));
    prev.current.students = students;
  }, [students]);

  useEffect(() => {
    if (!ready.current) return;
    syncCollection('blogs', blogs, prev.current.blogs, (b, i) => ({
      id: b.id,
      published: b.published,
      sort_order: i,
      data: b,
    }));
    prev.current.blogs = blogs;
  }, [blogs]);

  useEffect(() => {
    if (!ready.current) return;
    syncCollection('gallery', gallery, prev.current.gallery, (g, i) => ({
      id: g.id,
      published: g.published,
      sort_order: g.order ?? i,
      data: g,
    }));
    prev.current.gallery = gallery;
  }, [gallery]);

  useEffect(() => {
    if (!ready.current) return;
    if (JSON.stringify(prev.current.homeContent) !== JSON.stringify(homeContentState)) {
      syncSingleton('home_content', 'main', homeContentState);
      prev.current.homeContent = homeContentState;
    }
  }, [homeContentState]);

  useEffect(() => {
    if (!ready.current) return;
    if (JSON.stringify(prev.current.siteSettings) !== JSON.stringify(siteSettingsState)) {
      syncSingleton('site_settings', 'main', siteSettingsState);
      prev.current.siteSettings = siteSettingsState;
    }
  }, [siteSettingsState]);

  useEffect(() => {
    if (!ready.current) return;
    syncCollection('admissions', admissions, prev.current.admissions, (a) => ({
      id: a.id,
      data: a,
    }));
    prev.current.admissions = admissions;
  }, [admissions]);

  useEffect(() => {
    if (!ready.current) return;
    syncCollection('messages', messagesState, prev.current.messages, (m) => ({
      id: m.id,
      data: m,
    }));
    prev.current.messages = messagesState;
  }, [messagesState]);

  return (
    <DataContext.Provider
      value={{
        courses,
        setCourses,
        facilities,
        setFacilities,
        trainers,
        setTrainers,
        students,
        setStudents,
        blogs,
        setBlogs,
        gallery,
        setGallery,
        homeContent: homeContentState,
        setHomeContent,
        siteSettings: siteSettingsState,
        setSiteSettings,
        admissions,
        setAdmissions,
        messages: messagesState,
        setMessages,
        loading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
