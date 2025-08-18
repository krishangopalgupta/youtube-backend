const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promies.resolve(requestHandler(req, res, next)).catch((error) =>
            next(error)
        );
    };
};

// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         res.send(error.code || 500).json({
//             success: false,
//             message: error.message,
//         });
//         // console.log(`error ${error}`);
//     }
// };

export {asyncHandler};
