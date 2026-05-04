import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../config/nodeMailer.config.js";
import { userlogActivity } from "../utils/userActivity.js";

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const { browser, ip, os, browserVersion } = req.clientDetails

    try {
        const findUser = await userModel.findOne({ email_id: email });
        if (!findUser) return res.status(400).json({ message: "User not exist!" })
        if (findUser.status !== "Enabled") return res.status(400).json({ message: "Invalid Credentials!" })
        bcrypt.compare(password, findUser.password, async function (err, result) {
            if (!result || result == null) {
                return res.status(400).json({ message: "Invalid Credentials!" })
            }
            const token = jwt.sign(
                {
                    doc_id: findUser._id,
                    user_id: findUser.user_id,
                    name: findUser.name,
                    email_id: findUser.email_id,
                    mobile: findUser.mobile,
                    gender: findUser.gender,
                    role: findUser.role,
                    date: findUser.date,
                    image: findUser.image,
                    status: findUser.status
                },
                process.env.JWT_SECRET, { expiresIn: '1d' }
            );

            await res.cookie(`token`, token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production' ? true : true, // true for both envs (localhost considered secure)
                maxAge: 24 * 60 * 60 * 1000, // 1 day
                sameSite: 'none' // Allow cross-origin
            });
            await userlogActivity({
                user_id: findUser._id,
                role: findUser.role,
                action: "Log In",
                ip: ip,
                browser: browser + " " + browserVersion,
                os: os

            })


            return res.status(200).json({
                redirectUrl: "/admin/dashboard",
                message: "Login Successfully!",
            });
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error logging in", success: false, error });

    }


}

export const registerUser = async (req, res) => {
    try {
        const { name, role, email, password, gender, mobile } = req.body;
        const modifiedName = name.trim().replace(/\s+/g, ' ').toUpperCase();

        const imageFileName = req.file ? req.file.filename : null
        //getting user details
        const { doc_id, role: user_role } = req.user;
        //getting client ip's
        const { ip, os, browser, browserVersion } = req.clientDetails;




        const exitingEmail = await userModel.findOne({ email_id: email });
        if (exitingEmail) return res.status(400).json({ message: "Email Already Exist!" });
        const exitingMobile = await userModel.findOne({ mobile: mobile });
        if (exitingMobile) return res.status(400).json({ message: "Mobile Already Exist!" });

        bcrypt.genSalt(10, async function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hashPassword) {
                const newUser = await userModel.create({
                    name: modifiedName,
                    role: role,
                    email_id: email,
                    image: `/uploads/profile/${imageFileName}`,
                    gender: gender,
                    mobile: mobile,
                    password: hashPassword
                })
                if (!newUser) return res.status(400).json({ message: "Something went wrong !" })

                await userlogActivity({
                    user_id: doc_id,
                    action: "User Create",
                    action_on: newUser.name,
                    role: user_role,
                    ip: ip,
                    os: os,
                    browser: browser + " " + browserVersion,
                })

                return res.status(200).json({ message: "User Created Successfully!" })
            });
        });




    } catch (error) {
        console.log(error)
        res.status(400).json({ message: "Somthing Went Wrong!" });
    }
}

