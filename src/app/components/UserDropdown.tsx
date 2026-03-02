"use client";

import { signOut } from "next-auth/react";
import { updateUser, User } from "@/app/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  user: User;
  image?: string;
};

export const UserDropdown = ({ user, image }: Props) => {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      const id = Number(formData.get("id"));
      const displayName = String(formData.get("displayName"));
      const participate = formData.get("participate") === "on";
      const employeeNumber = Number(formData.get("employeeNumber"));
      await updateUser(id, displayName, employeeNumber, participate);
      setDialogOpen(false);
      toast.success("更新しました");
      router.refresh();
    } catch (error) {
      toast.error("更新に失敗しました");
      console.error("Error updating member:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage
              src={user.slack_image || image || ""}
              alt={`${user.slack_display_name}のアイコン画像`}
            />
            <AvatarFallback>
              {user.slack_display_name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user.slack_display_name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setDialogOpen(true);
            }}
          >
            編集
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              handleSignOut();
            }}
          >
            ログアウト
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form action={handleSubmit} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>プロフィール編集</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <Input type="hidden" name="id" value={user.id} />
              <div className="grid gap-2">
                <Label htmlFor="displayName">名前</Label>
                <Input
                  name="displayName"
                  type="text"
                  id="displayName"
                  defaultValue={user.slack_display_name}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="employeeNumber">社員番号</Label>
                <Input
                  name="employeeNumber"
                  type="number"
                  id="employeeNumber"
                  defaultValue={user.employee_number}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  name="participate"
                  id="participate"
                  defaultChecked={user.participate}
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
    </>
  );
}
