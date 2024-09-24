const jwt = require("jsonwebtoken");

const getToken = (user) => {
    const token = jwt.sign(
        {identifier: user._id},
        "thisKeyIsSupposedToBeSecret"
    );
    return token;
};

module.exports = { getToken };