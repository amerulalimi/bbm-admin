import "dotenv/config"
import { prisma } from "../lib/prisma"

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

async function main() {
  // Delete applications first (FK to Job), then jobs
  await prisma.jobApplication.deleteMany()
  await prisma.job.deleteMany()

  const now = new Date()
  
  // Create different creation dates spread over the past 4 months
  // 4 Permanent jobs, 4 Temporary jobs, 4 Internship jobs
  // Each with different creation dates
  
  const jobs = [
    // 4 Permanent jobs
    {
      title: "Senior Software Engineer",
      jobDescription: "We are seeking an experienced Senior Software Engineer to lead our development team. You will be responsible for architecting scalable solutions and mentoring junior developers.",
      jobType: "Permanent",
      location: "Kuala Lumpur",
      salary: 12000,
      jobStatus: "published",
      jobTime: "Full-time",
      active: true,
      createdAt: addDays(addMonths(now, -4), 0),
      postedDate: addDays(addMonths(now, -4), 0),
    },
    {
      title: "Full Stack Developer",
      jobDescription: "Join our dynamic team as a Full Stack Developer. You'll work on both frontend and backend systems, building modern web applications using React and Node.js.",
      jobType: "Permanent",
      location: "Petaling Jaya",
      salary: 8500,
      jobStatus: "published",
      jobTime: "Full-time",
      active: true,
      createdAt: addDays(addMonths(now, -3), 5),
      postedDate: addDays(addMonths(now, -3), 5),
    },
    {
      title: "DevOps Engineer",
      jobDescription: "We need a DevOps Engineer to manage our cloud infrastructure and CI/CD pipelines. Experience with AWS, Docker, and Kubernetes is required.",
      jobType: "Permanent",
      location: "Cyberjaya",
      salary: 10000,
      jobStatus: "published",
      jobTime: "Full-time",
      active: true,
      createdAt: addDays(addMonths(now, -2), 10),
      postedDate: addDays(addMonths(now, -2), 10),
    },
    {
      title: "Mobile App Developer",
      jobDescription: "Looking for a Mobile App Developer to create iOS and Android applications. You should have experience with React Native or Flutter.",
      jobType: "Permanent",
      location: "Kuala Lumpur",
      salary: 9000,
      jobStatus: "published",
      jobTime: "Full-time",
      active: true,
      createdAt: addDays(addMonths(now, -1), 15),
      postedDate: addDays(addMonths(now, -1), 15),
    },
    
    // 4 Temporary jobs
    {
      title: "Frontend Developer (Contract)",
      jobDescription: "Temporary position for a Frontend Developer to work on a 6-month project. You'll be building responsive user interfaces using React and TypeScript.",
      jobType: "Temporary",
      location: "Kuala Lumpur",
      salary: 7000,
      jobStatus: "published",
      jobTime: "Full-time",
      active: true,
      createdAt: addDays(addMonths(now, -4), 8),
      postedDate: addDays(addMonths(now, -4), 8),
    },
    {
      title: "Backend Developer (Project-based)",
      jobDescription: "Temporary Backend Developer role for a 3-month project. You'll work on API development and database optimization using Node.js and PostgreSQL.",
      jobType: "Temporary",
      location: "Petaling Jaya",
      salary: 7500,
      jobStatus: "published",
      jobTime: "Full-time",
      active: true,
      createdAt: addDays(addMonths(now, -3), 12),
      postedDate: addDays(addMonths(now, -3), 12),
    },
    {
      title: "UI/UX Designer (Contract)",
      jobDescription: "Temporary UI/UX Designer position for a 4-month design project. You'll create user interfaces and design systems for our web applications.",
      jobType: "Temporary",
      location: "Kuala Lumpur",
      salary: 6500,
      jobStatus: "published",
      jobTime: "Full-time",
      active: true,
      createdAt: addDays(addMonths(now, -2), 18),
      postedDate: addDays(addMonths(now, -2), 18),
    },
    {
      title: "QA Engineer (Temporary)",
      jobDescription: "Temporary QA Engineer role for a 5-month project. You'll be responsible for testing web applications and ensuring quality standards.",
      jobType: "Temporary",
      location: "Cyberjaya",
      salary: 6000,
      jobStatus: "published",
      jobTime: "Full-time",
      active: true,
      createdAt: addDays(addMonths(now, -1), 22),
      postedDate: addDays(addMonths(now, -1), 22),
    },
    
    // 4 Internship jobs
    {
      title: "Software Development Intern",
      jobDescription: "Internship opportunity for Computer Science students. You'll learn web development, work on real projects, and gain hands-on experience with modern technologies.",
      jobType: "Internship",
      location: "Kuala Lumpur",
      salary: 2000,
      jobStatus: "published",
      jobTime: "Full-time",
      active: true,
      createdAt: addDays(addMonths(now, -4), 3),
      postedDate: addDays(addMonths(now, -4), 3),
    },
    {
      title: "Frontend Development Intern",
      jobDescription: "Internship position for frontend development. Learn React, TypeScript, and modern web development practices while working alongside experienced developers.",
      jobType: "Internship",
      location: "Petaling Jaya",
      salary: 1800,
      jobStatus: "published",
      jobTime: "Part-time",
      active: true,
      createdAt: addDays(addMonths(now, -3), 7),
      postedDate: addDays(addMonths(now, -3), 7),
    },
    {
      title: "Backend Development Intern",
      jobDescription: "Backend development internship for students interested in server-side programming. You'll work with Node.js, databases, and API development.",
      jobType: "Internship",
      location: "Cyberjaya",
      salary: 2000,
      jobStatus: "published",
      jobTime: "Full-time",
      active: true,
      createdAt: addDays(addMonths(now, -2), 14),
      postedDate: addDays(addMonths(now, -2), 14),
    },
    {
      title: "DevOps Intern",
      jobDescription: "DevOps internship opportunity. Learn about cloud infrastructure, CI/CD pipelines, containerization, and deployment automation.",
      jobType: "Internship",
      location: "Kuala Lumpur",
      salary: 1900,
      jobStatus: "published",
      jobTime: "Part-time",
      active: true,
      createdAt: addDays(addMonths(now, -1), 20),
      postedDate: addDays(addMonths(now, -1), 20),
    },
  ]

  for (const job of jobs) {
    await prisma.job.create({
      data: job,
    })
  }

  console.log("Seeded 12 different jobs:")
  console.log("- 4 Permanent jobs")
  console.log("- 4 Temporary jobs")
  console.log("- 4 Internship jobs")
  console.log("All with different creation dates spread over the past 4 months.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
