// import express from 'express';

// import {
//   addCountry,
//   getCountries,
//   getCountryById,
//   updateCountry,
//   deleteCountry,
// } from '../../controllers/admin/country.controller.js';

// import {
//   addState,
//   getStates,
//   getStateById,
//   updateState,
//   deleteState,
// } from '../../controllers/admin/state.controller.js';

// import {
//   addCity,
//   getCities,
//   getCityById,
//   updateCity,
//   deleteCity,
// } from '../../controllers/admin/city.controller.js';

// import {
//   addCollege,
//   getColleges,
//   getCollegeById,
//   updateCollege,
//   deleteCollege,
// } from '../../controllers/admin/college.controller.js';

// const router = express.Router();

// /* COUNTRY */
// router.post('/country', addCountry);
// router.get('/country', getCountries);
// router.get('/country/:id', getCountryById);
// router.put('/country/:id', updateCountry);
// router.delete('/country/:id', deleteCountry);

// /* STATE */
// router.post('/state', addState);
// router.get('/state', getStates);
// router.get('/state/:id', getStateById);
// router.put('/state/:id', updateState);
// router.delete('/state/:id', deleteState);

// /* CITY */
// router.post('/city', addCity);
// router.get('/city', getCities);
// router.get('/city/:id', getCityById);
// router.put('/city/:id', updateCity);
// router.delete('/city/:id', deleteCity);

// /* COLLEGE */
// router.post('/college', addCollege);
// router.get('/college', getColleges);
// router.get('/college/:id', getCollegeById);
// router.put('/college/:id', updateCollege);
// router.delete('/college/:id', deleteCollege);

// export default router;


import express from 'express';
import {
  addCountry,
  getCountries,
  getCountryById,
  updateCountry,
  deleteCountry,
} from '../../controllers/admin/country.controller.js';

import {
 addState, 
    getStates, 
    updateState, 
    // deleteState,
   getActiveStates
} from '../../controllers/admin/state.controller.js';

import {
  addCity,
  getCities,
  getCityById,
  updateCity,
  deleteCity,
} from '../../controllers/admin/city.controller.js';

import {
  addCollege,
  getColleges,
  getCollegeById,
  updateCollege,
  deleteCollege,
} from '../../controllers/admin/college.controller.js';

import {
  createClass,
  getAllClasses,
  updateClass,
  deleteClass,
} from '../../controllers/admin/Class/class.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Location Management
 *   description: APIs for managing Countries, States, Cities, and Colleges
 */

/* ========================== COUNTRY ROUTES ========================== */

/**
 * @swagger
 * /api/location/country:
 *   post:
 *     summary: Add a new country
 *     tags: [Admin Location Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "India"
 *   get:
 *     summary: Get all countries
 *     tags: [Admin Location Management]
 */
router.post('/country', addCountry);
router.get('/country', getCountries);

/**
 * @swagger
 * /api/location/country/{id}:
 *   get:
 *     summary: Get country by ID
 *     tags: [Admin Location Management]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *   put:
 *     summary: Update country
 *     tags: [Admin Location Management]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: { name: { type: string } }
 *   delete:
 *     summary: Delete country
 *     tags: [Admin Location Management]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 */
router.get('/country/:id', getCountryById);
router.put('/country/:id', updateCountry);
router.delete('/country/:id', deleteCountry);


/* ========================== STATE ROUTES ========================== */

/**
 * @swagger
 * /api/location/state:
 *   post:
 *     summary: Add a new state
 *     tags: [Admin Location Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, countryId]
 *             properties:
 *               name: { type: string, example: "Maharashtra" }
 *               countryId: { type: string }
 *   get:
 *     summary: Get all states
 *     tags: [Admin Location Management]
 */
// router.post('/state', addState);
// router.get('/state', getStates);
router.post('/add', addState);
router.get('/all-states', getStates);

/**
 * @swagger
 * /api/location/state/{id}:
 *   get:
 *     summary: Get state by ID
 *     tags: [Admin Location Management]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *   put:
 *     summary: Update state
 *     tags: [Admin Location Management]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *   delete:
 *     summary: Delete state
 *     tags: [Admin Location Management]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 */
// router.get('/state/:id', getStateById);
// router.put('/state/:id', updateState);
// router.delete('/state/:id', deleteState);
router.put('/update/:id', updateState);
// router.delete('/delete/:id', deleteState);
router.get('/active-list', getActiveStates);


/* ========================== CITY ROUTES ========================== */

/**
 * @swagger
 * /api/location/city:
 *   post:
 *     summary: Add a new city
 *     tags: [Admin Location Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, stateId]
 *             properties:
 *               name: { type: string, example: "Mumbai" }
 *               stateId: { type: string }
 *   get:
 *     summary: Get all cities
 *     tags: [Admin Location Management]
 */
router.post('/city', addCity);
router.get('/city', getCities);

/**
 * @swagger
 * /api/location/city/{id}:
 *   get:
 *     summary: Get city by ID
 *     tags: [Admin Location Management]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *   put:
 *     summary: Update city
 *     tags: [Admin Location Management]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *   delete:
 *     summary: Delete city
 *     tags: [Admin Location Management]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 */
router.get('/city/:id', getCityById);
router.put('/city/:id', updateCity);
router.delete('/city/:id', deleteCity);


/* ========================== COLLEGE ROUTES ========================== */

/**
 * @swagger
 * /api/location/college:
 *   post:
 *     summary: Add a new college
 *     tags: [Admin Location Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, cityId]
 *             properties:
 *               name: { type: string, example: "Grant Medical College" }
 *               cityId: { type: string }
 *               stateId: { type: string }
 *               countryId: { type: string }
 *   get:
 *     summary: Get all colleges
 *     tags: [Admin Location Management]
 */
router.post('/college', addCollege);
router.get('/college', getColleges);

/**
 * @swagger
 * /api/location/college/{id}:
 *   get:
 *     summary: Get college by ID
 *     tags: [Admin Location Management]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *   put:
 *     summary: Update college
 *     tags: [Admin Location Management]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *   delete:
 *     summary: Delete college
 *     tags: [Admin Location Management]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 */
router.get('/college/:id', getCollegeById);
router.put('/college/:id', updateCollege);
router.delete('/college/:id', deleteCollege);

// Class
router.post('/class', createClass); // CREATE
router.get('/class', getAllClasses); // READ
router.put('/class/:id', updateClass); // UPDATE
router.delete('/class/:id', deleteClass); // DELETE

export default router;

