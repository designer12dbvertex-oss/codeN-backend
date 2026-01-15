import express from "express";

import { protect } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/Authorization.middleware.js'
const router = express.Router();
import { addAboutUs, getAboutUs } from "../../controllers/AboutUs/aboutus.controller.js";
router.use(protect);
router.use(authorize('admin'));


router.post("/about-us", addAboutUs); // POST used for both Add and Edit
router.get("/about-us", getAboutUs);   // GET for fetching data

export default router;