export const logoutUser = async (req, res) => {
    const { browser, ip, os, browserVersion } = req.clientDetails;
    const { doc_id, role } = req.user;

    await userlogActivity({
        user_id: doc_id,
        role: role,
        action: "Log Out",
        ip: ip,
        browser: browser + " " + browserVersion,
        os: os

    })

    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : true,
        sameSite: 'none'
    });
    return res.status(200).json({ message: "Logout Successfully!", redirectUrl: "/admin/login" });

}
export const checkAuth = async (req, res) => {

    const token = req.cookies.token;
    if (!token) return res.status(400).json({ redirectUrl: "/admin/login", message: "User not Logged In!" });
    // invalid token - synchronous
    try {
        var decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) return res.status(400).json({ redirectUrl: "/admin/login", message: "User not Logged In!" });
        const user = await userModel.findOne({ _id: decoded.doc_id });

        if (!user) return res.status(400).json({ redirectUrl: "/admin/login", message: "User not Logged In!" });
        return res.status(200).json({ message: "User Logged In!", userData: user });


    } catch (err) {
        throw err;
    }


}
export const updateProfile = async (req, res) => {

    const { name, gender } = req.body ? req.body : false;
    const imageFileName = req.file ? req.file.filename : false;
    if (!name && !gender && !imageFileName) {
        return res.status(400).json({ message: "No data provided for update." });
    }

    // 3. Authentication Check (Should ideally be done via a dedicated middleware)
    const token = req.cookies.token;
    if (!token) return res.status(400).json({ redirectUrl: "/admin/login" });

    try {
        // 4. Verify the Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const modifiedName = name.trim().replace(/\s+/g, ' ').toUpperCase();
        // 5. Dynamically Build the Update Object
        const updateFields = {};
        if (name) updateFields.name = modifiedName;
        if (gender) updateFields.gender = gender;
        if (imageFileName) updateFields.image = imageFileName; // Assuming 'image' field update is intended

        // 6. Update the User in the Database (Single, consolidated DB call)
        const updatedUser = await userModel.findOneAndUpdate(
            { email_id: decoded.email_id },
            updateFields, // Use the dynamically built object
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found or nothing was updated." });
        }
        // 7. Generate and Set NEW Token (Single, consolidated block)

        const newToken = jwt.sign({
            doc_id: updatedUser._id,
            user_id: updatedUser.user_id,
            name: updatedUser.name,
            email_id: updatedUser.email_id,
            mobile: updatedUser.mobile,
            gender: updatedUser.gender,
            role: updatedUser.role,
            date: updatedUser.date,
            image: updatedUser.image,
            status: updatedUser.status
        },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Ensure you include the necessary httpOnly and secure flags here
        res.cookie('token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' ? true : true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: 'none'
        });
        return res.status(200).json({
            message: "Profile Updated Successfully!",
            user: {
                name: updatedUser.name,
                gender: updatedUser.gender,
                image: updatedUser.image,
            }
        });

    } catch (err) {
        // Handle JWT verification errors (e.g., token expired)
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production' ? true : true,
                sameSite: 'none'
            }); // Clear invalid cookie
            return res.status(401).json({
                redirectUrl: "/admin/login",
                message: "Invalid or expired token."
            });
        }

        console.error(err);
        return res.status(500).json({ message: "Internal Server Error." });
    }
};
export const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const token = req.cookies.token;
    if (!token) return res.status(400).json({ redirectUrl: "/admin/login", message: "User not Logged In!" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({ email_id: decoded.email_id });
        if (!user) return res.status(400).json({ message: "User not found!" });
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Old password is incorrect!" });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({ message: "Password changed successfully!" });
    } catch (error) {

        console.log(error);
        res.status(500).json({ message: "Internal Server Error!" });//commented for debugging purpose
    }
}
export const forgetPassword = async (req, res) => {
    const { email, mobile } = req.body;
    if (!email && !mobile) return res.status(400).json({ message: "No data  provided!" })

    try {
        function generatePassword(len = 6) {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let out = "";
            for (let i = 0; i < len; i++) {
                const idx = Math.floor(Math.random() * chars.length);
                out += chars[idx];
            }
            return out;
        }
        const user = await userModel.findOne({ $and: [{ email_id: email }, { mobile: mobile }] });
        if (!user) return res.status(400).json({ message: "User Not Found!" })
        const newPass = await generatePassword()

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPass, salt);
        user.password = hashedPassword;
        await user.save();

        await sendEmail({
            to: "locroshan@gmail.com", // Replace with your email for testing
            subject: "Password Reset Request",
            html: `<h1> Your Login Password Is 🗝️:${newPass} </h1> `,
        });
        return res.status(200).json({ message: "Password sent successfully !" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error!" });//commented for debugging purpose
    }
}

