import { cookies } from "next/headers";

export const VISITOR_COOKIE = "ion_visitor_id";
export const THREAD_COOKIE = "ion_thread_id";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

export async function getOrCreateAgentCookies() {
  const cookieStore = await cookies();
  const visitorId = cookieStore.get(VISITOR_COOKIE)?.value ?? crypto.randomUUID();
  const threadId = cookieStore.get(THREAD_COOKIE)?.value ?? crypto.randomUUID();

  cookieStore.set(VISITOR_COOKIE, visitorId, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR_SECONDS,
    path: "/",
  });

  cookieStore.set(THREAD_COOKIE, threadId, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: THIRTY_DAYS_SECONDS,
    path: "/",
  });

  return { visitorId, threadId };
}

export async function getAgentCookieValues() {
  const cookieStore = await cookies();
  return {
    visitorId: cookieStore.get(VISITOR_COOKIE)?.value,
    threadId: cookieStore.get(THREAD_COOKIE)?.value,
  };
}

export async function startNewAgentThread() {
  const cookieStore = await cookies();
  const visitorId = cookieStore.get(VISITOR_COOKIE)?.value ?? crypto.randomUUID();
  const threadId = crypto.randomUUID();

  cookieStore.set(VISITOR_COOKIE, visitorId, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR_SECONDS,
    path: "/",
  });

  cookieStore.set(THREAD_COOKIE, threadId, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: THIRTY_DAYS_SECONDS,
    path: "/",
  });

  return { visitorId, threadId };
}
