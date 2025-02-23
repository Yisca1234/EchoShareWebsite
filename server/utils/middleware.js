const jwt = require('jsonwebtoken');
const { SECRET } = require('../utils/config');

const auth = (req, res, next) => {
  
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res
        .status(401)
        .send({ message: 'No auth token found. Authorization denied.' });
    }

    const token = authHeader.split(' ')[1];

    const decodedToken = jwt.verify(token, SECRET);

    if (!decodedToken.id) {
      return res
        .status(401)
        .send({ message: 'Token verification failed. Authorization denied.' });
    }
    // console.log(decodedToken.id);
    req.user = { _id: decodedToken.id };
    next();
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};


const unknownEndpointHandler = (_req, res) => {
  res.status(404).send({ message: 'Unknown endpoint.' });
};

const errorHandler = (error, _req, res, next) => {
  console.error(error.message);

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).send({ message: 'Malformatted ID.' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).send({ message: error.message });
  } else if (error.name === 'JsonWebTokenError') {
    return res.status(401).send({ message: 'Invalid token.' });
  } else {
    res.status(400).send({ message: error.message });
  }

  next(error);
};

module.exports = {
  auth,
  unknownEndpointHandler,
  errorHandler,
};
