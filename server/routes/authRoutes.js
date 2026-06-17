const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router= express.Router();

function createToken(id){
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:"7d"});
}

router.post('/register',async (req,res)=>{
    try{
        const {name, email, password}= req.body;

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
        console.log(error);
        res.status(500).json({message: "Server error occured"});
    }
});


router.post('/login',async (req,res)=>{
    try{
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
        res.status(500).json({message: "server error occured"});
    }
})


module.exports= router