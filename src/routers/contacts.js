import { Router } from 'express';
import {
  getContactByIdController,
  getStudentsController,
} from '../controllers/contacts.js';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';


const router = Router();

router.get('/contacts', ctrlWrapper(getStudentsController));

router.get('/contacts/:contactId', ctrlWrapper(getContactByIdController));

export default router;