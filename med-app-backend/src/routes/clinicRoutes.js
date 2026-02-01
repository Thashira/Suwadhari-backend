// Clinic Routes - Developer 2
const express = require('express');
const clinicController = require('../controllers/clinicController');

const router = express.Router();

router.get('/', clinicController.getAllClinics);
router.get('/:id', clinicController.getClinicById);
router.post('/', clinicController.createClinic);
router.put('/:id', clinicController.updateClinic);
router.delete('/:id', clinicController.deleteClinic);

module.exports = router;
