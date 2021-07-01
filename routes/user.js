const express = require('express');
const router = express.Router();

const {
    register,  
    login, 
    getMe, 
    forgotPassword, 
    resetPassword, 
    deleteAuth,
    authById,
    editAuth

} = require('../controllers/userController');


router.post('/add',   register);
router.post('/login', login);
router.get('/me', getMe);
router.put('/update/:id', editAuth);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.delete('/:id', deleteAuth)
router.get('/:id', authById)

module.exports = router