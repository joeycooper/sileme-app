export type GroupForm = {
  name: string;
  code: string;
  privacy: "public" | "private";
  requiresApproval: boolean;
};
