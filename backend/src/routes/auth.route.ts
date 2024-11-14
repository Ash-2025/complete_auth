import {Router} from 'express'
import { loginHandler, logoutHandler, refreshHandler, registerHandler, ResetHandler, sendPasswordResetHandler, verifyEmailHandler } from '../controllers/auth.contoller';
import { sendPasswordResetEmail } from '../services/auth.service';

export const authRoutes = Router();

// prefix : auth
//because it's a auth route
//registerHandler is a controller
authRoutes.post("/register" , registerHandler);
authRoutes.post("/login" , loginHandler);
authRoutes.get("/refresh" , refreshHandler);
authRoutes.get("/logout" , logoutHandler);

// verify email
authRoutes.get("/email/verify/:code" , verifyEmailHandler);

// forgot password
authRoutes.post("/password/forgot",sendPasswordResetHandler)
authRoutes.post("/password/reset",ResetHandler)
