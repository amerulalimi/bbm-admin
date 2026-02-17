/**
 * Type definitions for Jobs API Response
 * 
 * GET /api/jobs
 * 
 * Returns an array of Job objects ordered by createdAt (descending)
 * 
 * Query Parameters:
 * - limit?: number (max 100) - Limit the number of results
 * 
 * Response Status Codes:
 * - 200: Success
 * - 500: Server error
 */

export interface JobResponse {
  /** Unique job identifier */
  id: number
  
  /** Job title */
  title: string
  
  /** Full job description */
  jobDescription: string
  
  /** Job type: "Permanent" | "Contract" | "Internship" | "Full-time" | "Part-time" */
  jobType: string
  
  /** Job location */
  location: string
  
  /** Salary amount (number) */
  salary: number
  
  /** ISO 8601 date string when job was posted */
  postedDate: string
  
  /** Job status: "published" | "draft" | "closed" */
  jobStatus: string
  
  /** Job time: "Full-time" | "Part-time" */
  jobTime: string
  
  /** Whether the job is active */
  active: boolean
  
  /** ISO 8601 date string when record was created */
  createdAt: string
  
  /** ISO 8601 date string when record was last updated */
  updatedAt: string
  
  /** Count of related records */
  _count: {
    /** Number of applications for this job */
    applications: number
  }
}

/**
 * API Response type
 */
export type JobsApiResponse = JobResponse[]

/**
 * Example response structure:
 * 
 * [
 *   {
 *     "id": 1,
 *     "title": "Software Developer",
 *     "jobDescription": "We are looking for a motivated software developer...",
 *     "jobType": "Permanent",
 *     "location": "Kuala Lumpur",
 *     "salary": 6000,
 *     "postedDate": "2024-10-17T10:00:00.000Z",
 *     "jobStatus": "published",
 *     "jobTime": "Full-time",
 *     "active": true,
 *     "createdAt": "2024-10-17T10:00:00.000Z",
 *     "updatedAt": "2024-10-17T10:00:00.000Z",
 *     "_count": {
 *       "applications": 5
 *     }
 *   }
 * ]
 */
