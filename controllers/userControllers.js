import userModel from '../models/userModel.js'
import { userlogActivity } from '../utils/userActivity.js'
import bcrypt from 'bcrypt'

export const getAllUsers = async (req, res) => {
    try {
        let { name, email_id, mobile, gender, role, status, page = 1, limit = 10 } = req.query
        page = parseInt(page);
        limit = parseInt(limit);

        // Calculate how many documents to skip
        const skip = (page - 1) * limit;

        const filter = {};
        if (name) filter.name = { $regex: name, $options: "i" };
        if (mobile) filter.mobile = { $regex: mobile, $options: "i" };
        if (email_id) filter.email_id = { $regex: email_id, $options: "i" };
        if (status) filter.status = { $regex: status, $options: "i" };
        if (gender) filter.gender = { $regex: gender, $options: "i" };
        if (role) filter.role = role;

        // Fetch paginated + filtered leads
        const [users, totalUsers] = await Promise.all([
            userModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            userModel.countDocuments(filter),
        ]);
        // Calculate total number of pages
        const totalPages = Math.ceil(totalUsers / limit);

        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No user found",
                users: [],
                totalLeads: 0,
                totalPages: 0,
            });
        }

        // ✅ Return paginated data
        return res.status(200).json({
            success: true,
            users,
            totalUsers,
            totalPages,
            currentPage: page,
        });
    } catch (error) {

        console.log(error)
        return res.status(400).json({ message: "somthing went wrong!", error });
    }


}
export const getUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await userModel.findOne({ _id: id });
        if (!user) return res.status(400).json({ message: "No users available!" });
        return res.status(200).json({ user: user });

    } catch (error) {

        console.log(error);
        return res.status(400).json({ message: "somthing went wrong!", error });
    }


}
export const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        //getting logedin user data
        const { doc_id, role } = req.user;
        //getting logged in user ip 
        const { ip, os, browser, browserVersion } = req.clientDetails;

        // Clean only the name field if it exists
        if (updatedData.name && typeof updatedData.name === 'string') {
            updatedData.name = updatedData.name
                .trim()               // remove spaces at start & end
                .replace(/\s+/g, ' ') // replace multiple spaces with one
                .toUpperCase();       // convert to uppercase
        }
        const updateFields = {
            ...updatedData
        };

        if (req.file) {
            updateFields.image = "/uploads/profile/" + req.file.filename;
        }
        // Update user safely and return the new document
        const updatedUser = await userModel.findOneAndUpdate(
            { _id: id },
            {
                $set: updateFields,
            },
            { new: true, runValidators: true } // returns updated doc & applies schema validation
        );
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found!" });
        }
        await userlogActivity({
            user_id: doc_id,
            action: "User Profile Update",
            action_on: updatedUser.name,
            role: role,
            ip: ip,
            os: os,
            browser: browser + " " + browserVersion,
        })
        return res.status(200).json({
            success: true,
            message: "User updated successfully!",
            user: updatedUser,
        });

    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating user!",
            error: error.message,
        });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    //getting user details
    const { doc_id, role } = req.user
    //getting user ip's
    const { ip, os, browser, browserVersion } = req.clientDetails;


    try {
        const user = await userModel.findOneAndDelete({ email_id: id });
        if (!user) return res.status(400).json({ message: "No user available!" });
        await userlogActivity({
            user_id: doc_id,
            action: "User Delete",
            action_on: user.name,
            role: role,
            ip: ip,
            os: os,
            browser: browser + " " + browserVersion

        })
        return res.status(200).json({ message: "User Deleted!" });

    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: "somthing went wrong!", error });
    }


}
export const changeUserPassword = async (req, res) => {

    const { id } = req.params;
    const { password } = req.body

    //getting logedin user data
    const { doc_id, role } = req.user;
    //getting logged in user ip 
    const { ip, os, browser, browserVersion } = req.clientDetails;


    try {
        bcrypt.genSalt(10, async function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hashPassword) {
                const updatedPassword = await userModel.findOneAndUpdate({ _id: id }, { password: hashPassword });
                if (!updatedPassword) return res.status(400).json({ message: "Somthing went wrong!" })
                await userlogActivity({
                    user_id: doc_id,
                    action: "Password Change",
                    action_on: updatedPassword.name,
                    role: role,
                    ip: ip,
                    os: os,
                    browser: browser + " " + browserVersion,
                })

                return res.status(200).json({ message: "Password Changed!" })
            });
        });
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: "somthing went wrong!", error });
    }


}