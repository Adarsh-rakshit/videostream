import mongoose , {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videoFile: {
        type: String, //cloudinary
        required: [
            true,
            'video is must'
        ]
    },
    thumbnail: {
        type: String,
        required: true,
    },
    owner: {
        type: Schema.types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: Number, //cloudinary
        required: true,
    },
    views: {
        type: String,
        default:0
    },
    isPublished: {
        type: boolean,
        default: true,
    },
},
{
    timestamps: true
})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema);