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
  getStateById,
  updateState,
  deleteState,
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

/* COUNTRY */
router.post('/country', addCountry);
router.get('/country', getCountries);
router.get('/country/:id', getCountryById);
router.put('/country/:id', updateCountry);
router.delete('/country/:id', deleteCountry);

/* STATE */
router.post('/state', addState);
router.get('/state', getStates);
router.get('/state/:id', getStateById);
router.put('/state/:id', updateState);
router.delete('/state/:id', deleteState);

/* CITY */
router.post('/city', addCity);
router.get('/city', getCities);
router.get('/city/:id', getCityById);
router.put('/city/:id', updateCity);
router.delete('/city/:id', deleteCity);

/* COLLEGE */
router.post('/college', addCollege);
router.get('/college', getColleges);
router.get('/college/:id', getCollegeById);
router.put('/college/:id', updateCollege);
router.delete('/college/:id', deleteCollege);

// Class
router.post('/class', createClass); // CREATE
router.get('/class', getAllClasses); // READ
router.put('/class/:id', updateClass); // UPDATE
router.delete('/class/:id', deleteClass); // DELETE

export default router;
