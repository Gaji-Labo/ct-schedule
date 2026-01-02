"use client";

import { setUser, User } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export const SetupDataDialog = ({ user }: { user: User }) => {
  const [number, setNumber] = useState("");
  const [name, setName] = useState(user.slack_display_name);
  const [open, setOpen] = useState(true);

  const handleSubmit = async (formData: FormData) => {
    try {
      await setUser(user.slack_user_id, formData);
      setOpen(false);
      toast.success("設定が完了しました");
    } catch (error) {
      toast.error("設定に失敗しました");
      console.error("Error updating member:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) setNumber("");
        setOpen(open);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleSubmit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>設定</DialogTitle>
            <DialogDescription>
              CT表の表示に必要な情報を設定してください
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="displayName">名前</Label>
              <Input
                name="displayName"
                type="text"
                id="displayName"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="employeeNumber">社員番号</Label>
              <Input
                name="employeeNumber"
                type="number"
                id="employeeNumber"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox name="participate" id="participate" defaultChecked />
              <Label htmlFor="participate">CTに参加する</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!number}>
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
