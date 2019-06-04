const express = require("express");
const authMiddleware = require("../middlewares/auth");
const Project = require("../models/project");
const Task = require("../models/task");

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().populate(["user", "tasks"]);
    res.send({ projects });
  } catch (error) {
    return res.status(400).send({ error: "Error loading projects" });
  }
});

router.get("/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate([
      "user",
      "tasks"
    ]);
    res.send({ project });
  } catch (error) {
    return res.status(400).send({ error: "Error loading project" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, tasks } = req.body;
    const project = await Project.create({
      title,
      description,
      user: req.userId
    });

    await Promisse.all(
      tasks.map(async task => {
        const projectTask = new Task({
          ...task,
          project: project._id
        });
        await projectTask.save();

        project.tasks.push(projectTask);
      })
    );

    await project.save();

    return res.send({ project });
  } catch (error) {
    return res.status(400).send({ error: "Error creating new project" });
  }
});

router.put("/:projectId", async (req, res) => {
  try {
    const { title, description, tasks } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.project._id,
      {
        title,
        description
      },
      { new: true }
    );

    project.tasks = [];
    await Task.remove({ project: project._id });

    await Promisse.all(
      tasks.map(async task => {
        const projectTask = new Task({
          ...task,
          project: project._id
        });
        await projectTask.save();

        project.tasks.push(projectTask);
      })
    );

    await project.save();

    return res.send({ project });
  } catch (error) {
    return res.status(400).send({ error: "Error Updating new project" });
  }
});

router.delete("/:projectId", async (req, res) => {
  try {
    await Project.findByIdAndRemove(req.params.projectId);
    res.send();
  } catch (error) {
    return res.status(400).send({ error: "Error delete project" });
  }
});

module.exports = app => app.use("/projects", router);
