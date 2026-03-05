"use client";

import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";
import Image from "next/image";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  university: string;
  photo: string;
  linkedin: string;
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Azel Pandya Maheswara",
    role: "Technical Lead / IoT Web",
    university: "Telkom University",
    photo: "/Azel.svg",
    linkedin: "https://www.linkedin.com/in/azlnach-si26/",
  },
  {
    id: 2,
    name: "Matthew Alexander Sitorus",
    role: "Team Lead",
    university: "Telkom University",
    photo: "/Matt.svg",
    linkedin: "https://www.linkedin.com/in/matthewsitorus/",
  },
  {
    id: 3,
    name: "Lijona",
    role: "IoT Engineer",
    university: "Telkom University",
    photo: "/Lijona.svg",
    linkedin: "https://www.linkedin.com/in/lijonabretigan13/",
  },
  {
    id: 4,
    name: "Muhammad Handra Haq",
    role: "Design",
    university: "Telkom University",
    photo: "/Handra.svg",
    linkedin: "https://www.linkedin.com/in/mhandrahaq/",
  },
  {
    id: 5,
    name: "Karman Singh",
    role: "Support / Monitoring",
    university: "Thapar Institute of Engineering and Technology",
    photo: "/Karman.svg",
    linkedin: "https://www.linkedin.com/in/karman-singh-talwar-448405311/",
  },
  {
    id: 6,
    name: "Avni Sawant",
    role: "Support / Monitoring",
    university: "Tata Institute of Social Sciences",
    photo: "/Avni.svg",
    linkedin: "https://www.linkedin.com/in/avnisawant/",
  },
];

/* ── Card variants ── */
const cardVariants = {
  rest: {},
  hover: {},
};

const imageVariants = {
  rest: { filter: "grayscale(100%)" },
  hover: { filter: "grayscale(0%)" },
};

const overlayVariants = {
  rest: { height: "64px" },
  hover: { height: "120px" },
};

const revealVariants = {
  rest: { opacity: 0, y: 8 },
  hover: { opacity: 1, y: 0 },
};

/* ── Single Card ── */
function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <motion.div
      className="relative overflow-hidden cursor-pointer"
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      {/* Position Badge */}
      <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded text-[9px] font-semibold tracking-wide uppercase bg-[#89986D]/80 text-white backdrop-blur-sm">
        {member.role}
      </div>

      {/* Photo */}
      <motion.div
        className="relative w-full aspect-[4/5]"
        variants={imageVariants}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <Image
          src={member.photo}
          alt={member.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
        />
      </motion.div>

      {/* Overlay Info */}
      <motion.div
        className="absolute bottom-0 w-full px-4 pt-3 pb-4 bg-white/90 backdrop-blur-sm flex flex-col justify-start overflow-hidden"
        variants={overlayVariants}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        <div className="flex justify-between items-start">
          {/* Text */}
          <div className="flex flex-col min-w-0 pr-2">
            <span className="font-bold text-[12px] uppercase tracking-wide text-gray-800 truncate">
              {member.name}
            </span>
            <motion.span
              className="text-[11px] text-[#89986D] mt-0.5 leading-tight"
              variants={revealVariants}
              transition={{ duration: 0.25, delay: 0.05 }}
            >
              {member.university}
            </motion.span>
          </div>

          {/* LinkedIn Icon */}
          <motion.a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 text-[#89986D] hover:text-white hover:bg-[#89986D] rounded-full p-1.5 transition-colors duration-200 mt-0.5"
            variants={revealVariants}
            transition={{ duration: 0.25, delay: 0.08 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Linkedin className="w-4 h-4" />
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Section ── */
export default function TeamSection() {
  return (
    <section id="team" className="w-full bg-white">

      {/* Header */}
      <div className="px-6 md:px-12 pt-11 pb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          {/* Left: label + title */}
          <div>
            <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-[#9CAB84] mb-3">
              Our Team
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Get In Touch
            </h2>
          </div>

          {/* Right: desc */}
          <div className="md:max-w-xs md:text-right">
            <div className="hidden md:block w-8 h-px bg-[#C5D89D] mb-4 md:ml-auto" />
            <p className="text-sm text-gray-400 leading-relaxed">
              The team behind the Smart Agriculture IoT project —{" "}
              a collaboration of students across universities
            </p>
          </div>
        </div>
      </div>

      {/* Grid — full width, no padding, no gap */}
      <div className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y divide-[#F0F4EC] border-t border-[#F0F4EC]">
          {teamMembers.map((m) => (
            <div key={m.id} className="bg-white">
              <TeamMemberCard member={m} />
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
