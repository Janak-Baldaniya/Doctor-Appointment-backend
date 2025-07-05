export const generateToken = (user, message, statuscode, res) => {
    const token = user.generateJsonWebToken();
    // Determine the cookie name based on the user's role
    const cookieName = user.role === 'Admin' ? 'adminToken' : 'patientToken';

    res
        .status(statuscode)
        .cookie(cookieName, token, {
            expires: new Date(
                Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
            secure:true, // Set to true if using HTTPS
            sameSite: 'None', // Set to 'None' if using HTTPS
        })
        .json({
            success: true,
            message,
            user,
            token,
        });
};

