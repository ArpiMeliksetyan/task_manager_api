const User = require('../models/user');


const register = async (req, res) => {
    const user = new User(req.body);
    try {
        const token = await user.generateToken();
        await user.save();
        console.log(user);
        res.status(201).send({user, token});
    } catch (e) {
        res.status(400).send(e);
    }
}

module.exports = {
    register
};



