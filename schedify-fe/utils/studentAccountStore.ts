import AsyncStorage from '@react-native-async-storage/async-storage';

export type StudentRole = 'Student' | 'Professor';

export interface StudentAccountProfile {
  name: string;
  email: string;
  idNo: string;
  department: string;
  course: string;
  block: string;
  role: StudentRole;
}

const STORAGE_KEY = 'schedify:student:account:v1';
const ACCOUNTS_KEY = 'schedify:student:accounts:v1';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isStudentRole(value: unknown): value is StudentRole {
  return value === 'Student' || value === 'Professor';
}

function isValidProfile(value: unknown): value is StudentAccountProfile {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.idNo === 'string' &&
    typeof candidate.department === 'string' &&
    typeof candidate.course === 'string' &&
    typeof candidate.block === 'string' &&
    isStudentRole(candidate.role)
  );
}

export async function saveCurrentStudentAccount(profile: StudentAccountProfile): Promise<void> {
  const accounts = await getRegisteredStudentAccounts();
  const normalizedEmail = normalizeEmail(profile.email);

  const nextAccounts = accounts.filter(
    (account) => normalizeEmail(account.email) !== normalizedEmail
  );
  nextAccounts.unshift(profile);

  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextAccounts));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export async function getRegisteredStudentAccounts(): Promise<StudentAccountProfile[]> {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item) => isValidProfile(item));
  } catch {
    return [];
  }
}

export async function getCurrentStudentAccount(): Promise<StudentAccountProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!isValidProfile(parsed)) return null;

    return parsed;
  } catch {
    return null;
  }
}

export async function clearCurrentStudentAccount(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function setCurrentStudentAccountByEmail(email: string): Promise<boolean> {
  const normalizedEmail = normalizeEmail(email);
  const accounts = await getRegisteredStudentAccounts();
  const matched = accounts.find(
    (account) => normalizeEmail(account.email) === normalizedEmail
  );

  if (matched) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(matched));
    return true;
  }

  const current = await getCurrentStudentAccount();
  if (current && normalizeEmail(current.email) === normalizedEmail) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return true;
  }

  await AsyncStorage.removeItem(STORAGE_KEY);
  return false;
}
