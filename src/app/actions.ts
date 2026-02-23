"use server";
import { Holiday } from "@/src/utils/holiday";
import { neon } from "@neondatabase/serverless";

function getDataBaseUrl() {
  if (process.env.NODE_ENV === "development") {
    return `${process.env.DATABASE_URL_DEV}`;
  }
  if (process.env.VERCEL_ENV === "preview") {
    return `${process.env.DATABASE_URL}`;
  }
  return `${process.env.DATABASE_URL}`;
}

const sql = neon(getDataBaseUrl());

export type User = {
  id: number;
  slack_user_id: string;
  slack_email?: string;
  slack_display_name?: string;
  slack_image?: string;
  employee_number?: number;
  participate: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
};

export async function upsertUserFromSlack(slackUser: {
  slack_user_id: string;
  slack_email?: string;
  slack_display_name?: string;
  slack_image?: string;
}): Promise<User> {
  const result = await sql`
    INSERT INTO users (
      slack_user_id, 
      slack_email, 
      slack_display_name, 
      slack_image
    )
    VALUES (
      ${slackUser.slack_user_id},
      ${slackUser.slack_email},
      ${slackUser.slack_display_name},
      ${slackUser.slack_image}
    )
    ON CONFLICT (slack_user_id) 
    DO UPDATE SET
      slack_email = EXCLUDED.slack_email,
      slack_display_name = EXCLUDED.slack_display_name,
      slack_image = EXCLUDED.slack_image,
      updated_at = NOW()
    RETURNING *;
  `;

  return result[0] as User;
}

export async function getUserBySlackId(
  slackUserId: string,
): Promise<User | null> {
  const result = await sql`
    SELECT * FROM public.users
    WHERE slack_user_id = ${slackUserId}
  `;

  if (!result[0]) {
    return null;
  }

  return result[0] as User;
}

export async function setUser(
  slackUserId: string,
  formData: FormData,
): Promise<User> {
  const displayName = formData.get("displayName");
  const employeeNumber = formData.get("employeeNumber");
  const participate = formData.get("participate") === "on";

  const result = await sql`
    UPDATE users
    SET slack_display_name = ${displayName}, employee_number = ${employeeNumber}, participate = ${participate}, updated_at = NOW()
    WHERE slack_user_id = ${slackUserId}
    RETURNING *;
  `;

  if (!result[0]) {
    throw new Error(`User not found: ${slackUserId}`);
  }

  return result[0] as User;
}

export async function getUsers(): Promise<User[]> {
  const data = await sql`
    SELECT * FROM public.users
    WHERE deleted_at IS NULL
    ORDER BY employee_number ASC
  `;
  return data as User[];
}

export async function updateUser(
  id: number,
  displayName: string,
  employeeNumber: number,
  participate: boolean,
) {
  const result = await sql`
    UPDATE users
    SET slack_display_name = ${displayName}, employee_number = ${employeeNumber}, participate = ${participate}
    WHERE id = ${id}
    RETURNING *;
  `;

  return result[0];
}

export async function deleteUser(id: number) {
  const result = await sql`
    UPDATE users
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = ${id}
    RETURNING slack_display_name;
  `;
  return result[0]?.slack_display_name;
}

export async function getHolidays(): Promise<Holiday[]> {
  const result = await sql`
    SELECT * FROM public.holidays
  `;
  return result as Holiday[];
}

export async function saveHolidaysToDB(holidays: Holiday[]): Promise<void> {
  for (const holiday of holidays) {
    await sql`
      INSERT INTO holidays(date, name)
      VALUES(${holiday.date}, ${holiday.name})
      ON CONFLICT(date)
      DO UPDATE SET
        name = EXCLUDED.name,
        updated_at = NOW()
    `;
  }
}
