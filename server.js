"use strict";

import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import Router from "./src/routes.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: true }));

Router(app, '/api/v1');

app.use((req, res) => {
    res.status(404).json({ 
        status: "ERROR", 
        about: 'Endpoint not found!' 
    });
});

app.use((err, req, res) => {
    res.status(500).json({
        status: "ERROR",
        about: err.name,
        solution: err.message
    });
});


app.listen(PORT, (error) => {

    if(error){
        throw new Error(error);
    }

    console.log(`Running on port ${PORT}`);
});

