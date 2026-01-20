export type ProfileForm = {
  avatarUrl: string;
  nickname: string;
  wechat: string;
  email: string;
  alarmHours: string;
  estateNote: string;
};

export type Contact = {
  id: string;
  name: string;
  relation: string;
  phone: string;
  wechat?: string;
  email?: string;
  note?: string;
  avatar?: string;
};

export function emptyContact(): Contact {
  return {
    id: String(Date.now()),
    name: "",
    relation: "",
    phone: "",
    wechat: "",
    email: "",
    note: "",
    avatar: ""
  };
}
