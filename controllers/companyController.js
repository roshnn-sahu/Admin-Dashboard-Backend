import CompanyModel from "../models/companyModel.js";

export const manageCompany = async (req, res) => {


    try {
        const {
            name,
            display_name,
            gstin,
            aadhaar,
            pan,
            jurisdiction,
            phone,
            mobile,
            email_id,
            website,
            city,
            state,
            country,
            address,
            pin,
            facebook,
            instagram,
            twitter,
            linkedin,
            youtube,
            rss,
        } = req.body;
        const { ip, browser, browserVersion, os, timestamp } = req.clientDetails;

        const clientDetails = {
            ip: ip ? ip : null,
            browser: browser ? browser : null,
            browserVersion: browserVersion ? browserVersion : null,
            os: os ? os : null,
            timestamp: timestamp ? timestamp : null
        }
        const editInfo = JSON.stringify(clientDetails)


        const files = req.files || {};
        const images = {};
        if (files.icon) images.icon = `/uploads/company/${files.icon[0].filename}`;
        if (files.logo) images.logo = `/uploads/company/${files.logo[0].filename}`;
        if (files.login_icon) images.login_icon = `/uploads/company/${files.login_icon[0].filename}`;
        if (files.login_bg) images.login_bg = `/uploads/company/${files.login_bg[0].filename}`;

        let company = await CompanyModel.findOne();
        if (company) {
            // 🔁 Update existing
            company.set({
                name,
                display_name: display_name,
                gstin,
                aadhaar,
                pan,
                jurisdiction,
                phone,
                mobile,
                email_id,
                website,
                city,
                state,
                country,
                address,
                pin,
                social: {
                    facebook,
                    instagram,
                    twitter,
                    linkedin,
                    youtube,
                    rss,
                },
                edit_info: editInfo,
            });


            // ✅ Update logo fields only if new files uploaded
            if (files?.icon || files?.logo || files?.login_icon || files?.login_bg) {
                company.images = { ...company.images, ...images };
            }


            await company.save();
            return res.status(200).json({
                success: true,
                message: "Company details updated successfully",
                data: company,
            });

        } else {
            // 🆕 Create new
            const newCompany = new CompanyModel({
                name,
                display_name: display_name,
                gstin,
                aadhaar,
                pan,
                jurisdiction,
                phone,
                mobile,
                email_id,
                website,
                city,
                state,
                country,
                address,
                pin,
                social: {
                    facebook,
                    instagram,
                    twitter,
                    linkedin,
                    youtube,
                    rss,
                },
                images,
                edit_info: editInfo,
            });

            await newCompany.save();

            return res.status(201).json({
                success: true,
                message: "Company created successfully",
                data: newCompany,
            });
        }


    } catch (error) {
        console.log(error)
        throw Error(error)
    }
}

export const getCompany = async (req, res) => {
    try {
        const company = await CompanyModel.findOne();
        if (!company) return res.status(400).json({ message: "No Company Exist!" });

        return res.json({ company: company });

    } catch (error) {
        console.log(error);
        throw new Error(error)
    }

}