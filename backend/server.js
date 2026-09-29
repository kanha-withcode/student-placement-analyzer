
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/studentPlacementDB")
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Student Schema
const studentSchema = new mongoose.Schema({
  name: String,
  college: String,
  cgpa: Number,
  skills: [String],
  projects: Number,
  score: Number,
  status: String
});

const Student = mongoose.model("Student", studentSchema);

// Test route
app.get("/", (req, res) => {
  res.send("Student Placement Analyzer Backend is running!");
});

// POST API - Analyze and save student
app.post("/api/analyze", async (req, res) => {
  try {
    const { name, college, cgpa, skills, projects } = req.body;

    const score = calculateScore(cgpa, skills, projects);
    const status = getStatus(score);

    const student = new Student({
      name,
      college,
      cgpa,
      skills,
      projects,
      score,
      status
    });

    await student.save();

    res.json({
      name,
      college,
      cgpa,
      skills,
      projects,
      score,
      status
    });

  } catch (error) {
    console.error("Error saving student:", error);

    res.status(500).json({
      message: "Failed to save student data"
    });
  }
});

// GET API - Fetch all students
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find();

    res.json(students);

  } catch (error) {
    console.error("Error fetching students:", error);

    res.status(500).json({
      message: "Failed to fetch students"
    });
  }
});

// DELETE API - Delete a student
app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({
      message: "Student deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting student:", error);

    res.status(500).json({
      message: "Failed to delete student"
    });
  }
});

// PUT API - Update a student
app.put("/api/students/:id", async (req, res) => {
  try {
    const { name, college, cgpa, skills, projects } = req.body;

    // Recalculate score after updating details
    const score = calculateScore(cgpa, skills, projects);
    const status = getStatus(score);

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        name,
        college,
        cgpa,
        skills,
        projects,
        score,
        status
      },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json(student);

  } catch (error) {
    console.error("Error updating student:", error);

    res.status(500).json({
      message: "Failed to update student"
    });
  }
});

// Calculate placement score
function calculateScore(cgpa, skills, projects) {
  let score = 0;

  // CGPA - maximum 30 points
  if (cgpa >= 9) {
    score += 30;
  } else if (cgpa >= 8) {
    score += 25;
  } else if (cgpa >= 7) {
    score += 20;
  } else if (cgpa >= 6) {
    score += 15;
  } else {
    score += 10;
  }

  // Technical skills - maximum 30 points
  score += Math.min(skills.length * 4, 30);

  // DSA - maximum 15 points
  if (skills.includes("DSA")) {
    score += 15;
  }

  // Git/GitHub - maximum 10 points
  if (skills.includes("Git/GitHub")) {
    score += 10;
  }

  // Projects - maximum 15 points
  score += Math.min(projects * 5, 15);

  return Math.min(score, 100);
}

// Determine placement status
function getStatus(score) {
  if (score >= 80) {
    return "Ready";
  } else if (score >= 60) {
    return "Almost Ready";
  } else {
    return "Needs Improvement";
  }
}

// Start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

