import type { TeamLead, AboutTeam } from "@/types/developer";

/** Team Lead / Technical Mentor */
export const teamLead: TeamLead = {
  id: 1,
  name: "Eng. Abdelrahman Yehya",
  role: "Team Lead & Technical Mentor",
  bio: "Responsible for overseeing the code infrastructure and guiding team members to ensure the delivery of integrated solutions with the highest technical quality standards.",
  image: "/images/person.png",
  githubUrl: "https://github.com",
  linkedinUrl: "https://linkedin.com/in",
};

/** Backend team — 4 members */
const backendDevelopers = [
  { id: 1, name: "Backend Developer 1", role: "Backend Developer", image: "/images/person.png", githubUrl: "https://github.com", linkedinUrl: "https://linkedin.com/in" },
  { id: 2, name: "Backend Developer 2", role: "Backend Developer", image: "/images/person.png", githubUrl: "https://github.com", linkedinUrl: "https://linkedin.com/in" },
  { id: 3, name: "Backend Developer 3", role: "Backend Developer", image: "/images/person.png", githubUrl: "https://github.com", linkedinUrl: "https://linkedin.com/in" },
  { id: 4, name: "Backend Developer 4", role: "Backend Developer", image: "/images/person.png", githubUrl: "https://github.com", linkedinUrl: "https://linkedin.com/in" },
];

/** Frontend team — 4 members */
const frontendDevelopers = [
  { id: 1, name: "Frontend Developer 1", role: "Frontend Developer", image: "/images/person.png", githubUrl: "https://github.com", linkedinUrl: "https://linkedin.com/in" },
  { id: 2, name: "Frontend Developer 2", role: "Frontend Developer", image: "/images/person.png", githubUrl: "https://github.com", linkedinUrl: "https://linkedin.com/in" },
  { id: 3, name: "Frontend Developer 3", role: "Frontend Developer", image: "/images/person.png", githubUrl: "https://github.com", linkedinUrl: "https://linkedin.com/in" },
  { id: 4, name: "Frontend Developer 4", role: "Frontend Developer", image: "/images/person.png", githubUrl: "https://github.com", linkedinUrl: "https://linkedin.com/in" },
];

/** Flutter Mobile team — 4 members */
const flutterDevelopers = [
  { id: 1, name: "Flutter Developer 1", role: "Flutter Developer", image: "/images/person.png", githubUrl: "https://github.com", linkedinUrl: "https://linkedin.com/in" },
  { id: 2, name: "Flutter Developer 2", role: "Flutter Developer", image: "/images/person.png", githubUrl: "https://github.com", linkedinUrl: "https://linkedin.com/in" },
  { id: 3, name: "Flutter Developer 3", role: "Flutter Developer", image: "/images/person.png", githubUrl: "https://github.com", linkedinUrl: "https://linkedin.com/in" },
  { id: 4, name: "Flutter Developer 4", role: "Flutter Developer", image: "/images/person.png", githubUrl: "https://github.com", linkedinUrl: "https://linkedin.com/in" },
];

export const aboutTeams: AboutTeam[] = [
  { key: "backend", title: "Backend Team", developers: backendDevelopers },
  { key: "frontend", title: "Frontend Team", developers: frontendDevelopers },
  { key: "flutter", title: "Flutter Mobile Team", developers: flutterDevelopers },
];

/** Stats for the about page (e.g. squad size, open source) */
export const aboutStats = [
  { value: "12", label: "Core Squad" },

];
