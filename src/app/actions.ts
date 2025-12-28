"use server";
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

export type Member = {
  id: number;
  name: string;
  participate: boolean;
};

export async function getMember(): Promise<Member[]> {
  const data = await sql`
    SELECT * FROM public.member
    ORDER BY id ASC
  `;
  return data as Member[];
}

// メンバーの追加
export async function addMember(formData: FormData) {
  const name = formData.get("name") as string;
  const participate = formData.get("participate") === "on";

  const result = await sql`
    INSERT INTO member (name, participate)
    VALUES (${name}, ${participate})
    RETURNING *;
  `;

  return result[0];
}

// メンバーの編集
export async function updateMember(
  id: number,
  name: string,
  participate: boolean
) {
  const result = await sql`
    UPDATE member
    SET name = ${name}, participate = ${participate}
    WHERE id = ${id}
    RETURNING *;
  `;

  return result[0];
}

// メンバーの削除
export async function deleteMember(id: number) {
  const result = await sql`
    DELETE FROM member
    WHERE id = ${id}
    RETURNING name;
  `;
  return result[0]?.name;
}
