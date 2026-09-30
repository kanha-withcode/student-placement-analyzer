const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
import { useState } from "react"
import "./App.css"

function App() {
  const [started, setStarted] = useState(false)

  const [name, setName] = useState("")
  const [college, setCollege] = useState("")
  const [cgpa, setCgpa] = useState("")
  const [projects, setProjects] = useState("")
  const [skills, setSkills] = useState([])

  const [result, setResult] = useState(null)
  const [students, setStudents] = useState([])

  const [loading, setLoading] = useState(false)
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [savingId, setSavingId] = useState(null)

  const [editName, setEditName] = useState("")
  const [editCollege, setEditCollege] = useState("")
  const [editCgpa, setEditCgpa] = useState("")
  const [editProjects, setEditProjects] = useState("")
  const [editSkills, setEditSkills] = useState([])

  const [error, setError] = useState("")

  const availableSkills = [
    "HTML/CSS",
    "JavaScript",
    "React",
    "Python",
    "SQL",
    "Node.js",
    "Git/GitHub",
    "DSA",
  ]

  function handleSkillChange(skill) {
    if (skills.includes(skill)) {
      setSkills(skills.filter((item) => item !== skill))
    } else {
      setSkills([...skills, skill])
    }
  }

  function handleEditSkillChange(skill) {
    if (editSkills.includes(skill)) {
      setEditSkills(editSkills.filter((item) => item !== skill))
    } else {
      setEditSkills([...editSkills, skill])
    }
  }

  async function handleAnalyze() {
    if (!name || !college || !cgpa) {
      setError("Please enter your name, college and CGPA.")
      return
    }

    if (skills.length === 0) {
      setError("Please select at least one skill.")
      return
    }

    if (projects === "") {
      setError("Please enter the number of projects you have completed.")
      return
    }

    setError("")
    setLoading(true)

    try {
      const response = await fetch("https://student-placement-analyzer.onrender.com/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          college,
          cgpa: Number(cgpa),
          skills,
          projects: Number(projects),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze student")
      }

      const data = await response.json()

      setResult({
        score: data.score,
        status: data.status,
      })
    } catch (error) {
      console.error("Backend connection error:", error)

      setError(
        "Could not connect to the backend. Make sure the server is running."
      )
    } finally {
      setLoading(false)
    }
  }

  async function getStudents() {
    setStudentsLoading(true)
    setError("")

    try {
      const response = await fetch("https://student-placement-analyzer.onrender.com/api/students")

      if (!response.ok) {
        throw new Error("Failed to fetch students")
      }

      const data = await response.json()

      setStudents(data)
    } catch (error) {
      console.error("Error fetching students:", error)

      setError("Could not load students from the backend.")
    } finally {
      setStudentsLoading(false)
    }
  }

  async function deleteStudent(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    )

    if (!confirmDelete) {
      return
    }

    setDeletingId(id)
    setError("")

    try {
      const response = await fetch(
        `http://localhost:5000/api/students/${id}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        throw new Error("Failed to delete student")
      }

      setStudents(
        students.filter((student) => student._id !== id)
      )
    } catch (error) {
      console.error("Error deleting student:", error)

      setError("Could not delete the student.")
    } finally {
      setDeletingId(null)
    }
  }

  function startEditing(student) {
    setEditingId(student._id)

    setEditName(student.name)
    setEditCollege(student.college)
    setEditCgpa(student.cgpa)
    setEditProjects(student.projects ?? 0)
    setEditSkills(student.skills)

    setError("")
  }

  function cancelEditing() {
    setEditingId(null)
    setError("")
  }

  async function updateStudent(id) {
    if (!editName || !editCollege || !editCgpa) {
      setError("Please enter name, college and CGPA.")
      return
    }

    if (editSkills.length === 0) {
      setError("Please select at least one skill.")
      return
    }

    setSavingId(id)
    setError("")

    try {
      const response = await fetch(
        `http://localhost:5000/api/students/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editName,
            college: editCollege,
            cgpa: Number(editCgpa),
            projects: Number(editProjects),
            skills: editSkills,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to update student")
      }

      const updatedStudent = await response.json()

      setStudents(
        students.map((student) =>
          student._id === id ? updatedStudent : student
        )
      )

      setEditingId(null)
    } catch (error) {
      console.error("Error updating student:", error)

      setError("Could not update the student.")
    } finally {
      setSavingId(null)
    }
  }

  function getStatusMessage(status) {
    if (status === "Ready") {
      return "Excellent! You are well prepared for placements."
    }

    if (status === "Almost Ready") {
      return "Good progress! Keep improving your technical skills and coding practice."
    }

    return "Keep learning and improve your technical and problem-solving skills."
  }

  function getStatusClass(status) {
    if (status === "Ready") {
      return "ready"
    }

    if (status === "Almost Ready") {
      return "almost-ready"
    }

    return "needs-improvement"
  }

  /* =========================
     WELCOME SCREEN
  ========================= */

  if (!started) {
    return (
      <div className="app landing-page">

        <header className="topbar">
          <div className="brand">
            <div className="brand-icon">PA</div>

            <div>
              <span className="brand-title">Placement Analyzer</span>
              <span className="brand-subtitle">
                Student Career Readiness
              </span>
            </div>
          </div>

          <div className="topbar-badge">
            Full Stack Project
          </div>
        </header>

        <main className="hero-section">

          <div className="hero-content">

            <div className="hero-badge">
              <span className="pulse-dot"></span>
              Smart Placement Readiness
            </div>

            <h1>
              Know where you stand.
              <span> Get ready for placements.</span>
            </h1>

            <p>
              Analyze your academic profile, technical skills and projects
              to understand your current placement readiness.
            </p>

            <div className="hero-actions">
              <button
                className="hero-button"
                onClick={() => setStarted(true)}
              >
                Start Analysis
                <span>→</span>
              </button>

              <div className="hero-note">
                Takes less than a minute
              </div>
            </div>

          </div>

          <div className="hero-visual">

            <div className="dashboard-preview">

              <div className="preview-header">
                <div>
                  <small>PLACEMENT SCORE</small>
                  <strong>78%</strong>
                </div>

                <div className="preview-status">
                  Almost Ready
                </div>
              </div>

              <div className="preview-progress">
                <div></div>
              </div>

              <div className="preview-stats">

                <div>
                  <strong>6</strong>
                  <span>Skills</span>
                </div>

                <div>
                  <strong>2</strong>
                  <span>Projects</span>
                </div>

                <div>
                  <strong>8.4</strong>
                  <span>CGPA</span>
                </div>

              </div>

              <div className="preview-skills">
                <span>JavaScript</span>
                <span>React</span>
                <span>Python</span>
                <span>SQL</span>
              </div>

            </div>

            <div className="floating-card floating-card-one">
              <span>✓</span>
              Skill Analysis
            </div>

            <div className="floating-card floating-card-two">
              <span>★</span>
              Readiness Score
            </div>

          </div>

        </main>

        <section className="feature-section">

          <div className="feature-card">
            <div className="feature-icon purple">01</div>
            <div>
              <h3>Build your profile</h3>
              <p>
                Add your CGPA, projects and technical skills.
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon blue">02</div>
            <div>
              <h3>Analyze readiness</h3>
              <p>
                Get a placement readiness score instantly.
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon green">03</div>
            <div>
              <h3>Track students</h3>
              <p>
                Save, edit and manage analyzed profiles.
              </p>
            </div>
          </div>

        </section>

      </div>
    )
  }

  /* =========================
     MAIN APPLICATION
  ========================= */

  return (
    <div className="app dashboard-page">

      <header className="topbar app-topbar">

        <div className="brand">
          <div className="brand-icon">PA</div>

          <div>
            <span className="brand-title">Placement Analyzer</span>
            <span className="brand-subtitle">
              Student Career Readiness
            </span>
          </div>
        </div>

        <button
          className="home-button"
          onClick={() => setStarted(false)}
        >
          ← Home
        </button>

      </header>

      <main className="dashboard-container">

        <div className="page-heading">

          <div>
            <div className="section-label">
              PLACEMENT ASSESSMENT
            </div>

            <h1>Analyze your readiness</h1>

            <p>
              Enter your academic and technical profile to calculate
              your placement readiness.
            </p>
          </div>

          <div className="live-badge">
            <span></span>
            Assessment Ready
          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="error-box">
            <span>!</span>
            <strong>{error}</strong>
          </div>
        )}

        {/* STUDENT DETAILS */}

        <section className="dashboard-card">

          <div className="card-heading">

            <div className="card-number">
              01
            </div>

            <div>
              <h2>Student Details</h2>
              <p>
                Tell us about your academic background.
              </p>
            </div>

          </div>

          <div className="form-grid">

            <div className="input-group">
              <label>Full Name</label>

              <input
                type="text"
                placeholder="e.g. Kanha Gouda"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>College / University</label>

              <input
                type="text"
                placeholder="e.g. GIET Bhubaneswar"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>CGPA</label>

              <input
                type="number"
                step="0.01"
                placeholder="e.g. 8.4"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Projects Completed</label>

              <input
                type="number"
                min="0"
                placeholder="e.g. 2"
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
              />
            </div>

          </div>

        </section>

        {/* SKILLS */}

        <section className="dashboard-card">

          <div className="card-heading">

            <div className="card-number">
              02
            </div>

            <div>
              <h2>Technical Skills</h2>

              <p>
                Select the technologies you currently know.
              </p>
            </div>

            <div className="selected-count">
              {skills.length} selected
            </div>

          </div>

          <div className="skill-grid">

            {availableSkills.map((skill) => {

              const selected = skills.includes(skill)

              return (
                <label
                  className={`skill-card ${
                    selected ? "selected" : ""
                  }`}
                  key={skill}
                >

                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => handleSkillChange(skill)}
                  />

                  <div className="skill-check">
                    {selected ? "✓" : ""}
                  </div>

                  <div className="skill-name">
                    {skill}
                  </div>

                  <div className="skill-arrow">
                    →
                  </div>

                </label>
              )
            })}

          </div>

          <div className="analysis-action">

            <div>
              <strong>Ready to analyze?</strong>

              <span>
                Your information will be processed by the backend.
              </span>
            </div>

            <button
              className="analyze-button"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Placement
                  <span>→</span>
                </>
              )}
            </button>

          </div>

        </section>

        {/* RESULT */}

        {result && (
          <section className="result-dashboard">

            <div className="result-top">

              <div>
                <div className="section-label">
                  ANALYSIS COMPLETE
                </div>

                <h2>Your Placement Readiness</h2>

                <p>
                  Here is the result based on your submitted profile.
                </p>
              </div>

              <div
                className={`result-status ${getStatusClass(
                  result.status
                )}`}
              >
                {result.status}
              </div>

            </div>

            <div className="result-content">

              <div className="score-panel">

                <div className="score-circle">

                  <div>
                    <strong>{result.score}</strong>
                    <span>/100</span>
                  </div>

                </div>

                <h3>Readiness Score</h3>

                <p>
                  Based on your academic profile, projects and skills.
                </p>

              </div>

              <div className="profile-summary">

                <div className="summary-item">
                  <span>Student</span>
                  <strong>{name}</strong>
                </div>

                <div className="summary-item">
                  <span>College</span>
                  <strong>{college}</strong>
                </div>

                <div className="summary-item">
                  <span>CGPA</span>
                  <strong>{cgpa}</strong>
                </div>

                <div className="summary-item">
                  <span>Projects</span>
                  <strong>{projects}</strong>
                </div>

                <div className="summary-item full-width">
                  <span>Technical Skills</span>

                  <div className="skill-tags">
                    {skills.map((skill) => (
                      <span key={skill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            <div className="result-message">
              <span>💡</span>
              <p>{getStatusMessage(result.status)}</p>
            </div>

          </section>
        )}

        {/* STUDENT DATABASE */}

        <section className="dashboard-card database-card">

          <div className="database-heading">

            <div className="card-heading">

              <div className="card-number">
                03
              </div>

              <div>
                <h2>Student Database</h2>
                <p>
                  Manage previously analyzed student profiles.
                </p>
              </div>

            </div>

            <button
              className="database-button"
              onClick={getStudents}
              disabled={studentsLoading}
            >
              {studentsLoading
                ? "Loading..."
                : "View Saved Students"}
            </button>

          </div>

          {students.length > 0 && (

            <div className="student-grid">

              {students.map((student) => (

                <div
                  className="student-profile-card"
                  key={student._id}
                >

                  {editingId === student._id ? (

                    <div className="edit-area">

                      <div className="edit-header">
                        <h3>Edit Student</h3>

                        <button
                          className="close-edit"
                          onClick={cancelEditing}
                        >
                          ×
                        </button>
                      </div>

                      <div className="edit-grid">

                        <input
                          type="text"
                          value={editName}
                          placeholder="Name"
                          onChange={(e) =>
                            setEditName(e.target.value)
                          }
                        />

                        <input
                          type="text"
                          value={editCollege}
                          placeholder="College"
                          onChange={(e) =>
                            setEditCollege(e.target.value)
                          }
                        />

                        <input
                          type="number"
                          step="0.01"
                          value={editCgpa}
                          placeholder="CGPA"
                          onChange={(e) =>
                            setEditCgpa(e.target.value)
                          }
                        />

                        <input
                          type="number"
                          min="0"
                          value={editProjects}
                          placeholder="Projects"
                          onChange={(e) =>
                            setEditProjects(e.target.value)
                          }
                        />

                      </div>

                      <h4>Technical Skills</h4>

                      <div className="edit-skills">

                        {availableSkills.map((skill) => (

                          <label key={skill}>

                            <input
                              type="checkbox"
                              checked={editSkills.includes(skill)}
                              onChange={() =>
                                handleEditSkillChange(skill)
                              }
                            />

                            {skill}

                          </label>

                        ))}

                      </div>

                      <div className="actions">

                        <button
                          className="save-button"
                          onClick={() =>
                            updateStudent(student._id)
                          }
                          disabled={
                            savingId === student._id
                          }
                        >
                          {savingId === student._id
                            ? "Saving..."
                            : "Save Changes"}
                        </button>

                        <button
                          className="cancel-button"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </button>

                      </div>

                    </div>

                  ) : (

                    <>

                      <div className="student-card-header">

                        <div className="student-avatar">
                          {student.name
                            ? student.name.charAt(0).toUpperCase()
                            : "S"}
                        </div>

                        <div>
                          <h3>{student.name}</h3>
                          <p>{student.college}</p>
                        </div>

                      </div>

                      <div className="student-metrics">

                        <div>
                          <span>CGPA</span>
                          <strong>{student.cgpa}</strong>
                        </div>

                        <div>
                          <span>Projects</span>
                          <strong>
                            {student.projects ?? 0}
                          </strong>
                        </div>

                        <div>
                          <span>Score</span>
                          <strong className="metric-score">
                            {student.score}%
                          </strong>
                        </div>

                      </div>

                      <div className="saved-skills">

                        {student.skills.map((skill) => (
                          <span key={skill}>
                            {skill}
                          </span>
                        ))}

                      </div>

                      <div
                        className={`saved-status ${getStatusClass(
                          student.status
                        )}`}
                      >
                        {student.status}
                      </div>

                      <div className="student-actions">

                        <button
                          className="edit-button"
                          onClick={() =>
                            startEditing(student)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            deleteStudent(student._id)
                          }
                          disabled={
                            deletingId === student._id
                          }
                        >
                          {deletingId === student._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                    </>

                  )}

                </div>

              ))}

            </div>

          )}

          {students.length === 0 && !studentsLoading && (

            <div className="empty-state">

              <div className="empty-icon">
                👨‍🎓
              </div>

              <h3>No students loaded</h3>

              <p>
                Click "View Saved Students" to load
                profiles from MongoDB.
              </p>

            </div>

          )}

        </section>

      </main>

      <footer className="footer">
        Student Placement Analyzer · Full Stack Web Application
      </footer>

    </div>
  )
}

export default App