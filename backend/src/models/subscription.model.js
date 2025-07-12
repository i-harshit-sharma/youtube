import mongoose,{Schema} from "mongoose";

const subscriptionSchema = new Schema({
    //One who is subscribing
    subscriber:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    channel:{
        types: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
})

export const Subscription = mongoose.model("Subscription",subscriptionSchema)