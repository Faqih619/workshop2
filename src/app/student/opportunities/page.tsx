
const opportunities = [
  {
    id: 1,
    title: "Software Engineering Intern",
    company: "Nexora Technologies",
    location: "Kuala Lumpur",
    arrangement: "Hybrid",
    type: "Internship",
    match: 92,
    skills: ["React", "TypeScript", "SQL"],
    description:
      "Work with the engineering team to develop and maintain modern web applications.",
    deadline: "30 December 2026",
    posted: "2 days ago",
  },
  {
    id: 2,
    title: "Frontend Developer Intern",
    company: "BrightLabs",
    location: "Remote",
    arrangement: "Remote",
    type: "Internship",
    match: 85,
    skills: ["React", "CSS", "JavaScript"],
    description:
      "Help build responsive and accessible interfaces for real-world products.",
    deadline: "15 January 2027",
    posted: "3 days ago",
  },
  {
    id: 3,
    title: "Graduate Software Engineer",
    company: "TechNova Solutions",
    location: "Cyberjaya",
    arrangement: "On-site",
    type: "Graduate Role",
    match: 76,
    skills: ["Python", "SQL", "Git"],
    description:
      "Join our graduate programme and develop your software engineering skills.",
    deadline: "20 January 2027",
    posted: "Yesterday",
  },
  {
    id: 4,
    title: "Junior Web Developer",
    company: "DigitalWorks",
    location: "Johor Bahru",
    arrangement: "Hybrid",
    type: "Graduate Role",
    match: 68,
    skills: ["TypeScript", "React", "Node.js"],
    description:
      "Collaborate with developers to build and improve web-based solutions.",
    deadline: "25 January 2027",
    posted: "5 days ago",
  },
];

export default function StudentOpportunities() {
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Opportunity Hub
        </h1>

        <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">
          Saved Opportunities
        </button>
      </div>

      {/* Search Section */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search opportunities..."
          className="min-w-0 flex-1 rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
        />

        <select className="rounded-lg border px-4 py-3 text-sm">
          <option value="">All Locations</option>
          <option>Kuala Lumpur</option>
          <option>Selangor</option>
          <option>Johor</option>
          <option>Melaka</option>
          <option>Remote</option>
        </select>

        <button className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700">
          Search
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-6 lg:flex-row">

        {/* Filter Sidebar */}
        <aside className="w-full shrink-0 space-y-6 rounded-xl border bg-white p-5 lg:w-64">

          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Filters</h2>
            <button className="text-sm text-blue-600">
              Clear all
            </button>
          </div>

          {/* Opportunity Type */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">
              Opportunity Type
            </h3>
            {["Internships", "Graduate Roles"].map((item) => (
              <label key={item} className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" />
                {item}
              </label>
            ))}
          </div>

          <hr />

          {/* Work Arrangement */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">
              Work Arrangement
            </h3>
            {["Hybrid", "Remote", "On-site"].map((item) => (
              <label key={item} className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" />
                {item}
              </label>
            ))}
          </div>

          <hr />

          {/* Match Score */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">
              Match Score
            </h3>
            {["Any Match", "70% and above", "90% and above"].map((item, index) => (
              <label key={item} className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="radio"
                  name="matchScore"
                  defaultChecked={index === 0}
                />
                {item}
              </label>
            ))}
          </div>

          <hr />

          {/* Skills */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">
              Skills
            </h3>
            {["React", "TypeScript", "Python"].map((item) => (
              <label key={item} className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" />
                {item}
              </label>
            ))}
          </div>

          <hr />

          {/* Posted Within */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">
              Posted Within
            </h3>
            <select className="w-full rounded-lg border px-3 py-2 text-sm">
              <option>30 days</option>
              <option>7 days</option>
              <option>Yesterday</option>
            </select>
          </div>
        </aside>

        {/* Opportunity Results */}
        <section className="min-w-0 flex-1 space-y-5">

          {/* Results Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">
              {opportunities.length} opportunities available
            </p>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Sort by:
              </span>
              <select className="rounded-lg border px-3 py-2 text-sm">
                <option>Best Match</option>
                <option>Recently Posted</option>
                <option>Closing Soon</option>
                <option>Salary: Highest</option>
              </select>
            </div>
          </div>

          {/* Opportunity Grid */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {opportunities.map((opportunity) => (
              <article
                key={opportunity.id}
                className="flex flex-col rounded-xl border bg-white p-5 transition-shadow hover:shadow-md"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">

                  {/* Company Logo */}
                  <div className="flex h-11 w-11 shrink-0 items-center
                    justify-center rounded-lg bg-blue-50 text-lg
                    font-semibold text-blue-600">
                    {opportunity.company.charAt(0)}
                  </div>

                  {/* Opportunity Information */}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900">
                      {opportunity.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {opportunity.company}
                    </p>
                  </div>

                </div>

  <span className="shrink-0 rounded-full bg-blue-50
    px-3 py-1 text-xs font-semibold text-blue-700">
    {opportunity.match}% Match
  </span>
</div>

                {/* Opportunity Details */}
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span>{opportunity.location}</span>
                  <span>·</span>
                  <span>{opportunity.arrangement}</span>
                  <span>·</span>
                  <span>{opportunity.type}</span>
                </div>

                <p className="mt-4 line-clamp-2 text-sm font-medium leading-6 text-gray-800">
                  {opportunity.description}
                </p>

                {/* Skills */}
                <div className="mt-4 mb-3 flex flex-wrap gap-2">
                  {opportunity.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Card Footer */}
                <div className="mt-auto flex items-center justify-between border-t pt-4">
                  <div className="text-xs text-gray-500">
                    <p>Posted {opportunity.posted}</p>
                    <p className="mt-1">
                      Deadline: {opportunity.deadline}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      aria-label="Save opportunity"
                      className="rounded-lg border p-2 hover:bg-gray-50"
                    >
                      ☆
                    </button>

                    <button className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700">
                      View Details
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination Placeholder */}
          <div className="flex items-center justify-end gap-2 pt-4">
            <button className="rounded-lg border px-3 py-2 text-sm">
              Previous
            </button>
            <button className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white">
              1
            </button>
            <button className="rounded-lg border px-3 py-2 text-sm">
              2
            </button>
            <button className="rounded-lg border px-3 py-2 text-sm">
              Next
            </button>
          </div>

        </section>
      </div>
    </div>
  );
}
