import express from 'express';

import {
  addCountry,
  getCountries,
  updateCountry,
  deleteCountry,
} from '../controllers/country.controller.js';

import {
  addState,
  getStates,
  updateState,
  deleteState,
} from '../controllers/state.controller.js';

import {
  addCity,
  getCities,
  updateCity,
  deleteCity,
} from '../controllers/city.controller.js';

import {
  addCollege,
  getColleges,
  updateCollege,
  deleteCollege,
} from '../controllers/college.controller.js';

const router = express.Router();

/* COUNTRY */
router.post('/country', addCountry);
router.get('/country', getCountries);
router.put('/country/:id', updateCountry);
router.delete('/country/:id', deleteCountry);

/* STATE */
router.post('/state', addState);
router.get('/state', getStates);
router.put('/state/:id', updateState);
router.delete('/state/:id', deleteState);

/* CITY */
router.post('/city', addCity);
router.get('/city', getCities);
router.put('/city/:id', updateCity);
router.delete('/city/:id', deleteCity);

/* COLLEGE */
router.post('/college', addCollege);
router.get('/college', getColleges);
router.put('/college/:id', updateCollege);
router.delete('/college/:id', deleteCollege);

export default router;
