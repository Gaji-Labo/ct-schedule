import { User } from "@/app/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  user: Pick<User, "slack_display_name" | "slack_image"> &
    Partial<Pick<User, "slack_user_id">>;
  size?: "sm" | "default" | "lg";
  fallbackSrc?: string;
};

export const UserAvatar = ({ user, size, fallbackSrc }: Props) => (
  <Avatar size={size}>
    <AvatarImage
      src={user.slack_image || fallbackSrc || ""}
      alt={`${user.slack_display_name}のアイコン`}
    />
    <AvatarFallback
      colorSeed={user.slack_user_id || user.slack_display_name || undefined}
    >
      {user.slack_display_name?.charAt(0) || "?"}
    </AvatarFallback>
  </Avatar>
);
