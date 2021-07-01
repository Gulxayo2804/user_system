const User = require('../models/User');
const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config/config');
const sendEmail = require('../utils/sendEmail');
//const messagebird=require('messagebird')('azp4EeOu5hVf6vgONwbLcMS0C')

// POST - /auth/register
exports.register = async (req, res, next) => {
     let a = req.body.role
 
      const user = new User({
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            password: req.body.password,
            role: a,
            phone: req.body.phone
      })

      switch (a) {
            case "superAdmin":
                  user.role = 1
                  break;
            case "admin":
                  user.role = 2
                  break;
            case "user":
                user.role = 3
                  break;
            default:
                  console.log('bunday qiymat yoq')
      }

      await user.save()
      .then(() => {
            res.status(200).json({ success: true, data: user })
      })
      .catch((error) => {
            res.status(500).json({
                  success: false, data: error
            })
      })

   


}


// GET - /auth/:id
exports.authById = async (req, res, next) => {
      const users = await User.findById({ _id: req.params.id })
      if (!users) {
            res.status(404).json({
                  success: false,
                  data: 'User Not Found'
            })
      }
      res.status(200).json({
            success: true,
            data: users
      })


}
// GET - /auth/:id
exports.getByIdAuth = async (req, res) => {
      const user = await User.findById({ _id: req.params.id })
      if (!user) {
            res.status(404).json({ success: false, data: 'Auth Not Found' })
      }
      res.status(200).json({ success: true, data: user })
}
// PUT - /auth/:id
exports.editAuth = async (req, res, next) => {
      const user = await User.findByIdAndUpdate({ _id: req.params.id });
      if (!user) {
            res.status(404).json({ success: false, data: 'Auth Not Found' })
      }

      user.name = req.body.name;
      user.surname = req.body.surname;
      user.email = req.body.email;
      user.phone = req.body.phone;

      await user
            .save()
            .then(() => { res.status(200).json({ success: true, data: user }) })
            .catch((error) => { res.status(400).json({ success: false, error: error }) })
}
// DELETE - /auth/:id
exports.deleteAuth = async (req, res, next) => {

      await User.findByIdAndDelete({ _id: req.params.id })
      res.status(200).json({ success: true, data: [] })
}
// POST - /auth/login
exports.login = async (req, res, next) => {
      const { email, password } = req.body;


      if (!email || !password) {
            res.status(400).json({ success: false, data: 'Please provide email and password' })
      }
      const user = await User.findOne({ email: email }).select(['+password']);
      if (!user) {
            res.status(401).json({ success: false, data: 'Unauthorized' })
      }
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
            res.status(401).json({ success: false, data: 'Invalid credentials' })
      }
      sendTokenResponse(user, 200, res);
}
// GET - /auth/me
exports.getMe = async (req, res, next) => {
      const token = req.headers.authorization
      const my = JWT.decode(token.slice(7, token.length))
      //console.log(my)
     const user = await User.findById({ _id: my.id })
     res.status(201).json({ success: true, data: user });
}
// POST - /auth/forgotpassword
exports.forgotPassword = async (req, res, next) => {
      const user = await User.findOne({ email: req.body.email })
      if (!user) { res.status(404).json({ success: false, data: 'User not found' }) }
      const resetToken = user.getResetPasswordToken();
      console.log(`This is ResetToken: ${resetToken}`)


      await user.save({ validateBeforeSave: false })
      const resetUrl = `${req.protocol}://LCP/resetpassword/${resetToken}`;

      const msg = {
            to: req.body.email,
            subject: 'Parolni tiklash manzili',
            html: `Parolini tiklash uchun ushbu tugmani bosing  <a type="button" href="${resetUrl}" 
            style="cursor: pointer;background-color: #eee ">Tugma</a>`
      };
      try {
            await sendEmail(msg)
            res.status(200).json({ success: true, data: 'Email is sent' });
      } catch (err) {
            console.log(err)
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false })
            res.status(500).json({ success: false, data: 'Email could not be sent' });
      }
}
// PUT - /auth/forgotpassword
exports.resetPassword = async (req, res, next) => {
      const salt = await bcrypt.genSaltSync(12);
      const newHashedPassword = await bcrypt.hashSync(req.body.password, salt);
      const user = await User.findOneAndUpdate({
            resetPasswordToken: req.params.resettoken
      });
      if (!user) {
            return next(new ErrorResponse('Invalid Token', 400));
      }
      // New password is set and it will be hashed after that
      user.password = newHashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      // console.log(user.password);
      await user.save();
      sendTokenResponse(user, 200, res);
}
// Seen token
const sendTokenResponse = (user, statusCode, res) => {
      // Create token
      const token = user.getSignedJWT();
      const options = {
            expires: new Date(Date.now() + config.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
            httpOnly: true
      };
      res.status(statusCode)
            .cookie('token', token, options)
            .json({ success: true, token });
}


