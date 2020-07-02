const crypto = require('crypto');
const {
    promisify
} = require("util");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/email");

const signToken = (id) => {
    return jwt.sign({
            id,
        },
        process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        }
    );
};

exports.signup = async (req, res, next) => {
    try {
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
        });

        const token = signToken(newUser._id);

        res.status(200).json({
            status: "success",
            token,
            data: {
                user: newUser,
            },
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};

exports.login = catchAsync(async (req, res, next) => {
    const {
        email,
        password
    } = req.body;

    if (!email || !password) {
        return next(new AppError("Enter email address or password", 400));
    }

    const user = await User.findOne({
        email,
    }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Incorrect email or password", 401));
    }

    const token = signToken(user._id);

    res.status(200).json({
        status: "success",
        token,
        data: {
            user,
        },
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    } // else if (req.cookies.token) token = req.cookies.token;

    if (!token) {
        return next(
            new AppError(
                "You are not logged in! Please log in to get access",
                401
            )
        );
    }
    // verifying the token to see if the token was manipulated in any way or if it is expired
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(
            new AppError("The user belonging to this token does not exist", 401)
        );
    }

    //Checking if the user changed their password after the token was issued
    if (currentUser.passwordChangedAfter(decoded.iat)) {
        return next(
            new AppError(
                "User recently changed the password! Please login again.",
                401
            )
        );
    }

    //GRANT ACCESS TO THE PROTECTED ROUTES
    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // ...roles is the arbitrary no. of roles
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    "You do not have permission to perform this action",
                    403
                )
            );
        }

        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({
        email: req.body.email,
    });

    if (!user) {
        return next(new AppError("There is no user with that email", 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({
        validateBeforeSave: false,
    });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit your PATCH request with your new password and passwordConfirm to: ${resetURL}. \n If you did not forget your password, then please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (only valid for 10 minutes)',
            message
        })

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        })
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({
            validateBeforeSave: false,
        });

        return next(new AppError('There was an error sending the reset email. Please try again later', 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //get user based on token and checking whether it has expired
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {
            $gt: Date.now()
        }
    });

    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const token = signToken(user._id);

    res.status(200).json({
        status: "success",
        token
    });

});