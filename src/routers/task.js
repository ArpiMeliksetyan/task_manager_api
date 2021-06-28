const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
require('../db/mongoose');
const router = new express.Router();

// Get all tasks of the user
// /tasks
// /tasks/?completed=true
// /tasks/?completed=false
// /tasks/?limit=3&&skip=0
// /tasks/?sortBy=createdAt:desc

router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
        const splited = req.query.sortBy.split(':');
        sort[splited[0]] = splited[1] === 'desc' ? -1 : 1;

    }

    try {
        await req.user.populate({
            path: 'tasks',
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort,
            },

            match,
        }).execPopulate();
        res.send(req.user.tasks)
    } catch (e) {
        console.log(e)
        res.status(500).send();
    }
});

// Get specific task of the user
router.get('/tasks/:id', auth, async (req, res) => {

    const _id = req.params.id;
    try {
        const task = await Task.findOne({_id, owner: req.user._id})
        if (!task) {
            return res.status(404).send();
        }
        res.send(task)
    } catch (e) {
        res.status(500).send();
    }
});

//Create a task
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id,
    })
    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

//Update a task
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowed = ['description', 'completed'];
    const isValidOperation = updates.every(update => {
        return allowed.includes(update)
    });

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid update fields'})
    }
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});

        if (!task) {
            return res.status(404).send();
        }
        updates.forEach(update => task[update] = req.body[update]);

        await task.save();
        res.send(task)
    } catch (e) {
        console.log(e)
        res.status(400).send(e);
    }

});
//Delete a task
router.delete('/tasks/:id', auth, async (req, res) => {

    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
        if (!task) {
            return res.status(404).send();
        }
        res.send(task)
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;