export interface Developer {
  id: number;
  name: string;
  /** Role or title (e.g. "Backend Developer", "Frontend Developer") */
  role: string;
  /** Profile image URL or path (e.g. /images/team/name.jpg) */
  image?: string;
  /** GitHub profile URL */
  githubUrl?: string;
  /** LinkedIn profile URL */
  linkedinUrl?: string;
}

export interface TeamLead {
  id: number;
  name: string;
  role: string;
  bio: string;
  image?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export type TeamKey = "backend" | "frontend" | "flutter";

export interface AboutTeam {
  key: TeamKey;
  title: string;
  developers: Developer[];
}
