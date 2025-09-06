"use client";

import { deleteMember, Member } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export const DeleteMemberDialog = ({ member }: { member: Member }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    try {
      const deleteName = await deleteMember(Number(member.id));
      setOpen(false);
      toast.success(`${deleteName} を削除しました`);
      router.refresh();
    } catch (error) {
      toast.error("メンバーの削除に失敗しました");
      console.error("Error adding member:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleSubmit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>メンバーを削除</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">{member.name} を削除しますか？</div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">キャンセル</Button>
            </DialogClose>
            <Button type="submit" variant="destructive">
              削除
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
