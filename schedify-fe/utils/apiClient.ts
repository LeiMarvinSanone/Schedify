import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://schedify-be.onrender.com';
const TOKEN_KEY = 'schedify:auth:token:v1';
const USER_KEY = 'schedify:auth:user:v1';
const LOGIN_TIME_KEY = 'schedify:auth:loginTime:v1';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

function extractAuthData(response: ApiResponse<AuthResponse> | AuthResponse): AuthResponse {
  const envelope = response as ApiResponse<AuthResponse>;
  if (envelope && typeof envelope === 'object' && envelope.data) {
    return envelope.data;
  }
  return response as AuthResponse;
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const loginTimeRaw = await AsyncStorage.getItem(LOGIN_TIME_KEY);
    if (!token || !loginTimeRaw) return null;
    const loginTime = Number(loginTimeRaw);
    const now = Date.now();
    const fifteenDays = 15 * 24 * 60 * 60 * 1000;
    if (now - loginTime > fifteenDays) {
      await clearAuthToken();
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(LOGIN_TIME_KEY, String(Date.now()));
}

export async function clearAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
  await AsyncStorage.removeItem(LOGIN_TIME_KEY);
}

async function setStoredUser(user: AuthResponse['user']): Promise<void> {
  if (!user) {
    await AsyncStorage.removeItem(USER_KEY);
    return;
  }
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

async function getStoredUser(): Promise<AuthResponse['user']> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as AuthResponse['user'];
  } catch {
    await AsyncStorage.removeItem(USER_KEY);
    return undefined;
  }
}

async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown
): Promise<T> {
  try {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`🔵 API REQUEST: ${method} ${url}`);
    if (body) console.log('📤 Payload:', body);

    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log(`📨 API RESPONSE: ${response.status} ${response.statusText}`);

    if (response.status === 401) {
      await clearAuthToken();
      throw new Error('Unauthorized. Please login again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ API Error:', errorData);
      throw new Error(
        errorData.message || errorData.error || `API Error: ${response.status}`
      );
    }

    const data = await response.json();
    console.log('✅ Success:', data);
    return data;
  } catch (error) {
    console.error('🔴 API Call Failed:', error);
    throw error;
  }
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  idNo: string;
  department: string;
  course: string;
  yearLevel: string;
  block: string;
  role: string;
}

export interface AuthResponse {
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    idNo: string;
    department: string;
    course: string;
    yearLevel: string;
    block: string;
    role: string;
  };
}

export async function signup(signupData: SignupInput): Promise<AuthResponse> {
  const response = await apiCall<ApiResponse<AuthResponse> | AuthResponse>(
    '/api/auth/register',
    'POST',
    signupData
  );

  const authData = extractAuthData(response);
  const userToStore = authData.user
    ? { 
        ...authData.user, 
        idNo: authData.user.idNo || signupData.idNo,
        yearLevel: authData.user.yearLevel || signupData.yearLevel 
      }
    : undefined;

  if (authData.token) {
    await setAuthToken(authData.token);
  }
  await setStoredUser(userToStore);

  return { ...authData, user: userToStore };
}

export async function login(
  email: string,
  password: string,
  role?: string
): Promise<AuthResponse> {
  const payload: any = { email, password };
  if (role) payload.role = role;
  const response = await apiCall<ApiResponse<AuthResponse> | AuthResponse>(
    '/api/auth/login',
    'POST',
    payload
  );

  const authData = extractAuthData(response);
  const previousUser = await getStoredUser();
  const userToStore = authData.user
    ? { ...previousUser, ...authData.user }
    : previousUser;

  if (authData.token) {
    await setAuthToken(authData.token);
  }
  await setStoredUser(userToStore);

  return { ...authData, user: userToStore };
}

export async function getCurrentUser(): Promise<AuthResponse['user']> {
  return await getStoredUser();
}

export async function fetchCurrentUser(): Promise<AuthResponse['user']> {
  const user = await apiCall<AuthResponse['user']>('/api/auth/me', 'GET');
  await setStoredUser(user);
  return user;
}

export async function logout(): Promise<void> {
  await clearAuthToken();
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  return await apiCall<{ message: string }>(
    '/api/auth/change-password',
    'PUT',
    { currentPassword, newPassword }
  );
}

// Schedule API Functions
export interface ScheduleSubject {
  name: string;
  day: string;
  timeRange: string;
  room?: string;
  building?: string;
}

export interface Schedule {
  _id: string;
  type: 'Class Schedules' | 'Events' | 'Suspension';
  department?: string;
  course?: string;
  yearLevel?: string;
  block?: string;
  semester?: string;
  tag?: string;
  subjects?: ScheduleSubject[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleInput {
  type: string;
  department?: string;
  course?: string;
  yearLevel?: string;
  block?: string;
  semester?: string;
  tag?: string;
  subjects?: ScheduleSubject[];
}

export async function getSchedules(search?: string): Promise<Schedule[]> {
  const query = search?.trim();
  const endpoint = query
    ? `/api/schedules?search=${encodeURIComponent(query)}`
    : '/api/schedules';

  return await apiCall<Schedule[]>(endpoint, 'GET');
}

export async function getScheduleById(id: string): Promise<Schedule> {
  return await apiCall<Schedule>(`/api/schedules/${id}`, 'GET');
}

export async function createSchedule(data: CreateScheduleInput): Promise<{ message: string; schedule: Schedule }> {
  return await apiCall<{ message: string; schedule: Schedule }>('/api/schedules', 'POST', data);
}

export async function updateSchedule(id: string, data: Partial<CreateScheduleInput>): Promise<{ message: string; schedule: Schedule }> {
  return await apiCall<{ message: string; schedule: Schedule }>(`/api/schedules/${id}`, 'PUT', data);
}

export async function deleteSchedule(id: string): Promise<{ message: string }> {
  return await apiCall<{ message: string }>(`/api/schedules/${id}`, 'DELETE');  
}

export async function importSchedulesBulk(schedules: any[]): Promise<any> {
  return await apiCall('/api/schedules/import', 'POST', { schedules });
}

export async function isSessionValid(): Promise<boolean> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const loginTimeRaw = await AsyncStorage.getItem(LOGIN_TIME_KEY);
  if (!token || !loginTimeRaw) return false;
  const loginTime = Number(loginTimeRaw);
  const now = Date.now();
  const fifteenDays = 15 * 24 * 60 * 60 * 1000;
  if (now - loginTime > fifteenDays) {
    await clearAuthToken();
    return false;
  }
  return true;
}
