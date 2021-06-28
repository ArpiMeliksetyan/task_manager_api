const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const router = new express.Router();
const {sendWelcomeEmail,sendCancelationEmail } = require('../emails/account');

//Sign Up
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {

        await user.save();
        sendWelcomeEmail(user.email,user.name);
        const token = await user.generateToken();
        res.status(201).send({user, token});
    } catch (e) {
        res.status(400).send(e);
    }
});


//Get my info
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

//Get all users
// router.get('/users',auth, async (req, res) => {
//     try {
//         const user = await User.find({});
//         res.status(200).send(user);
//     } catch (e) {
//         res.status(500).send();
//     }
// });


//Get user avatar

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw  new Error();
        }
        res.set('Content-Type','image/png');
        res.send(user.avatar);

    } catch (error) {
        res.status(404).send();
    }
});


//User log in
router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateToken();
        res.send({user, token});
    } catch (err) {
        res.status(400).send();
    }
});

//User log out
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.send();

    } catch (err) {
        res.status(500).send();
    }
});

//User log out all
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();

    } catch (err) {
        res.status(500).send();
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
            cb(new Error('File should be a in form of jpg,png or jpeg'));
        }
        cb(undefined, true);
    }
});


//User upload profile pic
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({error: error.message});
});


//Update user info
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowed = ['name', 'age', 'email', 'password'];
    const isValidOperation = updates.every(update => {
        return allowed.includes(update)
    });
    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid update fields'})
    }
    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user)
    } catch (e) {
        res.status(500).send();
    }

});

//Delete user avatar
router.delete('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

//Delete user by Id
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        sendCancelationEmail(req.user.email,req.user.name);
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }

    // const _id = req.params.id;
    // try {
    //     const user = await User.findByIdAndDelete(req.user._id);
    //     if (!user) {
    //         return res.status(404).send();
    //     }

});


//Get users by Id

// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id;
//     try {
//         const user = await User.findById(_id);
//         if (!user) {
//             return res.status(404).send();
//         }
//         res.send(user)
//     } catch (e) {
//         res.status(500).send();
//     }
//
// });

module.exports = router;