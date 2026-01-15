"use client";

import { updateMember, User } from "@/app/actions";
import { DeleteMemberDialog } from "@/components/DeleteMemberDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PencilLine } from "lucide-react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const EditMemberForm = ({
  member,
  session,
}: {
  member: User;
  session: Session | null;
}) => {
  const router = useRouter();
  const [edit, setEdit] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      const id = Number(formData.get("id"));
      const name = String(formData.get("name"));
      const participate = formData.get("participate") === "on";
      await updateMember(id, name, participate);
      setEdit(false);
      toast.success("更新しました");
      router.refresh();
    } catch (error) {
      toast.error("メンバーの更新に失敗しました");
      console.error("Error updating member:", error);
    }
  };

  return edit ? (
    <form
      action={handleSubmit}
      key={member.id}
      className="flex justify-between"
    >
      <Input type="hidden" name="id" value={member.id} />
      <div className="flex gap-3 items-center">
        <Input
          name="name"
          id="name"
          defaultValue={member.slack_display_name}
          className="w-[300px]"
        />
        <div className="flex items-center gap-2">
          <Checkbox
            name="participate"
            id="participate"
            defaultChecked={member.participate}
          />
          <Label htmlFor="participate">CTに参加する</Label>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => setEdit(false)} variant="outline">
          キャンセル
        </Button>
        <Button type="submit">保存</Button>
      </div>
    </form>
  ) : (
    <div className="flex gap-3 items-center justify-between">
      <div key={member.id} className="flex gap-2 items-center">
        <span className="font-semibold">{member.slack_display_name}</span>
        <div className="flex gap-1 items-center text-sm">
          <div
            className={`${
              member.participate ? "bg-green-500" : "bg-gray-200"
            } h-2 w-2 rounded-full`}
          />
          {member.participate ? "参加" : "不参加"}
        </div>
      </div>
      {session && (
        <div className="flex gap-1">
          <Button variant="ghost" onClick={() => setEdit(!edit)} size="icon">
            <PencilLine />
          </Button>
          <DeleteMemberDialog member={member} />
        </div>
      )}
    </div>
  );
};
