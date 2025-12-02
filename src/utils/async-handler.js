const asyncHandler = (requestHandler) => { // main contro./func
    return (req, res, next) => { // this func returned -> called at route "req, res, next"
        Promise
            .resolve(requestHandler(req, res, next))
            .catch((err) => next(err));
    };
};

module.exports = {
    asyncHandler
};
