const authMiddleware = (router) => {
    console.log("Initializing auth middleware");
    router.use((req, res, next) => {
        // Check if the request has a valid bearer token
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            // Extract the token from the authorization header
            const token = authHeader.split(' ')[1];
            // Decode the base64 token
            const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
            // Attach the authenticated user to the request object
            req.user = decodedToken;
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    });
};

module.exports.init = authMiddleware;
