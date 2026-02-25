export const READ_CHAPTERS_KEY = 'readChapters';
export const RECENT_WORK_IDS_KEY = 'recentWorkIds';
export const READING_PROGRESS_KEY = 'readingProgress';

type ReadChaptersByWork = Record<string, string[]>;
type ReadingProgressByWork = Record<string, string>;

const readJson = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown): void => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const getReadChapters = (): ReadChaptersByWork => readJson<ReadChaptersByWork>(READ_CHAPTERS_KEY, {});

export const markChapterAsRead = (workId: string, chapterId: string): void => {
  const readChapters = getReadChapters();
  const existing = readChapters[workId] || [];
  if (!existing.includes(chapterId)) {
    readChapters[workId] = [...existing, chapterId];
    writeJson(READ_CHAPTERS_KEY, readChapters);
  }
};

export const getReadingProgress = (): ReadingProgressByWork =>
  readJson<ReadingProgressByWork>(READING_PROGRESS_KEY, {});

export const setLastReadChapter = (workId: string, chapterId: string): void => {
  const progress = getReadingProgress();
  progress[workId] = chapterId;
  writeJson(READING_PROGRESS_KEY, progress);
};

export const getRecentWorkIds = (): string[] => readJson<string[]>(RECENT_WORK_IDS_KEY, []);

export const markWorkAsRecent = (workId: string, maxItems = 10): void => {
  const recentWorkIds = getRecentWorkIds();
  const next = [workId, ...recentWorkIds.filter((id) => id !== workId)].slice(0, maxItems);
  writeJson(RECENT_WORK_IDS_KEY, next);
};
