const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");

const router= express.Router();

function createToken(id){
    return jwt.sign({id},process.env.JWT_SECRET || "default_jwt_secret",{expiresIn:"7d"});
}

router.post('/register',async (req,res)=>{
    try{
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: "Database is not connected. Please verify MONGO_URI in MongoDB Atlas / Render settings." });
        }

        const {name, email, password}= req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields (name, email, password) are required." });
        }

        const existingUser= await User.findOne({email});

        if(existingUser){
            return res.status(400).json({message: "user already exists"});
        }

        const handlePassword = await bcrypt.hash(password,10);

        const user = await User.create({
            name,
            email,
            password: handlePassword,
        })

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: createToken(user._id),
        });
    }catch(error){
        console.error("Register Error:", error);
        res.status(500).json({message: error.message || "Server error occured"});
    }
});


router.post('/login',async (req,res)=>{
    try{
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: "Database is not connected. Please verify MONGO_URI in MongoDB Atlas / Render settings." });
        }

        const {email, password}= req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({message: "Invalid email or password"})
        }

        const isMatch= await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(401).json({message: "Invalid password"})
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: createToken(user._id),
        });
    }catch(error){
        console.error("Login Error:", error);
        res.status(500).json({message: error.message || "server error occured"});
    }
})


module.exports= router