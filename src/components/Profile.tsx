import './Profile.css';

export interface ProfileProps {
  initials: string;
  name: string;
  role: string;
}

export function Profile({ initials, name, role }: ProfileProps) {
  return (
    <div className="profile">
      <span className="profile__avatar t-button" aria-hidden="true">
        {initials}
      </span>
      <span className="profile__text">
        <span className="profile__name t-button">{name}</span>
        <span className="profile__role t-label">{role}</span>
      </span>
    </div>
  );
}
