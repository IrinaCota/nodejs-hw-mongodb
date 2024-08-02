import { Router } from 'express';
import {
  getContactByIdController,
  getStudentsController,
} from '../controllers/contacts.js';

const router = Router();

router.get('/contacts', getStudentsController);

router.get('/contacts/:contactId', getContactByIdController);

export default router;