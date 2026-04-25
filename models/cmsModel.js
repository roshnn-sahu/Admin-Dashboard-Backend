import mongoose from "mongoose";

const { Schema } = mongoose;

const positionSchema = new Schema(
    {
        menu: { type: Boolean, default: false },
        top_header: { type: Boolean, default: false },
        footer: { type: Boolean, default: false },
    },
    { _id: false }
);

const orderSchema = new Schema(
    {
        menu: { type: Number, default: 0 },
        top_header: { type: Number, default: 0 },
        footer: { type: Number, default: 0 },
    },
    { _id: false }
);

const classSchema = new Schema(
    {
        menu: { type: String, default: null },
        top_header: { type: String, default: null },
        footer: { type: String, default: null },
    },
    { _id: false }
);

const cmsSchema = new Schema(
    {
        type: {
            type: String,
            enum: ["page", "cms",],
            default: "page",
        },

        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tbl_cms",
            default: null,
        },

        name: { type: String, required: true },

        title: { type: String },
        heading: { type: String },

        url: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        target: {
            type: String,
            enum: ["_self", "_blank"],
            default: "_self",
        },

        position: positionSchema,
        class: classSchema,
        order: orderSchema,

        // store full HTML / React / template code
        content: { type: String },

        short_description: { type: String },

        meta_title: { type: String },
        meta_keywords: { type: String },
        meta_description: { type: String },

        styles: { type: String }, // CSS or JSON styles

        // images
        thumbnail: { type: String, default: null }, // URL or base64
        breadcrumb: { type: String, default: null }, // URL or base64 

    },
    { timestamps: true }
);



const cmsModel = mongoose.model("tbl_cms", cmsSchema);
export default cmsModel;