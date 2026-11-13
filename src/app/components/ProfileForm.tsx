"use client";

import { updateUser, User } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlackChannelResponse } from "@/src/lib/slack";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  user: User;
  channels: Pick<SlackChannelResponse, "id" | "name_normalized">[];
};

export const ProfileForm = ({ user, channels }: Props) => {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    try {
      const displayName = String(formData.get("displayName"));
      const participate = formData.get("participate") === "on";
      const employeeNumber = Number(formData.get("employeeNumber"));
      const uChannelId = String(formData.get("slackUChannelId"));
      await updateUser(
        user.id,
        displayName,
        employeeNumber,
        participate,
        uChannelId,
      );
      toast.success("更新しました");
      router.refresh();
    } catch (error) {
      toast.error("更新に失敗しました");
      console.error("Error updating member:", error);
    }
  };

  return (
    <form action={handleSubmit} className="grid gap-5 max-w-md">
      <div className="grid gap-4">
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
        <div className="grid gap-2">
          <Label htmlFor="slackUChannelId">uチャンネル</Label>
          <Select
            required
            name="slackUChannelId"
            defaultValue={user.slack_u_channel_id}
          >
            <SelectTrigger id="slackUChannelId">
              <SelectValue placeholder="uチャンネルを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {channels.map((channel) => (
                  <SelectItem value={channel.id} key={channel.id}>
                    {channel.name_normalized}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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
      <div>
        <Button type="submit">保存</Button>
      </div>
    </form>
  );
};
