const express = require('express');
const router = express.Router();
const controller = require('../controllers/category.controller');

router.post('/categories', controller.createCategory);
router.get('/categories', controller.getCategories);
router.get('/categories/:id', controller.getCategoryById);
router.put('/categories/:id', controller.updateCategory);
router.delete('/categories/:id', controller.deleteCategory);

module.exports = router;
