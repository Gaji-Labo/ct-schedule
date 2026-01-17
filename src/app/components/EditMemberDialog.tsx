"use client";

import { updateUser, User } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PencilLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const EditMemberDialog = ({ member }: { member: User }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      const id = Number(formData.get("id"));
      const displayName = String(formData.get("displayName"));
      const participate = formData.get("participate") === "on";
      const employeeNumber = Number(formData.get("employeeNumber"));
      await updateUser(id, displayName, employeeNumber, participate);
      setOpen(false);
      toast.success("更新しました");
      router.refresh();
    } catch (error) {
      toast.error("メンバーの更新に失敗しました");
      console.error("Error updating member:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <PencilLine />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleSubmit} key={member.id} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>編集</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Input type="hidden" name="id" value={member.id} />
            <div className="grid gap-2">
              <Label htmlFor="displayName">名前</Label>
              <Input
                name="displayName"
                type="text"
                id="displayName"
                defaultValue={member.slack_display_name}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="employeeNumber">社員番号</Label>
              <Input
                name="employeeNumber"
                type="number"
                id="employeeNumber"
                defaultValue={member.employee_number}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                name="participate"
                id="participate"
                defaultChecked={member.participate}
              />
              <Label htmlFor="participate">CTに参加する</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">キャンセル</Button>
            </DialogClose>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
