import { useState } from "react";
import { getInitials, getAvatarColor } from "../utils/avatarUtils";
import "./Avatar.css";

interface AvatarProps {
  name: string;
  photoUrl?: string;
  size?: number;
}

export function Avatar({ name, photoUrl, size = 36 }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name);
  const color = getAvatarColor(name);
  const showImage = photoUrl && !imgError;

  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        backgroundColor: showImage ? "transparent" : color,
      }}
      title={name}
    >
      {showImage ? (
        <img
          src={photoUrl}
          alt={name}
          className="avatar-img"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="avatar-initials">{initials}</span>
      )}
    </div>
  );
}
