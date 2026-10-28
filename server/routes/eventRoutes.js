import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpEvent
} from '../controllers/eventController.js';
import { isAuth, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', isAuth, isAdmin, createEvent);
router.put('/:id', isAuth, isAdmin, updateEvent);
router.delete('/:id', isAuth, isAdmin, deleteEvent);
router.post('/:id/rsvp', isAuth, rsvpEvent);

export default router;
