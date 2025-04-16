import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true, 
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'] 
    },
    password: { 
        type: String, 
        required: true, 
        minlength: 8 
    },
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;